import "./style.css";
import { k } from "./kaplayCtx";
import { registerMenuScene } from "./scenes/menu";
import { registerGameScene } from "./scenes/game";
import { registerGameOverScene } from "./scenes/gameover";
import { spawnPowerUp, type PowerUpKind } from "./entities/powerup";
import type { PlayerObj } from "./entities/player";

registerMenuScene();
registerGameScene();
registerGameOverScene();
k.go("menu");

// Dev-only helpers for manual testing in the browser console.
if (import.meta.env.DEV) {
  (window as unknown as { game: unknown }).game = {
    count: (tag: string) => k.get(tag).length,
    tilesWith: (tag: string) =>
      k.get(tag).map((o) => (o as { tilePos?: unknown }).tilePos ?? null),
    playerPos: () => k.get("player").map((p) => ({ x: p.pos.x, y: p.pos.y })),
    players: () =>
      k.get("player").map((p) => {
        const player = p as PlayerObj;
        return { name: player.playerName, alive: player.alive, ...player.stats };
      }),
    spawnPowerUp: (col: number, row: number, kind: PowerUpKind) =>
      spawnPowerUp({ col, row }, kind),
  };
}
