import type { Vec2 } from "kaplay";
import { k } from "./kaplayCtx";

type RGB = [number, number, number];

/** Small squares that fly outward from a point and fade away. */
export function burstParticles(pos: Vec2, color: RGB, count = 8): void {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 110;
    const vel = k.vec2(Math.cos(angle), Math.sin(angle)).scale(speed);

    const p = k.add([
      k.rect(4 + Math.random() * 4, 4 + Math.random() * 4),
      k.pos(pos),
      k.anchor("center"),
      k.color(...color),
      k.opacity(1),
      k.z(20),
      k.lifespan(0.5, { fade: 0.4 }),
    ]);

    p.onUpdate(() => {
      p.pos = p.pos.add(vel.scale(k.dt()));
    });
  }
}
