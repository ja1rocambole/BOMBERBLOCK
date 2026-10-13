import kaplay from "kaplay";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "./config";

// Single shared KAPLAY context, initialized once and imported everywhere.
export const k = kaplay({
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  letterbox: true,
  background: COLORS.background,
  crisp: true,
});
