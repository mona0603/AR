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
    descripcion: 'Mexico national team striker and Feyenoord star, recognized for his positioning, finishing, and consistent goal scoring in European competitions.',
    textura: './models/textures/mexico.png',
    lvl: 41,
    lvlMax: 100,
    fuerza: 885,
    total: 910,
    pais: './resources/UI/paises/mexico.png'
  },
  {
    nombre: 'Percy Tau',
    descripcion: 'South Africa forward and Al Ahly player, known for his agility, creativity, and impact in African international competitions.',
    textura: './models/textures/sudafrica.png',
    lvl: 34,
    lvlMax: 100,
    fuerza: 830,
    total: 855,
    pais: './resources/UI/paises/sudafrica.png'
  },
  {
    nombre: 'Son Heung-min',
    descripcion: 'South Korea captain and Tottenham star, elite forward with world-class finishing, speed, and leadership at the highest level.',
    textura: './models/textures/coreadelsur.png',
    lvl: 47,
    lvlMax: 100,
    fuerza: 945,
    total: 970,
    pais: './resources/UI/paises/coreadelsur.png'
  },
  {
    nombre: 'Patrik Schick',
    descripcion: 'Czech Republic striker playing in Bundesliga, known for his aerial ability, powerful shots, and clinical finishing.',
    textura: './models/textures/republicacheca.png',
    lvl: 38,
    lvlMax: 100,
    fuerza: 890,
    total: 900,
    pais: './resources/UI/paises/republicacheca.png'
  },

  {
    nombre: 'Alphonso Davies',
    descripcion: 'Canada captain and Bayern Munich full-back, famous for his explosive pace, dribbling, and attacking contribution from defense.',
    textura: './models/textures/canada.png',
    lvl: 46,
    lvlMax: 100,
    fuerza: 935,
    total: 960,
    pais: './resources/UI/paises/canada.png'
  },
  {
    nombre: 'Edin Dzeko',
    descripcion: 'Bosnia veteran striker with vast European experience, known for his positioning, strength, and leadership in attack.',
    textura: './models/textures/bozniayherzegovina.png',
    lvl: 36,
    lvlMax: 100,
    fuerza: 865,
    total: 875,
    pais: './resources/UI/paises/bozniayherzegovina.png'
  },
  {
    nombre: 'Akram Afif',
    descripcion: 'Qatar star forward and Asian Cup standout, highly creative with excellent dribbling and playmaking ability.',
    textura: './models/textures/catar.png',
    lvl: 39,
    lvlMax: 100,
    fuerza: 880,
    total: 900,
    pais: './resources/UI/paises/catar.png'
  },
  {
    nombre: 'Granit Xhaka',
    descripcion: 'Switzerland captain and Bundesliga midfielder, known for his leadership, passing accuracy, and tactical intelligence.',
    textura: './models/textures/suiza.png',
    lvl: 43,
    lvlMax: 100,
    fuerza: 910,
    total: 925,
    pais: './resources/UI/paises/suiza.png'
  },

  {
    nombre: 'Vinicius Jr',
    descripcion: 'Brazil superstar and Real Madrid winger, one of the best players in the world with elite dribbling, speed, and decisive impact in big matches.',
    textura: './models/textures/brasil.png',
    lvl: 49,
    lvlMax: 100,
    fuerza: 965,
    total: 985,
    pais: './resources/UI/paises/brazil.png'
  },
  {
    nombre: 'Achraf Hakimi',
    descripcion: 'Morocco international and PSG full-back, known for his speed, attacking runs, and defensive reliability.',
    textura: './models/textures/marruecos.png',
    lvl: 45,
    lvlMax: 100,
    fuerza: 925,
    total: 945,
    pais: './resources/UI/paises/marruecos.png'
  },
  {
    nombre: 'Duckens Nazon',
    descripcion: 'Haiti striker and key national team figure, contributing with goals and physical presence in CONCACAF competitions.',
    textura: './models/textures/haiti.png',
    lvl: 32,
    lvlMax: 100,
    fuerza: 810,
    total: 830,
    pais: './resources/UI/paises/haiti.png'
  },
  {
    nombre: 'Andrew Robertson',
    descripcion: 'Scotland captain and Liverpool full-back, known for his stamina, crossing ability, and leadership on the pitch.',
    textura: './models/textures/escocia.png',
    lvl: 44,
    lvlMax: 100,
    fuerza: 915,
    total: 935,
    pais: './resources/UI/paises/escocia.png'
  }
];

let playerActual = 0;

