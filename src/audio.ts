// Synthesized sound effects using the Web Audio API — no audio assets,
// no licensing concerns, everything generated at runtime.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function context(): AudioContext | null {
  try {
    if (!ctx) {
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = 0.25;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null; // audio unavailable: game works silently
  }
}

/** Browsers only allow audio after a user gesture; call on key/click. */
export function unlockAudio(): void {
  context();
}

export function audioState(): string {
  return ctx?.state ?? "none";
}

function tone(
  freqFrom: number,
  freqTo: number,
  duration: number,
  type: OscillatorType,
  volume = 1,
  delay = 0,
): void {
  const c = context();
  if (!c || !master) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqFrom, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(freqTo, 1), t0 + duration);
  gain.gain.setValueAtTime(volume, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.connect(gain).connect(master);
  osc.start(t0);
  osc.stop(t0 + duration);
}

function noiseBurst(duration: number, volume = 1): void {
  const c = context();
  if (!c || !master) return;
  const t0 = c.currentTime;
  const buffer = c.createBuffer(1, c.sampleRate * duration, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1200, t0);
  filter.frequency.exponentialRampToValueAtTime(120, t0 + duration);
  const gain = c.createGain();
  gain.gain.value = volume;
  src.connect(filter).connect(gain).connect(master);
  src.start(t0);
}

export const sfx = {
  select: () => tone(660, 660, 0.07, "square", 0.4),
  placeBomb: () => tone(220, 140, 0.1, "square", 0.6),
  explosion: () => {
    noiseBurst(0.45, 1);
    tone(90, 35, 0.4, "triangle", 0.8);
  },
  powerUp: () => {
    tone(520, 520, 0.09, "square", 0.5);
    tone(780, 780, 0.12, "square", 0.5, 0.09);
  },
  death: () => tone(320, 60, 0.45, "sawtooth", 0.7),
  win: () => [440, 554, 659, 880].forEach((f, i) => tone(f, f, 0.14, "square", 0.5, i * 0.12)),
  defeat: () => [330, 262, 196].forEach((f, i) => tone(f, f, 0.2, "triangle", 0.5, i * 0.16)),
};
