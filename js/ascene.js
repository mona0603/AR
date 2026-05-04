'use strict';

// ============================================================
//  CONSTANTES
// ============================================================
const GOAL_THRESHOLDS = { USA: 100, CANADA: 200 };

// ============================================================
//  GEO-POSITION
// ============================================================
AFRAME.registerComponent('geo-position', {
  schema: {
    lat:   { type: 'number' },
    lon:   { type: 'number' },
    radio: { type: 'number' }
  },
  init() { this.update(); },
  update() {
    const lat = THREE.MathUtils.degToRad(this.data.lat);
    const lon = THREE.MathUtils.degToRad(this.data.lon);
    const r   = this.data.radio;
    const x = r * Math.cos(lat) * Math.sin(lon);
    const y = r * Math.sin(lat);
    const z = r * Math.cos(lat) * Math.cos(lon);
    this.el.setAttribute('position', { x, y, z });
    this.el.object3D.lookAt(0, 0, 0);
    this.el.object3D.rotateX(Math.PI);
  }
});

// ============================================================
//  PAIS
// ============================================================
AFRAME.registerComponent('pais', {
  schema: { nombre: { type: 'string' } },
  init() {
    this.el.addEventListener('click', () => {
      mostrarMenuPais(this.data.nombre);
    });
  }
});

