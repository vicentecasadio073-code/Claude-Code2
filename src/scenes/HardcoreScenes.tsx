import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useVideoConfig} from 'remotion';
import {CONFIG} from '../config';
import {COLORS} from '../theme';
import {LOCAL} from '../timeline';
import {AnimatedText, PixelLabel, Subtitle} from '../components/AnimatedText';
import {BreakingHeart} from '../components/BreakingHeart';
import {Embers} from '../components/Embers';
import {beatPulse} from '../components/fx';
import {FIRE, SKULL, SWORD, TNT} from '../components/icons';
import {SafeArea} from '../components/Overlays';
import {PixelBurst} from '../components/PixelBurst';
import {PixelSprite} from '../components/PixelSprite';
import {useBeatFrame, useGlobalFrame} from '../components/SceneContext';
import {Shockwave} from '../components/Shockwave';

const T = CONFIG.texts;
const LIVES = CONFIG.server.lives;

const usePop = (at: number, config = {damping: 9, stiffness: 240, mass: 0.6}) => {
  const f = useBeatFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - at, fps, config});
};

const Counter: React.FC<{n: number}> = ({n}) => (
  <PixelLabel text={`*0${n}* / 04`} color={COLORS.muted} size={36} spacing={8} at={0} />
);

/** Caja de altura fija para íconos, así el layout no salta */
const IconBox: React.FC<{height: number; children: React.ReactNode}> = ({height, children}) => (
  <div style={{height, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    {children}
  </div>
);

/** 8-11 s: DROP. MODO HARDCORE */
export const HardcoreTitleScene: React.FC = () => {
  const g = useGlobalFrame();
  const skull = usePop(0);
  const beat = beatPulse(g);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <Shockwave at={0} color={COLORS.red} maxSize={2200} duration={22} thickness={30} />
        <Shockwave at={4} color={COLORS.orange} maxSize={1600} duration={20} />
        <div style={{position: 'absolute', left: '50%', top: '48%'}}>
          <PixelBurst at={0} count={46} spread={900} seed="drop1" size={20} />
        </div>
      </AbsoluteFill>
      <SafeArea gap={26}>
        <div style={{transform: `scale(${skull * (1 + beat * 0.1)})`, filter: 'drop-shadow(0 0 30px rgba(255,30,30,0.8))'}}>
          <PixelSprite sprite={SKULL} cell={10} />
        </div>
        <PixelLabel text={T.hardcoreKicker} color={COLORS.white} size={40} spacing={10} at={2} />
        <AnimatedText
          text={T.hardcoreTitle.join('|')}
          font="pixel"
          sizes={[150, 180]}
          at={0}
          stagger={3}
          entrance={['drop', 'zoom']}
          lineHeight={1.05}
          glitch
          landShake={18}
        />
        <div style={{display: 'flex', gap: 26, marginTop: 10}}>
          {new Array(LIVES).fill(0).map((_, i) => (
            <BreakingHeart key={i} cell={9} appearAt={14 + i * 4} beat={beat} seed={`hc-${i}`} />
          ))}
        </div>
        <Subtitle text={T.hardcoreSub} at={30} size={54} />
      </SafeArea>
    </AbsoluteFill>
  );
};

/** Sin protecciones */
export const NoProtectionScene: React.FC = () => {
  const f = useBeatFrame();
  const pop = usePop(0);
  const flick = Math.sin(f * 0.9) * 0.05 + Math.sin(f * 0.37) * 0.04;
  return (
    <AbsoluteFill>
      <Embers count={40} seed="np" speed={1.6} sizeScale={1.4} />
      <SafeArea gap={26}>
        <Counter n={1} />
        <IconBox height={270}>
          <div
            style={{
              transform: `scale(${pop}) scaleY(${1 + flick}) skewX(${flick * 40}deg)`,
              transformOrigin: '50% 100%',
              filter: 'drop-shadow(0 0 40px rgba(255,120,20,0.85))',
            }}
          >
            <PixelSprite sprite={FIRE} cell={16} />
          </div>
          <div style={{position: 'absolute', left: '50%', top: '50%'}}>
            <PixelBurst at={0} count={24} spread={420} seed="np-burst" />
          </div>
        </IconBox>
        <AnimatedText
          text={T.noProtection.title}
          sizes={[140, 155]}
          at={0}
          stagger={3}
          entrance={['slam-left', 'slam-right']}
          glitch
        />
        <Subtitle text={T.noProtection.sub} at={12} />
      </SafeArea>
    </AbsoluteFill>
  );
};

/** Raids y PvP: la TNT se prende y explota en el beat */
export const RaidsScene: React.FC = () => {
  const f = useBeatFrame();
  const boom = LOCAL.tntExplode;
  const primed = f < boom;
  const blink = Math.floor(f / 3) % 2 === 0;
  const swell = interpolate(f, [-8, boom], [1, 1.3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const jitter = primed ? (random(`tnt-${f}`) * 2 - 1) * interpolate(f, [0, boom], [2, 14], {extrapolateLeft: 'clamp'}) : 0;
  return (
    <AbsoluteFill>
      <SafeArea gap={26}>
        <Counter n={2} />
        <IconBox height={300}>
          {primed ? (
            <div
              style={{
                transform: `translateX(${jitter}px) scale(${swell})`,
                filter: `brightness(${blink ? 2.4 : 1}) drop-shadow(0 0 ${blink ? 50 : 20}px rgba(255,80,40,0.9))`,
              }}
            >
              <PixelSprite sprite={TNT} cell={16} />
              <div style={{position: 'absolute', left: '50%', top: 10}}>
                <PixelBurst at={Math.floor(f / 4) * 4} count={6} spread={90} seed={`fuse-${Math.floor(f / 4)}`} duration={8} size={8} gravity={-0.6} colors={['#ffd23a', '#fff4c2', '#ff8a1f']} />
              </div>
            </div>
          ) : null}
          <div style={{position: 'absolute', left: '50%', top: '50%'}}>
            <PixelBurst at={boom} count={70} spread={1300} seed="tnt-boom" size={26} duration={40} />
            <PixelBurst at={boom} count={18} spread={500} seed="tnt-smoke" size={60} duration={40} gravity={-0.3} colors={['#3a3a3f', '#55555c', '#2a2a2e']} />
          </div>
          <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', overflow: 'visible'}}>
            <Shockwave at={boom} color={COLORS.orange} maxSize={2400} duration={20} thickness={40} />
          </AbsoluteFill>
        </IconBox>
        <AnimatedText text={T.raids.title} sizes={[150, 190]} at={boom} stagger={3} entrance="zoom" glitch landShake={20} />
        <Subtitle text={T.raids.sub} at={boom + 10} />
      </SafeArea>
    </AbsoluteFill>
  );
};

/** Cada traición cuenta: dos espadas chocan en el beat */
export const BetrayalScene: React.FC = () => {
  const f = useBeatFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f + 8, fps, config: {damping: 14, stiffness: 320, mass: 0.6}});
  const recoil = f >= 0 && f < 12 ? Math.sin(f * 1.2) * Math.exp(-f / 4) * 20 : 0;
  const swordStyle = (side: -1 | 1): React.CSSProperties => ({
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: `translate(-50%, -50%) translateX(${side * (interpolate(s, [0, 1], [800, 70]) + recoil)}px) ${
      side > 0 ? 'scaleX(-1)' : ''
    }`,
    filter: 'drop-shadow(0 0 20px rgba(200,220,255,0.5))',
  });
  return (
    <AbsoluteFill>
      <SafeArea gap={26}>
        <Counter n={3} />
        <IconBox height={300}>
          <div style={{position: 'relative', width: 600, height: 300}}>
            <div style={swordStyle(-1)}>
              <PixelSprite sprite={SWORD} cell={15} />
            </div>
            <div style={swordStyle(1)}>
              <PixelSprite sprite={SWORD} cell={15} />
            </div>
            <div style={{position: 'absolute', left: '50%', top: '40%'}}>
              <PixelBurst at={0} count={30} spread={520} seed="clash" size={12} colors={['#ffffff', '#fff4c2', '#ffd23a', '#c6d2e0']} />
            </div>
            <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
              <Shockwave at={0} color="#ffffff" maxSize={900} duration={12} thickness={14} />
            </AbsoluteFill>
          </div>
        </IconBox>
        <AnimatedText
          text={T.betrayal.title}
          sizes={[130, 200, 130]}
          at={2}
          stagger={4}
          entrance={['slam-left', 'zoom', 'slam-right']}
          glitch
        />
        <Subtitle text={T.betrayal.sub} at={18} />
      </SafeArea>
    </AbsoluteFill>
  );
};

/** 3 vidas: los corazones se rompen uno por uno */
export const LivesScene: React.FC = () => {
  const f = useBeatFrame();
  const g = useGlobalFrame();
  const breaks = LOCAL.heartBreaks;
  const punch = LOCAL.livesPunch;
  const lost = breaks.filter((b) => f >= b).length;
  const left = LIVES - lost;
  const lastChange = lost === 0 ? 0 : breaks[lost - 1];
  const label = left === 1 ? T.lives.counterOne : T.lives.counter.replace('{n}', String(left));

  const phase1Out = interpolate(f, [punch - 4, punch], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const danger = interpolate(f, [breaks[0], breaks[2] + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const throb = 0.5 + 0.5 * Math.sin(f * 0.5);

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 80% 65% at 50% 50%, rgba(0,0,0,0) 45%, rgba(200,0,0,${danger * (0.35 + throb * 0.2)}) 100%)`,
        }}
      />
      {f < punch && (
        <SafeArea gap={50} style={{opacity: phase1Out, transform: `scale(${1 + (1 - phase1Out) * 0.3})`}}>
          <Counter n={4} />
          <AnimatedText
            key={left}
            text={label}
            font="pixel"
            size={185}
            at={lastChange}
            entrance={lost === 0 ? 'zoom' : 'pop'}
            glitch={left === 0}
            landShake={22}
          />
          <div style={{display: 'flex', gap: 34}}>
            {breaks.map((b, i) => (
              <BreakingHeart key={i} cell={12} appearAt={-6 + i * 3} breakAt={b} beat={beatPulse(g)} seed={`life-${i}`} />
            ))}
          </div>
        </SafeArea>
      )}
      {f >= punch - 2 && (
        <SafeArea gap={30}>
          <div style={{transform: `scale(${popValue(f, punch)})`, filter: 'drop-shadow(0 0 40px rgba(255,20,20,0.9))'}}>
            <PixelSprite sprite={SKULL} cell={13} />
          </div>
          <AnimatedText text={T.lives.punch} sizes={[140, 220]} at={punch} stagger={3} entrance="zoom" glitch landShake={22} />
          <Subtitle text={T.lives.sub} at={punch + 8} size={52} />
        </SafeArea>
      )}
    </AbsoluteFill>
  );
};

/** Rebote amortiguado de 0 a 1 (sin hooks, se usa dentro de un render condicional) */
const popValue = (f: number, at: number) => {
  const t = f - at;
  return t < 0 ? 0 : 1 - Math.exp(-t / 3) * Math.cos(t * 0.8);
};
