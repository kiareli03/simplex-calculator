const DEFAULT_CONSTRAINTS = [
  { a1: 6, a2: 4, rhs: 24 },
  { a1: 1, a2: 2, rhs: 6  },
];

let numConstraints = DEFAULT_CONSTRAINTS.length;
const MAX_CONSTRAINTS = 6;
const MIN_CONSTRAINTS = 1;

// Cria e retorna o elemento HTML de uma linha de restrição com os campos de entrada preenchidos.
function buildConstraintRow(idx, def) {
  const d = def || { a1: 1, a2: 1, rhs: 10 };
  const row = document.createElement('div');
  row.className = 'constraint-row';
  row.dataset.idx = idx;
  row.innerHTML = `
    <input type="number" class="ca1" value="${d.a1}" step="any" style="width:60px" />
    <span>x₁ +</span>
    <input type="number" class="ca2" value="${d.a2}" step="any" style="width:60px" />
    <span>x₂</span>
    <select class="csign">
      <option value="lte" selected>≤</option>
      <option value="gte">≥</option>
      <option value="eq">=</option>
    </select>
    <input type="number" class="crhs" value="${d.rhs}" step="any" style="width:60px" />
  `;
  return row;
}

// Limpa e redesenha todas as linhas de restrição na tela.
function renderConstraints() {
  const list = document.getElementById('constraints-list');
  list.innerHTML = '';
  for (let i = 0; i < numConstraints; i++) {
    list.appendChild(buildConstraintRow(i, DEFAULT_CONSTRAINTS[i]));
  }
}

// Lê os valores das restrições preenchidas pelo usuário e retorna as matrizes A e b.
// Restrições do tipo ≥ são multiplicadas por -1 para converter em ≤.
// Restrições de igualdade viram duas restrições (uma ≤ e uma ≥ convertida).
function readConstraints() {
  const rows = document.querySelectorAll('.constraint-row');
  const A = [], b = [], signs = [];
  for (const row of rows) {
    const a1 = parseFloat(row.querySelector('.ca1').value) || 0;
    const a2 = parseFloat(row.querySelector('.ca2').value) || 0;
    const rhs = parseFloat(row.querySelector('.crhs').value) || 0;
    const sign = row.querySelector('.csign').value;
    if (sign === 'lte') {
      A.push([a1, a2]); b.push(rhs);
    } else if (sign === 'gte') {
      A.push([-a1, -a2]); b.push(-rhs);
    } else {
      // Igualdade vira duas restrições: uma ≤ e uma ≥ (convertida)
      A.push([a1, a2]); b.push(rhs);
      A.push([-a1, -a2]); b.push(-rhs);
    }
    signs.push(sign);
  }
  return { A, b, signs };
}

// Gera o HTML da tabela (tableau) do último passo do Simplex para exibir na tela.
function renderTableau(steps) {
  if (!steps || steps.length === 0) return '';
  const last = steps[steps.length - 1];
  const { tableau, basis } = last;
  const m = tableau.length - 1;
  const cols = tableau[0].length;
  const n = 2;

  const varName = (j) => {
    if (j < n) return `x${j + 1}`;
    if (j < cols - 1) return `s${j - n + 1}`;
    return 'rhs';
  };

  let html = '<table class="tableau"><thead><tr><th>Base</th>';
  for (let j = 0; j < cols; j++) html += `<th>${varName(j)}</th>`;
  html += '</tr></thead><tbody>';

  for (let i = 0; i < m; i++) {
    const baseVar = varName(basis[i]);
    html += `<tr><th>${baseVar}</th>`;
    for (let j = 0; j < cols; j++) {
      html += `<td>${fmtNum(tableau[i][j])}</td>`;
    }
    html += '</tr>';
  }
  // Linha da função objetivo (Z)
  html += '<tr><th>Z</th>';
  for (let j = 0; j < cols; j++) {
    html += `<td>${fmtNum(tableau[m][j])}</td>`;
  }
  html += '</tr></tbody></table>';
  return html;
}

// Formata um número para exibição no tableau: zeros exatos, inteiros sem decimais, outros com 4 casas.
function fmtNum(v) {
  if (Math.abs(v) < 1e-9) return '0';
  if (Number.isInteger(v)) return String(v);
  return parseFloat(v.toFixed(4)).toString();
}

