'use strict';

const videoMap = {
  'MEXICO|GDL':  'videos/gdl.mp4',
  'MEXICO|CDMX': 'videos/cdmx.mp4',
  'MEXICO|MTY':  'videos/mty.mp4',
  'CANADA|VA':   'videos/vancouver.mp4',
  'CANADA|TO':   'videos/toronto.mp4',
  'USA|NY':      'videos/ny.mp4',
  'USA|LA':      'videos/la.mp4',
  'USA|KSC':     'videos/ksc.mp4'
};

const effectNames = {
  blur:       'Desenfoque',
  pixel:      'Pixeleado',
  saturation: 'Saturación',
  thermal:    'Cámara térmica',
  pastel:     'Pastel'
};

const effectCss = {
  blur:       'blur(6px)',
  saturation: 'saturate(1.8)',
};

// Valores por defecto del pastel
let pastelValues = {
  saturate:   0.75,
  brightness: 1.25,
  contrast:   0.95
};

let currentEffect   = null;
let currentVideoSrc = null;
let mainVideo       = null;

// ─── Paleta Iron (FLIR) ────────────────────────────────────
const IRON_PALETTE = (function () {
  const keys = [
    [  0,   0,   0],
    [ 28,   0,  51],
    [ 56,   0, 102],
    [ 84,   0, 153],
    [100,   0, 190],
    [110,   0, 170],
    [130,   0, 140],
    [155,   0,  90],
    [175,   0,  40],
    [195,   0,   5],
    [215,  15,   0],
    [232,  55,   0],
    [244, 110,   0],
    [252, 160,   0],
    [255, 200,  10],
    [255, 228,  60],
    [255, 245, 140],
    [255, 252, 210],
    [255, 255, 255]
  ];

  const lut = new Uint8Array(256 * 3);
  const n   = keys.length - 1;

  for (let i = 0; i < 256; i++) {
    const t    = (i / 255) * n;
    const lo   = Math.floor(t);
    const hi   = Math.min(lo + 1, n);
    const frac = t - lo;

    lut[i * 3]     = Math.round(keys[lo][0] + frac * (keys[hi][0] - keys[lo][0]));
    lut[i * 3 + 1] = Math.round(keys[lo][1] + frac * (keys[hi][1] - keys[lo][1]));
    lut[i * 3 + 2] = Math.round(keys[lo][2] + frac * (keys[hi][2] - keys[lo][2]));
  }
  return lut;
})();

//  ----- Filtro Pastel ------

function buildPastelFilter() {
  return `saturate(${pastelValues.saturate}) brightness(${pastelValues.brightness}) contrast(${pastelValues.contrast}) hue-rotate(10deg)`;
}

function showPastelPanel() {
  if (document.getElementById('pastel-panel')) return;

  const panel = document.createElement('div');
  panel.id = 'pastel-panel';

  const sliders = [
    { key: 'saturate',   label: 'Saturate', min: 0,   max: 2,   step: 0.01 },
    { key: 'brightness', label: 'Brightness',      min: 0.5, max: 2,   step: 0.01 },
    { key: 'contrast',   label: 'Contrast',   min: 0.5, max: 2,   step: 0.01 },
  ];

  sliders.forEach(({ key, label, min, max, step }) => {
    const row = document.createElement('div');
    row.className = 'pastel-row';

    const lbl = document.createElement('span');
    lbl.textContent = label;

    const input = document.createElement('input');
    input.type  = 'range';
    input.min   = min;
    input.max   = max;
    input.step  = step;
    input.value = pastelValues[key];

    input.addEventListener('input', () => {
      pastelValues[key] = parseFloat(input.value);
      mainVideo.style.filter = buildPastelFilter();
    });

    row.appendChild(lbl);
    row.appendChild(input);
    panel.appendChild(row);
  });

  // ← va en .video-play, no en .vc-sidebar
  document.querySelector('.video-play').appendChild(panel);
}

function hidePastelPanel() {
  document.getElementById('pastel-panel')?.remove();
}

// ─── Helpers ───────────────────────────────────────────────

function getQueryParams() {
  return new URLSearchParams(window.location.search);
}

function showVideo() {
  document.querySelector('.video-play').style.display = '';
  document.getElementById('video-warning').style.display = 'none';
}

function showWarning() {
  document.querySelector('.video-play').style.display = 'none';
  document.getElementById('video-warning').style.display = '';
}

function setFilterLabel(effect) {
  const label = document.getElementById('filters-name');
  if (!label) return;
  label.textContent = effect ? effectNames[effect] : '';
  label.style.display = effect ? '' : 'none';
}

function markActiveBtn(effect) {
  document.querySelectorAll('.vcb[data-effect]').forEach(btn => {
    btn.classList.toggle('vcb--active', btn.dataset.effect === effect);
  });
}

// ─── Canvas térmico ────────────────────────────────────────

