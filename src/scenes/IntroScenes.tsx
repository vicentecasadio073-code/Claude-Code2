import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useVideoConfig} from 'remotion';
import {CONFIG} from '../config';
import {COLORS, FONTS, VIDEO} from '../theme';
import {HEARTBEATS, LOCAL} from '../timeline';
import {AnimatedText, PixelLabel} from '../components/AnimatedText';
import {glitchOffset, chromaShadow} from '../components/fx';
import {HEART, SKULL} from '../components/icons';
import {SafeArea} from '../components/Overlays';
import {PixelSprite} from '../components/PixelSprite';
import {useBeatFrame} from '../components/SceneContext';
import {Shockwave} from '../components/Shockwave';

const T = CONFIG.texts;

const heartbeatPulse = (f: number) =>
  HEARTBEATS.reduce((acc, hb) => {
    const lub = f - hb;
    const dub = f - hb - 6;
    const a = lub >= 0 ? Math.exp(-lub / 3) : 0;
    const d = dub >= 0 ? Math.exp(-dub / 3) * 0.6 : 0;
    return Math.max(acc, a, d);
  }, 0);

/** Línea de electrocardiograma que se dibuja con cada latido */
const EKG: React.FC<{f: number}> = ({f}) => {
  const W = VIDEO.width;
  const HOOK_LEN = 88;
  const base = 150;
  const spikes = HEARTBEATS.map((hb) => ((hb + 1) / HOOK_LEN) * W);
  const shape = (d: number) => {
    if (d > -44 && d < -22) return -14 * Math.sin((Math.PI * (d + 44)) / 22);
    if (d >= -8 && d < -2) return 12;
    if (d >= -2 && d < 6) return interpolate(d, [-2, 2, 6], [12, -130, 70]);
    if (d >= 6 && d < 14) return interpolate(d, [6, 14], [70, 0]);
    if (d > 34 && d < 70) return -26 * Math.sin((Math.PI * (d - 34)) / 36);
    return 0;
  };
  const head = Math.min(W, (f / HOOK_LEN) * W);
  const pts: string[] = [];
  for (let x = 0; x <= head; x += 3) {
    const y = base + spikes.reduce((acc, sx) => acc + shape(x - sx), 0);
    pts.push(`${x},${y}`);
  }
  const headY = base + spikes.reduce((acc, sx) => acc + shape(head - sx), 0);
  return (
    <svg width={W} height={300} style={{overflow: 'visible'}}>
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={COLORS.red}
        strokeWidth={7}
        strokeLinejoin="round"
        style={{filter: `drop-shadow(0 0 12px ${COLORS.red})`}}
      />
      <circle cx={head} cy={headY} r={12} fill="#fff" style={{filter: `drop-shadow(0 0 18px ${COLORS.red})`}} />
    </svg>
  );
};

/** 0-3 s: pantalla negra, latido y la pregunta */
export const HookScene: React.FC = () => {
  const f = useBeatFrame();
  const hb = heartbeatPulse(f);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 45%, rgba(255,20,20,${0.08 + hb * 0.22}) 0%, rgba(0,0,0,0) 60%)`,
        }}
      />
      <SafeArea gap={50}>
        <div style={{transform: `scale(${1 + hb * 0.28})`, filter: `drop-shadow(0 0 ${20 + hb * 50}px rgba(255,30,30,0.9))`}}>
          <PixelSprite sprite={HEART} cell={14} />
        </div>
        <AnimatedText
          text={T.hook.join('|')}
          font="pixel"
          sizes={[170, 170, 240]}
          at={LOCAL.hookWords[0]}
          stagger={LOCAL.hookWords[1] - LOCAL.hookWords[0]}
          entrance="zoom"
          lineHeight={1.08}
          glitch
          pulse={false}
          landShake={16}
        />
        <div style={{width: VIDEO.width, marginLeft: -VIDEO.safeSide * 2, height: 260}}>
          <EKG f={f} />
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};

/** 3-8 s: logo con calavera, glitch y cuenta regresiva hacia el drop */
export const LogoScene: React.FC = () => {
  const f = useBeatFrame();
  const {fps} = useVideoConfig();
  const [c1] = LOCAL.countdown;
  const skullIn = spring({frame: f, fps, config: {damping: 10, stiffness: 200, mass: 0.8}});
  const dim = interpolate(f, [c1 - 6, c1], [1, 0.22], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const push = interpolate(f, [0, c1], [1, 1.08], {extrapolateRight: 'clamp'});
  const gx = glitchOffset(f, 'logo', 0.18, 18) + (f >= 0 && f < 8 ? (8 - f) * 4 : 0);
  const eyes = 0.6 + 0.4 * Math.sin(f * 0.25);

  return (
    <AbsoluteFill>
      <SafeArea gap={18} style={{opacity: dim, filter: dim < 1 ? `blur(${(1 - dim) * 8}px)` : undefined, transform: `scale(${push})`}}>
        <div
          style={{
            transform: `translateY(${interpolate(skullIn, [0, 1], [-200, 0])}px) scale(${skullIn})`,
            filter: `drop-shadow(${gx}px 0 0 rgba(255,0,60,0.9)) drop-shadow(${-gx}px 0 0 rgba(0,229,255,0.8)) drop-shadow(0 0 ${30 * eyes}px rgba(255,30,30,0.7))`,
            marginBottom: 10,
          }}
        >
          <PixelSprite sprite={SKULL} cell={15} />
        </div>
        <AnimatedText text={CONFIG.server.name} font="display" size={210} at={2} glitch landShake={14} />
        <PixelLabel text={`~${CONFIG.server.nameSuffix.split('').join(' ')}~`} size={64} spacing={18} at={8} />
        <div style={{height: 40}} />
        <PixelLabel text={T.logoKicker} size={44} spacing={10} at={30} />
      </SafeArea>

      {LOCAL.countdown.map((at, i) => {
        const next = LOCAL.countdown[i + 1] ?? at + 18;
        const t = f - at;
        if (t < 0 || f >= next) return null;
        const s = spring({frame: t, fps, config: {damping: 9, stiffness: 300, mass: 0.5}});
        const off = (random(`cd-${i}-${f}`) * 2 - 1) * 8;
        return (
          <AbsoluteFill key={i} style={{alignItems: 'center', justifyContent: 'center'}}>
            <Shockwave at={at} color={COLORS.red} maxSize={1200} duration={14} />
            <div
              style={{
                fontFamily: FONTS.pixel,
                fontSize: 560,
                color: i === 2 ? COLORS.red : COLORS.white,
                transform: `translateX(${off}px) scale(${interpolate(s, [0, 1], [2.4, 1])})`,
                opacity: interpolate(t, [0, 2, 12, 15], [0, 1, 1, 0.2], {extrapolateRight: 'clamp'}),
                textShadow: [chromaShadow(10), `0 0 80px rgba(255,40,40,0.8)`, `0 14px 0 ${COLORS.redDeep}`].join(', '),
                lineHeight: 1,
              }}
            >
              {T.countdown[i]}
            </div>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