// Lê os dados do formulário, executa o Simplex e exibe o resultado, o tableau e o gráfico.
// O parâmetro saveHist controla se o resultado deve ser salvo no histórico.
function solve(saveHist = false) {
  const c = [
    parseFloat(document.getElementById('c1').value) || 0,
    parseFloat(document.getElementById('c2').value) || 0,
  ];
  const optType = document.getElementById('optType').value;
  const { A, b } = readConstraints();

  if (b.some(v => isNaN(v)) || A.some(r => r.some(isNaN))) {
    alert('Valores inválidos nas restrições.');
    return;
  }

  const result = solveSimplex(c, A, b, optType);
  const vertices = computeVertices(A, b);

  const resultSection = document.getElementById('resultSection');
  const resultContent = document.getElementById('resultContent');
  const tableauContent = document.getElementById('tableauContent');
  resultSection.style.display = '';

  if (result.status === 'optimal') {
    const label = optType === 'max' ? 'Máximo' : 'Mínimo';
    resultContent.innerHTML = `
      <div><strong>Status:</strong> <span style="color:#4ade80">Solução ótima encontrada</span></div>
      <div><strong>x₁</strong> = <span class="result-value">${fmtNum(result.x[0])}</span></div>
      <div><strong>x₂</strong> = <span class="result-value">${fmtNum(result.x[1])}</span></div>
      <div><strong>Z (${label})</strong> = <span class="result-value">${fmtNum(result.z)}</span></div>
      <div style="margin-top:8px;font-size:0.8rem;color:#64748b">
        Iterações: ${result.steps.length - 1}
      </div>
    `;
    tableauContent.innerHTML = renderTableau(result.steps);
    drawGraph(document.getElementById('graph'), A, b, c, optType, vertices, result.x);
  } else if (result.status === 'unbounded') {
    resultContent.innerHTML = '<div class="result-infeasible">Problema ilimitado (unbounded). Verifique as restrições.</div>';
    tableauContent.innerHTML = '';
    drawGraph(document.getElementById('graph'), A, b, c, optType, vertices, null);
  } else {
    resultContent.innerHTML = '<div class="result-infeasible">Sem solução viável.</div>';
    tableauContent.innerHTML = '';
    drawGraph(document.getElementById('graph'), A, b, c, optType, vertices, null);
  }

  if (saveHist) {
    const now = new Date();
    const p = n => String(n).padStart(2, '0');
    addToHistory({
      date: `${p(now.getDate())}/${p(now.getMonth() + 1)}/${now.getFullYear()} ${p(now.getHours())}:${p(now.getMinutes())}`,
      optType,
      c1: c[0],
      c2: c[1],
      status: result.status,
      x1: result.status === 'optimal' ? fmtNum(result.x[0]) : null,
      x2: result.status === 'optimal' ? fmtNum(result.x[1]) : null,
      z:  result.status === 'optimal' ? fmtNum(result.z)     : null,
      iterations: result.status === 'optimal' ? result.steps.length - 1 : null,
    });
  }
}

// Restaura todos os campos do formulário para os valores padrão e limpa o gráfico.
function reset() {
  document.getElementById('c1').value = '5';
  document.getElementById('c2').value = '4';
  document.getElementById('optType').value = 'max';
  numConstraints = DEFAULT_CONSTRAINTS.length;
  renderConstraints();
  document.getElementById('resultSection').style.display = 'none';
  const canvas = document.getElementById('graph');
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

// ── Perfil ──

// Retorna o nome salvo no localStorage.
function getProfileName() {
  return localStorage.getItem('simplex_name') || null;
}

// Salva o nome do usuário no localStorage.
function saveProfileName(name) {
  localStorage.setItem('simplex_name', name.trim());
}

// Atualiza os elementos visuais da aba de perfil com os dados atuais.
function renderProfile() {
  const name = getProfileName();
  if (!name) return;
  const count = getHistory().length;
  document.getElementById('profileAvatar').textContent = name.charAt(0).toUpperCase();
  document.getElementById('profileName').textContent = name;
  document.getElementById('profileStats').textContent =
    `${count} cálculo${count !== 1 ? 's' : ''} realizado${count !== 1 ? 's' : ''}`;
  document.getElementById('profileNameInput').value = name;
}

// Exibe o modal de boas-vindas se o usuário ainda não informou o nome.
function initProfile() {
  if (!getProfileName()) {
    document.getElementById('profileModal').classList.add('visible');
    setTimeout(() => document.getElementById('nameInput').focus(), 100);
  }
  renderProfile();
}

document.getElementById('nameSubmit').addEventListener('click', () => {
  const name = document.getElementById('nameInput').value.trim();
  if (!name) return;
  saveProfileName(name);
  document.getElementById('profileModal').classList.remove('visible');
  renderProfile();
});

document.getElementById('nameInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('nameSubmit').click();
});