// ============================================================
//  TOUCH-ROTATE
// ============================================================
AFRAME.registerComponent('touch-rotate', {
  init() {
    this.prevX    = 0;
    this.prevY    = 0;
    this.dragging = false;
    this.startX   = 0;
    this.startY   = 0;
    this.moved    = false;

    window.addEventListener('touchstart', e => {
      window._touchMoved = false;
      this.dragging = true;
      this.moved    = false;
      this.startX   = e.touches[0].clientX;
      this.startY   = e.touches[0].clientY;
      this.prevX    = this.startX;
      this.prevY    = this.startY;
    }, { passive: true });

    window.addEventListener('touchmove', e => {
      if (!this.dragging) return;
      const dx = e.touches[0].clientX - this.prevX;
      const dy = e.touches[0].clientY - this.prevY;
      const totalDx = e.touches[0].clientX - this.startX;
      const totalDy = e.touches[0].clientY - this.startY;
      if (Math.sqrt(totalDx * totalDx + totalDy * totalDy) > 5) {
        this.moved = true;
      }
      if (this.moved) {
        window._touchMoved = true;
        this.el.object3D.rotation.y += dx * 0.005;
        this.el.object3D.rotation.x += dy * 0.005;
      }
      this.prevX = e.touches[0].clientX;
      this.prevY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', () => { this.dragging = false; });
  }
});

// ============================================================
//  UI
// ============================================================
const countryOptions = {
  MEXICO: [
    { nombre: 'GDL',  img: 'resources/UI/tequila.png' },
    { nombre: 'CDMX', img: 'resources/UI/tacos.png' },
    { nombre: 'MTY',  img: 'resources/UI/montana.png' }
  ],
  CANADA: [
    { nombre: 'VAN', img: 'resources/UI/hoja-seca.png' },
    { nombre: 'TO',  img: 'resources/UI/fuente.png' }
  ],
  USA: [
    { nombre: 'NY',  img: 'resources/UI/estatua-de-la-libertad.png' },
    { nombre: 'LA',  img: 'resources/UI/estrella-de-hollywood.png' },
    { nombre: 'KSC', img: 'resources/UI/tostar.png' }
  ]
};

const countryColors = {
  MEXICO: 'linear-gradient(180deg, #8bd636, #7cc057)',
  USA:    'linear-gradient(180deg, #3646d6, #5784c0)',
  CANADA: 'linear-gradient(180deg, #d63636, #c06c57)'
};

function mostrarMensaje(pais, ciudad) {
  window.location.href = `video.html?pais=${encodeURIComponent(pais)}&ciudad=${encodeURIComponent(ciudad)}`;
}

function estaBloqueado(pais) {
  if (!GOAL_THRESHOLDS[pais]) return false;
  return !localStorage.getItem(`unlocked_${pais}`);
}

function cerrarTodo() {
  const wrapperMsg = document.querySelector('.wrapper-msg');
  if (wrapperMsg) wrapperMsg.style.display = 'none';

  const cardStack = document.querySelector('.card-stack');
  if (cardStack) cardStack.style.display = 'none';
  document.querySelector('.worldinfo')?.classList.remove('active');

  document.querySelector('.ui-country').textContent = '';
  document.getElementById('country-name').style.display = 'flex';
  document.getElementById('city-btns').style.display = 'none';
  document.getElementById('city-btns').innerHTML = '';
  document.querySelector('.ui-wrap-title').style.background = countryColors.MEXICO;
}

function resetUI() {
  cerrarTodo();
}

function mostrarMenuPais(pais) {
  cerrarTodo();
  if (estaBloqueado(pais)) {
    mostrarMensajeBloqueado(pais);
    return;
  }

  document.querySelector('.ui-country').textContent = pais;
  document.getElementById('country-name').style.display = 'none';
  const cityBtns = document.getElementById('city-btns');
  cityBtns.style.display = 'flex';
  cityBtns.innerHTML = '';

  const gradient = countryColors[pais] || '';
  document.querySelector('.ui-wrap-title').style.background = gradient;

  const ciudades = countryOptions[pais] || [];
  ciudades.forEach(ciudad => {
    const div = document.createElement('div');
    div.className = 'city-name';
    div.setAttribute('data-sfx', '');
    div.innerHTML = `
      <img src="${ciudad.img}" alt="${ciudad.nombre}" style="background: ${gradient};">
      <span>${ciudad.nombre}</span>
    `;
    div.onclick = () => mostrarMensaje(pais, ciudad.nombre);
    cityBtns.appendChild(div);
  });
}

// ============================================================
//  DOM READY
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

  // --- Referencias mensaje ---
  const wrapperMsg = document.querySelector('.wrapper-msg');
  const msgTitle   = document.getElementById('msg-title');
  const msgText    = document.getElementById('msg-text');

  window.mostrarMensajeBloqueado = function(pais) {
    cerrarTodo();
    const goles  = parseInt(localStorage.getItem('totalGoals') || '0');
    const faltan = GOAL_THRESHOLDS[pais] - goles;
    msgTitle.textContent = pais;
    msgText.textContent  = `Score ${faltan} more goal${faltan !== 1 ? 's' : ''} to unlock ${pais}`;
    wrapperMsg.style.display = 'block';
  };

  window.ocultarMessage = function() {
    wrapperMsg.style.display = 'none';
  };

  document.getElementById('hide').onclick    = ocultarMessage;
  document.getElementById('msg-btn').onclick = () => { window.location.href = 'dns.html'; };
  document.getElementById('country-close').onclick = resetUI;

  const goalEl = document.getElementById('goal-count');
  if (goalEl) goalEl.textContent = localStorage.getItem('totalGoals') || '0';

  const target = document.querySelector('[mindar-image-target]');
  target.addEventListener('targetLost', resetUI);

  // --- Worldinfo / cartas ---
  const worldinfoBtn = document.querySelector('.worldinfo');
  const cardStack    = document.querySelector('.card-stack');
  const cards        = document.querySelectorAll('.card');
  const cardCountry  = ['MEXICO', 'USA', 'CANADA'];

  function actualizarOverlays() {
    cards.forEach((card, i) => {
      const overlay = card.querySelector('.card-overlay');
      if (!overlay) return;
      overlay.style.display = estaBloqueado(cardCountry[i]) ? 'flex' : 'none';
    });
  }

  worldinfoBtn.addEventListener('click', () => {
    const visible = cardStack.style.display === 'block';
    if (!visible) cerrarTodo();
    worldinfoBtn.classList.toggle('active', !visible);
    if (visible) {
      cardStack.style.display = 'none';
    } else {
      actualizarOverlays();
      cardStack.style.display = 'block';
    }
  });

  cardStack.style.display = 'none';
});

// ============================================================
//  TOUCH RAYCASTER
// ============================================================
document.addEventListener('touchend', e => {
  if (window._touchMoved) return;

  const touch = e.changedTouches[0];
  const x =  (touch.clientX / window.innerWidth)  * 2 - 1;
  const y = -(touch.clientY / window.innerHeight)  * 2 + 1;

  const camera = document.querySelector('a-camera').getObject3D('camera');
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera({ x, y }, camera);

  const clickables = Array.from(document.querySelectorAll('.clickable'))
    .map(el => el.object3D)
    .filter(Boolean);

  const intersects = raycaster.intersectObjects(clickables, true);

  if (intersects.length > 0) {
    let obj = intersects[0].object;
    while (obj && !obj.el) obj = obj.parent;
    if (obj && obj.el) {
      const nombre = obj.el.getAttribute('pais')?.nombre;
      if (nombre) mostrarMenuPais(nombre);
    }
  }
});