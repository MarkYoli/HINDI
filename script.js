const ticker = document.getElementById('ticker');
const playingNow = document.getElementById('playingNow');
const wonLastHour = document.getElementById('wonLastHour');
const timer = document.getElementById('timer');

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function makeMaskedId() {
  return `${randomInt(100, 999)}***`;
}

function makeWin() {
  return randomInt(84, 980);
}

function renderTicker() {
  if (!ticker) return;

  const items = Array.from({ length: 18 }, () => {
    return `<div class="ticker-card"><span>ID: ${makeMaskedId()}</span><b>+$${makeWin()}</b></div>`;
  }).join('');

  ticker.innerHTML = items + items;
}

renderTicker();
setInterval(renderTicker, 18000);

setInterval(() => {
  if (playingNow) playingNow.textContent = randomInt(2680, 3190);
  if (wonLastHour) wonLastHour.textContent = `+${randomInt(95, 180)}`;
}, 2400);

let secondsLeft = 3 * 60;

setInterval(() => {
  secondsLeft -= 1;
  if (secondsLeft < 0) secondsLeft = 3 * 60;

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  if (timer) {
    timer.textContent = `${minutes}:${seconds}`;

    if (secondsLeft <= 60) {
      timer.classList.add('timer-danger');
    } else {
      timer.classList.remove('timer-danger');
    }
  }
}, 1000);

// Fake win / big win / jackpot notification
const fakeWinToast = document.getElementById('fakeWinToast');
const fakeWinFlag = document.getElementById('fakeWinFlag');
const fakeWinId = document.getElementById('fakeWinId');
const fakeWinAmount = document.getElementById('fakeWinAmount');

const fakeWinFlags = ['🇺🇸', '🇬🇧', '🇮🇳', '🇪🇸', '🇫🇷', '🇮🇹', '🇺🇿', '🇹🇯', '🇦🇪', '🇩🇪', '🇧🇷', '🇲🇽'];
const fakeWinTypes = [
  { label: 'WIN', min: 120, max: 740 },
  { label: 'BIG WIN', min: 750, max: 2400 },
  { label: 'JACKPOT', min: 2500, max: 9800 }
];

let soundUnlocked = false;
let audioContext = null;

function unlockSound() {
  if (soundUnlocked) return;
  soundUnlocked = true;

  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  } catch (error) {
    audioContext = null;
  }
}

document.addEventListener('click', unlockSound, { once: true });
document.addEventListener('touchstart', unlockSound, { once: true });

function playWinSound(typeLabel) {
  if (!soundUnlocked || !audioContext) return;

  const now = audioContext.currentTime;
  const gain = audioContext.createGain();
  gain.connect(audioContext.destination);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

  const notes = typeLabel === 'JACKPOT'
    ? [523.25, 659.25, 783.99, 1046.5]
    : typeLabel === 'BIG WIN'
      ? [440, 554.37, 659.25]
      : [523.25, 659.25];

  notes.forEach((freq, index) => {
    const osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + index * 0.08);
    osc.connect(gain);
    osc.start(now + index * 0.08);
    osc.stop(now + index * 0.08 + 0.18);
  });
}

function pickFakeWinType() {
  const roll = Math.random();
  if (roll > 0.88) return fakeWinTypes[2];
  if (roll > 0.55) return fakeWinTypes[1];
  return fakeWinTypes[0];
}

function showFakeWin() {
  if (!fakeWinToast || !fakeWinFlag || !fakeWinId || !fakeWinAmount) return;

  const type = pickFakeWinType();
  const amount = randomInt(type.min, type.max);
  const flag = fakeWinFlags[randomInt(0, fakeWinFlags.length - 1)];

  fakeWinFlag.textContent = flag;
  fakeWinId.textContent = `ID: ${randomInt(100, 999)}***`;
  fakeWinAmount.textContent = `${type.label} +$${amount.toLocaleString('en-US')}`;

  fakeWinToast.classList.remove('big-win', 'jackpot');
  if (type.label === 'BIG WIN') fakeWinToast.classList.add('big-win');
  if (type.label === 'JACKPOT') fakeWinToast.classList.add('jackpot');

  fakeWinToast.classList.add('is-visible');
  fakeWinToast.setAttribute('aria-hidden', 'false');

  playWinSound(type.label);

  setTimeout(() => {
    fakeWinToast.classList.remove('is-visible');
    fakeWinToast.setAttribute('aria-hidden', 'true');
  }, 4200);
}

function scheduleFakeWin() {
  const delay = randomInt(7000, 13000);
  setTimeout(() => {
    showFakeWin();
    scheduleFakeWin();
  }, delay);
}

setTimeout(showFakeWin, 2500);
scheduleFakeWin();
