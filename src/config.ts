// Central game configuration. All tunables live here so the gameplay
// can be tweaked (and extended with power-ups later) in a single place.

export const TILE_SIZE = 40;
export const COLS = 15;
export const ROWS = 13;

export const GAME_WIDTH = COLS * TILE_SIZE;
export const GAME_HEIGHT = ROWS * TILE_SIZE;

// Player
export const PLAYER_SPEED = 140; // px per second
export const PLAYER_SIZE = 30;

// Bombs
export const BOMB_TIMER = 2.5; // seconds until detonation
export const EXPLOSION_DURATION = 0.4; // seconds the flames stay on screen
export const INITIAL_BOMB_RANGE = 1; // tiles per direction
export const INITIAL_MAX_BOMBS = 1; // bombs alive per player
export const MAX_BOMB_RANGE = 15; // fire power-up cap
export const MAX_BOMBS = 6; // bomb power-up cap

// Power-ups
export const POWERUPS_ENABLED = true;
export const POWERUP_DROP_CHANCE = 0.35;

export const COLORS = {
  background: [18, 18, 28] as [number, number, number],
  floor: [44, 110, 62] as [number, number, number],
  wall: [110, 110, 125] as [number, number, number],
  block: [235, 125, 35] as [number, number, number],
  player1: [80, 140, 255] as [number, number, number],
  player2: [255, 90, 90] as [number, number, number],
  player3: [255, 215, 60] as [number, number, number],
  player4: [175, 95, 255] as [number, number, number],
  bomb: [25, 25, 25] as [number, number, number],
  explosion: [255, 170, 40] as [number, number, number],
  explosionCore: [255, 235, 130] as [number, number, number],
  powerupBomb: [60, 60, 75] as [number, number, number],
  powerupFire: [255, 80, 30] as [number, number, number],
};
