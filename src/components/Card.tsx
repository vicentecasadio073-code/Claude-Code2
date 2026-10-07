import React from 'react';
import {interpolate, spring, useVideoConfig} from 'remotion';
import {COLORS} from '../theme';
import {useBeatFrame} from './SceneContext';

type Props = {
  accent: string;
  /** Barra arriba (como el video original) o a la izquierda */
  bar?: 'top' | 'left';
  at?: number;
  from?: 'left' | 'right' | 'bottom' | 'scale';
  width?: number | string;
  padding?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

/** Panel oscuro con barra de color, estilo de la marca */
export const Card: React.FC<Props> = ({
  accent,
  bar = 'top',
  at = 0,
  from = 'bottom',
  width = '100%',
  padding = '34px 40px',
  children,
  style,
}) => {
  const f = useBeatFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - at, fps, config: {damping: 13, stiffness: 210, mass: 0.7}});
  const transform =
    from === 'left'
      ? `translateX(${interpolate(s, [0, 1], [-1100, 0])}px)`
      : from === 'right'
        ? `translateX(${interpolate(s, [0, 1], [1100, 0])}px)`
        : from === 'scale'
          ? `scale(${interpolate(s, [0, 1], [0.4, 1])})`
          : `translateY(${interpolate(s, [0, 1], [220, 0])}px)`;

  return (
    <div
      style={{
        width,
        position: 'relative',
        background: COLORS.panel,
        border: `2px solid ${COLORS.panelBorder}`,
        boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 40px ${accent}22`,
        padding,
        transform,
        opacity: interpolate(s, [0, 0.3], [0, 1], {extrapolateRight: 'clamp'}),
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          background: accent,
          boxShadow: `0 0 24px ${accent}`,
          ...(bar === 'top'
            ? {left: 0, right: 0, top: -2, height: 8}
            : {left: -2, top: 0, bottom: 0, width: 8}),
        }}
      />
      {children}
    </div>
  );
};
