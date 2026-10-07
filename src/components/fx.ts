import {random} from 'remotion';
import {BEAT, FLASHES, IMPACTS, PULSE_RANGES} from '../timeline';

/** 1 justo en cada beat y decae rápido (sólo dentro de PULSE_RANGES) */
export const beatPulse = (frame: number, decay = 4) => {
  for (const [start, end] of PULSE_RANGES) {
    if (frame >= start && frame < end) {
      return Math.exp(-((frame - start) % BEAT) / decay);
    }
  }
  return 0;
};

/** Screen shake determinístico sumando todos los impactos */
export const shakeAt = (frame: number) => {
  let x = 0;
  let y = 0;
  let r = 0;
  for (const im of IMPACTS) {
    const d = frame - im.at;
    if (d < 0 || d > im.decay * 5) continue;
    const a = im.amp * Math.exp(-d / im.decay);
    x += (random(`sx-${im.at}-${frame}`) * 2 - 1) * a;
    y += (random(`sy-${im.at}-${frame}`) * 2 - 1) * a;
    r += (random(`sr-${im.at}-${frame}`) * 2 - 1) * a * 0.04;
  }
  return {x, y, r};
};

export const flashAt = (frame: number) => {
  let best = {opacity: 0, color: '#ffffff'};
  for (const f of FLASHES) {
    const d = frame - f.at;
    if (d < -1 || d > f.decay * 5) continue;
    const o = d < 0 ? f.strength * 0.4 : f.strength * Math.exp(-d / f.decay);
    if (o > best.opacity) best = {opacity: o, color: f.color};
  }
  return best;
};

/** Desplazamiento de glitch RGB: picos aleatorios cada tanto */
export const glitchOffset = (frame: number, seed: string, chance = 0.12, max = 14) => {
  const r = random(`${seed}-${Math.floor(frame / 2)}`);
  if (r > chance) return 0;
  return (random(`${seed}-amt-${frame}`) * 2 - 1) * max;
};

export const chromaShadow = (offset: number) =>
  offset === 0
    ? ''
    : `${offset}px 0 0 rgba(255,0,60,0.85), ${-offset}px 0 0 rgba(0,229,255,0.8)`;
