import type { GameObj, Key } from "kaplay";
import { k } from "../kaplayCtx";
import {
  COLORS,
  INITIAL_BOMB_RANGE,
  INITIAL_MAX_BOMBS,
  PLAYER_SIZE,
  PLAYER_SPEED,
} from "../config";
import { tileToWorld, type TilePos } from "../map";

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
  controls: PlayerControls;
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
  controls: PlayerControls,
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

  player.onUpdate(() => {
    if (!player.alive) return;

    const dir = k.vec2(0, 0);
    if (k.isKeyDown(controls.left)) dir.x -= 1;
    if (k.isKeyDown(controls.right)) dir.x += 1;
    if (k.isKeyDown(controls.up)) dir.y -= 1;
    if (k.isKeyDown(controls.down)) dir.y += 1;

    // move() resolves collisions against objects with body() (walls,
    // blocks and armed bombs), keeping the player inside the arena.
    if (dir.x !== 0 || dir.y !== 0) {
      player.move(dir.unit().scale(player.stats.speed));
    }
  });

  return player;
}
