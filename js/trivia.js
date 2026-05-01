// ─── Sonidos ──────────────────────────────────────────────────────────────────
const sfxPerfect  = new Audio('resources/sfx/2.wav');   // nivel perfecto
const sfxComplete = new Audio('resources/sfx/5.wav');  // nivel completado con fallos

const questions = [
  // Level 1 — Basics (1-5)
  { question: "Players per team on the field?", options: ["9", "10", "11", "12"], answer: 2 },
  { question: "Length of a standard match?", options: ["60 min", "80 min", "90 min", "120 min"], answer: 2 },
  { question: "Most FIFA World Cup wins?", options: ["Germany", "Argentina", "Italy", "Brazil"], answer: 3 },
  { question: "What does a yellow card mean?", options: ["Goal", "Warning", "Penalty", "Offside"], answer: 1 },
  { question: "Who starts play at kickoff?", options: ["Goalkeeper", "Captain", "Any player", "Referee"], answer: 2 },

  // Level 2 — Competitions (6-10)
  { question: "Most Champions League titles?", options: ["Barcelona", "Bayern", "Real Madrid", "AC Milan"], answer: 2 },
  { question: "How often is the World Cup held?", options: ["2 years", "3 years", "4 years", "5 years"], answer: 2 },
  { question: "2014 World Cup host?", options: ["South Africa", "Brazil", "Russia", "Qatar"], answer: 1 },
  { question: "Top league in England?", options: ["La Liga", "Serie A", "Bundesliga", "Premier League"], answer: 3 },
  { question: "Teams in the World Cup finals?", options: ["16", "24", "32", "48"], answer: 2 },

  // Level 3 — Players & Records (11-15)
  { question: "Most Ballon d'Or awards?", options: ["C. Ronaldo", "Messi", "R. Nazário", "Zidane"], answer: 1 },
  { question: "Nickname 'El Fenómeno'?", options: ["Ronaldinho", "C. Ronaldo", "R. Nazário", "Romário"], answer: 2 },
  { question: "'Hand of God' goal scorer?", options: ["Pelé", "Maradona", "Ronaldo", "Zidane"], answer: 1 },
  { question: "Most international goals ever?", options: ["C. Ronaldo", "Messi", "Ali Daei", "Pelé"], answer: 0 },
  { question: "Top scorer in CL history?", options: ["Messi", "Raúl", "C. Ronaldo", "Lewandowski"], answer: 2 },

  // Level 4 — Rules & Tactics (16-20)
  { question: "Penalty kick distance?", options: ["8m", "10m", "11m", "12m"], answer: 2 },
  { question: "VAR stands for?", options: ["Video Assistant Referee", "Virtual Action Review", "Video Action Replay", "Visual Aid Rule"], answer: 0 },
  { question: "Max substitutions per match?", options: ["3", "4", "5", "6"], answer: 2 },
  { question: "Offside is based on?", options: ["Player speed", "Last defender position", "Goal distance", "Pass timing"], answer: 1 },
  { question: "What is a 4-4-2?", options: ["4 def, 4 mid, 2 fwd", "4 fwd, 4 def, 2 mid", "4 mid, 4 fwd, 2 def", "None"], answer: 0 },
];

const TOTAL_QUESTIONS    = questions.length;   // 20
const QUESTIONS_PER_LEVEL = 5;
const TOTAL_LEVELS        = TOTAL_QUESTIONS / QUESTIONS_PER_LEVEL; // 4

// ─── State ────────────────────────────────────────────────────────────────────
// levelData[i] = { completed: bool, score: number }  (index 0 = level 1)
let levelData       = loadLevelData();
let activeLevel     = 0;   // 0-indexed, which level is currently being played
let currentQuestion = 0;   // index within the full questions array
let score           = 0;   // score for the active level session
let answered        = 0;   // questions answered within the active level session

// ─── Persistence helpers ──────────────────────────────────────────────────────
function loadLevelData() {
  const saved = localStorage.getItem('levelData');
  if (saved) return JSON.parse(saved);
  // Default: all levels incomplete, 0 score
  return Array.from({ length: TOTAL_LEVELS }, () => ({ completed: false, score: 0 }));
}

function saveLevelData() {
  localStorage.setItem('levelData', JSON.stringify(levelData));
}

// ─── Update: level buttons ────────────────────────────────────────────────────────
function updateRewindBtn() {
  const rewindBtn = document.querySelector('.c-rewind');
  if (!rewindBtn) return;

  const canRewind = levelData[activeLevel].completed &&
                    levelData[activeLevel].score < QUESTIONS_PER_LEVEL;

  rewindBtn.classList.toggle('unlocked', canRewind);
  rewindBtn.style.pointerEvents = canRewind ? 'auto' : 'none';
}


// ─── UI: level buttons ────────────────────────────────────────────────────────
function renderLevelButtons() {
  const btns = document.querySelectorAll('.lvls-btn');
  btns.forEach((btn, i) => {
    // Remove old state classes
    btn.classList.remove('lvl-active', 'lvl-completed', 'lvl-locked');

    if (i === activeLevel) {
      btn.classList.add('lvl-active');
    } else if (levelData[i].completed) {
      btn.classList.add('lvl-completed');
    }
    // All levels are always accessible (no locked state per requirements)

    btn.onclick = () => switchLevel(i);
  });
}

