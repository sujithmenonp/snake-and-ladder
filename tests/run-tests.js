import assert from 'node:assert/strict';
import {
  advanceState,
  createConfig,
  placeFood,
  setDirection
} from '../src/gameLogic.js';

function rngFrom(values) {
  let index = 0;
  return () => {
    const value = values[index] ?? values[values.length - 1] ?? 0;
    index += 1;
    return value;
  };
}

const tests = [
  {
    name: 'moves snake forward without growth',
    run() {
      const config = createConfig({ width: 8, height: 8 });
      const state = {
        snake: [
          { x: 3, y: 3 },
          { x: 2, y: 3 },
          { x: 1, y: 3 }
        ],
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
        food: { x: 0, y: 0 },
        score: 0,
        status: 'running'
      };

      const next = advanceState(state, config);

      assert.deepEqual(next.snake, [
        { x: 4, y: 3 },
        { x: 3, y: 3 },
        { x: 2, y: 3 }
      ]);
      assert.equal(next.score, 0);
      assert.equal(next.status, 'running');
    }
  },
  {
    name: 'grows and increments score when food is eaten',
    run() {
      const config = createConfig({ width: 6, height: 6 });
      const state = {
        snake: [
          { x: 2, y: 2 },
          { x: 1, y: 2 },
          { x: 0, y: 2 }
        ],
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
        food: { x: 3, y: 2 },
        score: 4,
        status: 'running'
      };

      const next = advanceState(state, config, rngFrom([0]));

      assert.equal(next.snake.length, 4);
      assert.equal(next.score, 5);
      assert.notDeepEqual(next.food, { x: 3, y: 2 });
      assert.equal(next.status, 'running');
    }
  },
  {
    name: 'sets gameover on wall collision',
    run() {
      const config = createConfig({ width: 5, height: 5 });
      const state = {
        snake: [
          { x: 4, y: 1 },
          { x: 3, y: 1 },
          { x: 2, y: 1 }
        ],
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
        food: { x: 0, y: 0 },
        score: 0,
        status: 'running'
      };

      const next = advanceState(state, config);
      assert.equal(next.status, 'gameover');
    }
  },
  {
    name: 'sets gameover on self collision',
    run() {
      const config = createConfig({ width: 7, height: 7 });
      const state = {
        snake: [
          { x: 3, y: 3 },
          { x: 4, y: 3 },
          { x: 4, y: 2 },
          { x: 3, y: 2 },
          { x: 2, y: 2 },
          { x: 2, y: 3 }
        ],
        direction: 'RIGHT',
        nextDirection: 'UP',
        food: { x: 0, y: 0 },
        score: 0,
        status: 'running'
      };

      const next = advanceState(state, config);
      assert.equal(next.status, 'gameover');
    }
  },
  {
    name: 'food placement avoids snake cells deterministically',
    run() {
      const config = createConfig({ width: 3, height: 2 });
      const snake = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: 1 }
      ];

      const foodA = placeFood(config, snake, rngFrom([0]));
      const foodB = placeFood(config, snake, rngFrom([0.999]));

      assert.deepEqual(foodA, { x: 1, y: 1 });
      assert.deepEqual(foodB, { x: 2, y: 1 });
    }
  },
  {
    name: 'ignores reverse direction changes',
    run() {
      const state = {
        snake: [{ x: 1, y: 1 }],
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
        food: { x: 2, y: 1 },
        score: 0,
        status: 'running'
      };

      const next = setDirection(state, 'LEFT');
      assert.equal(next.nextDirection, 'RIGHT');
    }
  }
];

let failed = 0;
for (const t of tests) {
  try {
    t.run();
    console.log(`PASS ${t.name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${t.name}`);
    console.error(error.stack || error.message);
  }
}

if (failed > 0) {
  process.exitCode = 1;
  console.error(`\n${failed} test(s) failed.`);
} else {
  console.log(`\nAll ${tests.length} tests passed.`);
}
