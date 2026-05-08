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
  const modelo        = document.getElementById('player-padre');
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
//  El campo "target" debe coincidir con el targetIndex del .mind
// ============================================================
const players = [
  {
    nombre: 'Santiago Gimenez',
    descripcion: 'Mexico national team striker and AC Milan forward, recognized for his lethal finishing, positioning, and consistent goal-scoring performances in European football.',
    textura: './models/textures/mexico.png',
    lvl: 43, lvlMax: 100, fuerza: 900, total: 925,
    pais: './resources/UI/paises/mexico.png',
    target: 6
  },
  {
    nombre: 'Percy Tau',
    descripcion: 'South Africa attacking forward known for his creativity, agility, and decisive impact in CAF competitions and international matches.',
    textura: './models/textures/sudafrica.png',
    lvl: 35, lvlMax: 100, fuerza: 840, total: 865,
    pais: './resources/UI/paises/sudafrica.png',
    target: 9
  },
  {
    nombre: 'Son Heung-min',
    descripcion: 'South Korea captain and world-class Premier League forward, known for elite finishing, explosive pace, and leadership at the highest level.',
    textura: './models/textures/coreadelsur.png',
    lvl: 48, lvlMax: 100, fuerza: 950, total: 975,
    pais: './resources/UI/paises/coreadelsur.png',
    target: 5
  },
  {
    nombre: 'Patrik Schick',
    descripcion: 'Czech Republic striker recognized for his aerial dominance, powerful shooting, and consistent scoring ability in top European competitions.',
    textura: './models/textures/republicacheca.png',
    lvl: 39, lvlMax: 100, fuerza: 895, total: 910,
    pais: './resources/UI/paises/republicacheca.png',
    target: 4
  },
  {
    nombre: 'Alphonso Davies',
    descripcion: 'Canada captain and Bayern Munich superstar, famous for his incredible speed, attacking runs, and defensive versatility.',
    textura: './models/textures/canada.png',
    lvl: 47, lvlMax: 100, fuerza: 940, total: 965,
    pais: './resources/UI/paises/canada.png',
    target: 3
  },
  {
    nombre: 'Edin Dzeko',
    descripcion: 'Bosnia veteran striker with elite experience in European football, known for leadership, finishing, and physical presence in attack.',
    textura: './models/textures/bozniayherzegovina.png',
    lvl: 37, lvlMax: 100, fuerza: 870, total: 885,
    pais: './resources/UI/paises/bozniayherzegovina.png',
    target: 2
  },
  {
    nombre: 'Akram Afif',
    descripcion: 'Qatar attacking star and Asian Cup standout, highly creative with exceptional dribbling, vision, and offensive playmaking.',
    textura: './models/textures/catar.png',
    lvl: 41, lvlMax: 100, fuerza: 890, total: 910,
    pais: './resources/UI/paises/catar.png',
    target: 8
  },
  {
    nombre: 'Granit Xhaka',
    descripcion: 'Switzerland captain and elite midfielder, known for leadership, tactical intelligence, long passing, and control of the game tempo.',
    textura: './models/textures/suiza.png',
    lvl: 44, lvlMax: 100, fuerza: 915, total: 930,
    pais: './resources/UI/paises/suiza.png',
    target: 10
  },
  {
    nombre: 'Christian Pulisic',
    descripcion: 'USA captain and AC Milan star, considered the most influential American player of his generation with elite dribbling and attacking creativity.',
    textura: './models/textures/usa.png',
    lvl: 45, lvlMax: 100, fuerza: 925, total: 945,
    pais: './resources/UI/paises/eeuu.png',
    target: 12
  },
  {
    nombre: 'Miguel Almiron',
    descripcion: 'Paraguay attacking midfielder known for his speed, energy, and ability to create danger through counterattacks and long-range runs.',
    textura: './models/textures/paraguay.png',
    lvl: 40, lvlMax: 100, fuerza: 885, total: 900,
    pais: './resources/UI/paises/paraguay.png',
    target: 7
  },
  {
    nombre: 'Mathew Ryan',
    descripcion: 'Australia national team captain and experienced goalkeeper, recognized for his reflexes, leadership, and consistency in international tournaments.',
    textura: './models/textures/australia.png',
    lvl: 38, lvlMax: 100, fuerza: 875, total: 890,
    pais: './resources/UI/paises/australia.png',
    target: 1
  },
  {
    nombre: 'Hakan Calhanoglu',
    descripcion: 'Turkey captain and Inter Milan midfielder, recognized for his world-class passing, leadership, long-range shooting, and control in midfield.',
    textura: './models/textures/turkey.png',
    lvl: 45, lvlMax: 100, fuerza: 925, total: 945,
    pais: './resources/UI/paises/turquia.png',
    target: 11
  },
];

