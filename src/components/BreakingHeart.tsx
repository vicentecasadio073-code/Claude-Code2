import React from 'react';
import {interpolate, random, spring, useVideoConfig} from 'remotion';
import {HEART, HEART_CRACK, HEART_EMPTY} from './icons';
import {PixelSprite} from './PixelSprite';
import {PixelBurst} from './PixelBurst';
import {useBeatFrame} from './SceneContext';

type Props = {
  cell: number;
  /** Frame de aparición (pop) */
  appearAt?: number;
  /** Frame en que se rompe (undefined = no se rompe) */
  breakAt?: number;
  /** Late con el beat antes de romperse */
  beat?: number;
  seed?: string;
};

const W = 11 + 2;
const H = 10 + 2;

/** Corazón pixel estilo Minecraft que tiembla, se agrieta y se parte en dos */
export const BreakingHeart: React.FC<Props> = ({cell, appearAt = 0, breakAt, beat = 0, seed = 'heart'}) => {
  const f = useBeatFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: f - appearAt, fps, config: {damping: 9, stiffness: 260, mass: 0.6}});
  const width = W * cell;
  const height = H * cell;

  const broken = breakAt !== undefined && f >= breakAt;
  const t = breakAt !== undefined ? f - breakAt : -999;

  // antes de romperse: tiembla y se pone blanco
  const pre = breakAt !== undefined ? interpolate(t, [-6, 0], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  const jitter = !broken && pre > 0 ? (random(`${seed}-j-${f}`) * 2 - 1) * 10 * pre : 0;
  const crackOverride = (r: number, c: number) =>
    pre > 0.3 && (c === HEART_CRACK[r] || c === HEART_CRACK[r] - 1) && random(`${seed}-${r}-${c}`) > 0.3
      ? '#ffffff'
      : undefined;

  const scale = pop * (1 + beat * 0.08);

  if (!broken) {
    return (
      <div style={{width, height, position: 'relative', transform: `translateX(${jitter}px) scale(${scale})`}}>
        <PixelSprite
          sprite={HEART}
          cell={cell}
          override={crackOverride}
          style={{filter: pre > 0 ? `brightness(${1 + pre * 0.8}) drop-shadow(0 0 ${20 * pre}px #ff2a2a)` : 'drop-shadow(0 0 18px rgba(255,40,40,0.45))'}}
        />
      </div>
    );
  }

  const g = 2.2; // gravedad
  const fall = 0.5 * g * t * t;
  const fade = interpolate(t, [10, 26], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const half = (side: -1 | 1) => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: fade,
        transform: `translate(${side * t * 9}px, ${fall - t * 6}px) rotate(${side * t * 4}deg)`,
        transformOrigin: side < 0 ? '30% 80%' : '70% 80%',
      }}
    >
      <PixelSprite
        sprite={HEART}
        cell={cell}
        mask={(r, c) => (side < 0 ? c < HEART_CRACK[r] : c >= HEART_CRACK[r])}
        style={{filter: `brightness(${interpolate(t, [0, 6], [1.8, 0.8], {extrapolateRight: 'clamp'})})`}}
      />
    </div>
  );

  const emptyIn = interpolate(t, [4, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <div style={{width, height, position: 'relative', transform: `scale(${pop})`}}>
      <div style={{position: 'absolute', inset: 0, opacity: emptyIn}}>
        <PixelSprite sprite={HEART_EMPTY} cell={cell} />
      </div>
      {half(-1)}
      {half(1)}
      <div style={{position: 'absolute', left: width / 2, top: height / 2}}>
        <PixelBurst at={breakAt!} count={22} spread={260} seed={seed} colors={['#ff2a2a', '#ec1c2a', '#ffb4b4', '#9a0d17']} />
      </div>
    </div>
  );
};
