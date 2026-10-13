import { k } from "../kaplayCtx";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";

export interface GameOverResult {
  /** Final message: winner name, draw or defeat. */
  message: string;
}

export function registerGameOverScene(): void {
  k.scene("gameover", ({ message }: GameOverResult) => {
    k.add([
      k.text(message, { size: 36 }),
      k.pos(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40),
      k.anchor("center"),
    ]);

    k.add([
      k.text("Pressione ENTER para voltar ao menu", { size: 18 }),
      k.pos(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40),
      k.anchor("center"),
      k.color(160, 160, 180),
    ]);

    k.onKeyPress("enter", () => k.go("menu"));
  });
}
