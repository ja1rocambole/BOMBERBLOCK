import type { GameObj, Key, Vec2 } from "kaplay";
import { k } from "../kaplayCtx";
import {
  COLORS,
  COLS,
  INITIAL_BOMB_RANGE,
  INITIAL_MAX_BOMBS,
  PLAYER_SIZE,
  PLAYER_SPEED,
  ROWS,
} from "../config";
import { getAtTile, tileToWorld, worldToTile, type TilePos } from "../map";

export interface PlayerControls {
  up: Key;
  down: Key;
  left: Key;
  right: Key;
  bomb: Key;
}

/**
 * Mutable per-player stats. Power-ups will modify these values later
 * (speed up, extra bombs, longer explosion range...).
 */
export interface PlayerStats {
  speed: number;
  bombRange: number;
  maxBombs: number;
}

export type PlayerObj = GameObj & {
  id: number;
  playerName: string;
  alive: boolean;
  activeBombs: number;
  /** Null for CPU-controlled players (they don't listen to the keyboard). */
  controls: PlayerControls | null;
  stats: PlayerStats;
};

export const P1_CONTROLS: PlayerControls = {
  up: "w",
  down: "s",
  left: "a",
  right: "d",
  bomb: "space",
};

export const P2_CONTROLS: PlayerControls = {
  up: "up",
  down: "down",
  left: "left",
  right: "right",
  bomb: "enter",
};

export function spawnPlayer(
  id: number,
  name: string,
  spawn: TilePos,
  controls: PlayerControls | null,
  color: [number, number, number] = COLORS.player1,
): PlayerObj {
  const player = k.add([
    k.rect(PLAYER_SIZE, PLAYER_SIZE),
    k.pos(tileToWorld(spawn)),
    k.anchor("center"),
    k.color(...color),
    k.area(),
    k.z(10),
    "player",
    {
      id,
      playerName: name,
      alive: true,
      activeBombs: 0,
      controls,
      stats: {
        speed: PLAYER_SPEED,
        bombRange: INITIAL_BOMB_RANGE,
        maxBombs: INITIAL_MAX_BOMBS,
      } satisfies PlayerStats,
    },
  ]) as PlayerObj;

  if (controls) {
    player.onUpdate(() => {
      if (!player.alive) return;

      const dir = k.vec2(0, 0);
      if (k.isKeyDown(controls.left)) dir.x -= 1;
      if (k.isKeyDown(controls.right)) dir.x += 1;
      if (k.isKeyDown(controls.up)) dir.y -= 1;
      if (k.isKeyDown(controls.down)) dir.y += 1;

      movePlayer(player, dir);
    });
  }

  return player;
}

/**
 * Moves a player with grid-aware collision. KAPLAY's move() does not
 * resolve collisions against static bodies in top-down games, so we
 * check the destination tiles manually. Horizontal and vertical axes
 * are applied separately so the player slides along walls.
 */
export function movePlayer(player: PlayerObj, dir: Vec2): void {
  if (dir.x === 0 && dir.y === 0) return;

  const step = dir.unit().scale(player.stats.speed * k.dt());
  for (const axis of [k.vec2(step.x, 0), k.vec2(0, step.y)]) {
    if (axis.x === 0 && axis.y === 0) continue;
    const next = player.pos.add(axis);
    if (canOccupy(next)) player.pos = next;
  }
}

/** A tile is solid when it holds a wall, a block or an armed bomb. */
function isSolidTile(tile: TilePos): boolean {
  if (tile.col < 0 || tile.row < 0 || tile.col >= COLS || tile.row >= ROWS) {
    return true;
  }
  if (getAtTile("wall", tile) || getAtTile("block", tile)) return true;

  // A bomb only blocks movement after its owner has left its tile.
  const bomb = getAtTile("bomb", tile) as (GameObj & { solid?: boolean }) | undefined;
  return bomb?.solid === true;
}

function canOccupy(center: Vec2): boolean {
  // Slightly smaller than the sprite for smoother cornering.
  const half = PLAYER_SIZE / 2 - 2;
  const corners = [
    k.vec2(center.x - half, center.y - half),
    k.vec2(center.x + half, center.y - half),
    k.vec2(center.x - half, center.y + half),
    k.vec2(center.x + half, center.y + half),
  ];
  return corners.every((c) => !isSolidTile(worldToTile(c)));
}

export function killPlayer(player: PlayerObj): void {
  if (!player.alive) return;
  player.alive = false;
  k.destroy(player);
}
