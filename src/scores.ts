// Win counter that persists across matches (module state survives scene
// changes; resets only on page reload).

const wins = new Map<string, number>();

export function addWin(name: string): void {
  wins.set(name, (wins.get(name) ?? 0) + 1);
}

export function scoreEntries(): [string, number][] {
  return [...wins.entries()];
}
