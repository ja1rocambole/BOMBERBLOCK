import { k } from "../kaplayCtx";
import { GAME_HEIGHT, GAME_WIDTH } from "../config";
import { sfx } from "../audio";
import type { GameMode } from "./game";

interface MenuOption {
  label: string;
  mode: GameMode;
}

const OPTIONS: MenuOption[] = [
  { label: "Single Player (voce + 3 CPUs)", mode: "single" },
  { label: "Multiplayer (2 jogadores + 2 CPUs)", mode: "multi" },
];

export function registerMenuScene(): void {
  k.scene("menu", () => {
    k.add([
      k.text("BOMBERBLOCK", { size: 48 }),
      k.pos(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 150),
      k.anchor("center"),
      k.color(255, 170, 40),
    ]);

    let selected = 0;
    const labels = OPTIONS.map((option, i) =>
      k.add([
        k.text(option.label, { size: 22 }),
        k.pos(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40 + i * 40),
        k.anchor("center"),
        k.color(220, 220, 230),
        { option },
      ]),
    );

    const cursor = k.add([
      k.rect(16, 16),
      k.pos(0, 0),
      k.anchor("center"),
      k.color(255, 170, 40),
      k.opacity(1),
      k.z(1),
    ]);

    function refresh(): void {
      labels.forEach((label, i) => {
        const active = i === selected;
        label.color = active ? k.rgb(255, 170, 40) : k.rgb(220, 220, 230);
        if (active) {
          cursor.pos = k.vec2(label.pos.x - label.width / 2 - 24, label.pos.y);
        }
      });
    }
    refresh();

    // The cursor block blinks next to the selected option.
    cursor.onUpdate(() => {
      cursor.opacity = k.wave(0.4, 1, k.time() * 4);
    });

    function move(delta: number): void {
      selected = (selected + OPTIONS.length + delta) % OPTIONS.length;
      sfx.select();
      refresh();
    }

    k.onKeyPress("up", () => move(-1));
    k.onKeyPress("w", () => move(-1));
    k.onKeyPress("down", () => move(1));
    k.onKeyPress("s", () => move(1));

    const confirm = () => {
      sfx.select();
      k.go("game", OPTIONS[selected].mode);
    };
    k.onKeyPress("enter", confirm);
    k.onKeyPress("space", confirm);

    k.add([
      k.text("Setas/W S: navegar   Enter: iniciar", { size: 14 }),
      k.pos(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80),
      k.anchor("center"),
      k.color(160, 160, 180),
    ]);

    k.add([
      k.text("P1: WASD + Espaco   P2: Setas + Enter", { size: 14 }),
      k.pos(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 110),
      k.anchor("center"),
      k.color(160, 160, 180),
    ]);

    k.add([
      k.text("Power-ups:  B = +1 bomba (max 6)   F = +1 alcance (max 15)", { size: 14 }),
      k.pos(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 140),
      k.anchor("center"),
      k.color(160, 160, 180),
    ]);
  });
}
