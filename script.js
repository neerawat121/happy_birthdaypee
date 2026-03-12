const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
const balloonLayer = document.getElementById('balloon-layer');
const celebrateBtn = document.getElementById('celebrate-btn');
const musicBtn = document.getElementById('music-btn');

const balloonEmojis = ['🎈', '🎈', '🎉', '🎊', '🎂', '✨'];

let confetti = [];
let animationId;
let audioCtx;
let isSongPlaying = false;
let stopSong = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function makePiece() {
  return {
    x: randomBetween(0, canvas.width),
    y: randomBetween(-canvas.height, 0),
    size: randomBetween(4, 11),
    color: `hsl(${Math.floor(randomBetween(0, 360))} 100% 60%)`,
    speedY: randomBetween(1.5, 5),
    speedX: randomBetween(-1.8, 1.8),
    tilt: randomBetween(0, Math.PI * 2),
    tiltSpeed: randomBetween(0.03, 0.1),
  };
}

function initConfetti(count = 220) {
  confetti = Array.from({ length: count }, makePiece);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  confetti.forEach((piece) => {
    piece.x += piece.speedX;
    piece.y += piece.speedY;
    piece.tilt += piece.tiltSpeed;

    if (piece.y > canvas.height + 20) {
      piece.y = -10;
      piece.x = randomBetween(0, canvas.width);
    }

    ctx.save();
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.tilt);
    ctx.fillStyle = piece.color;
    ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
    ctx.restore();
  });

  animationId = requestAnimationFrame(draw);
}

function celebrateBurst(extra = 80) {
  for (let i = 0; i < extra; i += 1) {
    confetti.push({
      ...makePiece(),
      y: randomBetween(-120, 0),
      speedY: randomBetween(3.5, 7),
    });
  }
  spawnBalloons(12);
}

function spawnBalloons(count = 18) {
  for (let i = 0; i < count; i += 1) {
    const balloon = document.createElement('span');
    balloon.className = 'balloon';
    balloon.textContent = balloonEmojis[Math.floor(randomBetween(0, balloonEmojis.length))];
    balloon.style.left = `${randomBetween(3, 95)}vw`;
    balloon.style.bottom = `${randomBetween(-15, 15)}vh`;
    balloon.style.setProperty('--drift', `${randomBetween(-50, 50)}px`);
    balloon.style.setProperty('--spin', `${randomBetween(-35, 35)}deg`);
    balloon.style.animationDuration = `${randomBetween(8, 14)}s`;

    balloonLayer.append(balloon);
    setTimeout(() => balloon.remove(), 15000);
  }
}

const noteMap = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392,
  A4: 440,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
};

const birthdaySong = [
  ['C4', 0.34], ['C4', 0.22], ['D4', 0.56], ['C4', 0.56], ['F4', 0.56], ['E4', 1],
  ['C4', 0.34], ['C4', 0.22], ['D4', 0.56], ['C4', 0.56], ['G4', 0.56], ['F4', 1],
  ['C4', 0.34], ['C4', 0.22], ['C5', 0.56], ['A4', 0.56], ['F4', 0.56], ['E4', 0.56], ['D4', 1],
  ['B4', 0.34], ['B4', 0.22], ['A4', 0.56], ['F4', 0.56], ['G4', 0.56], ['F4', 1.15],
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function playSong() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }

  stopSong = false;
  isSongPlaying = true;
  musicBtn.setAttribute('aria-pressed', 'true');
  musicBtn.textContent = 'Pause Song ⏸️';

  for (const [note, beats] of birthdaySong) {
    if (stopSong) break;

    const duration = beats * 400;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.value = noteMap[note];
    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration / 1000);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration / 1000);

    await wait(duration + 20);
  }

  isSongPlaying = false;
  stopSong = false;
  musicBtn.setAttribute('aria-pressed', 'false');
  musicBtn.textContent = 'Play Birthday Song 🎵';
}

function toggleSong() {
  if (!isSongPlaying) {
    playSong();
    return;
  }

  stopSong = true;
  isSongPlaying = false;
  musicBtn.setAttribute('aria-pressed', 'false');
  musicBtn.textContent = 'Play Birthday Song 🎵';
}

window.addEventListener('resize', resizeCanvas);
celebrateBtn.addEventListener('click', () => celebrateBurst(120));
musicBtn.addEventListener('click', toggleSong);

resizeCanvas();
initConfetti();
spawnBalloons(20);
setInterval(() => spawnBalloons(4), 2800);
cancelAnimationFrame(animationId);
draw();
