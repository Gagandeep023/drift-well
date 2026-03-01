// Physics
export const FRICTION = 0.99;
export const MAX_SPEED = 12;
export const PARTICLE_RADIUS = 6;
export const TRAIL_LENGTH = 20;

// Gravity
export const GRAVITY_MIN_STRENGTH = 80;
export const GRAVITY_MAX_STRENGTH = 200;
export const GRAVITY_INFLUENCE_RADIUS = 200;
export const GRAVITY_REPULSIVE_CHANCE = 0.25;

// Impulse
export const IMPULSE_COST = 8;
export const IMPULSE_MIN = 1.5;
export const IMPULSE_MAX = 6;
export const IMPULSE_DRAG_MAX = 150; // max drag distance in px

// Checkpoints
export const CHECKPOINT_RADIUS = 20;
export const CHECKPOINT_COLLECT_DISTANCE = 25;

// Walls
export const WALL_ENERGY_DRAIN = 5;
export const WALL_BOUNCE_DAMPING = 0.6;
export const BOUNDARY_BOUNCE_DAMPING = 0.7;

// Level scaling
export const BASE_CHECKPOINTS = 3;
export const BASE_GRAVITY_WELLS = 2;
export const BASE_ENERGY = 100;
export const ENERGY_PER_LEVEL = -5; // tighter budget each level
export const MIN_ENERGY = 50;
export const WALLS_START_LEVEL = 3;
export const MAX_WALLS_PER_LEVEL = 4;

// Scoring
export const CHECKPOINT_SCORE = 100;
export const LEVEL_BONUS = 250;
export const ENERGY_BONUS_MULTIPLIER = 2;

// Canvas defaults
export const DEFAULT_WIDTH = 600;
export const DEFAULT_HEIGHT = 500;

// Placement safety
export const MIN_DISTANCE_BETWEEN_OBJECTS = 60;
export const EDGE_MARGIN = 50;
