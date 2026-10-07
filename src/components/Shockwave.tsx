import React from 'react';
import {interpolate} from 'remotion';
import {useBeatFrame} from './SceneContext';

/** Anillo que se expande desde el centro del contenedor */
export const Shockwave: React.FC<{at: number; color?: string; maxSize?: number; duration?: number; thickness?: number}> = ({
  at,
  color = '#ff2d2d',
  maxSize = 1400,
  duration = 18,
  thickness = 22,
}) => {
  const f = useBeatFrame();
  const t = f - at;
  if (t < 0 || t > duration) return null;
  const p = t / duration;
  const size = interpolate(Math.sqrt(p), [0, 1], [60, maxSize]);
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderRadius: '50%',
        border: `${thickness * (1 - p) + 2}px solid ${color}`,
        boxShadow: `0 0 50px ${color}, inset 0 0 50px ${color}`,
        opacity: 1 - p,
        pointerEvents: 'none',
      }}
    />
  );
};
