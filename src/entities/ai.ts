import { k } from "../kaplayCtx";
import { getAtTile, tileToWorld, worldToTile, type TilePos } from "../map";
import { tryPlaceBomb } from "./bomb";
import type { PlayerObj } from "./player";

const DIRS = [k.vec2(1, 0), k.vec2(-1, 0), k.vec2(0, 1), k.vec2(0, -1)];

/**
 * Attaches a very simple "CPU brain" to a player:
 * - wanders in random directions, changing course a few times per second
 * - drops a bomb when standing next to a destructible block
 * - runs away for a moment right after planting a bomb
 *
 * It is deliberately dumb (no pathfinding, no danger detection) — enough
 * to make single-player matches fun while keeping the code readable.
 */
export function attachAI(player: PlayerObj): void {
  let dir = k.vec2(0, 0);
  let fleeingFrom: TilePos | null = null;
  let fleeTime = 0;

  k.loop(0.4, () => {
    if (!player.alive || fleeTime > 0) return;
    dir = DIRS[Math.floor(Math.random() * DIRS.length)];
  });

  player.onUpdate(() => {
    if (!player.alive) return;

    if (fleeTime > 0 && fleeingFrom) {
      fleeTime -= k.dt();
      const away = player.pos.sub(tileToWorld(fleeingFrom));
      if (!away.eq(k.vec2(0, 0))) dir = away.unit();
    }

    if (dir.x !== 0 || dir.y !== 0) {
      player.move(dir.scale(player.stats.speed));
    }

    // Small chance per frame, only when a block is in reach.
    if (fleeTime <= 0 && Math.random() < 0.01) {
      const tile = worldToTile(player.pos);
      const nearBlock = DIRS.some((d) =>
        getAtTile("block", { col: tile.col + d.x, row: tile.row + d.y }),
      );
      if (nearBlock) {
        const before = player.activeBombs;
        tryPlaceBomb(player);
        if (player.activeBombs > before) {
          fleeingFrom = tile;
          fleeTime = 1.2;
        }
      }
    }
  });
}
