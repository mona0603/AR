// js/audio.js
const bgMusic  = new Audio('resources/sfx/bg_music.wav');
const sfxClick = new Audio('resources/sfx/6.wav');

bgMusic.loop   = true;
bgMusic.volume = 0.1;

// Arranca en la primera interacción respetando la preferencia guardada
function startMusic() {
  const musicOn = localStorage.getItem('audio_music') !== '0';
  if (musicOn) bgMusic.play();
}

document.addEventListener('click',    startMusic, { once: true });
document.addEventListener('touchend', startMusic, { once: true });

// Exponer para que menu.js pueda pausar/reanudar
window.bgMusic = bgMusic;

// Sonido para los botones al interactuar
document.addEventListener('click', e => {
  if (!e.target.closest('[data-sfx]')) return;
  if (window.isSfxOn?.() === false) return;  // respeta el switch

  sfxClick.currentTime = 0;   // reinicia si se clickea rápido
  sfxClick.play();
}, true);  // capture: true para que funcione en todos los elementos