document.getElementById('profileSave').addEventListener('click', () => {
  const name = document.getElementById('profileNameInput').value.trim();
  if (!name) return;
  saveProfileName(name);
  renderProfile();
  const btn = document.getElementById('profileSave');
  btn.textContent = 'Salvo!';
  setTimeout(() => { btn.textContent = 'Salvar'; }, 1500);
});

// ── Histórico ──

// Retorna o array de histórico armazenado no localStorage.
function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('simplex_history') || '[]');
  } catch {
    return [];
  }
}

// Adiciona uma entrada ao histórico (mais recente primeiro) e limita a 50 registros.
function addToHistory(entry) {
  const history = getHistory();
  history.unshift(entry);
  if (history.length > 50) history.pop();
  localStorage.setItem('simplex_history', JSON.stringify(history));
  renderProfile();
}

// Renderiza os cards de histórico na aba correspondente.
function renderHistory() {
  const history = getHistory();
  const list = document.getElementById('historyList');

  if (history.length === 0) {
    list.innerHTML = '<div class="history-empty">Nenhum cálculo realizado ainda.</div>';
    return;
  }

  list.innerHTML = history.map(entry => {
    const optLabel = entry.optType === 'max' ? 'Max' : 'Min';
    const objStr = `${optLabel} Z = ${entry.c1}x₁ + ${entry.c2}x₂`;

    if (entry.status === 'optimal') {
      const iter = entry.iterations;
      return `
        <div class="history-card">
          <div class="history-card-header">
            <span class="history-objective">${objStr}</span>
            <span class="history-date">${entry.date}</span>
          </div>
          <div class="history-result">
            <span>x₁ = <strong>${entry.x1}</strong></span>
            <span>x₂ = <strong>${entry.x2}</strong></span>
            <span>Z = <strong>${entry.z}</strong></span>
            <span>${iter} iteração${iter !== 1 ? 'ões' : ''}</span>
          </div>
        </div>`;
    }

    const msg = entry.status === 'unbounded' ? 'Problema ilimitado' : 'Sem solução viável';
    return `
      <div class="history-card">
        <div class="history-card-header">
          <span class="history-objective">${objStr}</span>
          <span class="history-date">${entry.date}</span>
        </div>
        <div class="history-status-error">${msg}</div>
      </div>`;
  }).join('');
}

document.getElementById('clearHistory').addEventListener('click', () => {
  if (!confirm('Deseja limpar todo o histórico?')) return;
  localStorage.removeItem('simplex_history');
  renderHistory();
  renderProfile();
});

// ── Navegação por abas ──

// Alterna a aba visível e atualiza o estado ativo no navbar.
document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    if (tab.dataset.tab === 'history') renderHistory();
    if (tab.dataset.tab === 'profile') renderProfile();
  });
});

// ── Listeners da calculadora ──

document.getElementById('addConstraint').addEventListener('click', () => {
  if (numConstraints >= MAX_CONSTRAINTS) return;
  DEFAULT_CONSTRAINTS[numConstraints] = null;
  numConstraints++;
  const list = document.getElementById('constraints-list');
  list.appendChild(buildConstraintRow(numConstraints - 1, null));
});

document.getElementById('removeConstraint').addEventListener('click', () => {
  if (numConstraints <= MIN_CONSTRAINTS) return;
  numConstraints--;
  DEFAULT_CONSTRAINTS.splice(numConstraints, 1);
  const list = document.getElementById('constraints-list');
  list.removeChild(list.lastChild);
});

document.getElementById('solveBtn').addEventListener('click', () => solve(true));
document.getElementById('resetBtn').addEventListener('click', reset);

// Inicializa perfil, renderiza restrições e executa o Simplex ao carregar a página
initProfile();
renderConstraints();
solve();