function createThermalCanvas(wrapper) {
  mainVideo.style.display = 'none';

  const canvas  = document.createElement('canvas');
  canvas.width  = 720;
  canvas.height = 1280;
  canvas.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  const W = 180, H = 320;
  const off    = document.createElement('canvas');
  off.width    = W;
  off.height   = H;
  const offCtx = off.getContext('2d', { willReadFrequently: true });

  let rafId = null;

  const drawFrame = () => {
    if (mainVideo.paused || mainVideo.ended) return;
    offCtx.drawImage(mainVideo, 0, 0, W, H);
    const imgData = offCtx.getImageData(0, 0, W, H);
    const px      = imgData.data;
    for (let i = 0; i < px.length; i += 4) {
      const lum    = (px[i] * 76 + px[i+1] * 150 + px[i+2] * 29) >> 8;
      px[i]        = IRON_PALETTE[lum * 3];
      px[i + 1]    = IRON_PALETTE[lum * 3 + 1];
      px[i + 2]    = IRON_PALETTE[lum * 3 + 2];
    }
    offCtx.putImageData(imgData, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium';
    ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
    rafId = requestAnimationFrame(drawFrame);
  };

  if (!mainVideo.paused) drawFrame();
  else mainVideo.addEventListener('play', drawFrame, { once: true });

  canvas._cleanup = () => {
    cancelAnimationFrame(rafId);
    mainVideo.style.display = '';
  };

  wrapper.appendChild(canvas);
}

// ─── Canvas pixelado ───────────────────────────────────────

function createPixelCanvas(wrapper) {
  mainVideo.style.display = 'none';

  const canvas  = document.createElement('canvas');
  canvas.width  = 720;
  canvas.height = 1280;
  canvas.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  let rafId = null;

  const drawFrame = () => {
    if (mainVideo.paused || mainVideo.ended) return;
    ctx.drawImage(mainVideo, 0, 0, 45, 80);
    ctx.drawImage(canvas, 0, 0, 45, 80, 0, 0, 720, 1280);
    rafId = requestAnimationFrame(drawFrame);
  };

  if (!mainVideo.paused) drawFrame();
  else mainVideo.addEventListener('play', drawFrame, { once: true });

  canvas._cleanup = () => {
    cancelAnimationFrame(rafId);
    mainVideo.style.display = '';
  };

  wrapper.appendChild(canvas);
}

// ─── Apply effect ──────────────────────────────────────────

function applyEffect(effect) {
  const wrapper = document.getElementById('video-wrapper');

  const prevCanvas = wrapper.querySelector('canvas');
  if (prevCanvas?._cleanup) prevCanvas._cleanup();
  prevCanvas?.remove();

  mainVideo.style.filter = 'none';
  hidePastelPanel();  // ← siempre ocultar al cambiar efecto

  if (effect === 'thermal') { createThermalCanvas(wrapper); return; }
  if (effect === 'pixel')   { createPixelCanvas(wrapper);   return; }

  if (effect === 'pastel') {
    mainVideo.style.filter = buildPastelFilter();
    showPastelPanel();  // ← mostrar panel
    return;
  }

  mainVideo.style.filter = effectCss[effect] || 'none';
}

// ─── Render video (solo al inicio) ─────────────────────────

function renderVideo(src) {
  const wrapper = document.getElementById('video-wrapper');

  mainVideo             = document.createElement('video');
  mainVideo.autoplay    = true;
  mainVideo.playsInline = true;
  mainVideo.muted       = true;
  mainVideo.loop        = true;
  mainVideo.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';

  const source = document.createElement('source');
  source.src   = src;
  source.type  = 'video/mp4';

  mainVideo.appendChild(source);
  wrapper.appendChild(mainVideo);
  mainVideo.load();
  mainVideo.play().catch(() => {});
}

// ─── Efectos ───────────────────────────────────────────────

function selectEffect(effect) {
  currentEffect = (currentEffect === effect) ? null : effect;
  applyEffect(currentEffect);
  setFilterLabel(currentEffect);
  markActiveBtn(currentEffect);
}

// ─── Sidebar ───────────────────────────────────────────────

function initSidebar() {
  const toggle = document.getElementById('sidebar-toggle');
  const menu   = document.getElementById('vc-menu');

  toggle.addEventListener('click', () => menu.classList.toggle('open'));

  document.querySelectorAll('.vcb[data-effect]').forEach(btn => {
    btn.addEventListener('click', () => selectEffect(btn.dataset.effect));
  });
}

// ─── Init ──────────────────────────────────────────────────

function init() {
  const params = getQueryParams();
  const pais   = params.get('pais');
  const ciudad = params.get('ciudad');

  if (!pais || !ciudad) { showWarning(); return; }

  const key = `${pais}|${ciudad}`;
  const src = videoMap[key];

  if (!src) { showWarning(); return; }

  currentVideoSrc = src;
  showVideo();
  renderVideo(src);
  initSidebar();
}

init();