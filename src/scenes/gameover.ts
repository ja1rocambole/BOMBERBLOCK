import { k } from "../kaplayCtx";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";
import { sfx } from "../audio";
import { scoreEntries } from "../scores";
import type { GameMode } from "./game";

export interface GameOverResult {
  /** Final message: winner name, draw or defeat. */
  message: string;
  /** Mode of the finished match, used by the rematch shortcut. */
  mode: GameMode;
  /** Color of the winning character, when there is one. */
  winnerColor: [number, number, number] | null;
}

export function registerGameOverScene(): void {
  k.scene("gameover", ({ message, mode, winnerColor }: GameOverResult) => {
    k.add([
      k.text(message, { size: 36 }),
      k.pos(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 90),
      k.anchor("center"),
      k.color(...(winnerColor ?? ([235, 235, 245] as [number, number, number]))),
    ]);

    const scores = scoreEntries()
      .map(([name, count]) => `${name}: ${count}`)
      .join("   ");
    if (scores) {
      k.add([
        k.text(`Vitorias - ${scores}`, { size: 16 }),
        k.pos(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20),
        k.anchor("center"),
        k.color(255, 170, 40),
      ]);
    }

    k.add([
      k.text("R: revanche\nEnter: voltar ao menu", { size: 18 }),
      k.pos(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 70),
      k.anchor("center"),
      k.color(160, 160, 180),
    ]);

    k.onKeyPress("r", () => {
      sfx.select();
      k.go("game", mode);
    });
    k.onKeyPress("enter", () => {
      sfx.select();
      k.go("menu");
    });
  });
}
