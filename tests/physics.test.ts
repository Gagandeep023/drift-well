import { describe, it, expect } from 'vitest';
import {
  applyGravity,
  applyFriction,
  clampSpeed,
  updatePosition,
  checkWallCollision,
  checkBoundaryCollision,
  distance,
  physicsTick,
} from '../src/engine/physics';
import type { Particle, GravityWell, Wall } from '../src/types';
import { FRICTION, MAX_SPEED, BOUNDARY_BOUNCE_DAMPING } from '../src/engine/constants';

function makeParticle(overrides: Partial<Particle> = {}): Particle {
  return {
    x: 200,
    y: 200,
    vx: 0,
    vy: 0,
    radius: 6,
    trail: [],
    ...overrides,
  };
}

describe('physics', () => {
  describe('applyGravity', () => {
    it('should accelerate particle toward an attractive gravity well', () => {
      const particle = makeParticle({ x: 100, y: 200 });
      const well: GravityWell = { x: 200, y: 200, strength: 100, radius: 300 };

      applyGravity(particle, well, 1);

      expect(particle.vx).toBeGreaterThan(0);
      expect(particle.vy).toBeCloseTo(0, 5);
    });

    it('should push particle away from a repulsive gravity well', () => {
      const particle = makeParticle({ x: 100, y: 200 });
      const well: GravityWell = { x: 200, y: 200, strength: -100, radius: 300 };

      applyGravity(particle, well, 1);

      expect(particle.vx).toBeLessThan(0);
    });

    it('should not affect particle outside well influence radius', () => {
      const particle = makeParticle({ x: 100, y: 200 });
      const well: GravityWell = { x: 500, y: 500, strength: 100, radius: 50 };

      applyGravity(particle, well, 1);

      expect(particle.vx).toBe(0);
      expect(particle.vy).toBe(0);
    });

    it('should apply stronger force when particle is closer', () => {
      const particleNear = makeParticle({ x: 180, y: 200 });
      const particleFar = makeParticle({ x: 100, y: 200 });
      const well: GravityWell = { x: 200, y: 200, strength: 100, radius: 300 };

      applyGravity(particleNear, well, 1);
      applyGravity(particleFar, well, 1);

      expect(particleNear.vx).toBeGreaterThan(particleFar.vx);
    });
  });

  describe('applyFriction', () => {
    it('should reduce velocity by friction factor', () => {
      const particle = makeParticle({ vx: 10, vy: 5 });
      applyFriction(particle);

      expect(particle.vx).toBeCloseTo(10 * FRICTION);
      expect(particle.vy).toBeCloseTo(5 * FRICTION);
    });
  });

  describe('clampSpeed', () => {
    it('should clamp velocity to MAX_SPEED', () => {
      const particle = makeParticle({ vx: 20, vy: 20 });
      clampSpeed(particle);

      const speed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
      expect(speed).toBeCloseTo(MAX_SPEED);
    });

    it('should not change velocity below MAX_SPEED', () => {
      const particle = makeParticle({ vx: 2, vy: 3 });
      clampSpeed(particle);

      expect(particle.vx).toBe(2);
      expect(particle.vy).toBe(3);
    });
  });

  describe('updatePosition', () => {
    it('should update position based on velocity and dt', () => {
      const particle = makeParticle({ x: 100, y: 100, vx: 5, vy: -3 });
      updatePosition(particle, 2);

      expect(particle.x).toBe(110);
      expect(particle.y).toBe(94);
    });
  });

  describe('checkWallCollision', () => {
    it('should reflect particle off a horizontal wall', () => {
      const particle = makeParticle({ x: 150, y: 100, vy: 5 });
      const wall: Wall = { x1: 100, y1: 103, x2: 200, y2: 103 };

      const hit = checkWallCollision(particle, wall);

      expect(hit).toBe(true);
      expect(particle.vy).toBeLessThan(0);
    });

    it('should not collide if particle is far from wall', () => {
      const particle = makeParticle({ x: 150, y: 50 });
      const wall: Wall = { x1: 100, y1: 300, x2: 200, y2: 300 };

      const hit = checkWallCollision(particle, wall);
      expect(hit).toBe(false);
    });
  });

  describe('checkBoundaryCollision', () => {
    it('should bounce off left boundary', () => {
      const particle = makeParticle({ x: 2, vx: -5 });
      const hit = checkBoundaryCollision(particle, 600, 500);

      expect(hit).toBe(true);
      expect(particle.vx).toBeGreaterThan(0);
      expect(particle.x).toBe(particle.radius);
    });

    it('should bounce off bottom boundary', () => {
      const particle = makeParticle({ y: 498, vy: 5 });
      const hit = checkBoundaryCollision(particle, 600, 500);

      expect(hit).toBe(true);
      expect(particle.vy).toBeLessThan(0);
    });

    it('should not bounce when particle is inside bounds', () => {
      const particle = makeParticle({ x: 300, y: 250 });
      const hit = checkBoundaryCollision(particle, 600, 500);
      expect(hit).toBe(false);
    });

    it('should apply boundary bounce damping', () => {
      const particle = makeParticle({ x: 2, vx: -10 });
      checkBoundaryCollision(particle, 600, 500);

      expect(particle.vx).toBeCloseTo(10 * BOUNDARY_BOUNCE_DAMPING);
    });
  });

  describe('distance', () => {
    it('should calculate distance between two points', () => {
      const d = distance({ x: 0, y: 0 }, { x: 3, y: 4 });
      expect(d).toBe(5);
    });
  });

  describe('physicsTick', () => {
    it('should update particle position in a tick', () => {
      const particle = makeParticle({ x: 200, y: 200, vx: 3, vy: 0 });
      physicsTick(particle, [], [], 600, 500, 1);

      expect(particle.x).toBeGreaterThan(200);
      expect(particle.trail.length).toBe(1);
    });

    it('should report wall hits', () => {
      const particle = makeParticle({ x: 150, y: 100, vy: 5 });
      const walls: Wall[] = [{ x1: 100, y1: 103, x2: 200, y2: 103 }];

      const { wallHits } = physicsTick(particle, [], walls, 600, 500, 1);
      expect(wallHits).toBe(1);
    });
  });
});
