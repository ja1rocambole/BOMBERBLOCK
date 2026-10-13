import { k } from "../kaplayCtx";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";

export function registerMenuScene(): void {
  k.scene("menu", () => {
    k.add([
      k.text("BOMBERMAN CLONE", { size: 42 }),
      k.pos(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 120),
      k.anchor("center"),
    ]);

    k.add([
      k.text("1 - Single Player (vs CPU)\n2 - Multiplayer (mesmo teclado)", { size: 24 }),
      k.pos(GAME_WIDTH / 2, GAME_HEIGHT / 2),
      k.anchor("center"),
    ]);

    k.add([
      k.text("P1: WASD + Espaco\nP2: Setas + Enter", { size: 16 }),
      k.pos(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 110),
      k.anchor("center"),
      k.color(160, 160, 180),
    ]);

    k.onKeyPress("1", () => k.go("game", "single"));
    k.onKeyPress("2", () => k.go("game", "multi"));
  });
}
