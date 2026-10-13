import { k } from "../kaplayCtx";
import { COLORS } from "../config";
import { generateLevel, spawnLevel } from "../map";
import { P1_CONTROLS, spawnPlayer } from "../entities/player";

export function registerGameScene(): void {
  k.scene("game", () => {
    const level = generateLevel();
    spawnLevel(level);

    spawnPlayer(1, "Player 1", level.spawns[0], P1_CONTROLS, COLORS.player1);
  });
}
