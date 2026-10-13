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

    // Battle mode: always 4 characters. Humans take the first slots
    // (1 in single-player, 2 in local multiplayer), CPUs fill the rest.
    const isMulti = mode === "multi";
    const slots = [
      { controls: P1_CONTROLS, color: COLORS.player1 },
      { controls: isMulti ? P2_CONTROLS : null, color: COLORS.player2 },
      { controls: null, color: COLORS.player3 },
      { controls: null, color: COLORS.player4 },
    ];

    const players: PlayerObj[] = [];
    let cpuCount = 0;
    slots.forEach((slot, i) => {
      const name = slot.controls ? `Player ${i + 1}` : `CPU ${++cpuCount}`;
      const player = spawnPlayer(i + 1, name, level.spawns[i], slot.controls, slot.color);
      if (!slot.controls) attachAI(player);
      players.push(player);
    });

    const [p1, p2] = players;
    k.onKeyPress(P1_CONTROLS.bomb, () => tryPlaceBomb(p1));
    if (isMulti) k.onKeyPress(P2_CONTROLS.bomb, () => tryPlaceBomb(p2));

    // Walking into an active flame kills the player (standing on a tile
    // when the explosion starts is handled by the explosion itself).
    k.onCollide("player", "explosion", (p) => killPlayer(p as PlayerObj));

    // Match end: last character standing wins; simultaneous deaths = draw.
    // The match also ends as soon as no HUMAN player is left alive —
    // no point watching the CPUs finish it among themselves.
    let gameEnded = false;
    k.onDestroy("player", () => {
      if (gameEnded) return;
      const alive = players.filter((p) => p.alive);
      const humansAlive = alive.filter((p) => p.controls !== null);

      let message: string | null = null;
      if (alive.length <= 1) {
        message = alive[0] ? `${alive[0].playerName} venceu!` : "Empate!";
      } else if (humansAlive.length === 0) {
        message = isMulti ? "As CPUs venceram!" : "Voce perdeu!";
      }

      if (message !== null) {
        gameEnded = true;
        // Small delay so the final explosion stays visible.
        k.wait(1.2, () => k.go("gameover", { message }));
      }
    });
  });
}
