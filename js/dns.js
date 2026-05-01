'use strict';

const SHOOT_SPEED    = 1.5;
const SHOOT_UP       = 0.4;
const GRAVITY        = 0.02;
const DAMPING        = 0.995;
const RESET_DISTANCE = 100;
const OFFSET         = { x: 0, y: -2, z: -10 };
const GOAL_THRESHOLDS = { USA: 10, CANADA: 25 };

// ── Net config ──────────────────────────────────────────
const NET_OFFSET     = { x: 0, y: 1, z: -20 };
const NET_SWING      = 5;
const NET_SPEED      = 0.05;

const velocity = new THREE.Vector3();
let launched   = false;
let homePos    = new THREE.Vector3();

// ── Componente: portería fija + animación lateral ───────
AFRAME.registerComponent('net-controller', {
  init() {
    this.net     = null;
    this.netHome = new THREE.Vector3();
    this.visible = false;
    this.t       = 0;

    const target = document.querySelector('[mindar-image-target]');

    target.addEventListener('targetFound', () => {
      if (this.net) {
        this.net.object3D.visible = true;
        this.visible = true;
        return;
      }

      const netEl    = document.querySelector('#net-goal');
      const scene    = this.el.sceneEl;
      const worldPos = new THREE.Vector3();

      netEl.object3D.getWorldPosition(worldPos);
      scene.object3D.add(netEl.object3D);

      worldPos.x += NET_OFFSET.x;
      worldPos.y += NET_OFFSET.y;
      worldPos.z += NET_OFFSET.z;

      netEl.object3D.position.copy(worldPos);
      this.netHome.copy(worldPos);

      this.net     = netEl;
      this.visible = true;
    });

    target.addEventListener('targetLost', () => {
      if (this.net) this.net.object3D.visible = false;
      this.visible = false;
    });
  },

  tick() {
    if (!this.net || !this.visible) return;
    this.t += NET_SPEED;
    this.net.object3D.position.x = this.netHome.x + Math.sin(this.t) * NET_SWING;
  }
});

// ── Componente: disparo de pelota ───────────────────────
AFRAME.registerComponent('tap-shoot', {
  init() {
    this.ball   = null;
    this.target = document.querySelector('[mindar-image-target]');

    this.target.addEventListener('targetFound', () => {
      if (this.ball) {
        this.ball.object3D.visible = true;
        return;
      }

      const ballEl   = document.querySelector('#ball');
      const scene    = this.el.sceneEl;
      const worldPos = new THREE.Vector3();

      ballEl.object3D.getWorldPosition(worldPos);
      scene.object3D.add(ballEl.object3D);

      worldPos.x += OFFSET.x;
      worldPos.y += OFFSET.y;
      worldPos.z += OFFSET.z;

      ballEl.object3D.position.copy(worldPos);
      homePos.copy(worldPos);

      this.ball = ballEl;
    });

    this.target.addEventListener('targetLost', () => {
      if (this.ball) this.ball.object3D.visible = false;
      launched = false;
    });

    // ── Touch: ignorar si toca un elemento UI ──
    document.addEventListener('touchend', e => {
      if (e.target.closest('#close, button, a, [data-ui]')) return;
      e.preventDefault();
      this.shoot();
    }, { passive: false });

    // ── Click: ignorar si toca un elemento UI ──
    document.addEventListener('click', e => {
      if (e.target.closest('#close, button, a, [data-ui]')) return;
      this.shoot();
    });
  },

  shoot() {
    if (!this.ball) return;
    velocity.set(0, SHOOT_UP, -SHOOT_SPEED);
    launched = true;
  },

  tick() {
    if (!launched || !this.ball) return;

    const pos = this.ball.object3D.position;
    pos.add(velocity);
    velocity.y -= GRAVITY;
    velocity.multiplyScalar(DAMPING);

    // ── Detección de gol ──────────────────────────────────
    const net = document.querySelector('#net-goal');
    if (net) {
      const netPos = new THREE.Vector3();
      net.object3D.getWorldPosition(netPos);

      const dist = pos.distanceTo(netPos);
      if (dist < 3 && !this._scored) {          // umbral de proximidad
        this._scored = true;
        registrarGol();                          // ← nueva función
      }
      if (dist > 6) this._scored = false;        // reset para el siguiente tiro
    }

    if (pos.length() > RESET_DISTANCE) {
      pos.copy(homePos);
      velocity.set(0, 0, 0);
      launched = false;
      this._scored = false;
    }
  },
});

