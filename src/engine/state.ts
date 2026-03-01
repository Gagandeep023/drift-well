import type { GameState, GamePhase, Particle } from '../types';
import { createLevel } from './level';
import { physicsTick, distance } from './physics';
import {
  PARTICLE_RADIUS,
  IMPULSE_COST,
  IMPULSE_MIN,
  IMPULSE_MAX,
  IMPULSE_DRAG_MAX,
  CHECKPOINT_COLLECT_DISTANCE,
  WALL_ENERGY_DRAIN,
  CHECKPOINT_SCORE,
  LEVEL_BONUS,
  ENERGY_BONUS_MULTIPLIER,
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
} from './constants';

/** Create initial game state for a given level */
export function createGameState(
  levelNumber: number,
  width: number = DEFAULT_WIDTH,
  height: number = DEFAULT_HEIGHT,
  existingScore: number = 0,
): GameState {
  const level = createLevel(levelNumber, width, height);
  const particle: Particle = {
    x: level.startPosition.x,
    y: level.startPosition.y,
    vx: 0,
    vy: 0,
    radius: PARTICLE_RADIUS,
    trail: [],
  };

  return {
    phase: levelNumber === 1 ? 'rules' : 'playing',
    level,
    particle,
    energy: level.maxEnergy,
    maxEnergy: level.maxEnergy,
    score: existingScore,
    levelNumber,
    checkpointsCollected: 0,
    totalCheckpoints: level.checkpoints.length,
    canvasWidth: width,
    canvasHeight: height,
  };
}

/** Apply an impulse to the particle in a direction. Returns energy cost. */
export function applyImpulse(
  state: GameState,
  dirX: number,
  dirY: number,
  dragDistance: number,
): number {
  if (state.phase !== 'playing' || state.energy <= 0) return 0;

  // Normalize direction
  const len = Math.sqrt(dirX * dirX + dirY * dirY);
  if (len < 0.001) return 0;

  const nx = dirX / len;
  const ny = dirY / len;

  // Scale impulse by drag distance
  const t = Math.min(dragDistance / IMPULSE_DRAG_MAX, 1);
  const strength = IMPULSE_MIN + t * (IMPULSE_MAX - IMPULSE_MIN);

  state.particle.vx += nx * strength;
  state.particle.vy += ny * strength;

  // Deduct energy
  const cost = IMPULSE_COST;
  state.energy = Math.max(0, state.energy - cost);

  return cost;
}

/** Get the index of the next uncollected checkpoint */
export function getNextCheckpointIndex(state: GameState): number {
  for (let i = 0; i < state.level.checkpoints.length; i++) {
    if (!state.level.checkpoints[i].collected) return i;
  }
  return -1;
}

/** Run one game tick. Returns the new phase if changed. */
export function tick(state: GameState, dt: number): GamePhase {
  if (state.phase !== 'playing') return state.phase;

  // Normalize dt (target ~16ms frames)
  const normalizedDt = dt / 16;

  // Physics step
  const { wallHits } = physicsTick(
    state.particle,
    state.level.gravityWells,
    state.level.walls,
    state.canvasWidth,
    state.canvasHeight,
    normalizedDt,
  );

  // Wall hit energy drain
  if (wallHits > 0) {
    state.energy = Math.max(0, state.energy - WALL_ENERGY_DRAIN * wallHits);
  }

  // Check checkpoint collection
  const nextIdx = getNextCheckpointIndex(state);
  if (nextIdx >= 0) {
    const cp = state.level.checkpoints[nextIdx];
    const dist = distance(state.particle, { x: cp.x, y: cp.y });
    if (dist < CHECKPOINT_COLLECT_DISTANCE) {
      cp.collected = true;
      state.checkpointsCollected++;
      state.score += CHECKPOINT_SCORE;
    }
  }

  // Check if all checkpoints collected
  if (state.checkpointsCollected >= state.totalCheckpoints) {
    // Level complete bonus
    state.score += LEVEL_BONUS + Math.floor(state.energy * ENERGY_BONUS_MULTIPLIER);
    state.phase = 'levelComplete';
    return 'levelComplete';
  }

  // Check game over
  if (state.energy <= 0) {
    state.phase = 'over';
    return 'over';
  }

  return 'playing';
}

/** Advance to the next level */
export function nextLevel(state: GameState): GameState {
  return createGameState(
    state.levelNumber + 1,
    state.canvasWidth,
    state.canvasHeight,
    state.score,
  );
}

/** Calculate final score */
export function getFinalScore(state: GameState): number {
  return state.score;
}