// ─── Switch to a level ────────────────────────────────────────────────────────
function switchLevel(levelIndex) {
  if (levelIndex === activeLevel) return;
  activeLevel     = levelIndex;
  currentQuestion = activeLevel * QUESTIONS_PER_LEVEL;
  score           = 0;
  answered        = 0;
  renderLevelButtons();
  updateRewindBtn();
  loadQuestion();
}

// ─── Rewind: reset the active level ──────────────────────────────────────────
function rewindLevel() {
  // Only allow rewind if the level has been completed
  if (!levelData[activeLevel].completed) return;

  levelData[activeLevel] = { completed: false, score: 0 };
  saveLevelData();

  currentQuestion = activeLevel * QUESTIONS_PER_LEVEL;
  score           = 0;
  answered        = 0;

  renderLevelButtons();
  updateRewindBtn();
  loadQuestion();
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function updateProgressUI() {
  const pct = Math.round((answered / QUESTIONS_PER_LEVEL) * 100);

  const bar = document.querySelector('.cwp-bar');
  if (bar) bar.style.width = pct + '%';

  const percentSpan = document.getElementById('percent');
  if (percentSpan) {
    percentSpan.textContent   = pct + '%';
    percentSpan.style.visibility = pct > 0 ? 'visible' : 'hidden';
  }

  const levelsSpan = document.querySelector('.levels span');
  if (levelsSpan) levelsSpan.textContent = `${activeLevel + 1}/${TOTAL_LEVELS}`;
}

// ─── Load question ────────────────────────────────────────────────────────────
function loadQuestion() {
  // If this level is already completed, show its result
  if (levelData[activeLevel].completed) {
    showLevelResult();
    return;
  }

  const questionIndex = activeLevel * QUESTIONS_PER_LEVEL + answered;

  if (answered >= QUESTIONS_PER_LEVEL) {
    finishLevel();
    return;
  }

  document.getElementById('question').innerHTML =
    `<span>${questions[questionIndex].question}</span>`;
  document.getElementById('options').innerHTML = '';
  document.getElementById('result').textContent  = '';
  document.getElementById('level-up').textContent = '';

  questions[questionIndex].options.forEach((option, index) => {
    const button = document.createElement('button');
    button.setAttribute('data-sfx', '');
    button.className  = 'option';
    button.innerHTML  = `${option}<i class="fa-solid fa-angle-right"></i>`;
    button.onclick    = () => checkAnswer(index, questionIndex);
    document.getElementById('options').appendChild(button);
  });

  updateProgressUI();
  renderLevelButtons();
  updateRewindBtn();
}

// ─── Check answer ─────────────────────────────────────────────────────────────
function checkAnswer(selected, questionIndex) {
  const correctIndex = questions[questionIndex].answer;
  const buttons      = document.querySelectorAll('.option');

  buttons.forEach(btn => { btn.onclick = null; btn.style.cursor = 'default'; });

  if (selected === correctIndex) {
    score++;
    buttons.forEach((btn, i) => {
      btn.classList.add(i === correctIndex ? 'correct' : 'dimmed');
    });
  } else {
    buttons.forEach((btn, i) => {
      if      (i === selected)     btn.classList.add('wrong');
      else if (i === correctIndex) btn.classList.add('correct');
      else                         btn.classList.add('dimmed');
    });
  }

  answered++;
  updateProgressUI();

  setTimeout(loadQuestion, 2000);
}

// ─── Finish a level ───────────────────────────────────────────────────────────
function finishLevel() {
  levelData[activeLevel] = { completed: true, score };
  saveLevelData();

  // ── Solo cuenta niveles con score perfecto ──
  const levelsPerfect = levelData.filter(l => l.score === QUESTIONS_PER_LEVEL).length;
  localStorage.setItem('triviaAnswered', levelsPerfect * 5);

  if (window.isSfxOn?.() !== false) {
    if (score === QUESTIONS_PER_LEVEL) {
      sfxPerfect.play();
    } else {
      sfxComplete.play();
    }
  }

  renderLevelButtons();
  updateRewindBtn();
  showLevelResult();
}

function showLevelResult() {
  const saved = levelData[activeLevel];
  document.getElementById('question').innerHTML =
    `<span>Level ${activeLevel + 1} complete! Score: ${saved.score}/${QUESTIONS_PER_LEVEL}</span>`;
  document.getElementById('options').innerHTML   = '';
  document.getElementById('result').textContent  = saved.score === QUESTIONS_PER_LEVEL
    ? 'Perfect score!'
    : `You can rewind and try again with the ↺ button.`;
  document.getElementById('level-up').textContent = '';

  // Fill bar to 100%
  const bar = document.querySelector('.cwp-bar');
  if (bar) bar.style.width = '100%';
  const percentSpan = document.getElementById('percent');
  if (percentSpan) {
    percentSpan.textContent      = '100%';
    percentSpan.style.visibility = 'visible';
  }
}

// ─── Rewind button wiring ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const rewindBtn = document.querySelector('.c-rewind');
  if (rewindBtn) rewindBtn.addEventListener('click', rewindLevel);

  renderLevelButtons();
  updateRewindBtn();
  loadQuestion();
  updateProgressUI();
});