// ── Init ────────────────────────────────────────────────
document.querySelector('a-scene').addEventListener('loaded', () => {
  const scene = document.querySelector('a-scene');
  scene.setAttribute('tap-shoot', '');
  scene.setAttribute('net-controller', '');
});

// Inicializar score al cargar
document.addEventListener('DOMContentLoaded', () => {
  const totalGuardado = parseInt(localStorage.getItem('totalGoals') || '0');
  const scoreSpan = document.querySelector('.score span:last-child');
  if (scoreSpan) scoreSpan.textContent = totalGuardado;
});

function registrarGol() {
  const total = (parseInt(localStorage.getItem('totalGoals') || '0')) + 1;
  localStorage.setItem('totalGoals', total);

  // Actualizar score en pantalla
  const scoreSpan = document.querySelector('.score span:last-child');
  if (scoreSpan) scoreSpan.textContent = total;

  for (const [pais, umbral] of Object.entries(GOAL_THRESHOLDS)) {
    const clave = `unlocked_${pais}`;
    if (total === umbral && !localStorage.getItem(clave)) {
      localStorage.setItem(clave, 'true');
      mostrarMensajePais(pais);
    }
  }
}

function mostrarMensajePais(pais) {
  const wrapper = document.querySelector('.wrapper-msg');
  const titulo  = wrapper.querySelector('.dnsm-uno span');
  const texto   = wrapper.querySelector('.dnsm-dos span:last-child');
  // const btnGo   = wrapper.querySelector('.dnsg-btn');

  const info = {
    USA:    { titulo: 'U.S.A',    texto: '10 goals! You can now explore USA.' },
    CANADA: { titulo: 'CANADA', texto: '25 goals! You can now explore Canada.' },
  };

  if (info[pais]) {
    titulo.textContent = info[pais].titulo;
    texto.textContent  = info[pais].texto;
  }

  // Mostrar mensaje
  wrapper.style.display      = 'block';
  wrapper.style.pointerEvents = 'all';

  // Bloquear taps al juego pero NO al botón
  wrapper.addEventListener('touchend', e => {
    if (e.target.closest('.dnsg-btn')) return;  // dejar pasar el botón
    e.stopPropagation();
  }, { capture: true });

  wrapper.addEventListener('click', e => {
    if (e.target.closest('.dnsg-btn')) return;  // dejar pasar el botón
    e.stopPropagation();
  }, { capture: true });

  const btnGo = wrapper.querySelector('.dnsg-btn');
  btnGo.addEventListener('click', () => {
    window.location.href = 'world.html';
  });

  // ── Sonido de desbloqueo ──
  if (window.isSfxOn?.() !== false) {
    const sfxUnlock = new Audio('resources/sfx/2.wav');
    sfxUnlock.play();
  }

  // ── Partículas: tres ráfagas en distintos puntos ──
  setTimeout(() => {
    crearParticulas(window.innerWidth * 0.5, window.innerHeight * 0.3);
    setTimeout(() => crearParticulas(window.innerWidth * 0.2, window.innerHeight * 0.5), 250);
    setTimeout(() => crearParticulas(window.innerWidth * 0.8, window.innerHeight * 0.5), 450);
    setTimeout(() => crearParticulas(window.innerWidth * 0.5, window.innerHeight * 0.7), 650);
  }, 100);

  // Cerrar
  const hideBtn = wrapper.querySelector('#hide');
  hideBtn.onclick = () => {
    wrapper.style.display      = 'none';
    wrapper.style.pointerEvents = 'none';
  };
}