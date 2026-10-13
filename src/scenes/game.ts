import { k } from "../kaplayCtx";
import { generateLevel, spawnLevel } from "../map";

export function registerGameScene(): void {
  k.scene("game", () => {
    const level = generateLevel();
    spawnLevel(level);
  });
}
