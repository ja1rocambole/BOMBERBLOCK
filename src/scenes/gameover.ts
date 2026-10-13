import { k } from "../kaplayCtx";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";

export interface GameOverResult {
  /** Name of the winning player, or null on a draw. */
  winner: string | null;
}

export function registerGameOverScene(): void {
  k.scene("gameover", ({ winner }: GameOverResult) => {
    k.add([
      k.text(winner ? `${winner} venceu!` : "Empate!", { size: 36 }),
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
