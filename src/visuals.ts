import type { GameObj } from "kaplay";
import { k } from "./kaplayCtx";

export type RGB = [number, number, number];

/** Scales a color's brightness (factor < 1 darkens, > 1 lightens). */
export function shade(c: RGB, factor: number): RGB {
  return [
    Math.min(255, Math.round(c[0] * factor)),
    Math.min(255, Math.round(c[1] * factor)),
    Math.min(255, Math.round(c[2] * factor)),
  ];
}

/**
 * Adds a lighter strip near the top edge of a square block, giving the
 * flat shapes a beveled "cube" look — the BomberBlock identity.
 */
export function addBevel(obj: GameObj, size: number, base: RGB): void {
  obj.add([
    k.rect(size - 8, 4),
    k.pos(0, -size / 2 + 5),
    k.anchor("center"),
    k.color(...shade(base, 1.35)),
    k.z(1),
  ]);
}
