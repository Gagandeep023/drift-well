import { describe, it, expect } from 'vitest';
import {
  createGameState,
  applyImpulse,
  tick,
  nextLevel,
  getNextCheckpointIndex,
} from '../src/engine/state';
import { IMPULSE_COST, CHECKPOINT_SCORE, IMPULSE_DRAG_MAX } from '../src/engine/constants';

const WIDTH = 600;
const HEIGHT = 500;

describe('state', () => {
  describe('createGameState', () => {
    it('should create initial state with rules phase for level 1', () => {
      const state = createGameState(1, WIDTH, HEIGHT);
      expect(state.phase).toBe('rules');
      expect(state.levelNumber).toBe(1);
    });

    it('should create state with playing phase for level > 1', () => {
      const state = createGameState(2, WIDTH, HEIGHT);
      expect(state.phase).toBe('playing');
    });

    it('should set particle at start position', () => {
      const state = createGameState(1, WIDTH, HEIGHT);
      expect(state.particle.x).toBe(state.level.startPosition.x);
      expect(state.particle.y).toBe(state.level.startPosition.y);
    });

    it('should set energy to max energy', () => {
      const state = createGameState(1, WIDTH, HEIGHT);
      expect(state.energy).toBe(state.maxEnergy);
    });

    it('should carry over score from previous level', () => {
      const state = createGameState(2, WIDTH, HEIGHT, 500);
      expect(state.score).toBe(500);
    });
  });

  describe('applyImpulse', () => {
    it('should reduce energy by impulse cost', () => {
      const state = createGameState(1, WIDTH, HEIGHT);
      state.phase = 'playing';
      const initialEnergy = state.energy;

      applyImpulse(state, 1, 0, IMPULSE_DRAG_MAX);

      expect(state.energy).toBe(initialEnergy - IMPULSE_COST);
    });

    it('should add velocity to particle', () => {
      const state = createGameState(1, WIDTH, HEIGHT);
      state.phase = 'playing';

      applyImpulse(state, 1, 0, IMPULSE_DRAG_MAX);

      expect(state.particle.vx).toBeGreaterThan(0);
    });

    it('should not apply impulse when game is over', () => {
      const state = createGameState(1, WIDTH, HEIGHT);
      state.phase = 'over';
      const initialEnergy = state.energy;

      applyImpulse(state, 1, 0, IMPULSE_DRAG_MAX);

      expect(state.energy).toBe(initialEnergy);
      expect(state.particle.vx).toBe(0);
    });

    it('should not apply impulse with zero direction', () => {
      const state = createGameState(1, WIDTH, HEIGHT);
      state.phase = 'playing';
      const initialEnergy = state.energy;

      const cost = applyImpulse(state, 0, 0, IMPULSE_DRAG_MAX);

      expect(cost).toBe(0);
      expect(state.energy).toBe(initialEnergy);
    });

    it('should return energy cost', () => {
      const state = createGameState(1, WIDTH, HEIGHT);
      state.phase = 'playing';

      const cost = applyImpulse(state, 1, 0, IMPULSE_DRAG_MAX);
      expect(cost).toBe(IMPULSE_COST);
    });
  });

  describe('getNextCheckpointIndex', () => {
    it('should return 0 when no checkpoints collected', () => {
      const state = createGameState(1, WIDTH, HEIGHT);
      expect(getNextCheckpointIndex(state)).toBe(0);
    });

    it('should return -1 when all checkpoints collected', () => {
      const state = createGameState(1, WIDTH, HEIGHT);
      for (const cp of state.level.checkpoints) {
        cp.collected = true;
      }
      expect(getNextCheckpointIndex(state)).toBe(-1);
    });
  });

  describe('tick', () => {
    it('should not update when phase is not playing', () => {
      const state = createGameState(1, WIDTH, HEIGHT);
      // phase is 'rules' for level 1
      const result = tick(state, 16);
      expect(result).toBe('rules');
    });

    it('should return over when energy is zero', () => {
      const state = createGameState(1, WIDTH, HEIGHT);
      state.phase = 'playing';
      state.energy = 0;

      const result = tick(state, 16);
      expect(result).toBe('over');
    });

    it('should collect checkpoint when particle is near it', () => {
      const state = createGameState(1, WIDTH, HEIGHT);
      state.phase = 'playing';

      // Move particle to first checkpoint
      const cp = state.level.checkpoints[0];
      state.particle.x = cp.x;
      state.particle.y = cp.y;

      tick(state, 16);

      expect(state.level.checkpoints[0].collected).toBe(true);
      expect(state.checkpointsCollected).toBe(1);
      expect(state.score).toBe(CHECKPOINT_SCORE);
    });

    it('should complete level when all checkpoints collected', () => {
      const state = createGameState(1, WIDTH, HEIGHT);
      state.phase = 'playing';

      // Collect all but the last checkpoint manually
      for (let i = 0; i < state.level.checkpoints.length - 1; i++) {
        state.level.checkpoints[i].collected = true;
        state.checkpointsCollected++;
      }

      // Move particle to last checkpoint
      const lastCp = state.level.checkpoints[state.level.checkpoints.length - 1];
      state.particle.x = lastCp.x;
      state.particle.y = lastCp.y;

      const result = tick(state, 16);
      expect(result).toBe('levelComplete');
    });
  });

  describe('nextLevel', () => {
    it('should advance to the next level number', () => {
      const state = createGameState(1, WIDTH, HEIGHT);
      state.score = 300;
      const next = nextLevel(state);

      expect(next.levelNumber).toBe(2);
      expect(next.score).toBe(300);
      expect(next.phase).toBe('playing');
    });
  });
});