// ============================================================
//  EXTRA CARDS DATA
// ============================================================

const playerExtraCards = [
  {
    nombre: 'Santiago Gimenez',
    performance: 'Consistent high-level striker in European football, regularly delivering goals through smart positioning and fast finishing inside the penalty area.',
    strengthProfile: 'Clinical finisher with excellent anticipation and composure. Strong movement off the ball and highly effective during quick attacking transitions.'
  },
  {
    nombre: 'Percy Tau',
    performance: 'Important attacking figure for South Africa, contributing with assists, creativity, and dynamic offensive plays in major African competitions.',
    strengthProfile: 'Quick dribbler with agility and acceleration. Excels in one-on-one situations and creating offensive opportunities in tight spaces.'
  },
  {
    nombre: 'Son Heung-min',
    performance: 'Elite-level performer in international and club football, consistently delivering goals and assists in high-pressure matches.',
    strengthProfile: 'World-class speed and finishing with both feet. Exceptional in counterattacks, diagonal runs, and long-range shooting.'
  },
  {
    nombre: 'Patrik Schick',
    performance: 'Reliable goal scorer with strong performances in European leagues and international tournaments. Constant aerial threat in attacking situations.',
    strengthProfile: 'Powerful striker with elite heading ability and strong shooting technique. Dangerous both inside and outside the penalty box.'
  },
  {
    nombre: 'Alphonso Davies',
    performance: 'One of the most explosive full-backs in world football, constantly contributing to both defense and attack at elite level.',
    strengthProfile: 'Exceptional acceleration and stamina. Dominates wide areas with dribbling, overlapping runs, and defensive recoveries.'
  },
  {
    nombre: 'Edin Dzeko',
    performance: 'Experienced striker still performing at high level through intelligent positioning, leadership, and reliable finishing.',
    strengthProfile: 'Strong target forward with excellent aerial ability and hold-up play. Effective in physical duels and penalty-area finishing.'
  },
  {
    nombre: 'Akram Afif',
    performance: 'Key offensive leader for Qatar, consistently creating chances and contributing goals in Asian competitions.',
    strengthProfile: 'Creative playmaker with outstanding dribbling and vision. Effective at breaking defensive lines and generating assists.'
  },
  {
    nombre: 'Granit Xhaka',
    performance: 'Consistent midfield leader capable of controlling the tempo of matches while contributing defensively and offensively.',
    strengthProfile: 'Excellent passer with tactical awareness and physical presence. Strong long-range shooting and defensive positioning.'
  },
  {
    nombre: 'Christian Pulisic',
    performance: 'Top performer for the USMNT and European football, regularly contributing goals and assists in decisive moments.',
    strengthProfile: 'Creative winger with elite close control and agility. Dangerous in one-on-one situations and highly effective at creating scoring opportunities.'
  },
  {
    nombre: 'Miguel Almiron',
    performance: 'Energetic attacking midfielder capable of changing matches through pace, pressing, and fast offensive transitions.',
    strengthProfile: 'Explosive runner with high stamina and quick dribbling. Effective in counterattacks and creating space between defensive lines.'
  },
  {
    nombre: 'Mathew Ryan',
    performance: 'Experienced goalkeeper with strong performances in international tournaments, providing leadership and key saves under pressure.',
    strengthProfile: 'Quick reflexes and strong positioning. Reliable shot-stopper with leadership and composure in defensive organization.'
  },
  {
    nombre: 'Hakan Calhanoglu',
    performance: 'Elite midfielder consistently performing at the highest European level, controlling matches through passing accuracy, vision, and leadership.',
    strengthProfile: 'Exceptional playmaker with powerful long shots, set-piece mastery, and excellent tactical awareness. Strong in possession and tempo control.'
  },
];

