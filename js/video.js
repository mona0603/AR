'use strict';

const videoMap = {
  'MEXICO|GDL':       'videos/gdl.mp4',
  'MEXICO|CDMX':      'videos/cdmx.mp4',
  'MEXICO|MTY':       'videos/mty.mp4',
  'CANADA|Vancouver': 'videos/vancouver.mp4',
  'CANADA|Toronto':   'videos/toronto.mp4',
  'USA|NY':            'videos/ny.mp4',
  'USA|LA':           'videos/la.mp4',
  'USA|KSC':          'videos/ksc.mp4'
};

const effectNames = {
  blur:       'Desenfoque',
  pixel:      'Pixeleado',
  saturation: 'Saturación',
  thermal:    'Cámara térmica'
};

const effectCss = {
  blur:       'blur(6px)',
  pixel:      'blur(1px) contrast(3) saturate(0.3) brightness(1.5)',
  saturation: 'saturate(1.8)',
  thermal:    'sepia(0.9) contrast(1.6) saturate(2) hue-rotate(180deg)'
};

let currentEffect   = null;
let currentVideoSrc = null;

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

// ─── Render video ──────────────────────────────────────────

function renderVideo(src, effect) {
  const wrapper = document.getElementById('video-wrapper');
  wrapper.innerHTML = '';

  if (effect === 'pixel') {
    const canvas  = document.createElement('canvas');
    canvas.width  = 720;
    canvas.height = 900;
    canvas.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const video       = document.createElement('video');
    video.src         = src;
    video.muted       = true;
    video.playsInline = true;
    video.preload     = 'metadata';

    video.onloadedmetadata = () => {
      const drawFrame = () => {
        if (video.paused || video.ended) return;
        ctx.drawImage(video, 0, 0, 45, 56);               // tiny sample
        ctx.drawImage(canvas, 0, 0, 45, 56, 0, 0, 720, 900); // upscale = pixel art
        requestAnimationFrame(drawFrame);
      };
      video.play()
        .then(drawFrame)
        .catch(() => {
          canvas.addEventListener('click', () => video.play().then(drawFrame), { once: true });
        });
    };

    wrapper.appendChild(canvas);

  } else {
    const video       = document.createElement('video');
    video.controls    = true;
    video.autoplay    = true;
    video.playsInline = true;
    video.muted       = true;
    video.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    video.style.filter  = effect ? (effectCss[effect] || 'none') : 'none';

    const source  = document.createElement('source');
    source.src    = src;
    source.type   = 'video/mp4';

    video.appendChild(source);
    wrapper.appendChild(video);
    video.load();
    video.play().catch(() => {});
  }
}

// ─── Efectos ───────────────────────────────────────────────

function selectEffect(effect) {
  // Toggle: si ya está activo, quita el efecto
  if (currentEffect === effect) {
    currentEffect = null;
  } else {
    currentEffect = effect;
  }

  renderVideo(currentVideoSrc, currentEffect);
  setFilterLabel(currentEffect);
  markActiveBtn(currentEffect);
}

// ─── Sidebar toggle ────────────────────────────────────────

function initSidebar() {
  const toggle = document.getElementById('sidebar-toggle');
  const menu   = document.getElementById('vc-menu');

  toggle.addEventListener('click', () => {
    menu.classList.toggle('open');
  });

  // Botones de efecto
  document.querySelectorAll('.vcb[data-effect]').forEach(btn => {
    btn.addEventListener('click', () => selectEffect(btn.dataset.effect));
  });

  // Botón reset
  document.getElementById('vcb-reset').addEventListener('click', () => {
    currentEffect = null;
    renderVideo(currentVideoSrc, null);
    setFilterLabel(null);
    markActiveBtn(null);
    menu.classList.remove('open');
  });
}

// ─── Init ──────────────────────────────────────────────────

function init() {
  const params  = getQueryParams();
  const pais    = params.get('pais');
  const ciudad  = params.get('ciudad');

  if (!pais || !ciudad) {
    showWarning();
    return;
  }

  const key = pais + '|' + ciudad;
  const src = videoMap[key];

  if (!src) {
    showWarning();
    return;
  }

  currentVideoSrc = src;
  showVideo();
  renderVideo(src, null);
  initSidebar();
}

init();