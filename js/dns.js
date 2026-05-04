'use strict';

const SHOOT_SPEED     = 1.5;
const SHOOT_UP        = 0.4;
const GRAVITY         = 0.02;
const DAMPING         = 0.995;
const RESET_DISTANCE  = 100;
const OFFSET          = { x: 0, y: -2, z: -10 };
const GOAL_THRESHOLDS = { USA: 100, CANADA: 200 };

const NET_OFFSET = { x: 0, y: 1, z: -20 };
const NET_SWING  = 5;
const NET_SPEED  = 0.05;

const BALL_POOL_SIZE = 10;
const SHOOT_DELAY    = 0; //no delay (ms)

let ballPool     = [];
let lastShotTime = 0;
let homePos      = new THREE.Vector3();

const ROUND_DURATION    = 30;
let roundActive         = false;
let roundGoals          = 0;
let timeLeft            = ROUND_DURATION;
let timerInterval       = null;
let totalAntesDeLaRonda = 0;

// ============================================================
//  NET CONTROLLER
// ============================================================
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

// ============================================================
//  TAP SHOOT
// ============================================================
AFRAME.registerComponent('tap-shoot', {
  init() {
    this.target = document.querySelector('[mindar-image-target]');

    this.target.addEventListener('targetFound', () => {
      if (ballPool.length === 0) {
        const scene      = this.el.sceneEl;
        const sourceBall = document.querySelector('#ball');
        const worldPos   = new THREE.Vector3();

        sourceBall.object3D.getWorldPosition(worldPos);
        worldPos.x += OFFSET.x;
        worldPos.y += OFFSET.y;
        worldPos.z += OFFSET.z;
        homePos.copy(worldPos);

        for (let i = 0; i < BALL_POOL_SIZE; i++) {
          const clone = sourceBall.cloneNode(true);
          clone.id = `ball-${i}`;
          scene.appendChild(clone);

          clone.addEventListener('loaded', () => {
            clone.object3D.position.copy(homePos);
            clone.object3D.visible = true;
          });

          ballPool.push({
            el:       clone,
            velocity: new THREE.Vector3(),
            active:   false,
            scored:   false
          });
        }

        sourceBall.object3D.visible = false;
      } else {
        ballPool.forEach(b => {
          b.el.object3D.visible = true;
          b.active = false;
          b.el.object3D.position.copy(homePos);
        });
      }
    });

    this.target.addEventListener('targetLost', () => {
      ballPool.forEach(b => {
        b.el.object3D.visible = false;
        b.active = false;
      });
    });

    document.addEventListener('touchend', e => {
      if (e.target.closest('#close, button, a, [data-ui]')) return;
      e.preventDefault();
      this.handleTap();
    }, { passive: false });

    document.addEventListener('click', e => {
      if (e.target.closest('#close, button, a, [data-ui]')) return;
      this.handleTap();
    });
  },

  handleTap() {
    if (ballPool.length === 0) return;
    if (!roundActive) iniciarRonda();

    const now = Date.now();
    if (now - lastShotTime < SHOOT_DELAY) return;
    lastShotTime = now;

    const ball = ballPool.find(b => !b.active);
    if (!ball) return;

    ball.el.object3D.position.copy(homePos);
    ball.velocity.set(0, SHOOT_UP, -SHOOT_SPEED);
    ball.active = true;
    ball.scored = false;
  },

  tick() {
    const net    = document.querySelector('#net-goal');
    const netPos = new THREE.Vector3();
    if (net) net.object3D.getWorldPosition(netPos);

    ballPool.forEach(ball => {
      if (!ball.active) return;

      const pos = ball.el.object3D.position;
      pos.add(ball.velocity);
      ball.velocity.y -= GRAVITY;
      ball.velocity.multiplyScalar(DAMPING);

      if (net) {
        const dist = pos.distanceTo(netPos);
        if (dist < 3 && !ball.scored) {
          ball.scored = true;
          registrarGol();
        }
        if (dist > 6) ball.scored = false;
      }

      if (pos.length() > RESET_DISTANCE) {
        pos.copy(homePos);
        ball.velocity.set(0, 0, 0);
        ball.active = false;
        ball.scored = false;
      }
    });
  }
});

// ============================================================
//  RONDA
// ============================================================
function iniciarRonda() {
  totalAntesDeLaRonda = parseInt(localStorage.getItem('totalGoals') || '0');
  roundActive         = true;
  roundGoals          = 0;
  timeLeft            = ROUND_DURATION;

  actualizarTimerUI();

  timerInterval = setInterval(() => {
    timeLeft--;
    actualizarTimerUI();
    if (timeLeft <= 0) terminarRonda();
  }, 1000);
}

function actualizarTimerUI() {
  const timerEl = document.querySelector('.timer span:last-child');
  if (timerEl) timerEl.textContent = timeLeft;
}

