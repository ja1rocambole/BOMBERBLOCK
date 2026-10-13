import type { GameObj, Vec2 } from "kaplay";
import { k } from "./kaplayCtx";
import { COLORS, COLS, ROWS, TILE_SIZE } from "./config";

export type TileKind = "empty" | "wall" | "block";

export interface TilePos {
  col: number;
  row: number;
}

export interface Level {
  grid: TileKind[][];
  /** Tiles where players spawn (top-left, bottom-right, top-right, bottom-left). */
  spawns: TilePos[];
}

export function tileToWorld(tile: TilePos): Vec2 {
  return k.vec2(
    tile.col * TILE_SIZE + TILE_SIZE / 2,
    tile.row * TILE_SIZE + TILE_SIZE / 2,
  );
}

export function worldToTile(pos: Vec2): TilePos {
  return {
    col: Math.floor(pos.x / TILE_SIZE),
    row: Math.floor(pos.y / TILE_SIZE),
  };
}

function spawnSafeZones(): TilePos[] {
  // Each spawn corner also frees the two adjacent tiles so the player
  // is never trapped by randomly generated blocks.
  return [
    { col: 1, row: 1 },
    { col: 2, row: 1 },
    { col: 1, row: 2 },
    { col: COLS - 2, row: ROWS - 2 },
    { col: COLS - 3, row: ROWS - 2 },
    { col: COLS - 2, row: ROWS - 3 },
    { col: COLS - 2, row: 1 },
    { col: COLS - 3, row: 1 },
    { col: COLS - 2, row: 2 },
    { col: 1, row: ROWS - 2 },
    { col: 2, row: ROWS - 2 },
    { col: 1, row: ROWS - 3 },
  ];
}

export function generateLevel(): Level {
  const safe = spawnSafeZones();
  const isSafe = (col: number, row: number) =>
    safe.some((t) => t.col === col && t.row === row);

  // Classic Bomberman layout: the arena starts completely filled with
  // destructible blocks, except for the walls/pillars and the spawn
  // corners where the players begin.
  const grid: TileKind[][] = [];
  for (let row = 0; row < ROWS; row++) {
    const line: TileKind[] = [];
    for (let col = 0; col < COLS; col++) {
      const isBorder = row === 0 || col === 0 || row === ROWS - 1 || col === COLS - 1;
      const isPillar = row % 2 === 0 && col % 2 === 0;
      if (isBorder || isPillar) {
        line.push("wall");
      } else if (!isSafe(col, row)) {
        line.push("block");
      } else {
        line.push("empty");
      }
    }
    grid.push(line);
  }

  return {
    grid,
    spawns: [
      { col: 1, row: 1 },
      { col: COLS - 2, row: ROWS - 2 },
      { col: COLS - 2, row: 1 },
      { col: 1, row: ROWS - 2 },
    ],
  };
}

/** Instantiates floor, walls and destructible blocks as game objects. */
export function spawnLevel(level: Level): void {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const center = tileToWorld({ col, row });

      // Checkerboard-ish floor for readability.
      k.add([
        k.rect(TILE_SIZE, TILE_SIZE),
        k.pos(center),
        k.anchor("center"),
        k.color(...COLORS.floor),
        k.opacity((row + col) % 2 === 0 ? 1 : 0.85),
        k.z(-10),
      ]);

      // Collision against walls/blocks is resolved by tile lookups in
      // movePlayer(), so these objects only need their tag and tilePos.
      const kind = level.grid[row][col];
      if (kind === "wall") {
        k.add([
          k.rect(TILE_SIZE, TILE_SIZE),
          k.pos(center),
          k.anchor("center"),
          k.color(...COLORS.wall),
          k.z(-5),
          "wall",
          { tilePos: { col, row } },
        ]);
      } else if (kind === "block") {
        k.add([
          k.rect(TILE_SIZE - 4, TILE_SIZE - 4),
          k.pos(center),
          k.anchor("center"),
          k.color(...COLORS.block),
          k.z(-5),
          "block",
          { tilePos: { col, row } },
        ]);
      }
    }
  }
}

/** Finds a game object with the given tag occupying a tile, if any. */
export function getAtTile(tag: string, tile: TilePos): GameObj | undefined {
  return k
    .get(tag)
    .find(
      (obj) =>
        (obj as GameObj & { tilePos?: TilePos }).tilePos?.col === tile.col &&
        (obj as GameObj & { tilePos?: TilePos }).tilePos?.row === tile.row,
    );
}
