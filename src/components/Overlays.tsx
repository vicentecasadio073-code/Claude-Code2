import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {VIDEO} from '../theme';
import {beatPulse, flashAt, shakeAt} from './fx';

/** Aplica el screen shake global y el "zoom punch" del beat */
export const ScreenShake: React.FC<{children: React.ReactNode; strength?: number}> = ({children, strength = 1}) => {
  const frame = useCurrentFrame();
  const {x, y, r} = shakeAt(frame);
  const zoom = 1 + beatPulse(frame) * 0.012 * strength;
  return (
    <AbsoluteFill
      style={{transform: `translate(${x * strength}px, ${y * strength}px) rotate(${r * strength}deg) scale(${zoom})`}}
    >
      {children}
    </AbsoluteFill>
  );
};

export const FlashOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const {opacity, color} = flashAt(frame);
  if (opacity < 0.01) return null;
  return <AbsoluteFill style={{backgroundColor: color, opacity, mixBlendMode: 'screen'}} />;
};

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background: 'radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.7) 100%)',
      pointerEvents: 'none',
    }}
  />
);

/** Contenedor centrado dentro de la zona segura de TikTok */
export const SafeArea: React.FC<{children: React.ReactNode; gap?: number; style?: React.CSSProperties}> = ({
  children,
  gap = 36,
  style,
}) => (
  <AbsoluteFill
    style={{
      paddingTop: VIDEO.safeTop,
      paddingBottom: VIDEO.safeBottom,
      paddingLeft: VIDEO.safeSide,
      paddingRight: VIDEO.safeSide,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap,
      ...style,
    }}
  >
    {children}
  </AbsoluteFill>
);

/** Guía visual (sólo para el Studio) */
export const SafeZoneGuide: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: VIDEO.safeTop, background: 'rgba(0,160,255,0.25)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: VIDEO.safeBottom, background: 'rgba(0,160,255,0.25)'}} />
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: 820,
        width: 130,
        bottom: VIDEO.safeBottom,
        background: 'rgba(255,160,0,0.2)',
      }}
    />
  </AbsoluteFill>
);
