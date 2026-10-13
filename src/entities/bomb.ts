import type { GameObj } from "kaplay";
import { k } from "../kaplayCtx";
import {
  BOMB_TIMER,
  COLORS,
  EXPLOSION_DURATION,
  PLAYER_SIZE,
  TILE_SIZE,
} from "../config";
import { getAtTile, tileToWorld, worldToTile, type TilePos } from "../map";
import { killPlayer, type PlayerObj } from "./player";
import { maybeSpawnPowerUp } from "./powerup";
import { sfx } from "../audio";
import { burstParticles } from "../effects";
import { shade } from "../visuals";

type BombObj = GameObj & {
  tilePos: TilePos;
  range: number;
  owner: PlayerObj;
  exploded: boolean;
  /** True once the owner left the tile; only then the bomb blocks movement. */
  solid: boolean;
};

const DIRECTIONS: TilePos[] = [
  { col: 1, row: 0 },
  { col: -1, row: 0 },
  { col: 0, row: 1 },
  { col: 0, row: -1 },
];

/** Places a bomb on the player's current tile, if allowed. */
export function tryPlaceBomb(player: PlayerObj): void {
  if (!player.alive) return;
  if (player.activeBombs >= player.stats.maxBombs) return;

  const tile = worldToTile(player.pos);
  if (getAtTile("bomb", tile)) return; // only one bomb per tile

  spawnBomb(tile, player);
}

function spawnBomb(tile: TilePos, owner: PlayerObj): void {
  owner.activeBombs++;
  sfx.placeBomb();

  // A bomb is a dark block with a burning fuse on top.
  const bomb = k.add([
    k.rect(TILE_SIZE * 0.7, TILE_SIZE * 0.7),
    k.pos(tileToWorld(tile)),
    k.anchor("center"),
    k.color(...COLORS.bomb),
    k.outline(2, k.rgb(...shade(COLORS.bomb, 3))),
    k.area(),
    k.opacity(1),
    k.scale(1),
    k.z(5),
    "bomb",
    {
      tilePos: tile,
      range: owner.stats.bombRange,
      owner,
      exploded: false,
      solid: false,
    },
  ]) as BombObj;

  bomb.add([
    k.rect(4, 9),
    k.pos(0, -TILE_SIZE * 0.35 - 3),
    k.anchor("center"),
    k.color(120, 80, 40),
    k.z(1),
  ]);
  const spark = bomb.add([
    k.rect(6, 6),
    k.pos(0, -TILE_SIZE * 0.35 - 9),
    k.anchor("center"),
    k.color(255, 200, 60),
    k.opacity(1),
    k.z(2),
  ]);

  // The bomb only becomes solid once its owner no longer overlaps its
  // tile, otherwise the player would get stuck on top of it.
  const solidCheck = bomb.onUpdate(() => {
    const center = tileToWorld(tile);
    const overlap = TILE_SIZE / 2 + PLAYER_SIZE / 2 - 1;
    const stillOnTop =
      Math.abs(owner.pos.x - center.x) < overlap &&
      Math.abs(owner.pos.y - center.y) < overlap;
    if (!owner.alive || !stillOnTop) {
      solidCheck.cancel();
      bomb.solid = true;
    }
  });

  // Blink and pulse while the fuse burns; the spark flickers.
  bomb.onUpdate(() => {
    bomb.opacity = k.wave(0.35, 1, k.time() * 8);
    const s = k.wave(0.9, 1.15, k.time() * 6);
    bomb.scale = k.vec2(s, s);
    spark.opacity = k.wave(0.2, 1, k.time() * 16);
  });

  k.wait(BOMB_TIMER, () => explodeBomb(bomb));
}

function explodeBomb(bomb: BombObj): void {
  if (bomb.exploded) return;
  bomb.exploded = true;

  const { tilePos, range, owner } = bomb;
  owner.activeBombs--;
  if (bomb.exists()) k.destroy(bomb);

  spawnExplosion(tilePos, range);
}

/** Creates the cross-shaped explosion and applies all of its effects. */
export function spawnExplosion(center: TilePos, range: number): void {
  sfx.explosion();
  // Screen shake grows with the explosion range.
  k.shake(Math.min(4 + range * 2, 14));
  const tiles: TilePos[] = [center];

  for (const dir of DIRECTIONS) {
    for (let step = 1; step <= range; step++) {
      const tile = { col: center.col + dir.col * step, row: center.row + dir.row * step };
      if (getAtTile("wall", tile)) break;
      tiles.push(tile);
      // The flame destroys one block and stops right after it.
      if (getAtTile("block", tile)) break;
    }
  }

  for (const tile of tiles) {
    // Flames burn power-ups already revealed (classic rule).
    const revealed = getAtTile("powerup", tile);
    if (revealed) k.destroy(revealed);

    const block = getAtTile("block", tile);
    if (block) {
      burstParticles(tileToWorld(tile), COLORS.block, 7);
      k.destroy(block);
      maybeSpawnPowerUp(tile);
    }

    // Chain reaction: other bombs caught in the blast explode instantly.
    const chainedBomb = getAtTile("bomb", tile) as BombObj | undefined;
    if (chainedBomb) explodeBomb(chainedBomb);

    // Flames pop in with a quick scale animation.
    const flame = k.add([
      k.rect(TILE_SIZE - 6, TILE_SIZE - 6),
      k.pos(tileToWorld(tile)),
      k.anchor("center"),
      k.color(...COLORS.explosion),
      k.opacity(0.9),
      k.area(),
      k.scale(0.3),
      k.z(15),
      k.lifespan(EXPLOSION_DURATION, { fade: 0.15 }),
      "explosion",
      { tilePos: tile },
    ]);
    // Bright core inside the flame block.
    flame.add([
      k.rect(TILE_SIZE - 20, TILE_SIZE - 20),
      k.pos(0, 0),
      k.anchor("center"),
      k.color(...COLORS.explosionCore),
      k.z(1),
    ]);
    k.tween(0.3, 1, 0.1, (s) => (flame.scale = k.vec2(s, s)), k.easings.easeOutQuad);
  }

  // Kills players already standing on any affected tile. Walking into an
  // active flame is handled by the "player" x "explosion" collide event.
  for (const player of k.get("player")) {
    const p = player as PlayerObj;
    if (!p.alive) continue;
    const t = worldToTile(p.pos);
    if (tiles.some((tile) => tile.col === t.col && tile.row === t.row)) {
      killPlayer(p);
    }
  }
}
