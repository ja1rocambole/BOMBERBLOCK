import type { GameObj } from "kaplay";
import { k } from "../kaplayCtx";
import {
  COLORS,
  MAX_BOMB_RANGE,
  MAX_BOMBS,
  POWERUP_DROP_CHANCE,
  POWERUPS_ENABLED,
  TILE_SIZE,
} from "../config";
import { tileToWorld, type TilePos } from "../map";
import { sfx } from "../audio";
import { addBevel, shade } from "../visuals";
import type { PlayerObj } from "./player";

export type PowerUpKind = "bomb" | "fire";

export type PowerUpObj = GameObj & {
  tilePos: TilePos;
  kind: PowerUpKind;
};

/**
 * Called whenever a destructible block is burned by an explosion.
 * Rolls the drop chance and reveals a power-up on that tile.
 */
export function maybeSpawnPowerUp(tile: TilePos): void {
  if (!POWERUPS_ENABLED) return;
  if (Math.random() >= POWERUP_DROP_CHANCE) return;
  spawnPowerUp(tile, Math.random() < 0.5 ? "bomb" : "fire");
}

export function spawnPowerUp(tile: TilePos, kind: PowerUpKind): PowerUpObj {
  const color = kind === "bomb" ? COLORS.powerupBomb : COLORS.powerupFire;
  const size = TILE_SIZE * 0.65;
  const powerup = k.add([
    k.rect(size, size),
    k.pos(tileToWorld(tile)),
    k.anchor("center"),
    k.color(...color),
    k.outline(2, k.rgb(...shade(color, 0.5))),
    k.area(),
    k.z(4),
    "powerup",
    { tilePos: tile, kind },
  ]) as PowerUpObj;

  addBevel(powerup, size, color);
  powerup.add([
    k.text(kind === "bomb" ? "B" : "F", { size: 14 }),
    k.pos(0, 1),
    k.anchor("center"),
    k.color(255, 255, 255),
    k.z(2),
  ]);

  return powerup;
}

/**
 * Applies the power-up effect to the player who picked it up:
 * - bomb: +1 simultaneous bomb (up to MAX_BOMBS)
 * - fire: +1 explosion range (up to MAX_BOMB_RANGE)
 */
export function applyPowerUp(player: PlayerObj, powerup: PowerUpObj): void {
  if (!player.alive) return;
  sfx.powerUp();

  if (powerup.kind === "bomb") {
    player.stats.maxBombs = Math.min(player.stats.maxBombs + 1, MAX_BOMBS);
  } else {
    player.stats.bombRange = Math.min(player.stats.bombRange + 1, MAX_BOMB_RANGE);
  }

  k.destroy(powerup);
}
