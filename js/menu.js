// ============================================================
//  MENÚ — abrir / cerrar
// ============================================================
const menuBtn    = document.getElementById('menuBtn');
const menuExpand = document.getElementById('menuExpand');
const closeMenu  = document.getElementById('closeMenu');
const overlay    = document.getElementById('overlay');

function openMenu() {
  menuExpand.classList.add('active');
  overlay.classList.add('active');
}

function closeMenuFn() {
  menuExpand.classList.remove('active');
  overlay.classList.remove('active');
}

menuBtn.addEventListener('click', openMenu);
closeMenu.addEventListener('click', closeMenuFn);
overlay.addEventListener('click', closeMenuFn);   // cerrar al tocar fuera

// ============================================================
//  AUDIO — estado inicial (ambos ON)
// ============================================================
const audioState = {
  sfx:   true,
  music: true,
};

// Lee las preferencias guardadas en localStorage
// Si el usuario apagó algo antes, se restaura el estado
['sfx', 'music'].forEach(key => {
  const saved = localStorage.getItem(`audio_${key}`);
  if (saved === '0') audioState[key] = false;
  applyToggle(key);   // aplica visualmente el estado guardado
});

// ============================================================
//  applyToggle — sincroniza CSS con el estado actual
// ============================================================
function applyToggle(key) {
  const isOn = audioState[key];
  const btn  = document.getElementById(`${key}Btn`);
  const icon = document.getElementById(`${key}-icon`);

  btn.classList.toggle('on', isOn);

  if (key === 'sfx') {
    icon.textContent = isOn ? 'music_note' : 'music_off';
  } else {
    icon.textContent = isOn ? 'volume_up' : 'volume_off';

    // ← Pausa o reanuda la música de fondo
    if (window.bgMusic) {
      if (isOn) {
        window.bgMusic.play();
      } else {
        window.bgMusic.pause();
      }
    }
  }

  localStorage.setItem(`audio_${key}`, isOn ? '1' : '0');
}

// ============================================================
//  toggleAudio — invierte el estado y actualiza la UI
// ============================================================
function toggleAudio(key) {
  audioState[key] = !audioState[key];
  applyToggle(key);
}

document.getElementById('sfxBtn').addEventListener('click',  () => toggleAudio('sfx'));
document.getElementById('musicBtn').addEventListener('click', () => toggleAudio('music'));

// ============================================================
//  Exportar para otros archivos (dns.js, etc.)
//  Uso: if (window.isSfxOn()) new Audio('sounds/gol.wav').play();
// ============================================================
window.isSfxOn   = () => audioState.sfx;
window.isMusicOn = () => audioState.music;