// ============================================================
//  CANVAS PARTÍCULAS
// ============================================================
const canvas = document.getElementById('star-canvas');
const ctx    = canvas.getContext('2d');
let particulas = [];
const MAX_PARTICULAS = 200;

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ============================================================
//  DIBUJO DE ESTRELLA
// ============================================================
function drawRoundedStar(ctx, cx, cy, outerR, innerR, points, color, alpha, rotation) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  const step  = Math.PI / points;
  const curve = 0.35;

  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r     = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    const x     = Math.cos(angle) * r;
    const y     = Math.sin(angle) * r;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      const prevR     = (i - 1) % 2 === 0 ? outerR : innerR;
      const prevAngle = (i - 1) * step - Math.PI / 2;
      const px  = Math.cos(prevAngle) * prevR;
      const py  = Math.sin(prevAngle) * prevR;
      const cpx = (px + x) / 2 * (1 - curve);
      const cpy = (py + y) / 2 * (1 - curve);
      ctx.quadraticCurveTo(cpx + (x - px) * curve, cpy + (y - py) * curve, x, y);
    }
  }
  ctx.closePath();

  ctx.fillStyle   = color;
  ctx.shadowColor = color;
  ctx.shadowBlur  = 8;
  ctx.fill();
  ctx.restore();
}

// ============================================================
//  CREAR PARTÍCULAS
// ============================================================
function crearParticulas(originX, originY) {
  if (particulas.length >= MAX_PARTICULAS) return;

  const cantidad = Math.min(28, MAX_PARTICULAS - particulas.length);

  for (let i = 0; i < cantidad; i++) {
    const angle = (Math.PI * 2 / cantidad) * i + (Math.random() - 0.5) * 0.4;
    const speed = 3 + Math.random() * 6;
    const size  = 10 + Math.random() * 22;
    const hue   = 40 + Math.random() * 20;
    const sat   = 85 + Math.random() * 15;
    const lit   = 50 + Math.random() * 15;

    particulas.push({
      x: originX, y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
      color:    `hsl(${hue}, ${sat}%, ${lit}%)`,
      alpha:    1,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.12,
      gravity:  0.12 + Math.random() * 0.08,
      decay:    0.018 + Math.random() * 0.012,
    });
  }
}

// ============================================================
//  LOOP DE ANIMACIÓN
// ============================================================
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particulas = particulas.filter(p => p.alpha > 0.01);

  for (const p of particulas) {
    p.x        += p.vx;
    p.y        += p.vy;
    p.vy       += p.gravity;
    p.vx       *= 0.98;
    p.rotation += p.rotSpeed;
    p.alpha    -= p.decay;
    p.size     *= 0.992;
    drawRoundedStar(ctx, p.x, p.y, p.size, p.size * 0.45, 5, p.color, Math.max(0, p.alpha), p.rotation);
  }

  requestAnimationFrame(animate);
}
animate();

// ============================================================
//  EXPLOTAR DESDE UN BOTÓN
// ============================================================
function explotar(btn) {
  const rect = btn.getBoundingClientRect();
  crearParticulas(rect.left + rect.width / 2, rect.top + rect.height / 2);
}