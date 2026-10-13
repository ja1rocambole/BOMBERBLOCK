import { k } from "../kaplayCtx";
import { COLORS, GAME_WIDTH, HUD_HEIGHT } from "../config";
import { shade } from "../visuals";
import { generateLevel, spawnLevel } from "../map";
import {
  killPlayer,
  P1_CONTROLS,
  P2_CONTROLS,
  spawnPlayer,
  type PlayerObj,
} from "../entities/player";
import { tryPlaceBomb } from "../entities/bomb";
import { applyPowerUp, type PowerUpObj } from "../entities/powerup";
import { attachAI } from "../entities/ai";
import { sfx } from "../audio";

export type GameMode = "single" | "multi";

/** Top bar with one live status slot per character. */
function spawnHUD(players: PlayerObj[]): void {
  k.add([
    k.rect(GAME_WIDTH, HUD_HEIGHT),
    k.pos(0, 0),
    k.anchor("topleft"),
    k.color(10, 10, 16),
    k.z(-20),
  ]);

  players.forEach((p, i) => {
    const slotX = (GAME_WIDTH / players.length) * i;
    const c = p.color;

    const icon = k.add([
      k.rect(20, 20),
      k.pos(slotX + 22, HUD_HEIGHT / 2),
      k.anchor("center"),
      k.color(c),
      k.outline(2, k.rgb(...shade([c.r, c.g, c.b], 0.55))),
      k.opacity(1),
      k.z(30),
    ]);

    const label = k.add([
      k.text("", { size: 13 }),
      k.pos(slotX + 40, 10),
      k.color(235, 235, 245),
      k.z(30),
    ]);

    label.onUpdate(() => {
      label.text = `${p.playerName}\nB${p.stats.maxBombs}  F${p.stats.bombRange}`;
      label.color = p.alive ? k.rgb(235, 235, 245) : k.rgb(110, 110, 125);
      icon.opacity = p.alive ? 1 : 0.25;
    });
  });
}

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

    spawnHUD(players);

    // Walking into an active flame kills the player (standing on a tile
    // when the explosion starts is handled by the explosion itself).
    k.onCollide("player", "explosion", (p) => killPlayer(p as PlayerObj));

    // Walking over a power-up collects it.
    k.onCollide("player", "powerup", (p, powerup) =>
      applyPowerUp(p as PlayerObj, powerup as PowerUpObj),
    );

    // Match end: last character standing wins; simultaneous deaths = draw.
    // The match also ends as soon as no HUMAN player is left alive —
    // no point watching the CPUs finish it among themselves.
    let gameEnded = false;
    k.onDestroy("player", () => {
      if (gameEnded) return;
      const alive = players.filter((p) => p.alive);
      const humansAlive = alive.filter((p) => p.controls !== null);

      let message: string | null = null;
      let defeat = false;
      if (alive.length <= 1) {
        message = alive[0] ? `${alive[0].playerName} venceu!` : "Empate!";
      } else if (humansAlive.length === 0) {
        message = isMulti ? "As CPUs venceram!" : "Voce perdeu!";
        defeat = true;
      }

      if (message !== null) {
        gameEnded = true;
        if (defeat) sfx.defeat();
        else sfx.win();
        // Small delay so the final explosion stays visible.
        k.wait(1.2, () => k.go("gameover", { message }));
      }
    });
  });
}
