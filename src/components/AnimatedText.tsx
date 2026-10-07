import React from 'react';
import {interpolate, random, spring, useVideoConfig} from 'remotion';
import {COLORS, FONTS, TITLE_SHADOW} from '../theme';
import {beatPulse, chromaShadow, glitchOffset} from './fx';
import {RichText, splitLines} from './RichText';
import {useBeatFrame, useGlobalFrame} from './SceneContext';

export type Entrance = 'zoom' | 'pop' | 'drop' | 'rise' | 'slam-left' | 'slam-right';

type Props = {
  /** Usa "|" para separar líneas y *x* / ~x~ para acentos */
  text: string;
  /** Frame (relativo al beat de la escena) en que entra la primera línea */
  at?: number;
  /** Frames entre líneas */
  stagger?: number;
  entrance?: Entrance | Entrance[];
  font?: keyof typeof FONTS;
  size?: number;
  /** Tamaños distintos por línea */
  sizes?: number[];
  color?: string;
  lineHeight?: number;
  letterSpacing?: number;
  glitch?: boolean;
  /** Reacciona al pulso de la música */
  pulse?: boolean;
  /** Sacude el texto al aterrizar */
  landShake?: number;
  shadow?: string;
  /** Sale con zoom/blur en este frame (opcional) */
  exitAt?: number;
  style?: React.CSSProperties;
};

const SPRING = {damping: 11, stiffness: 240, mass: 0.7};

export const AnimatedText: React.FC<Props> = ({
  text,
  at = 0,
  stagger = 4,
  entrance = 'zoom',
  font = 'display',
  size = 150,
  sizes,
  color = COLORS.white,
  lineHeight = 0.98,
  letterSpacing = 0,
  glitch = false,
  pulse = true,
  landShake = 10,
  shadow = TITLE_SHADOW,
  exitAt,
  style,
}) => {
  const f = useBeatFrame();
  const g = useGlobalFrame();
  const {fps} = useVideoConfig();
  const lines = splitLines(text);
  const bump = pulse ? 1 + beatPulse(g) * 0.035 : 1;

  const exit =
    exitAt === undefined
      ? 0
      : interpolate(f, [exitAt, exitAt + 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        transform: `scale(${bump * (1 + exit * 0.6)})`,
        opacity: 1 - exit,
        filter: exit > 0 ? `blur(${exit * 14}px)` : undefined,
        ...style,
      }}
    >
      {lines.map((line, i) => {
        const local = f - (at + i * stagger);
        const kind = Array.isArray(entrance) ? entrance[i % entrance.length] : entrance;
        const s = spring({frame: local, fps, config: SPRING});
        const appear = interpolate(local, [0, 2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

        let transform = '';
        let blur = 0;
        switch (kind) {
          case 'zoom':
            transform = `scale(${interpolate(s, [0, 1], [3.2, 1])})`;
            blur = interpolate(s, [0, 0.8], [14, 0], {extrapolateRight: 'clamp'});
            break;
          case 'pop':
            transform = `scale(${s}) rotate(${interpolate(s, [0, 1], [-10, 0])}deg)`;
            break;
          case 'drop':
            transform = `translateY(${interpolate(s, [0, 1], [-260, 0])}px) scaleY(${interpolate(s, [0, 0.6, 1], [1.4, 0.85, 1])})`;
            break;
          case 'rise':
            transform = `translateY(${interpolate(s, [0, 1], [180, 0])}px)`;
            break;
          case 'slam-left':
            transform = `translateX(${interpolate(s, [0, 1], [-900, 0])}px) skewX(${interpolate(s, [0, 1], [25, 0])}deg)`;
            break;
          case 'slam-right':
            transform = `translateX(${interpolate(s, [0, 1], [900, 0])}px) skewX(${interpolate(s, [0, 1], [-25, 0])}deg)`;
            break;
        }

        // pequeño temblor al aterrizar
        const shakeT = local - 3;
        const shakeAmp = shakeT >= 0 && shakeT < 10 ? landShake * Math.exp(-shakeT / 2.5) : 0;
        const jx = shakeAmp ? (random(`tx-${text}-${i}-${local}`) * 2 - 1) * shakeAmp : 0;
        const jy = shakeAmp ? (random(`ty-${text}-${i}-${local}`) * 2 - 1) * shakeAmp : 0;

        const gx = glitch ? glitchOffset(g, `${text}-${i}`) + (local < 6 && local >= 0 ? (6 - local) * 3 : 0) : 0;
        const textShadow = [chromaShadow(gx), shadow].filter(Boolean).join(', ');

        return (
          <div
            key={i}
            style={{
              fontFamily: FONTS[font],
              fontSize: sizes?.[i] ?? size,
              lineHeight,
              letterSpacing,
              color,
              whiteSpace: 'nowrap',
              opacity: appear,
              transform: `translate(${jx}px, ${jy}px) ${transform}`,
              filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
              textShadow,
            }}
          >
            <RichText text={line} />
          </div>
        );
      })}
    </div>
  );
};

/** Subtítulo (sans bold) con entrada suave desde abajo */
export const Subtitle: React.FC<{text: string; at?: number; size?: number; style?: React.CSSProperties}> = ({
  text,
  at = 10,
  size = 50,
  style,
}) => {
  const f = useBeatFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - at, fps, config: {damping: 16, stiffness: 180}});
  return (
    <div
      style={{
        fontFamily: FONTS.sans,
        fontWeight: 600,
        fontSize: size,
        color: COLORS.white,
        opacity: interpolate(s, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
        textShadow: '0 4px 18px rgba(0,0,0,0.9)',
        textAlign: 'center',
        ...style,
      }}
    >
      <RichText text={text} />
    </div>
  );
};

/** Etiqueta pixelada chica (contadores, "EDICIÓN", etc.) */
export const PixelLabel: React.FC<{
  text: string;
  color?: string;
  size?: number;
  at?: number;
  spacing?: number;
  style?: React.CSSProperties;
}> = ({text, color = COLORS.yellow, size = 34, at = 0, spacing = 6, style}) => {
  const f = useBeatFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - at, fps, config: {damping: 14, stiffness: 200}});
  return (
    <div
      style={{
        fontFamily: FONTS.pixel,
        fontSize: size,
        letterSpacing: spacing,
        color,
        opacity: s,
        transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`,
        textShadow: '0 4px 0 rgba(0,0,0,0.6)',
        ...style,
      }}
    >
      <RichText text={text} />
    </div>
  );
};
