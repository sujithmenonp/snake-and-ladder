export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

const OPPOSITES = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT'
};

export function createConfig(overrides = {}) {
  return {
    width: 16,
    height: 16,
    tickMs: 160,
    ...overrides
  };
}

export function createInitialSnake(config) {
  const centerX = Math.floor(config.width / 2);
  const centerY = Math.floor(config.height / 2);
  return [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY }
  ];
}

export function createInitialState(config, rng = Math.random) {
  const snake = createInitialSnake(config);
  return {
    snake,
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    food: placeFood(config, snake, rng),
    score: 0,
    status: 'running'
  };
}

export function setDirection(state, direction) {
  if (state.status !== 'running') {
    return state;
  }

  if (!DIRECTIONS[direction]) {
    return state;
  }

  const activeDirection = state.nextDirection || state.direction;
  if (OPPOSITES[activeDirection] === direction) {
    return state;
  }

  return {
    ...state,
    nextDirection: direction
  };
}

export function togglePause(state) {
  if (state.status === 'running') {
    return { ...state, status: 'paused' };
  }

  if (state.status === 'paused') {
    return { ...state, status: 'running' };
  }

  return state;
}

export function restart(config, rng = Math.random) {
  return createInitialState(config, rng);
}

export function advanceState(state, config, rng = Math.random) {
  if (state.status !== 'running') {
    return state;
  }

  const direction = state.nextDirection || state.direction;
  const delta = DIRECTIONS[direction];
  const currentHead = state.snake[0];
  const nextHead = { x: currentHead.x + delta.x, y: currentHead.y + delta.y };

  if (isWallCollision(nextHead, config)) {
    return {
      ...state,
      direction,
      status: 'gameover'
    };
  }

  const willGrow = pointsEqual(nextHead, state.food);
  const occupied = willGrow ? state.snake : state.snake.slice(0, -1);

  if (isSnakeCollision(nextHead, occupied)) {
    return {
      ...state,
      direction,
      status: 'gameover'
    };
  }

  const snake = [nextHead, ...state.snake];
  if (!willGrow) {
    snake.pop();
  }

  if (snake.length === config.width * config.height) {
    return {
      ...state,
      snake,
      direction,
      nextDirection: direction,
      score: state.score + 1,
      food: null,
      status: 'won'
    };
  }

  return {
    ...state,
    snake,
    direction,
    nextDirection: direction,
    score: willGrow ? state.score + 1 : state.score,
    food: willGrow ? placeFood(config, snake, rng) : state.food
  };
}

export function placeFood(config, snake, rng = Math.random) {
  const occupied = new Set(snake.map((segment) => pointKey(segment)));
  const emptyCells = [];

  for (let y = 0; y < config.height; y += 1) {
    for (let x = 0; x < config.width; x += 1) {
      const cell = { x, y };
      if (!occupied.has(pointKey(cell))) {
        emptyCells.push(cell);
      }
    }
  }

  if (emptyCells.length === 0) {
    return null;
  }

  const index = Math.floor(rng() * emptyCells.length);
  return emptyCells[index];
}

export function isWallCollision(point, config) {
  return point.x < 0 || point.y < 0 || point.x >= config.width || point.y >= config.height;
}

export function isSnakeCollision(point, snake) {
  return snake.some((segment) => pointsEqual(segment, point));
}

export function pointsEqual(a, b) {
  return a.x === b.x && a.y === b.y;
}

export function pointKey(point) {
  return `${point.x},${point.y}`;
}
