const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];
let score = 0;
let timeLeft = 30;
let correctColor = '';
let timerInterval;

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const game = document.getElementById('game');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const colorWord = document.getElementById('colorWord');
const colorBoxes = document.getElementById('colorBoxes');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const finalScoreDisplay = document.getElementById('finalScore');

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

function startGame() {
  score = 0;
  timeLeft = 30;
  updateScore();
  updateTime();
  startScreen.style.display = 'none';
  gameOverScreen.style.display = 'none';
  game.style.display = 'block';
  nextRound();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTime();
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  clearInterval(timerInterval);
  game.style.display = 'none';
  gameOverScreen.style.display = 'block';
  finalScoreDisplay.textContent = score;
}

function nextRound() {
  colorBoxes.innerHTML = '';
  const shuffledColors = colors.sort(() => 0.5 - Math.random()).slice(0, 4);
  correctColor = shuffledColors[Math.floor(Math.random() * shuffledColors.length)];
  colorWord.textContent = correctColor.toUpperCase();
  colorWord.style.color = shuffledColors[Math.floor(Math.random() * shuffledColors.length)];

  shuffledColors.forEach(color => {
    const box = document.createElement('div');
    box.classList.add('box');
    box.style.backgroundColor = color;
    box.addEventListener('click', () => checkAnswer(color));
    colorBoxes.appendChild(box);
  });
}

function checkAnswer(selectedColor) {
  if (selectedColor === correctColor) {
    score += 10;
    updateScore();
  }
  nextRound();
}

function updateScore() {
  scoreDisplay.textContent = score;
}

function updateTime() {
  timerDisplay.textContent = timeLeft;
}
