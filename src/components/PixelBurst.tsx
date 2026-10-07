import React from 'react';
import {random} from 'remotion';
import {useBeatFrame} from './SceneContext';

type Props = {
  at: number;
  count?: number;
  /** Distancia aprox. que recorren las partículas (px) */
  spread?: number;
  colors?: string[];
  seed?: string;
  gravity?: number;
  duration?: number;
  size?: number;
};

/** Explosión de cuadraditos pixelados desde el punto (0,0) del contenedor */
export const PixelBurst: React.FC<Props> = ({
  at,
  count = 30,
  spread = 400,
  colors = ['#ffd23a', '#ff8a1f', '#ff4a1c', '#f3f1ee'],
  seed = 'burst',
  gravity = 1.1,
  duration = 34,
  size = 16,
}) => {
  const f = useBeatFrame();
  const t = f - at;
  if (t < 0 || t > duration) return null;

  return (
    <>
      {new Array(count).fill(0).map((_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const angle = r('a') * Math.PI * 2;
        const v = (0.35 + r('v') * 0.65) * spread * 0.12;
        const drag = 1 - Math.exp(-t / 8);
        const dist = v * 8 * drag;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist + 0.5 * gravity * t * t * 0.35;
        const s = size * (0.5 + r('s') * 0.9);
        const life = 1 - t / duration;
        const color = colors[Math.floor(r('c') * colors.length)];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - s / 2,
              top: y - s / 2,
              width: s,
              height: s,
              backgroundColor: color,
              opacity: Math.max(0, life),
              transform: `rotate(${t * (r('r') * 20 - 10)}deg)`,
              boxShadow: `0 0 ${s}px ${color}`,
            }}
          />
        );
      })}
    </>
  );
};
