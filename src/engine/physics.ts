import type { Particle, GravityWell, Wall, Vec2 } from '../types';
import {
  FRICTION,
  MAX_SPEED,
  TRAIL_LENGTH,
  WALL_BOUNCE_DAMPING,
  BOUNDARY_BOUNCE_DAMPING,
} from './constants';

/** Apply gravity from a single well to the particle's velocity */
export function applyGravity(
  particle: Particle,
  well: GravityWell,
  dt: number,
): void {
  const dx = well.x - particle.x;
  const dy = well.y - particle.y;
  const distSq = dx * dx + dy * dy;
  const dist = Math.sqrt(distSq);

  if (dist < 1 || dist > well.radius) return;

  // Force falls off with distance squared, scaled by strength
  const force = (well.strength / distSq) * dt;
  const nx = dx / dist;
  const ny = dy / dist;

  particle.vx += nx * force;
  particle.vy += ny * force;
}

/** Apply all gravity wells to particle */
export function applyAllGravity(
  particle: Particle,
  wells: GravityWell[],
  dt: number,
): void {
  for (const well of wells) {
    applyGravity(particle, well, dt);
  }
}

/** Apply friction damping to velocity */
export function applyFriction(particle: Particle): void {
  particle.vx *= FRICTION;
  particle.vy *= FRICTION;
}

/** Clamp speed to max */
export function clampSpeed(particle: Particle): void {
  const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
  if (speed > MAX_SPEED) {
    const scale = MAX_SPEED / speed;
    particle.vx *= scale;
    particle.vy *= scale;
  }
}

/** Update particle position from velocity */
export function updatePosition(particle: Particle, dt: number): void {
  particle.x += particle.vx * dt;
  particle.y += particle.vy * dt;
}

/** Update the motion trail */
export function updateTrail(particle: Particle): void {
  particle.trail.push({ x: particle.x, y: particle.y });
  if (particle.trail.length > TRAIL_LENGTH) {
    particle.trail.shift();
  }
}

/**
 * Check and resolve wall collision.
 * Returns true if a collision occurred.
 */
export function checkWallCollision(particle: Particle, wall: Wall): boolean {
  // Find closest point on line segment to particle
  const dx = wall.x2 - wall.x1;
  const dy = wall.y2 - wall.y1;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) return false;

  let t = ((particle.x - wall.x1) * dx + (particle.y - wall.y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const closestX = wall.x1 + t * dx;
  const closestY = wall.y1 + t * dy;

  const distX = particle.x - closestX;
  const distY = particle.y - closestY;
  const dist = Math.sqrt(distX * distX + distY * distY);

  if (dist < particle.radius) {
    // Normal of the wall
    const wallLen = Math.sqrt(lenSq);
    const nx = -dy / wallLen;
    const ny = dx / wallLen;

    // Make sure normal points toward particle
    const dot = distX * nx + distY * ny;
    const normalX = dot >= 0 ? nx : -nx;
    const normalY = dot >= 0 ? ny : -ny;

    // Reflect velocity
    const velDot = particle.vx * normalX + particle.vy * normalY;
    particle.vx = (particle.vx - 2 * velDot * normalX) * WALL_BOUNCE_DAMPING;
    particle.vy = (particle.vy - 2 * velDot * normalY) * WALL_BOUNCE_DAMPING;

    // Push particle out of wall
    const overlap = particle.radius - dist;
    particle.x += normalX * overlap;
    particle.y += normalY * overlap;

    return true;
  }

  return false;
}

/** Check all walls for collision. Returns number of wall hits. */
export function checkAllWallCollisions(
  particle: Particle,
  walls: Wall[],
): number {
  let hits = 0;
  for (const wall of walls) {
    if (checkWallCollision(particle, wall)) {
      hits++;
    }
  }
  return hits;
}

/**
 * Check and resolve boundary collision.
 * Returns true if a collision occurred.
 */
export function checkBoundaryCollision(
  particle: Particle,
  width: number,
  height: number,
): boolean {
  let hit = false;

  if (particle.x - particle.radius < 0) {
    particle.x = particle.radius;
    particle.vx = Math.abs(particle.vx) * BOUNDARY_BOUNCE_DAMPING;
    hit = true;
  } else if (particle.x + particle.radius > width) {
    particle.x = width - particle.radius;
    particle.vx = -Math.abs(particle.vx) * BOUNDARY_BOUNCE_DAMPING;
    hit = true;
  }

  if (particle.y - particle.radius < 0) {
    particle.y = particle.radius;
    particle.vy = Math.abs(particle.vy) * BOUNDARY_BOUNCE_DAMPING;
    hit = true;
  } else if (particle.y + particle.radius > height) {
    particle.y = height - particle.radius;
    particle.vy = -Math.abs(particle.vy) * BOUNDARY_BOUNCE_DAMPING;
    hit = true;
  }

  return hit;
}

/** Distance between two 2D points */
export function distance(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Run a single physics tick */
export function physicsTick(
  particle: Particle,
  wells: GravityWell[],
  walls: Wall[],
  width: number,
  height: number,
  dt: number,
): { wallHits: number; boundaryHit: boolean } {
  applyAllGravity(particle, wells, dt);
  applyFriction(particle);
  clampSpeed(particle);
  updatePosition(particle, dt);

  const wallHits = checkAllWallCollisions(particle, walls);
  const boundaryHit = checkBoundaryCollision(particle, width, height);

  updateTrail(particle);

  return { wallHits, boundaryHit };
}