// ============================================================
//  CARTAS POR JUGADOR
// ============================================================
function actualizarCartas(index) {
  const p     = players[index];
  const extra = playerExtraCards.find(e => e.nombre === p.nombre);
  const cards = document.querySelectorAll('.card-stack .card');
  const stack = document.querySelector('.card-stack');

  if (!extra) { stack.style.display = 'none'; return; }

  cards.forEach(card => {
    const overlay = card.querySelector('.card-overlay');
    if (overlay) overlay.style.display = 'none';
  });

  cards[0].querySelector('span').textContent = extra.performance;
  cards[1].querySelector('span').textContent = extra.strengthProfile;
}

// ============================================================
//  RENDER INFO
// ============================================================
function renderPlayerInfo(index) {
  const p = players[index];
  document.getElementById('player-nombre').textContent      = p.nombre;
  document.getElementById('player-descripcion').textContent = p.descripcion;
  document.getElementById('player-lvl').textContent         = p.lvl;
  document.getElementById('player-lvl-txt').textContent     = `${p.lvl}/${p.lvlMax}`;
  document.getElementById('player-fuerza').textContent      = p.fuerza;
  document.getElementById('player-total').textContent       = p.total;
  document.getElementById('country').src                    = p.pais;

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
  actualizarCartas(index);
  document.querySelector('.card-stack').style.display = 'none';
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

function cambiarTexturaEnModelo(modelo, urlTextura) {
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
  const modelo = document.getElementById('player-padre');
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

// ============================================================
//  BLOQUEO DE BOTONES POR TRIVIA
// ============================================================
function actualizarBotones() {
  const answered       = parseInt(localStorage.getItem('triviaAnswered') || '0');
  const botonesActivos = Math.floor(answered / 5);

  const botones = [
    { id: 'btn-anim-1' },
    { id: 'btn-anim-2' },
    { id: 'btn-anim-3' },
    { id: 'btn-anim-4' },
  ];

  botones.forEach(({ id }, index) => {
    const el = document.getElementById(id);
    if (!el) return;

    const desbloqueado     = index < botonesActivos;
    el.style.opacity       = desbloqueado ? '1' : '0.5';
    el.style.cursor        = desbloqueado ? 'pointer' : 'not-allowed';
    el.style.pointerEvents = desbloqueado ? 'auto' : 'none';
    el.title = desbloqueado ? '' : `Completa el nivel ${index + 1} para desbloquear`;
  });
}

// ============================================================
//  INIT — lógica por target en vez de prev/next
// ============================================================
let playerActual    = 0;
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

  // Ocultar prev/next — ya no se usan
  document.getElementById('prev-btn').style.display = 'none';
  document.getElementById('next-btn').style.display = 'none';

  const scene = document.querySelector('a-scene');

  scene.addEventListener('arReady', () => {

    players.forEach((player, index) => {
      const target = document.querySelector(`[mindar-image-target="targetIndex: ${player.target}"]`);
      if (!target) return;

      target.addEventListener('targetFound', () => {
        targetDetectado = true;
        playerActual    = index;

        // Buscar el modelo dentro de este target específico
        const modeloEnTarget = target.querySelector('[gltf-model]');

        document.getElementById('player-name').classList.add('activo');
        renderPlayerInfo(index);
        actualizarCartas(index);
        document.querySelector('.card-stack').style.display = 'none';

        if (modeloEnTarget) {
          const aplicar = () => {
            cambiarTexturaEnModelo(modeloEnTarget, player.textura);
            setTimeout(() => {
              modeloEnTarget.setAttribute('animation-mixer', {
                clip: 'idle',
                loop: 'repeat',
                crossFadeDuration: 0.3
              });
            }, 100);
          };
          if (modeloEnTarget.components['gltf-model']?.model) {
            aplicar();
          } else {
            modeloEnTarget.addEventListener('model-loaded', aplicar, { once: true });
          }
        }
      });

      target.addEventListener('targetLost', () => {
        targetDetectado = false;
        document.getElementById('player-name').classList.remove('activo');

        document.getElementById('player-descripcion').textContent = 'Scan to interact.';
        document.getElementById('player-nombre').textContent      = '';
        document.getElementById('player-lvl').textContent         = '?';
        document.getElementById('player-lvl-txt').textContent     = '?/?';
        document.getElementById('player-fuerza').textContent      = '?';
        document.getElementById('player-total').textContent       = '?';
        document.getElementById('player-lvl-bar').style.width     = '0%';
        document.getElementById('country').src                    = '';
        document.querySelector('.card-stack').style.display        = 'none';
      });
    });

  });

  document.getElementById('player-padre').addEventListener('model-loaded', listarAnimaciones);
});