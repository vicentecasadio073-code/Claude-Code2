import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {VIDEO} from '../theme';

const COLORS = ['#ff4a1c', '#ff7a1a', '#ff9d2e', '#ffd23a'];

type Props = {
  count?: number;
  seed?: string;
  /** 0..1, cuántas partículas se ven */
  intensity?: number;
  /** multiplica la velocidad */
  speed?: number;
  sizeScale?: number;
};

/** Brasas y chispas pixeladas subiendo, determinísticas por frame */
export const Embers: React.FC<Props> = ({count = 70, seed = 'embers', intensity = 1, speed = 1, sizeScale = 1}) => {
  const frame = useCurrentFrame();
  const H = VIDEO.height + 200;
  const visible = Math.round(count * Math.max(0, Math.min(1, intensity)));

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {new Array(visible).fill(0).map((_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const isSpark = r('kind') < 0.25;
        const v = (isSpark ? 6 + r('s') * 8 : 1.4 + r('s') * 3.2) * speed;
        const travel = (frame * v + r('p') * H) % H;
        const y = VIDEO.height + 100 - travel;
        const sway = Math.sin(frame * (0.02 + r('w') * 0.05) + r('ph') * 6.28) * (20 + r('a') * 50);
        const x = r('x') * VIDEO.width + sway;
        const size = (isSpark ? 4 : [4, 6, 8, 10, 12][Math.floor(r('z') * 5)]) * sizeScale;
        const color = COLORS[Math.floor(r('c') * COLORS.length)];
        const flicker = 0.55 + 0.45 * Math.sin(frame * (0.15 + r('f') * 0.35) + i);
        const fadeTop = Math.min(1, Math.max(0, (y - 120) / 500));
        const opacity = (0.35 + r('o') * 0.65) * flicker * fadeTop;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: isSpark ? size * 3 : size,
              backgroundColor: color,
              opacity,
              boxShadow: `0 0 ${size * 2.5}px ${color}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
