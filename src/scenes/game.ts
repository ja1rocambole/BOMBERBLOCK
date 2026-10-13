import { k } from "../kaplayCtx";
import { COLORS } from "../config";
import { generateLevel, spawnLevel } from "../map";
import {
  killPlayer,
  P1_CONTROLS,
  P2_CONTROLS,
  spawnPlayer,
  type PlayerObj,
} from "../entities/player";
import { tryPlaceBomb } from "../entities/bomb";
import { attachAI } from "../entities/ai";

export type GameMode = "single" | "multi";

export function registerGameScene(): void {
  k.scene("game", (mode: GameMode = "single") => {
    const level = generateLevel();
    spawnLevel(level);

    const players: PlayerObj[] = [
      spawnPlayer(1, "Player 1", level.spawns[0], P1_CONTROLS, COLORS.player1),
    ];
    k.onKeyPress(P1_CONTROLS.bomb, () => tryPlaceBomb(players[0]));

    if (mode === "multi") {
      const p2 = spawnPlayer(2, "Player 2", level.spawns[1], P2_CONTROLS, COLORS.player2);
      players.push(p2);
      k.onKeyPress(P2_CONTROLS.bomb, () => tryPlaceBomb(p2));
    } else {
      // Single-player: same match rules against a simple CPU opponent.
      players.push(spawnPlayer(2, "CPU", level.spawns[1], P2_CONTROLS, COLORS.player2));
      attachAI(players[1]);
    }

    // Walking into an active flame kills the player (standing on a tile
    // when the explosion starts is handled by the explosion itself).
    k.onCollide("player", "explosion", (p) => killPlayer(p as PlayerObj));

    // Match end: last player standing wins; simultaneous deaths = draw.
    let gameEnded = false;
    k.onDestroy("player", () => {
      if (gameEnded) return;
      const alive = players.filter((p) => p.alive);
      if (players.length > 1 && alive.length <= 1) {
        gameEnded = true;
        // Small delay so the final explosion stays visible.
        k.wait(1.2, () => k.go("gameover", { winner: alive[0]?.playerName ?? null }));
      }
    });
  });
}
