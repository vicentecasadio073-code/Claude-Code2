import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useVideoConfig} from 'remotion';
import {CONFIG} from '../config';
import {COLORS, FONTS} from '../theme';
import {AnimatedText, Subtitle} from '../components/AnimatedText';
import {beatPulse} from '../components/fx';
import {CAMERA, CROWN, HEART, SHIELD, STAR} from '../components/icons';
import {SafeArea} from '../components/Overlays';
import {PixelBurst} from '../components/PixelBurst';
import {PixelSprite} from '../components/PixelSprite';
import {useBeatFrame, useGlobalFrame} from '../components/SceneContext';

const T = CONFIG.texts;

const usePop = (at = 0) => {
  const f = useBeatFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - at, fps, config: {damping: 9, stiffness: 260, mass: 0.6}});
};

/** Estrellitas que titilan alrededor de un ícono */
const Twinkles: React.FC<{count?: number; radius?: number; seed: string}> = ({count = 6, radius = 230, seed}) => {
  const f = useBeatFrame();
  return (
    <>
      {new Array(count).fill(0).map((_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const a = (i / count) * Math.PI * 2 + r('a') * 0.6;
        const d = radius * (0.8 + r('d') * 0.4);
        const tw = Math.max(0, Math.sin(f * 0.35 + r('p') * 6.28));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `calc(50% + ${Math.cos(a) * d}px)`,
              top: `calc(50% + ${Math.sin(a) * d * 0.6}px)`,
              transform: `translate(-50%, -50%) scale(${tw})`,
            }}
          >
            <PixelSprite sprite={STAR} cell={8} outline={null} />
          </div>
        );
      })}
    </>
  );
};

const IconStage: React.FC<{children: React.ReactNode; height?: number}> = ({children, height = 260}) => (
  <div style={{position: 'relative', width: 700, height, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    {children}
  </div>
);

export const ClansScene: React.FC = () => {
  const f = useBeatFrame();
  const pop = usePop(0);
  const side = usePop(5);
  const sway = Math.sin(f * 0.15) * 4;
  return (
    <AbsoluteFill>
      <SafeArea gap={28}>
        <IconStage>
          {[-1, 1].map((s) => (
            <div
              key={s}
              style={{
                position: 'absolute',
                left: `calc(50% + ${s * 210}px)`,
                top: '58%',
                transform: `translate(-50%, -50%) scale(${side * 0.6}) rotate(${s * 14}deg)`,
                opacity: 0.75,
                filter: 'saturate(0.7) brightness(0.8)',
              }}
            >
              <PixelSprite sprite={SHIELD} cell={14} />
            </div>
          ))}
          <div style={{transform: `scale(${pop}) rotate(${sway}deg)`, filter: 'drop-shadow(0 0 40px rgba(77,141,255,0.7))'}}>
            <PixelSprite sprite={SHIELD} cell={17} />
          </div>
          <Twinkles seed="clans" />
        </IconStage>
        <AnimatedText text={T.clans.title} sizes={[140, 180]} at={0} stagger={3} entrance={['pop', 'zoom']} />
        <Subtitle text={T.clans.sub} at={10} />
      </SafeArea>
    </AbsoluteFill>
  );
};

export const DominateScene: React.FC = () => {
  const f = useBeatFrame();
  const {fps} = useVideoConfig();
  const drop = spring({frame: f, fps, config: {damping: 8, stiffness: 220, mass: 0.7}});
  return (
    <AbsoluteFill>
      <SafeArea gap={28}>
        <IconStage>
          <div
            style={{
              transform: `translateY(${interpolate(drop, [0, 1], [-500, 0])}px) rotate(${Math.sin(f * 0.2) * 5}deg)`,
              filter: 'drop-shadow(0 0 45px rgba(255,200,61,0.75))',
            }}
          >
            <PixelSprite sprite={CROWN} cell={22} />
          </div>
          <div style={{position: 'absolute', left: '50%', top: '50%'}}>
            <PixelBurst at={4} count={20} spread={420} seed="crown" colors={['#ffc83d', '#fff4c2', '#b07a12']} />
          </div>
          <Twinkles seed="crown-tw" count={5} />
        </IconStage>
        <AnimatedText text={T.dominate.title} sizes={[170, 170]} at={0} stagger={3} entrance={['drop', 'zoom']} glitch />
      </SafeArea>
    </AbsoluteFill>
  );
};

export const StreamScene: React.FC = () => {
  const f = useBeatFrame();
  const pop = usePop(0);
  const recOn = Math.floor((f + 30) / 8) % 2 === 0;
  return (
    <AbsoluteFill>
      <SafeArea gap={28}>
        <IconStage>
          <div style={{position: 'relative', transform: `scale(${pop}) rotate(${Math.sin(f * 0.3) * 3}deg)`}}>
            <PixelSprite sprite={CAMERA} cell={17} style={{filter: 'drop-shadow(0 0 30px rgba(154,161,176,0.5))'}} />
            <div
              style={{
                position: 'absolute',
                left: -70,
                top: -40,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontFamily: FONTS.pixel,
                fontSize: 40,
                color: COLORS.white,
                background: 'rgba(0,0,0,0.75)',
                padding: '8px 16px',
                border: `3px solid ${COLORS.red}`,
              }}
            >
              <div style={{width: 22, height: 22, background: COLORS.red, opacity: recOn ? 1 : 0.2, boxShadow: `0 0 16px ${COLORS.red}`}} />
              {T.stream.rec}
            </div>
          </div>
          <FloatingHearts />
        </IconStage>
        <AnimatedText text={T.stream.title} sizes={[160, 200]} at={0} stagger={3} entrance={['slam-left', 'zoom']} glitch />
      </SafeArea>
    </AbsoluteFill>
  );
};

/** Corazoncitos subiendo como en un live */
const FloatingHearts: React.FC = () => {
  const f = useBeatFrame();
  return (
    <>
      {new Array(7).fill(0).map((_, i) => {
        const r = (k: string) => random(`fh-${i}-${k}`);
        const t = f - i * 4;
        if (t < 0) return null;
        const y = -t * (6 + r('v') * 4);
        const x = 260 + r('x') * 80 + Math.sin(t * 0.2 + i) * 20;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `calc(50% + ${x - 40}px)`,
              top: `calc(70% + ${y}px)`,
              opacity: interpolate(t, [0, 4, 30, 40], [0, 1, 1, 0], {extrapolateRight: 'clamp'}),
            }}
          >
            <PixelSprite sprite={HEART} cell={4 + Math.round(r('s') * 2)} outline={null} />
          </div>
        );
      })}
    </>
  );
};

