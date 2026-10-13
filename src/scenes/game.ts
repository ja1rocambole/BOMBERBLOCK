import { k } from "../kaplayCtx";
import { COLORS } from "../config";
import { generateLevel, spawnLevel } from "../map";
import {
  killPlayer,
  P1_CONTROLS,
  spawnPlayer,
  type PlayerObj,
} from "../entities/player";
import { tryPlaceBomb } from "../entities/bomb";

export function registerGameScene(): void {
  k.scene("game", () => {
    const level = generateLevel();
    spawnLevel(level);

    const p1 = spawnPlayer(1, "Player 1", level.spawns[0], P1_CONTROLS, COLORS.player1);
    k.onKeyPress(P1_CONTROLS.bomb, () => tryPlaceBomb(p1));

    // Walking into an active flame kills the player (standing on a tile
    // when the explosion starts is handled by the explosion itself).
    k.onCollide("player", "explosion", (p) => killPlayer(p as PlayerObj));
  });
}
