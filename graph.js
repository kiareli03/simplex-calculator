const COLORS = {
  grid: '#1e2a3a',
  axis: '#4a6080',
  constraint: ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#c084fc'],
  feasible: 'rgba(14, 165, 233, 0.18)',
  feasibleBorder: 'rgba(14, 165, 233, 0.7)',
  optimal: '#4ade80',
  optimalLabel: '#0f1117',
  objective: 'rgba(250, 204, 21, 0.5)',
};

// Desenha o gráfico completo no canvas: grade, eixos, região viável, restrições e ponto ótimo.
function drawGraph(canvas, A, b, c, optType, vertices, optX) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Define o limite dos eixos com base nos vértices encontrados
  let maxVal = 10;
  if (vertices.length > 0) {
    maxVal = Math.max(...vertices.flatMap(v => v), 10) * 1.25;
  }
  maxVal = Math.ceil(maxVal);

  const pad = { left: 55, right: 20, top: 20, bottom: 45 };
  const graphW = W - pad.left - pad.right;
  const graphH = H - pad.top - pad.bottom;

  const toCanvas = ([x, y]) => [
    pad.left + (x / maxVal) * graphW,
    pad.top + graphH - (y / maxVal) * graphH,
  ];

  // Desenha a grade de fundo
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  const step = niceStep(maxVal);
  for (let v = 0; v <= maxVal; v += step) {
    const [cx] = toCanvas([v, 0]);
    const [, cy] = toCanvas([0, v]);
    ctx.beginPath(); ctx.moveTo(cx, pad.top); ctx.lineTo(cx, pad.top + graphH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad.left, cy); ctx.lineTo(pad.left + graphW, cy); ctx.stroke();
  }

  // Escreve os números nos eixos
  ctx.fillStyle = '#64748b';
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  for (let v = 0; v <= maxVal; v += step) {
    const [cx] = toCanvas([v, 0]);
    const [, cy] = toCanvas([0, v]);
    ctx.fillText(fmt(v), cx, pad.top + graphH + 16);
    ctx.textAlign = 'right';
    ctx.fillText(fmt(v), pad.left - 6, cy + 4);
    ctx.textAlign = 'center';
  }

  // Desenha os eixos x₁ e x₂
  ctx.strokeStyle = COLORS.axis;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top); ctx.lineTo(pad.left, pad.top + graphH + 5); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pad.left - 5, pad.top + graphH); ctx.lineTo(pad.left + graphW, pad.top + graphH); ctx.stroke();

  // Escreve os nomes dos eixos
  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('x₁', pad.left + graphW + 10, pad.top + graphH + 4);
  ctx.fillText('x₂', pad.left - 10, pad.top - 6);

  // Preenche a região viável com cor se houver vértices suficientes
  if (vertices.length >= 3) {
    const hull = convexHull(vertices);
    ctx.beginPath();
    const [sx, sy] = toCanvas(hull[0]);
    ctx.moveTo(sx, sy);
    for (let i = 1; i < hull.length; i++) {
      const [px, py] = toCanvas(hull[i]);
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = COLORS.feasible;
    ctx.fill();
    ctx.strokeStyle = COLORS.feasibleBorder;
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (vertices.length > 0) {
    // Se não há polígono, desenha apenas os pontos viáveis
    vertices.forEach(v => {
      const [cx, cy] = toCanvas(v);
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.feasibleBorder;
      ctx.fill();
    });
  }

  // Desenha cada restrição como uma reta tracejada colorida
  const m = A.length;
  for (let i = 0; i < m; i++) {
    const color = COLORS.constraint[i % COLORS.constraint.length];
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);

    // Calcula os dois pontos extremos da reta para desenhar no gráfico
    const [a, bCoef] = [A[i][0], A[i][1]];
    const rhs = b[i];
    let p1, p2;

    if (Math.abs(bCoef) < 1e-12) {
      // Reta vertical: x₁ = rhs/a
      if (Math.abs(a) < 1e-12) continue;
      const xV = rhs / a;
      p1 = [xV, 0]; p2 = [xV, maxVal];
    } else if (Math.abs(a) < 1e-12) {
      // Reta horizontal: x₂ = rhs/bCoef
      const yH = rhs / bCoef;
      p1 = [0, yH]; p2 = [maxVal, yH];
    } else {
      const y0 = rhs / bCoef;
      const x0 = rhs / a;
      p1 = [0, y0]; p2 = [x0, 0];
      // Ajusta os pontos se a reta ultrapassar o limite do gráfico
      if (y0 > maxVal) { const xAtMax = (rhs - bCoef * maxVal) / a; p1 = [xAtMax, maxVal]; }
      if (x0 > maxVal) { const yAtMax = (rhs - a * maxVal) / bCoef; p2 = [maxVal, yAtMax]; }
    }

    const [cx1, cy1] = toCanvas(p1);
    const [cx2, cy2] = toCanvas(p2);
    ctx.beginPath();
    ctx.moveTo(cx1, cy1);
    ctx.lineTo(cx2, cy2);
    ctx.stroke();

    // Escreve o rótulo da restrição no meio da reta
    ctx.setLineDash([]);
    ctx.fillStyle = color;
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    const midX = (cx1 + cx2) / 2 + 4;
    const midY = (cy1 + cy2) / 2 - 4;
    const labelParts = [];
    if (Math.abs(a) > 1e-9) labelParts.push(`${fmt(a)}x₁`);
    if (Math.abs(bCoef) > 1e-9) labelParts.push(`${fmt(bCoef)}x₂`);
    ctx.fillText(`R${i + 1}: ${labelParts.join('+')} ≤ ${fmt(rhs)}`, midX, midY);
  }
  ctx.setLineDash([]);

  // Desenha a reta da função objetivo passando pelo ponto ótimo
  if (optX && c[0] !== 0 || c[1] !== 0) {
    const zOpt = c[0] * (optX[0] || 0) + c[1] * (optX[1] || 0);
    const [a, bCoef] = [c[0], c[1]];
    let p1, p2;
    if (Math.abs(bCoef) < 1e-12) {
      const xV = zOpt / a;
      p1 = [xV, 0]; p2 = [xV, maxVal];
    } else {
      const y0 = zOpt / bCoef;
      const x0 = zOpt / a;
      p1 = [0, y0]; p2 = [x0, 0];
      if (y0 > maxVal) { const xAtMax = (zOpt - bCoef * maxVal) / a; p1 = [xAtMax, maxVal]; }
      if (x0 > maxVal) { const yAtMax = (zOpt - a * maxVal) / bCoef; p2 = [maxVal, yAtMax]; }
    }
    const [cx1, cy1] = toCanvas(p1);
    const [cx2, cy2] = toCanvas(p2);
    ctx.strokeStyle = COLORS.objective;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(cx1, cy1); ctx.lineTo(cx2, cy2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#facc15';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Z=${fmt(zOpt)} (ótimo)`, cx2 - 4, cy2 - 6);
  }

  // Desenha um ponto cinza em cada vértice da região viável
  vertices.forEach(v => {
    const [cx, cy] = toCanvas(v);
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#94a3b8';
    ctx.fill();
  });

  // Destaca o ponto ótimo com um círculo verde e uma estrela
  if (optX) {
    const [cx, cy] = toCanvas(optX);
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.optimal;
    ctx.fill();
    ctx.fillStyle = COLORS.optimalLabel;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('★', cx, cy + 4);

    ctx.fillStyle = COLORS.optimal;
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`(${fmt(optX[0])}, ${fmt(optX[1])})`, cx + 12, cy - 6);
  }
}

// Calcula um intervalo "bonito" para os marcadores dos eixos (ex: 1, 2, 5, 10...).
function niceStep(maxVal) {
  const raw = maxVal / 8;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norms = [1, 2, 5, 10];
  let best = norms[0];
  for (const n of norms) if (n * mag <= raw * 1.5) best = n;
  return best * mag || 1;
}

// Formata um número para exibição: inteiros sem casas decimais, outros com até 3 casas.
function fmt(v) {
  if (Number.isInteger(v)) return String(v);
  return parseFloat(v.toFixed(3)).toString();
}
