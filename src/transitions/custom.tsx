import React from 'react';
import {AbsoluteFill, interpolate, random} from 'remotion';
import type {TransitionPresentation, TransitionPresentationComponentProps} from '@remotion/transitions';

type Empty = Record<string, never>;

/** 0 en los extremos, 1 en el medio de la transición */
const peak = (p: number) => 1 - Math.abs(p - 0.5) * 2;

// ---------------------------------------------------------------- GLITCH
const GlitchComp: React.FC<TransitionPresentationComponentProps<Empty>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  const entering = presentationDirection === 'entering';
  const visible = entering ? p >= 0.5 : p < 0.5;
  const k = peak(p);
  const step = Math.floor(p * 24);
  const dx = (random(`gdx-${step}-${entering}`) * 2 - 1) * 90 * k;
  const ca = 18 * k;

  if (!visible) return <AbsoluteFill />;

  const slices = [0, 1, 2, 3].map((i) => {
    const top = random(`gs-top-${step}-${i}`) * 90;
    const h = 3 + random(`gs-h-${step}-${i}`) * 9;
    const off = (random(`gs-off-${step}-${i}`) * 2 - 1) * 220 * k;
    return {top, h, off};
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: `translateX(${dx}px) skewX(${dx * 0.05}deg)`,
          filter: `drop-shadow(${ca}px 0 0 rgba(255,0,60,0.9)) drop-shadow(${-ca}px 0 0 rgba(0,229,255,0.85))`,
        }}
      >
        {children}
      </AbsoluteFill>
      {k > 0.25 &&
        slices.map((s, i) => (
          <AbsoluteFill
            key={i}
            style={{
              clipPath: `inset(${s.top}% 0 ${Math.max(0, 100 - s.top - s.h)}% 0)`,
              transform: `translateX(${s.off}px)`,
              filter: 'hue-rotate(90deg) saturate(2)',
            }}
          >
            {children}
          </AbsoluteFill>
        ))}
    </AbsoluteFill>
  );
};

export const glitch = (): TransitionPresentation<Empty> => ({component: GlitchComp, props: {}});

// ---------------------------------------------------------------- FLASH
const FlashComp: React.FC<TransitionPresentationComponentProps<{color: string}>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
  passedProps,
}) => {
  const entering = presentationDirection === 'entering';
  const k = peak(p);
  if (!entering) {
    return (
      <AbsoluteFill
        style={{
          opacity: p < 0.5 ? 1 : 0,
          transform: `scale(${1 + p * 0.5})`,
          filter: `brightness(${1 + p * 5}) blur(${p * 10}px)`,
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: p >= 0.5 ? 1 : 0,
          transform: `scale(${interpolate(p, [0.5, 1], [1.25, 1], {extrapolateLeft: 'clamp'})})`,
          filter: `brightness(${interpolate(p, [0.5, 1], [4, 1], {extrapolateLeft: 'clamp'})})`,
        }}
      >
        {children}
      </AbsoluteFill>
      <AbsoluteFill style={{backgroundColor: passedProps.color, opacity: Math.pow(k, 1.4) * 0.95}} />
    </AbsoluteFill>
  );
};

export const flash = (color = '#ffffff'): TransitionPresentation<{color: string}> => ({
  component: FlashComp,
  props: {color},
});

// ---------------------------------------------------------------- PUNCH (zoom a través)
const PunchComp: React.FC<TransitionPresentationComponentProps<Empty>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  const entering = presentationDirection === 'entering';
  const style: React.CSSProperties = entering
    ? {
        transform: `scale(${interpolate(p, [0, 1], [0.35, 1])})`,
        opacity: interpolate(p, [0, 0.4], [0, 1], {extrapolateRight: 'clamp'}),
        filter: `blur(${(1 - p) * 8}px)`,
      }
    : {
        transform: `scale(${interpolate(p, [0, 1], [1, 3.5])})`,
        opacity: interpolate(p, [0, 0.7], [1, 0], {extrapolateRight: 'clamp'}),
        filter: `blur(${p * 16}px)`,
      };
  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};

export const punch = (): TransitionPresentation<Empty> => ({component: PunchComp, props: {}});
