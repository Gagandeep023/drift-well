import type { Level, Checkpoint, GravityWell, Wall, Vec2 } from '../types';
import {
  BASE_CHECKPOINTS,
  BASE_GRAVITY_WELLS,
  BASE_ENERGY,
  ENERGY_PER_LEVEL,
  MIN_ENERGY,
  CHECKPOINT_RADIUS,
  GRAVITY_MIN_STRENGTH,
  GRAVITY_MAX_STRENGTH,
  GRAVITY_INFLUENCE_RADIUS,
  GRAVITY_REPULSIVE_CHANCE,
  WALLS_START_LEVEL,
  MAX_WALLS_PER_LEVEL,
  MIN_DISTANCE_BETWEEN_OBJECTS,
  EDGE_MARGIN,
} from './constants';

/** Simple seeded random for reproducibility in tests */
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Check if a position is far enough from existing positions */
function isFarEnough(pos: Vec2, existing: Vec2[], minDist: number): boolean {
  for (const other of existing) {
    const dx = pos.x - other.x;
    const dy = pos.y - other.y;
    if (Math.sqrt(dx * dx + dy * dy) < minDist) return false;
  }
  return true;
}

/** Generate a random position within canvas bounds with margin */
function randomPosition(
  rand: () => number,
  width: number,
  height: number,
  existing: Vec2[],
  margin: number = EDGE_MARGIN,
  minDist: number = MIN_DISTANCE_BETWEEN_OBJECTS,
  maxAttempts: number = 50,
): Vec2 {
  for (let i = 0; i < maxAttempts; i++) {
    const x = margin + rand() * (width - 2 * margin);
    const y = margin + rand() * (height - 2 * margin);
    const pos = { x, y };
    if (isFarEnough(pos, existing, minDist)) return pos;
  }
  // Fallback: just place it somewhere
  return {
    x: margin + rand() * (width - 2 * margin),
    y: margin + rand() * (height - 2 * margin),
  };
}

/** Get the number of checkpoints for a given level */
export function getCheckpointCount(levelNumber: number): number {
  return BASE_CHECKPOINTS + (levelNumber - 1);
}

/** Get the number of gravity wells for a given level */
export function getGravityWellCount(levelNumber: number): number {
  return BASE_GRAVITY_WELLS + (levelNumber - 1);
}

/** Get the max energy for a given level */
export function getMaxEnergy(levelNumber: number): number {
  const energy = BASE_ENERGY + (levelNumber - 1) * ENERGY_PER_LEVEL;
  return Math.max(energy, MIN_ENERGY);
}

/** Get the number of walls for a given level */
export function getWallCount(levelNumber: number): number {
  if (levelNumber < WALLS_START_LEVEL) return 0;
  return Math.min(levelNumber - WALLS_START_LEVEL + 1, MAX_WALLS_PER_LEVEL);
}

/** Create a level layout */
export function createLevel(
  levelNumber: number,
  width: number,
  height: number,
  seed?: number,
): Level {
  const rand = mulberry32(seed ?? levelNumber * 7919 + 1013);
  const placedPositions: Vec2[] = [];

  // Start position: always near the left side
  const startPosition: Vec2 = {
    x: EDGE_MARGIN + rand() * (width * 0.2),
    y: EDGE_MARGIN + rand() * (height - 2 * EDGE_MARGIN),
  };
  placedPositions.push(startPosition);

  // Generate checkpoints
  const numCheckpoints = getCheckpointCount(levelNumber);
  const checkpoints: Checkpoint[] = [];
  for (let i = 0; i < numCheckpoints; i++) {
    const pos = randomPosition(rand, width, height, placedPositions);
    placedPositions.push(pos);
    checkpoints.push({
      x: pos.x,
      y: pos.y,
      radius: CHECKPOINT_RADIUS,
      collected: false,
      order: i,
    });
  }

  // Generate gravity wells
  const numWells = getGravityWellCount(levelNumber);
  const gravityWells: GravityWell[] = [];
  for (let i = 0; i < numWells; i++) {
    const pos = randomPosition(rand, width, height, placedPositions);
    placedPositions.push(pos);
    const isRepulsive = rand() < GRAVITY_REPULSIVE_CHANCE;
    const strength =
      GRAVITY_MIN_STRENGTH + rand() * (GRAVITY_MAX_STRENGTH - GRAVITY_MIN_STRENGTH);
    gravityWells.push({
      x: pos.x,
      y: pos.y,
      strength: isRepulsive ? -strength : strength,
      radius: GRAVITY_INFLUENCE_RADIUS,
    });
  }

  // Generate walls (only from level 3+)
  const numWalls = getWallCount(levelNumber);
  const walls: Wall[] = [];
  for (let i = 0; i < numWalls; i++) {
    const startPos = randomPosition(rand, width, height, [], EDGE_MARGIN * 2, 30);
    const angle = rand() * Math.PI * 2;
    const length = 60 + rand() * 80;
    walls.push({
      x1: startPos.x,
      y1: startPos.y,
      x2: startPos.x + Math.cos(angle) * length,
      y2: startPos.y + Math.sin(angle) * length,
    });
  }

  const maxEnergy = getMaxEnergy(levelNumber);

  return {
    number: levelNumber,
    checkpoints,
    gravityWells,
    walls,
    startPosition,
    maxEnergy,
  };
}