function terminarRonda() {
  clearInterval(timerInterval);
  timerInterval = null;
  roundActive   = false;

  const total    = parseInt(localStorage.getItem('totalGoals') || '0');
  const umbrales = Object.values(GOAL_THRESHOLDS).sort((a, b) => a - b);

  // Checkpoint: umbral más alto ya desbloqueado antes de esta ronda
  const checkpoint     = umbrales.filter(u => totalAntesDeLaRonda >= u).pop() || 0;
  const siguienteUmbral = umbrales.find(u => u > checkpoint) || Infinity;

  // Si no se alcanzó el siguiente umbral, resetear al checkpoint
  if (total < siguienteUmbral) {
    localStorage.setItem('totalGoals', checkpoint);
    const scoreSpan = document.querySelector('.score span:last-child');
    if (scoreSpan) scoreSpan.textContent = checkpoint;
  }

  mostrarResultado(roundGoals);
}

function mostrarResultado(goles) {
  const wrapper = document.querySelector('.wrapper-msg');
  const titulo  = wrapper.querySelector('.dnsm-uno span');
  const texto   = wrapper.querySelector('.dnsm-dos span:last-child');

  titulo.textContent = `${goles} GOAL${goles !== 1 ? 'S' : ''}`;
  texto.textContent  = goles === 0
    ? 'No goals this round. Try again!'
    : `You scored ${goles} goal${goles !== 1 ? 's' : ''} this round!`;

  wrapper.style.display       = 'block';
  wrapper.style.pointerEvents = 'all';

  const btnGo = wrapper.querySelector('.dnsg-btn');
  btnGo.querySelector('span').textContent = 'PLAY AGAIN';
  btnGo.onclick = () => {
    wrapper.style.display       = 'none';
    wrapper.style.pointerEvents = 'none';
  };

  const hideBtn = wrapper.querySelector('#hide');
  hideBtn.onclick = () => {
    wrapper.style.display       = 'none';
    wrapper.style.pointerEvents = 'none';
  };

  wrapper.addEventListener('touchend', e => {
    if (e.target.closest('.dnsg-btn, #hide, #hide span')) return;
    e.stopPropagation();
  }, { capture: true });

  wrapper.addEventListener('click', e => {
    if (e.target.closest('.dnsg-btn, #hide, #hide span')) return;
    e.stopPropagation();
  }, { capture: true });
}

// ============================================================
//  GOLES
// ============================================================
function registrarGol() {
  const total = (parseInt(localStorage.getItem('totalGoals') || '0')) + 1;
  localStorage.setItem('totalGoals', total);

  if (roundActive) roundGoals++;

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

// ============================================================
//  MENSAJE DESBLOQUEO
// ============================================================
function mostrarMensajePais(pais) {
  const wrapper = document.querySelector('.wrapper-msg');
  const titulo  = wrapper.querySelector('.dnsm-uno span');
  const texto   = wrapper.querySelector('.dnsm-dos span:last-child');

  const info = {
    USA:    { titulo: 'U.S.A',  texto: '100 goals! You can now explore USA.' },
    CANADA: { titulo: 'CANADA', texto: '200 goals! You can now explore Canada.' },
  };

  if (info[pais]) {
    titulo.textContent = info[pais].titulo;
    texto.textContent  = info[pais].texto;
  }

  if (roundActive) clearInterval(timerInterval);

  wrapper.style.display       = 'block';
  wrapper.style.pointerEvents = 'all';

  const btnGo = wrapper.querySelector('.dnsg-btn');
  btnGo.querySelector('span').textContent = 'CHECK OUT';
  btnGo.onclick = () => { window.location.href = 'world.html'; };

  const hideBtn = wrapper.querySelector('#hide');
  hideBtn.onclick = () => {
    wrapper.style.display       = 'none';
    wrapper.style.pointerEvents = 'none';

    if (roundActive && timeLeft > 0) {
      timerInterval = setInterval(() => {
        timeLeft--;
        actualizarTimerUI();
        if (timeLeft <= 0) terminarRonda();
      }, 1000);
    }
  };

  wrapper.addEventListener('touchend', e => {
    if (e.target.closest('.dnsg-btn, #hide, #hide span')) return;
    e.stopPropagation();
  }, { capture: true });

  wrapper.addEventListener('click', e => {
    if (e.target.closest('.dnsg-btn, #hide, #hide span')) return;
    e.stopPropagation();
  }, { capture: true });

  if (window.isSfxOn?.() !== false) {
    const sfxUnlock = new Audio('resources/sfx/2.wav');
    sfxUnlock.play();
  }

  setTimeout(() => {
    crearParticulas(window.innerWidth * 0.5, window.innerHeight * 0.3);
    setTimeout(() => crearParticulas(window.innerWidth * 0.2, window.innerHeight * 0.5), 250);
    setTimeout(() => crearParticulas(window.innerWidth * 0.8, window.innerHeight * 0.5), 450);
    setTimeout(() => crearParticulas(window.innerWidth * 0.5, window.innerHeight * 0.7), 650);
  }, 100);
}

// ============================================================
//  INIT
// ============================================================
document.querySelector('a-scene').addEventListener('loaded', () => {
  const scene = document.querySelector('a-scene');
  scene.setAttribute('tap-shoot', '');
  scene.setAttribute('net-controller', '');
});

document.addEventListener('DOMContentLoaded', () => {
  const totalGuardado = parseInt(localStorage.getItem('totalGoals') || '0');
  const scoreSpan = document.querySelector('.score span:last-child');
  if (scoreSpan) scoreSpan.textContent = totalGuardado;

  actualizarTimerUI();
});