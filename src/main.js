import {
  advanceState,
  createConfig,
  createInitialState,
  pointKey,
  restart,
  setDirection,
  togglePause
} from './gameLogic.js';

const config = createConfig();
let state = createInitialState(config);

const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const statusEl = document.getElementById('status');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');

boardEl.style.gridTemplateColumns = `repeat(${config.width}, 1fr)`;
boardEl.style.gridTemplateRows = `repeat(${config.height}, 1fr)`;

const cells = [];
for (let i = 0; i < config.width * config.height; i += 1) {
  const cell = document.createElement('div');
  cell.className = 'cell';
  boardEl.appendChild(cell);
  cells.push(cell);
}

function setStatusText() {
  if (state.status === 'gameover') {
    statusEl.textContent = 'Game Over';
    return;
  }

  if (state.status === 'paused') {
    statusEl.textContent = 'Paused';
    return;
  }

  if (state.status === 'won') {
    statusEl.textContent = 'You Win';
    return;
  }

  statusEl.textContent = 'Running';
}

function render() {
  const snakeCells = new Set(state.snake.map((segment) => pointKey(segment)));
  const foodCell = state.food ? pointKey(state.food) : null;
  const head = state.snake[0];
  const headKey = head ? pointKey(head) : null;
  const tail = state.snake[state.snake.length - 1];
  const tailKey = tail ? pointKey(tail) : null;
  const tailPrev = state.snake[state.snake.length - 2];

  const directionFromPoints = (from, to) => {
    if (!from || !to) {
      return null;
    }
    if (to.x > from.x) {
      return 'RIGHT';
    }
    if (to.x < from.x) {
      return 'LEFT';
    }
    if (to.y > from.y) {
      return 'DOWN';
    }
    if (to.y < from.y) {
      return 'UP';
    }
    return null;
  };

  const tailDirection = directionFromPoints(tailPrev, tail) || state.direction;

  for (let y = 0; y < config.height; y += 1) {
    for (let x = 0; x < config.width; x += 1) {
      const idx = y * config.width + x;
      const key = `${x},${y}`;
      cells[idx].className = 'cell';

      if (snakeCells.has(key)) {
        cells[idx].classList.add('snake');
        if (key === headKey) {
          cells[idx].classList.add('snake-head', `snake-head--${state.direction.toLowerCase()}`);
        } else if (key === tailKey) {
          cells[idx].classList.add('snake-tail', `snake-tail--${tailDirection.toLowerCase()}`);
        } else {
          cells[idx].classList.add('snake-body');
        }
      } else if (foodCell === key) {
        cells[idx].classList.add('food');
      }
    }
  }

  scoreEl.textContent = `Score: ${state.score}`;
  setStatusText();
  pauseBtn.textContent = state.status === 'paused' ? 'Resume' : 'Pause';
}

function onDirection(direction) {
  state = setDirection(state, direction);
  render();
}

function onRestart() {
  state = restart(config);
  render();
}

function onPause() {
  state = togglePause(state);
  render();
}

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  const directionMap = {
    arrowup: 'UP',
    w: 'UP',
    arrowdown: 'DOWN',
    s: 'DOWN',
    arrowleft: 'LEFT',
    a: 'LEFT',
    arrowright: 'RIGHT',
    d: 'RIGHT'
  };

  if (directionMap[key]) {
    event.preventDefault();
    onDirection(directionMap[key]);
    return;
  }

  if (key === 'r') {
    onRestart();
    return;
  }

  if (key === ' ' || key === 'p') {
    event.preventDefault();
    onPause();
  }
});

pauseBtn.addEventListener('click', onPause);
restartBtn.addEventListener('click', onRestart);
document.querySelectorAll('[data-dir]').forEach((button) => {
  button.addEventListener('click', () => onDirection(button.dataset.dir));
});

setInterval(() => {
  state = advanceState(state, config);
  render();
}, config.tickMs);

render();
