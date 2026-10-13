import { POWERUPS_ENABLED } from "../config";
import type { TilePos } from "../map";

/**
 * Hook called whenever a destructible block is burned by an explosion.
 *
 * Power-ups are intentionally NOT implemented in this first version.
 * When they are enabled (POWERUPS_ENABLED = true), this is the single
 * place responsible for spawning drops (extra bomb, +range, +speed),
 * which will then mutate the PlayerStats of whoever picks them up.
 */
export function maybeSpawnPowerUp(tile: TilePos): void {
  if (!POWERUPS_ENABLED) return;
  // TODO: roll POWERUP_DROP_CHANCE, spawn a pickup object on `tile`
  // and apply its effect to the collecting player's stats.
  void tile;
}
