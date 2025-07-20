const board = document.getElementById('board');
const status = document.getElementById('status');
let cells = Array(9).fill(null);
let gameOver = false;
let currentPlayer = 'X';

const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function celebrateWin() {
  const duration = 2 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);
    confetti({
      ...defaults,
      particleCount: 50 * (timeLeft / duration),
      origin: { x: Math.random(), y: Math.random() - 0.2 }
    });
  }, 250);
}

function createBoard() {
  board.innerHTML = '';
  cells = Array(9).fill(null);
  gameOver = false;
  currentPlayer = Math.random() < 0.5 ? 'X' : 'O';

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.addEventListener('click', playerMove);
    board.appendChild(cell);
  }

  if (currentPlayer === 'O') {
    status.textContent = "AI starts...";
    setTimeout(aiMove, 600);
  } else {
    status.textContent = "Your turn (X)";
  }
}

function playerMove(e) {
  if (currentPlayer !== 'X' || gameOver) return;

  const index = e.target.dataset.index;
  if (cells[index]) return;

  makeMove(index, 'X');
  if (checkWinner('X')) {
    status.textContent = "🎉 You win";
    celebrateWin();
    gameOver = true;
    return;
  }

  if (isDraw()) {
    status.textContent = "🤝 It's a draw!";
    gameOver = true;
    return;
  }

  currentPlayer = 'O';
  status.textContent = "AI thinking...";
  setTimeout(aiMove, 500);
}

function aiMove() {
  if (gameOver) return;

  const difficulty = 0.9;
  let move;
  if (Math.random() < difficulty) {
    move = minimax(cells, 'O');
  } else {
    const emptyIndexes = cells.map((v, i) => v === null ? i : null).filter(v => v !== null);
    const randomIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
    move = { index: randomIndex };
  }

  makeMove(move.index, 'O');

  if (checkWinner('O')) {
    status.textContent = "🤖 AI wins!";
    celebrateWin();
    gameOver = true;
    return;
  }

  if (isDraw()) {
    status.textContent = "🤝 It's a draw!";
    gameOver = true;
    return;
  }

  currentPlayer = 'X';
  status.textContent = "Your turn (X)";
}

function makeMove(index, player) {
  cells[index] = player;
  const cell = board.querySelector(`.cell[data-index="${index}"]`);
  cell.textContent = player;
  cell.style.color = player === 'X' ? '#00ffc8' : '#ff6bcb';
  cell.style.cursor = 'default';
}

function checkWinner(player) {
  return winPatterns.some(pattern => pattern.every(i => cells[i] === player));
}

function isDraw() {
  return cells.every(cell => cell !== null);
}

function minimax(newBoard, player) {
  const availSpots = newBoard.map((v, i) => v === null ? i : null).filter(v => v !== null);

  if (checkWinner('X')) return { score: -10 };
  if (checkWinner('O')) return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };

  const moves = [];

  for (let i = 0; i < availSpots.length; i++) {
    const move = {};
    move.index = availSpots[i];
    newBoard[availSpots[i]] = player;

    if (player === 'O') {
      const result = minimax(newBoard, 'X');
      move.score = result.score;
    } else {
      const result = minimax(newBoard, 'O');
      move.score = result.score;
    }

    newBoard[availSpots[i]] = null;
    moves.push(move);
  }

  let bestMove;
  if (player === 'O') {
    let bestScore = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
}

function restartGame() {
  createBoard();
}

createBoard();
