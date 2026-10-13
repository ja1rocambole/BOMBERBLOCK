import { k } from "../kaplayCtx";
import { BOMB_TIMER, COLS, ROWS } from "../config";
import { getAtTile, tileToWorld, worldToTile, type TilePos } from "../map";
import { tryPlaceBomb } from "./bomb";
import { movePlayer, type PlayerObj } from "./player";

const DIRS: TilePos[] = [
  { col: 1, row: 0 },
  { col: -1, row: 0 },
  { col: 0, row: 1 },
  { col: 0, row: -1 },
];

const MAX_ESCAPE_DEPTH = 8;

function isWalkable(tile: TilePos): boolean {
  if (tile.col < 1 || tile.row < 1 || tile.col >= COLS - 1 || tile.row >= ROWS - 1) {
    return false;
  }
  return (
    !getAtTile("wall", tile) && !getAtTile("block", tile) && !getAtTile("bomb", tile)
  );
}

/** A tile is safe from a bomb when it shares neither its row nor column. */
function isSafeFrom(tile: TilePos, bomb: TilePos): boolean {
  return tile.col !== bomb.col && tile.row !== bomb.row;
}

/**
 * BFS from `from` to the nearest walkable tile that survives the blast of
 * a bomb placed on `bomb`. Returns the path (excluding the start tile),
 * or null when no escape exists within MAX_ESCAPE_DEPTH steps.
 */
function findEscapePath(from: TilePos, bomb: TilePos): TilePos[] | null {
  const key = (t: TilePos) => `${t.col},${t.row}`;
  const visited = new Set([key(from)]);
  const queue: { tile: TilePos; path: TilePos[] }[] = [{ tile: from, path: [] }];

  while (queue.length > 0) {
    const { tile, path } = queue.shift()!;
    if (path.length > 0 && isSafeFrom(tile, bomb)) return path;
    if (path.length >= MAX_ESCAPE_DEPTH) continue;

    for (const d of DIRS) {
      const next = { col: tile.col + d.col, row: tile.row + d.row };
      if (visited.has(key(next)) || !isWalkable(next)) continue;
      visited.add(key(next));
      queue.push({ tile: next, path: [...path, next] });
    }
  }
  return null;
}

/**
 * Attaches a simple "CPU brain" to a player:
 * - wanders in random directions, changing course a few times per second
 * - plants bombs next to destructible blocks, but only when an escape
 *   route exists (BFS), then follows that route and waits for the blast
 *
 * Deliberately simple: no pathfinding while wandering and no awareness
 * of other players' bombs — just enough to play a proper match.
 */
export function attachAI(player: PlayerObj): void {
  let dir = k.vec2(0, 0);
  let escapePath: TilePos[] = [];
  let dangerUntil = 0;
  let lastPos = k.vec2(0, 0);
  let stuckFor = 0;

  k.loop(0.4, () => {
    if (!player.alive || escapePath.length > 0 || k.time() < dangerUntil) return;
    const d = DIRS[Math.floor(Math.random() * DIRS.length)];
    dir = k.vec2(d.col, d.row);
  });

  player.onUpdate(() => {
    if (!player.alive) return;

    // The bomb already went off: stop fleeing/hiding and resume.
    if (k.time() >= dangerUntil && escapePath.length > 0) {
      escapePath = [];
    }

    // Fleeing: follow the escape route waypoint by waypoint, one axis at
    // a time (matches the orthogonal path from the BFS and avoids getting
    // caught on wall corners).
    if (escapePath.length > 0) {
      const target = tileToWorld(escapePath[0]);
      const dx = target.x - player.pos.x;
      const dy = target.y - player.pos.y;
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) {
        escapePath.shift();
        stuckFor = 0;
      } else {
        if (Math.abs(dx) >= Math.abs(dy)) {
          movePlayer(player, k.vec2(dx, 0));
        } else {
          movePlayer(player, k.vec2(0, dy));
        }
        // Failsafe: if blocked en route, give up the route instead of
        // freezing forever.
        stuckFor = player.pos.eq(lastPos) ? stuckFor + k.dt() : 0;
        if (stuckFor > 0.5) {
          escapePath = [];
          stuckFor = 0;
        }
      }
      lastPos = player.pos.clone();
      return;
    }

    // Hiding: stand still until the bomb goes off.
    if (k.time() < dangerUntil) return;

    movePlayer(player, dir);
    lastPos = player.pos.clone();

    // Consider planting a bomb when a block is in reach and a way out exists.
    if (Math.random() < 0.02) {
      const tile = worldToTile(player.pos);
      const nearBlock = DIRS.some((d) =>
        getAtTile("block", { col: tile.col + d.col, row: tile.row + d.row }),
      );
      if (!nearBlock) return;

      const path = findEscapePath(tile, tile);
      if (!path) return;

      const before = player.activeBombs;
      tryPlaceBomb(player);
      if (player.activeBombs > before) {
        escapePath = path;
        dangerUntil = k.time() + BOMB_TIMER + 0.2;
        dir = k.vec2(0, 0);
      }
    }
  });
}
