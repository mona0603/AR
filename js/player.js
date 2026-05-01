// ============================================================
//  TOUCH-ROTATE
// ============================================================
AFRAME.registerComponent('touch-rotate', {
  init() {
    this.prevX    = 0;
    this.prevY    = 0;
    this.startX   = 0;
    this.startY   = 0;
    this.dragging = false;
    this.moved    = false;

    window.addEventListener('touchstart', e => {
      this.dragging      = true;
      this.moved         = false;
      window._touchMoved = false;
      this.startX        = e.touches[0].clientX;
      this.startY        = e.touches[0].clientY;
      this.prevX         = this.startX;
      this.prevY         = this.startY;
    }, { passive: true });

    window.addEventListener('touchmove', e => {
      if (!this.dragging) return;
      const dx    = e.touches[0].clientX - this.prevX;
      const dy    = e.touches[0].clientY - this.prevY;
      const distX = e.touches[0].clientX - this.startX;
      const distY = e.touches[0].clientY - this.startY;

      if (Math.sqrt(distX * distX + distY * distY) > 5) {
        this.moved         = true;
        window._touchMoved = true;
      }

      if (this.moved) {
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
//  OVERLAY MENSAJE
// ============================================================
function mostrarMensaje(texto) {
  document.getElementById('mensaje-texto').textContent = texto;
  document.getElementById('mensaje-overlay').style.display = 'block';
}

function cerrarMensaje() {
  document.getElementById('mensaje-overlay').style.display = 'none';
}

// ============================================================
//  ANIMACIONES
// ============================================================
function listarAnimaciones() {
  const modelo       = document.getElementById('player-padre');
  const gltfComponent = modelo.components['gltf-model'];

  if (gltfComponent && gltfComponent.model && gltfComponent.model.animations) {
    const nombres = gltfComponent.model.animations.map(a => a.name).join(', ');
    console.log('Animaciones:', nombres);

    setTimeout(() => {
      modelo.setAttribute('animation-mixer', {
        clip: 'idle',
        loop: 'repeat',
        crossFadeDuration: 0.3
      });
    }, 100);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('player-padre').addEventListener('model-loaded', listarAnimaciones);
});

function reproducirAnimacion(nombreAnimacion) {
  const modelo = document.getElementById('player-padre');
  if (!modelo) return;

  modelo.removeAttribute('animation-mixer');

  setTimeout(() => {
    modelo.setAttribute('animation-mixer', {
      clip: nombreAnimacion,
      loop: 'once',
      crossFadeDuration: 0.0
    });

    const duracion = obtenerDuracionAnimacion(nombreAnimacion);

    setTimeout(() => {
      modelo.removeAttribute('animation-mixer');
      setTimeout(() => {
        modelo.setAttribute('animation-mixer', {
          clip: 'idle',
          loop: 'repeat',
          crossFadeDuration: 0.0
        });
      }, 50);
    }, duracion);
  }, 50);
}

function obtenerDuracionAnimacion(nombre) {
  const modelo = document.getElementById('player-padre');
  if (!modelo || !modelo.components['gltf-model']) return 2000;

  const gltf = modelo.components['gltf-model'];
  if (gltf.model && gltf.model.animations) {
    const anim = gltf.model.animations.find(a => a.name === nombre);
    if (anim) return (anim.duration || 2) * 1000;
  }
  return 2000;
}

// ============================================================
//  DATOS DE PLAYERS
// ============================================================
const players = 
[
  {
    nombre: 'Santiago Gimenez',
    descripcion: 'Mexico star striker, known for his goal-scoring ability in European football.',
    textura: './models/textures/mexico.png',
    lvl: 38,
    lvlMax: 100,
    fuerza: 870,
    total: 900,
    pais: './resources/UI/paises/mexico.png'
  },
  {
    nombre: 'Percy Tau',
    descripcion: 'South Africa offensive leader, fast and skillful in attack.',
    textura: './models/textures/sudafrica.png',
    lvl: 32,
    lvlMax: 100,
    fuerza: 820,
    total: 845,
    pais: './resources/UI/paises/sudafrica.png'
  },
  {
    nombre: 'Son Heung-min',
    descripcion: 'Global star of South Korea, known for his speed and finishing ability.',
    textura: './models/textures/coreadelsur.png',
    lvl: 45,
    lvlMax: 100,
    fuerza: 940,
    total: 960,
    pais: './resources/UI/paises/coreadelsur.png'
  },
  {
    nombre: 'Patrik Schick',
    descripcion: 'Czech Republic striker, powerful and deadly inside the box.',
    textura: './models/textures/republicacheca.png',
    lvl: 36,
    lvlMax: 100,
    fuerza: 880,
    total: 890,
    pais: './resources/UI/paises/republicacheca.png'
  },

  {
    nombre: 'Alphonso Davies',
    descripcion: 'Canada top player, known for his explosive speed and wing play.',
    textura: './models/textures/canada.png',
    lvl: 44,
    lvlMax: 100,
    fuerza: 930,
    total: 955,
    pais: './resources/UI/paises/canada.png'
  },
  {
    nombre: 'Edin Dzeko',
    descripcion: 'Bosnia veteran striker, key offensive reference for the team.',
    textura: './models/textures/bozniayherzegovina.png',
    lvl: 34,
    lvlMax: 100,
    fuerza: 860,
    total: 870,
    pais: './resources/UI/paises/bozniayherzegovina.png'
  },
  {
    nombre: 'Akram Afif',
    descripcion: 'Qatar main playmaker, creative and dangerous in attack.',
    textura: './models/textures/catar.png',
    lvl: 35,
    lvlMax: 100,
    fuerza: 870,
    total: 880,
    pais: './resources/UI/paises/catar.png'
  },
  {
    nombre: 'Granit Xhaka',
    descripcion: 'Switzerland midfield leader, strong with excellent vision.',
    textura: './models/textures/suiza.png',
    lvl: 40,
    lvlMax: 100,
    fuerza: 900,
    total: 910,
    pais: './resources/UI/paises/suiza.png'
  },

  {
    nombre: 'Vinicius Jr',
    descripcion: 'Brazil superstar winger, highly skilled and one of the best in the world.',
    textura: './models/textures/brasil.png',
    lvl: 47,
    lvlMax: 100,
    fuerza: 960,
    total: 980,
    pais: './resources/UI/paises/brazil.png'
  },
  {
    nombre: 'Achraf Hakimi',
    descripcion: 'Morocco attacking full-back, fast and decisive on both ends of the pitch.',
    textura: './models/textures/marruecos.png',
    lvl: 43,
    lvlMax: 100,
    fuerza: 920,
    total: 940,
    pais: './resources/UI/paises/marruecos.png'
  },
  {
    nombre: 'Duckens Nazon',
    descripcion: 'Haiti main striker, leading offensive figure of the team.',
    textura: './models/textures/haiti.png',
    lvl: 30,
    lvlMax: 100,
    fuerza: 800,
    total: 820,
    pais: './resources/UI/paises/haiti.png'
  },
  {
    nombre: 'Andrew Robertson',
    descripcion: 'Scotland captain, known for his endurance and leadership.',
    textura: './models/textures/escocia.png',
    lvl: 41,
    lvlMax: 100,
    fuerza: 910,
    total: 925,
    pais: './resources/UI/paises/escocia.png'
  }
];

let playerActual = 0;

// ============================================================
//  RENDER INFO
// ============================================================
function renderPlayerInfo(index) {
  const p = players[index];
  document.getElementById('player-nombre').textContent     = p.nombre;
  document.getElementById('player-descripcion').textContent = p.descripcion;
  document.getElementById('player-lvl').textContent        = p.lvl;
  document.getElementById('player-lvl-txt').textContent    = `${p.lvl}/${p.lvlMax}`;
  document.getElementById('player-fuerza').textContent     = p.fuerza;
  document.getElementById('player-total').textContent      = p.total;
  document.getElementById('country').src = p.pais;

  // Barra de progreso
  const progreso = (p.lvl / p.lvlMax) * 100;
  document.getElementById('player-lvl-bar').style.width = `${progreso}%`;
}

function aplicarPlayer(index) {
  const p = players[index];
  renderPlayerInfo(index);
  if (p.textura === null) {
    restaurarTexturaOriginal();
  } else {
    cambiarTextura(p.textura);
  }
}

// ============================================================
//  TEXTURAS
// ============================================================
function cambiarTextura(urlTextura) {
  const modelo = document.getElementById('player-padre');
  if (!modelo || !modelo.components['gltf-model'] || !modelo.components['gltf-model'].model) return;

  const loader = new THREE.TextureLoader();
  loader.load(urlTextura, texture => {
    texture.flipY       = false;
    texture.encoding    = THREE.sRGBEncoding;
    texture.needsUpdate = true;

    modelo.object3D.traverse(child => {
      if (child.isMesh) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach(mat => {
          mat.map         = texture;
          mat.needsUpdate = true;
        });
      }
    });
  });
}

function restaurarTexturaOriginal() {
  const modelo    = document.getElementById('player-padre');
  if (!modelo) return;
  const currentSrc = modelo.getAttribute('gltf-model');
  modelo.setAttribute('gltf-model', '');

  setTimeout(() => {
    modelo.setAttribute('gltf-model', currentSrc);
    modelo.addEventListener('model-loaded', function reactivarIdle() {
      modelo.removeEventListener('model-loaded', reactivarIdle);
      setTimeout(() => {
        modelo.removeAttribute('animation-mixer');
        setTimeout(() => {
          modelo.setAttribute('animation-mixer', {
            clip: 'idle',
            loop: 'repeat',
            crossFadeDuration: 0.3
          });
        }, 50);
      }, 100);
    });
  }, 100);
}

function cambiarTexturaYSincronizar(url) {
  const idx = players.findIndex(p => p.textura === url);
  if (idx !== -1) {
    playerActual = idx;
    renderPlayerInfo(idx);
  }
  cambiarTextura(url);
}

// ============================================================
//  BLOQUEO DE BOTONES POR TRIVIA
// ============================================================
function actualizarBotones() {
  const answered       = parseInt(localStorage.getItem('triviaAnswered') || '0');
  const botonesActivos = Math.floor(answered / 5); // nivel 1=1 btn, nivel 2=2 btns...

  const botones = [
    { id: 'btn-anim-1', color: '#4CAF50' },
    { id: 'btn-anim-2', color: '#2196F3' },
    { id: 'btn-anim-3', color: '#FF9800' },
    { id: 'btn-anim-4', color: '#9C27B0' },
  ];

  botones.forEach(({ id }, index) => {
    const el = document.getElementById(id);
    if (!el) return;

    const desbloqueado = index < botonesActivos;
    el.style.opacity       = desbloqueado ? '1' : '0.5';
    el.style.cursor        = desbloqueado ? 'pointer' : 'not-allowed';
    el.style.pointerEvents = desbloqueado ? 'auto' : 'none';
    el.title = desbloqueado ? '' : `Completa el nivel ${index + 1} para desbloquear`;
  });
}

// ============================================================
//  BOTONES PREV / NEXT
// ============================================================
// Al inicio — bloquea prev/next
function bloquearNavegacion() {
  document.getElementById('prev-btn').style.pointerEvents = 'none';
  document.getElementById('prev-btn').style.opacity       = '0.3';
  document.getElementById('next-btn').style.pointerEvents = 'none';
  document.getElementById('next-btn').style.opacity       = '0.3';
}

function desbloquearNavegacion() {
  document.getElementById('prev-btn').style.pointerEvents = 'auto';
  document.getElementById('prev-btn').style.opacity       = '1';
  document.getElementById('next-btn').style.pointerEvents = 'auto';
  document.getElementById('next-btn').style.opacity       = '1';
}

document.addEventListener('DOMContentLoaded', () => {
  actualizarBotones();
  bloquearNavegacion();

  document.getElementById('prev-btn').addEventListener('click', function () {
    playerActual = (playerActual - 1 + players.length) % players.length;
    aplicarPlayer(playerActual);
    explotar(this);
  });

  document.getElementById('next-btn').addEventListener('click', function () {
    playerActual = (playerActual + 1) % players.length;
    aplicarPlayer(playerActual);
    explotar(this);
  });

  const target = document.querySelector('[mindar-image-target]');
  target.addEventListener('targetFound', () => {
    document.getElementById('player-name').classList.add('activo');
    desbloquearNavegacion();
    // mostrarStats();
    aplicarPlayer(playerActual);
  });

  target.addEventListener('targetLost', () => {
    document.getElementById('player-name').classList.remove('activo');
    bloquearNavegacion();
    // ocultarStats();
    document.getElementById('player-descripcion').textContent = 'Scan to interact.';
    document.getElementById('player-nombre').textContent = '';

    // Default
    document.getElementById('player-descripcion').textContent = 'Scan to interact.';
    document.getElementById('player-nombre').textContent      = '';
    document.getElementById('player-lvl').textContent         = '?';
    document.getElementById('player-lvl-txt').textContent     = '?/?';
    document.getElementById('player-fuerza').textContent      = '?';
    document.getElementById('player-total').textContent       = '?';
    document.getElementById('player-lvl-bar').style.width     = '0%';
    document.getElementById('country').src = '';
  });

  document.getElementById('player-padre').addEventListener('model-loaded', listarAnimaciones);
});