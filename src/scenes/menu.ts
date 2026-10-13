import { k } from "../kaplayCtx";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";
import { sfx } from "../audio";

export function registerMenuScene(): void {
  k.scene("menu", () => {
    k.add([
      k.text("BOMBERMAN CLONE", { size: 42 }),
      k.pos(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 120),
      k.anchor("center"),
    ]);

    k.add([
      k.text("1 - Single Player (voce + 3 CPUs)\n2 - Multiplayer (2 jogadores + 2 CPUs)", { size: 24 }),
      k.pos(GAME_WIDTH / 2, GAME_HEIGHT / 2),
      k.anchor("center"),
    ]);

    k.add([
      k.text("P1: WASD + Espaco\nP2: Setas + Enter", { size: 16 }),
      k.pos(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 110),
      k.anchor("center"),
      k.color(160, 160, 180),
    ]);

    k.onKeyPress("1", () => {
      sfx.select();
      k.go("game", "single");
    });
    k.onKeyPress("2", () => {
      sfx.select();
      k.go("game", "multi");
    });
  });
}
