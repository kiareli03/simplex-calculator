// Resolve um problema de programação linear com o método Simplex (até 2 variáveis).
// Recebe os coeficientes da função objetivo (c), a matriz de restrições (A), os limites (b) e o tipo de otimização.
function solveSimplex(c, A, b, optType) {
  const m = A.length;   // número de restrições
  const n = c.length;   // número de variáveis de decisão (2)

  // Se for minimização, inverte os coeficientes para transformar em maximização
  const cObj = optType === 'min' ? c.map(v => -v) : [...c];

  // Monta o tableau inicial com a matriz de restrições, variáveis de folga e os valores do lado direito
  const cols = n + m + 1;
  const tableau = [];

  for (let i = 0; i < m; i++) {
    const row = new Array(cols).fill(0);
    for (let j = 0; j < n; j++) row[j] = A[i][j];
    row[n + i] = 1;         // variável de folga
    row[cols - 1] = b[i];  // lado direito
    tableau.push(row);
  }

  // Linha da função objetivo com os coeficientes negados
  const objRow = new Array(cols).fill(0);
  for (let j = 0; j < n; j++) objRow[j] = -cObj[j];
  tableau.push(objRow);

  const steps = [];
  const basis = Array.from({ length: m }, (_, i) => n + i); // base inicial: variáveis de folga
  const MAX_ITER = 200;

  const cloneTableau = () => tableau.map(r => [...r]);

  for (let iter = 0; iter < MAX_ITER; iter++) {
    const obj = tableau[m];

    // Encontra a coluna pivô: a mais negativa na linha objetivo
    let pivotCol = -1;
    let minVal = -1e-9;
    for (let j = 0; j < cols - 1; j++) {
      if (obj[j] < minVal) { minVal = obj[j]; pivotCol = j; }
    }
    if (pivotCol === -1) break; // solução ótima encontrada

    // Encontra a linha pivô pelo teste da razão mínima
    let pivotRow = -1;
    let minRatio = Infinity;
    for (let i = 0; i < m; i++) {
      if (tableau[i][pivotCol] > 1e-9) {
        const ratio = tableau[i][cols - 1] / tableau[i][pivotCol];
        if (ratio < minRatio) { minRatio = ratio; pivotRow = i; }
      }
    }

    if (pivotRow === -1) {
      return { status: 'unbounded', x: null, z: null, steps, vertices: [] };
    }

    steps.push({ tableau: cloneTableau(), pivotRow, pivotCol, basis: [...basis] });

    // Realiza o pivoteamento: normaliza a linha pivô e elimina das outras linhas
    const pivotVal = tableau[pivotRow][pivotCol];
    for (let j = 0; j < cols; j++) tableau[pivotRow][j] /= pivotVal;

    for (let i = 0; i <= m; i++) {
      if (i === pivotRow) continue;
      const factor = tableau[i][pivotCol];
      for (let j = 0; j < cols; j++) tableau[i][j] -= factor * tableau[pivotRow][j];
    }

    basis[pivotRow] = pivotCol;
  }

  steps.push({ tableau: cloneTableau(), pivotRow: -1, pivotCol: -1, basis: [...basis] });

  // Extrai os valores da solução a partir da base final
  const x = new Array(n).fill(0);
  for (let i = 0; i < m; i++) {
    if (basis[i] < n) x[basis[i]] = tableau[i][cols - 1];
  }

  const zRaw = tableau[m][cols - 1];
  const z = optType === 'min' ? -zRaw : zRaw;

  return { status: 'optimal', x, z, steps, vertices: [] };
}

// Calcula todos os vértices da região viável para problemas com 2 variáveis.
// Testa interseções entre pares de restrições e com os eixos.
function computeVertices(A, b) {
  const m = A.length;
  const vertices = [];

  const isNonNeg = (pt) => pt[0] >= -1e-9 && pt[1] >= -1e-9;

  const satisfiesAll = (pt) => {
    for (let i = 0; i < m; i++) {
      if (A[i][0] * pt[0] + A[i][1] * pt[1] > b[i] + 1e-9) return false;
    }
    return true;
  };

  // Testa todos os pares de restrições para encontrar interseções
  for (let i = 0; i < m; i++) {
    for (let j = i + 1; j < m; j++) {
      const pt = intersect2Lines(A[i], b[i], A[j], b[j]);
      if (pt && isNonNeg(pt) && satisfiesAll(pt)) vertices.push(pt);
    }
    // Interseção da restrição i com o eixo x₁=0
    if (Math.abs(A[i][1]) > 1e-12) {
      const x2 = b[i] / A[i][1];
      const pt = [0, x2];
      if (isNonNeg(pt) && satisfiesAll(pt)) vertices.push(pt);
    }
    // Interseção da restrição i com o eixo x₂=0
    if (Math.abs(A[i][0]) > 1e-12) {
      const x1 = b[i] / A[i][0];
      const pt = [x1, 0];
      if (isNonNeg(pt) && satisfiesAll(pt)) vertices.push(pt);
    }
  }

  // Verifica se a origem também é um vértice viável
  if (satisfiesAll([0, 0])) vertices.push([0, 0]);

  // Remove pontos duplicados
  const unique = [];
  for (const v of vertices) {
    if (!unique.some(u => Math.abs(u[0] - v[0]) < 1e-6 && Math.abs(u[1] - v[1]) < 1e-6)) {
      unique.push(v);
    }
  }

  return unique;
}

// Calcula o ponto de interseção entre duas retas definidas por coeficientes e termos independentes.
function intersect2Lines(a1, b1, a2, b2) {
  const det = a1[0] * a2[1] - a2[0] * a1[1];
  if (Math.abs(det) < 1e-12) return null;
  const x = (b1 * a2[1] - b2 * a1[1]) / det;
  const y = (a1[0] * b2 - a2[0] * b1) / det;
  return [x, y];
}

// Calcula o fecho convexo de um conjunto de pontos usando o algoritmo de Andrew.
function convexHull(pts) {
  if (pts.length < 3) return pts;
  const sorted = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (O, A, B) => (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]);
  const lower = [], upper = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  for (const p of [...sorted].reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop(); lower.pop();
  return lower.concat(upper);
}
