export interface Vec2 {
  x: number;
  y: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  trail: Vec2[];
}

export interface GravityWell {
  x: number;
  y: number;
  strength: number; // positive = attractive, negative = repulsive
  radius: number;   // influence radius
}

export interface Checkpoint {
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  order: number;
}

export interface Wall {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Level {
  number: number;
  checkpoints: Checkpoint[];
  gravityWells: GravityWell[];
  walls: Wall[];
  startPosition: Vec2;
  maxEnergy: number;
}

export type GamePhase = 'rules' | 'playing' | 'levelComplete' | 'over';

export interface GameState {
  phase: GamePhase;
  level: Level;
  particle: Particle;
  energy: number;
  maxEnergy: number;
  score: number;
  levelNumber: number;
  checkpointsCollected: number;
  totalCheckpoints: number;
  canvasWidth: number;
  canvasHeight: number;
}

export interface DriftWellProps {
  width?: number;
  height?: number;
  onGameOver?: (score: number) => void;
}
