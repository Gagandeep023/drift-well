import { describe, it, expect } from 'vitest';
import {
  createLevel,
  getCheckpointCount,
  getGravityWellCount,
  getMaxEnergy,
  getWallCount,
} from '../src/engine/level';
import {
  BASE_CHECKPOINTS,
  BASE_GRAVITY_WELLS,
  BASE_ENERGY,
  MIN_ENERGY,
  EDGE_MARGIN,
  WALLS_START_LEVEL,
} from '../src/engine/constants';

const WIDTH = 600;
const HEIGHT = 500;

describe('level', () => {
  describe('getCheckpointCount', () => {
    it('should return base checkpoints for level 1', () => {
      expect(getCheckpointCount(1)).toBe(BASE_CHECKPOINTS);
    });

    it('should increase checkpoints with level', () => {
      expect(getCheckpointCount(3)).toBe(BASE_CHECKPOINTS + 2);
    });
  });

  describe('getGravityWellCount', () => {
    it('should return base gravity wells for level 1', () => {
      expect(getGravityWellCount(1)).toBe(BASE_GRAVITY_WELLS);
    });

    it('should increase gravity wells with level', () => {
      expect(getGravityWellCount(5)).toBe(BASE_GRAVITY_WELLS + 4);
    });
  });

  describe('getMaxEnergy', () => {
    it('should return base energy for level 1', () => {
      expect(getMaxEnergy(1)).toBe(BASE_ENERGY);
    });

    it('should decrease energy with level but not below minimum', () => {
      expect(getMaxEnergy(20)).toBe(MIN_ENERGY);
    });
  });

  describe('getWallCount', () => {
    it('should return 0 walls before WALLS_START_LEVEL', () => {
      expect(getWallCount(1)).toBe(0);
      expect(getWallCount(2)).toBe(0);
    });

    it('should return walls starting from WALLS_START_LEVEL', () => {
      expect(getWallCount(WALLS_START_LEVEL)).toBe(1);
    });
  });

  describe('createLevel', () => {
    it('should create a level with correct checkpoint count', () => {
      const level = createLevel(1, WIDTH, HEIGHT, 42);
      expect(level.checkpoints.length).toBe(BASE_CHECKPOINTS);
    });

    it('should create a level with correct gravity well count', () => {
      const level = createLevel(1, WIDTH, HEIGHT, 42);
      expect(level.gravityWells.length).toBe(BASE_GRAVITY_WELLS);
    });

    it('should increase objects with higher levels', () => {
      const level3 = createLevel(3, WIDTH, HEIGHT, 42);
      expect(level3.checkpoints.length).toBe(BASE_CHECKPOINTS + 2);
      expect(level3.gravityWells.length).toBe(BASE_GRAVITY_WELLS + 2);
    });

    it('should place start position within left portion of canvas', () => {
      const level = createLevel(1, WIDTH, HEIGHT, 42);
      expect(level.startPosition.x).toBeGreaterThanOrEqual(EDGE_MARGIN);
      expect(level.startPosition.x).toBeLessThanOrEqual(EDGE_MARGIN + WIDTH * 0.2);
    });

    it('should place checkpoints within canvas bounds', () => {
      const level = createLevel(2, WIDTH, HEIGHT, 99);
      for (const cp of level.checkpoints) {
        expect(cp.x).toBeGreaterThanOrEqual(0);
        expect(cp.x).toBeLessThanOrEqual(WIDTH);
        expect(cp.y).toBeGreaterThanOrEqual(0);
        expect(cp.y).toBeLessThanOrEqual(HEIGHT);
      }
    });

    it('should generate same level with same seed', () => {
      const a = createLevel(1, WIDTH, HEIGHT, 123);
      const b = createLevel(1, WIDTH, HEIGHT, 123);

      expect(a.checkpoints.length).toBe(b.checkpoints.length);
      expect(a.checkpoints[0].x).toBe(b.checkpoints[0].x);
      expect(a.gravityWells[0].strength).toBe(b.gravityWells[0].strength);
    });

    it('should mark all checkpoints as not collected', () => {
      const level = createLevel(1, WIDTH, HEIGHT, 42);
      for (const cp of level.checkpoints) {
        expect(cp.collected).toBe(false);
      }
    });

    it('should assign checkpoints sequential order values', () => {
      const level = createLevel(2, WIDTH, HEIGHT, 42);
      for (let i = 0; i < level.checkpoints.length; i++) {
        expect(level.checkpoints[i].order).toBe(i);
      }
    });
  });
});
