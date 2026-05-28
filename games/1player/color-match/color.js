const COLORS = [
  { hex: '#e05c7a', name: 'rose' },
  { hex: '#87bcde', name: 'sky' },
  { hex: '#a07d93', name: 'mauve' },
  { hex: '#6abeaa', name: 'seafoam' },
  { hex: '#e8a97e', name: 'peach' },
  { hex: '#7fa3c8', name: 'steel' },
  { hex: '#c4a85a', name: 'gold' },
  { hex: '#8a7fce', name: 'lavender' },
];

const COMBO_MSGS = ['nice', 'hot', 'on fire', 'unstoppable', 'legendary'];
const MAX_COMBO = 5;
const COMBO_COLORS = ['#6a8a9f', '#87bcde', '#a07d93', '#e8a97e', '#e05c7a', '#c4a85a'];

let flipped = [];
let matchedCount = 0;
let moves = 0;
let score = 0;
let combo = 0;
let locked = false;
let toastTimer;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function setCombo(n) {
  combo = Math.min(n, MAX_COMBO);
  const fill = document.getElementById('combo-fill');
  fill.style.width = (combo / MAX_COMBO * 100) + '%';
  fill.style.background = COMBO_COLORS[combo] || '#87bcde';
  document.getElementById('combo-mult').textContent = 'x' + (combo + 1);
}

function showToast(msg, color) {
  clearTimeout(toastTimer);
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.color = color || '#87bcde';
  t.classList.add('show');
  toastTimer = setTimeout(() => t.classList.remove('show'), 1200);
}

function updateHud() {
  document.getElementById('score').textContent = score;
  document.getElementById('pairs').textContent = matchedCount + '/8';
  document.getElementById('moves').textContent = moves;
}

function createCard(item) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id = item.id;

  let frontContent;
  if (item.type === 'swatch') {
    frontContent = `<div class="swatch" style="background:${item.hex}"></div>`;
  } else {
    frontContent = `
      <div class="card-label-swatch" style="background:${item.hex}"></div>
      <span class="card-label-hex">${item.hex}</span>
      <span class="card-label-name">${item.name}</span>
    `;
  }

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-back"><div class="card-back-inner"></div></div>
      <div class="card-front">${frontContent}</div>
    </div>
  `;

  card.addEventListener('click', () => flip(card));
  return card;
}

function init() {
  flipped = [];
  matchedCount = 0;
  moves = 0;
  score = 0;
  locked = false;

  setCombo(0);
  updateHud();
  document.getElementById('win').classList.remove('show');
  document.getElementById('toast').classList.remove('show');

  const deck = shuffle([
    ...COLORS.map((c, i) => ({ ...c, type: 'swatch', id: i })),
    ...COLORS.map((c, i) => ({ ...c, type: 'label',  id: i })),
  ]);

  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  deck.forEach(item => grid.appendChild(createCard(item)));
}

function flip(card) {
  if (locked || flipped.length >= 2) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

  card.classList.add('flipped');
  flipped.push(card);

  if (flipped.length < 2) return;

  moves++;
  locked = true;
  updateHud();

  const [a, b] = flipped;

  if (a.dataset.id === b.dataset.id) {
    const gained = 100 * (combo + 1);
    score += gained;
    matchedCount++;
    setCombo(combo + 1);

    setTimeout(() => {
      a.classList.replace('flipped', 'matched');
      b.classList.replace('flipped', 'matched');
      flipped = [];
      locked = false;
      updateHud();

      const msg = combo > 1
        ? COMBO_MSGS[Math.min(combo - 2, COMBO_MSGS.length - 1)] + '  +' + gained
        : '+' + gained;
      showToast(msg, combo > 1 ? '#e8a97e' : null);

      if (matchedCount === 8) {
        setTimeout(() => {
          document.getElementById('win-sub').textContent =
            score.toLocaleString() + ' pts · ' + moves + ' moves';
          document.getElementById('win').classList.add('show');
        }, 300);
      }
    }, 280);

  } else {
    setTimeout(() => { a.classList.add('wrong'); b.classList.add('wrong'); }, 10);
    setCombo(0);
    showToast('chain broken', '#e05c7a');

    setTimeout(() => {
      a.classList.remove('flipped', 'wrong');
      b.classList.remove('flipped', 'wrong');
      flipped = [];
      locked = false;
      updateHud();
    }, 700);
  }
}

document.getElementById('new-btn').addEventListener('click', init);
init();