export const RankScene: React.FC = () => {
  const g = useGlobalFrame();
  const shine = beatPulse(g);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{position: 'absolute', left: '50%', top: '48%'}}>
          <PixelBurst at={2} count={34} spread={800} seed="rank" colors={['#ffc83d', '#fff4c2', '#ff7a1a']} size={14} />
        </div>
      </AbsoluteFill>
      <SafeArea gap={30}>
        <AnimatedText
          text={T.rank.title}
          sizes={[140, 220, 140]}
          at={0}
          stagger={3}
          entrance={['drop', 'zoom', 'rise']}
          shadow={`0 7px 0 #5a3a00, 0 0 ${50 + shine * 60}px rgba(255,200,61,${0.35 + shine * 0.3})`}
        />
        <Subtitle text={T.rank.sub} at={10} />
      </SafeArea>
    </AbsoluteFill>
  );
};

/** Build antes del segundo drop: todo tiembla cada vez más */
export const ReadyScene: React.FC = () => {
  const f = useBeatFrame();
  const tension = interpolate(f, [0, 42], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const amp = tension * tension * 26;
  const jx = (random(`rdy-x-${f}`) * 2 - 1) * amp;
  const jy = (random(`rdy-y-${f}`) * 2 - 1) * amp;
  // latido que se acelera junto con el redoble
  const period = interpolate(f, [0, 42], [15, 3.5], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hb = Math.exp(-((Math.max(0, f) % period) / (period * 0.3)));
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse ${90 - tension * 30}% ${70 - tension * 25}% at 50% 50%, rgba(0,0,0,0) 40%, rgba(170,0,0,${0.15 + tension * 0.55}) 100%)`,
        }}
      />
      <SafeArea gap={40} style={{transform: `translate(${jx}px, ${jy}px) scale(${1 + tension * 0.18})`}}>
        <div style={{transform: `scale(${1 + hb * 0.25})`, filter: `drop-shadow(0 0 ${30 + hb * 40}px rgba(255,30,30,0.9))`}}>
          <PixelSprite sprite={HEART} cell={12} />
        </div>
        <AnimatedText text={T.ready.title} font="pixel" sizes={[170, 240]} at={0} stagger={4} entrance="zoom" glitch landShake={20} lineHeight={1.08} />
      </SafeArea>
    </AbsoluteFill>
  );
};
