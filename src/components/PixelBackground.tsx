import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {BEAT, DROP_1, DROP_2, HEARTBEATS, SCENES, TOTAL_FRAMES} from '../timeline';
import {VIDEO} from '../theme';
import {beatPulse} from './fx';

const CELL = 60;
const GAP = 4;
const DRIFT = 0.45; // px por frame hacia arriba
const COLS = Math.ceil(VIDEO.width / CELL) + 1;
const ROWS = Math.ceil((VIDEO.height + TOTAL_FRAMES * DRIFT) / CELL) + 2;

type Tile = {x: number; y: number; base: number; hot: number; phase: number; speed: number; idx: number};

const LOGO_AT = SCENES[1].at;

/** Fondo de cuadrados pixelados rojos/naranjas que laten con la música */
export const PixelBackground: React.FC = () => {
  const frame = useCurrentFrame();

  const tiles = useMemo(() => {
    const out: Tile[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const idx = r * COLS + c;
        // más tiles calientes hacia abajo de la pantalla visible
        const screenRow = (r * CELL) % VIDEO.height;
        const depth = screenRow / VIDEO.height;
        const hotChance = 0.04 + 0.16 * depth * depth;
        out.push({
          x: c * CELL,
          y: r * CELL,
          base: 13 + random(`b-${idx}`) * 12,
          hot: random(`h-${idx}`) < hotChance ? 0.35 + random(`hv-${idx}`) * 0.65 : 0,
          phase: random(`p-${idx}`) * Math.PI * 2,
          speed: 0.03 + random(`s-${idx}`) * 0.06,
          idx,
        });
      }
    }
    return out;
  }, []);

  // En el gancho el fondo casi no se ve; late con el corazón y explota con el logo
  const heart = HEARTBEATS.reduce((acc, hb) => {
    const d = frame - hb;
    return d >= 0 && d < 20 ? Math.max(acc, Math.exp(-d / 5)) : acc;
  }, 0);
  const reveal =
    frame < LOGO_AT
      ? 0.1 + heart * 0.35
      : interpolate(frame, [LOGO_AT, LOGO_AT + 12], [0.6, 1], {extrapolateRight: 'clamp'});
  const pulse = beatPulse(frame, 5);
  const beatIndex = Math.floor(frame / BEAT);
  const sinceBeat = frame % BEAT;
  const hype = frame >= DROP_1 ? 1 : 0.6;
  const offsetY = -frame * DRIFT;

  const minRow = Math.floor(-offsetY / CELL) - 1;
  const maxRow = minRow + Math.ceil(VIDEO.height / CELL) + 2;

  return (
    <AbsoluteFill style={{backgroundColor: '#060608', overflow: 'hidden'}}>
      <svg
        width={VIDEO.width}
        height={VIDEO.height}
        style={{position: 'absolute', inset: 0, opacity: reveal}}
        shapeRendering="crispEdges"
      >
        <g transform={`translate(${-GAP / 2}, ${offsetY})`}>
          {tiles.map((t) => {
            const row = t.y / CELL;
            if (row < minRow || row > maxRow) return null;
            const flicker = 0.55 + 0.45 * Math.sin(frame * t.speed + t.phase);
            // tiles que se encienden en cada beat
            const pop =
              pulse > 0 && random(`pop-${beatIndex}-${t.idx}`) < 0.018 ? Math.exp(-sinceBeat / 5) : 0;
            const heat = Math.min(1, t.hot * flicker * hype * (1 + pulse * 0.6) + pop);
            let fill: string;
            if (heat > 0.02) {
              const r = Math.round(40 + heat * 190);
              const g = Math.round(12 + heat * heat * 70);
              const bl = Math.round(10 + heat * 8);
              fill = `rgb(${r},${g},${bl})`;
            } else {
              const v = Math.round(t.base);
              fill = `rgb(${v},${v},${v + 3})`;
            }
            return <rect key={t.idx} x={t.x} y={t.y} width={CELL - GAP} height={CELL - GAP} fill={fill} />;
          })}
        </g>
      </svg>

      {/* oscurecer arriba para que se lea el texto */}
      <AbsoluteFill
        style={{
          background: 'linear-gradient(180deg, rgba(6,6,8,0.92) 0%, rgba(6,6,8,0.55) 35%, rgba(6,6,8,0.2) 70%, rgba(6,6,8,0) 100%)',
        }}
      />
      {/* brillo de lava abajo, más fuerte en los drops */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 90% 45% at 50% 108%, rgba(255,70,20,${
            (0.22 + pulse * 0.12 + dropGlow(frame) * 0.35) * reveal
          }) 0%, rgba(255,40,10,0) 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const dropGlow = (frame: number) => {
  for (const d of [DROP_1, DROP_2]) {
    const x = frame - d;
    if (x >= 0 && x < 60) return Math.exp(-x / 15);
  }
  return 0;
};
