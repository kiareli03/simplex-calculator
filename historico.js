// Retorna o array de histórico armazenado no localStorage.
function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('simplex_history') || '[]');
  } catch {
    return [];
  }
}

// Renderiza os cards de histórico na página.
function renderHistory() {
  const history = getHistory();
  const list = document.getElementById('historyList');

  if (history.length === 0) {
    list.innerHTML = `
      <div class="history-empty">
        Nenhum cálculo realizado ainda.<br>
        <a href="index.html" class="history-empty-link">Ir para a calculadora →</a>
      </div>`;
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
});

renderHistory();