// ============================================================
//  EXTRA CARDS DATA
// ============================================================
const playerExtraCards = [
  {
    nombre: 'Santiago Gimenez',
    performance: 'High-impact striker in European leagues, consistently scoring goals with excellent positioning and composure. Performs best inside the box and in quick attacking plays.',
    strengthProfile: 'Strong finisher with great off-ball movement. Excels in positioning, anticipation, and first-touch shots. Reliable under pressure situations.'
  },
  {
    nombre: 'Percy Tau',
    performance: 'Key offensive player in African competitions, contributing with assists and dynamic attacking plays. Known for stepping up in important matches.',
    strengthProfile: 'Agile dribbler with quick acceleration and creativity. Effective in one-on-one situations and generating space in tight defenses.'
  },
  {
    nombre: 'Son Heung-min',
    performance: 'Top-level forward in the Premier League, consistently delivering goals and assists. Proven performer in high-pressure matches and international tournaments.',
    strengthProfile: 'Elite speed and finishing with both feet. Dangerous in counterattacks, long-range shots, and off-the-ball runs behind defenses.'
  },
  {
    nombre: 'Patrik Schick',
    performance: 'Reliable goal scorer in Bundesliga and international tournaments. Strong presence in the box and effective in aerial duels.',
    strengthProfile: 'Powerful striker with excellent heading and shooting strength. Threat from distance and highly effective in physical play.'
  },
  {
    nombre: 'Alphonso Davies',
    performance: 'Top-performing full-back in elite European football, contributing both defensively and offensively with assists and constant runs.',
    strengthProfile: 'Exceptional speed and stamina. Dominates the wing with dribbling, overlaps, and recovery runs in defense.'
  },
  {
    nombre: 'Edin Dzeko',
    performance: 'Experienced forward still contributing with goals and leadership. Plays a key role in team structure and attacking transitions.',
    strengthProfile: 'Strong target man with excellent positioning and aerial ability. Holds up play and finishes effectively inside the box.'
  },
  {
    nombre: 'Akram Afif',
    performance: 'Standout player in Asian competitions, leading his team with goals and assists. Highly influential in offensive build-up.',
    strengthProfile: 'Creative playmaker with strong dribbling and vision. Excels in chance creation and breaking defensive lines.'
  },
  {
    nombre: 'Granit Xhaka',
    performance: 'Consistent midfield leader in European football, controlling tempo and contributing both defensively and offensively.',
    strengthProfile: 'Strong passer with tactical intelligence and physical presence. Excellent long shots and defensive positioning.'
  },
  {
    nombre: 'Vinicius Jr',
    performance: 'One of the most decisive players in world football, delivering goals and assists in top competitions including knockout stages.',
    strengthProfile: 'Explosive winger with elite dribbling and acceleration. Unpredictable, strong in one-on-one situations and clutch moments.'
  },
  {
    nombre: 'Achraf Hakimi',
    performance: 'Consistent high-level performer in European competitions, contributing with assists and defensive stability.',
    strengthProfile: 'Extremely fast full-back with great stamina. Constant attacking runs and solid defensive recovery.'
  },
  {
    nombre: 'Duckens Nazon',
    performance: 'Key offensive player for his national team, contributing goals in regional competitions and qualifiers.',
    strengthProfile: 'Physical striker with strength and finishing ability. Effective in hold-up play and aerial duels.'
  },
  {
    nombre: 'Andrew Robertson',
    performance: 'Consistent top-level performer in the Premier League, contributing assists and maintaining defensive solidity.',
    strengthProfile: 'High endurance full-back with precise crossing. Strong leadership and constant presence on the wing.'
  }
];

// ============================================================
//  CARTAS POR JUGADOR
// ============================================================
function actualizarCartas(index) {
  const p       = players[index];
  const extra   = playerExtraCards.find(e => e.nombre === p.nombre);
  const cards   = document.querySelectorAll('.card-stack .card');
  const stack   = document.querySelector('.card-stack');

  if (!extra) {
    stack.style.display = 'none';
    return;
  }

  // Ocultar todos los overlays — no se usan aquí
  cards.forEach(card => {
    const overlay = card.querySelector('.card-overlay');
    if (overlay) overlay.style.display = 'none';
  });

  // Carta 1 → performance
  cards[0].querySelector('span').textContent = extra.performance;
  // Carta 2 → strengthProfile
  cards[1].querySelector('span').textContent = extra.strengthProfile;

  // stack.style.display = 'block';
}

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
  actualizarCartas(index);          // actualiza contenido
  document.querySelector('.card-stack').style.display = 'none'; // cierra al cambiar jugador
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

let targetDetectado = false;
document.addEventListener('DOMContentLoaded', () => {

  document.querySelector('.country-w').addEventListener('click', () => {
    if (!targetDetectado) return;
    
    const stack   = document.querySelector('.card-stack');
    const visible = stack.style.display === 'block';
    stack.style.display = visible ? 'none' : 'block';
    actualizarCartas(playerActual);
  });

  actualizarBotones();
  bloquearNavegacion();

  document.getElementById('prev-btn').addEventListener('click', function () {
    playerActual = (playerActual - 1 + players.length) % players.length;
    aplicarPlayer(playerActual);
    // explotar(this);
  });

  document.getElementById('next-btn').addEventListener('click', function () {
    playerActual = (playerActual + 1) % players.length;
    aplicarPlayer(playerActual);
    // explotar(this);
  });

  const target = document.querySelector('[mindar-image-target]');
  target.addEventListener('targetFound', () => {
    targetDetectado = true;
    document.getElementById('player-name').classList.add('activo');
    desbloquearNavegacion();
    // mostrarStats();
    aplicarPlayer(playerActual);
  });

  target.addEventListener('targetLost', () => {
    targetDetectado = false;

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

    document.querySelector('.card-stack').style.display = 'none';
  });

  document.getElementById('player-padre').addEventListener('model-loaded', listarAnimaciones);
});