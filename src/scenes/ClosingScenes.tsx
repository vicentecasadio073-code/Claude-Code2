import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {CONFIG} from '../config';
import {COLORS, FONTS} from '../theme';
import {AnimatedText} from '../components/AnimatedText';
import {Card} from '../components/Card';
import {beatPulse} from '../components/fx';
import {SKULL} from '../components/icons';
import {SafeArea} from '../components/Overlays';
import {PixelBurst} from '../components/PixelBurst';
import {PixelSprite} from '../components/PixelSprite';
import {useBeatFrame, useGlobalFrame} from '../components/SceneContext';
import {Shockwave} from '../components/Shockwave';

const T = CONFIG.texts;
const S = CONFIG.server;

/** Texto que se tipea letra por letra con cursor */
const Typed: React.FC<{text: string; at: number; perFrame?: number; style: React.CSSProperties}> = ({
  text,
  at,
  perFrame = 1,
  style,
}) => {
  const f = useBeatFrame();
  const n = Math.max(0, Math.min(text.length, Math.floor((f - at) * perFrame)));
  const done = n >= text.length;
  const cursorOn = !done || Math.floor(f / 8) % 2 === 0;
  return (
    <div style={{...style, whiteSpace: 'nowrap'}}>
      {text.slice(0, n)}
      <span style={{opacity: cursorOn ? 1 : 0, color: COLORS.yellow}}>_</span>
      {/* reserva el ancho final para que no salte el layout */}
      <span style={{visibility: 'hidden'}}>{text.slice(n)}</span>
    </div>
  );
};

const Label: React.FC<{text: string; color: string}> = ({text, color}) => (
  <div style={{fontFamily: FONTS.pixel, fontSize: 32, letterSpacing: 8, color, marginBottom: 8}}>{text}</div>
);

/** DROP 2: IP gigante */
export const IpScene: React.FC = () => (
  <AbsoluteFill>
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <Shockwave at={0} color={COLORS.yellow} maxSize={2200} duration={22} thickness={30} />
      <div style={{position: 'absolute', left: '50%', top: '50%'}}>
        <PixelBurst at={0} count={46} spread={1000} seed="drop2" size={20} />
      </div>
    </AbsoluteFill>
    <SafeArea gap={44}>
      <AnimatedText text={T.ipKicker} font="pixel" size={110} at={0} entrance="zoom" glitch landShake={18} />
      <Card accent={COLORS.yellow} bar="left" at={2} from="scale" width={900} padding="34px 30px">
        <Label text={T.ipLabel} color={COLORS.yellow} />
        <Typed text={S.ip} at={4} style={{fontFamily: FONTS.mono, fontWeight: 800, fontSize: 80, color: COLORS.white}} />
      </Card>
      <Card accent={COLORS.orange} bar="left" at={14} from="right" width={900} padding="28px 30px">
        <Label text={T.portLabel} color={COLORS.orange} />
        <div style={{fontFamily: FONTS.mono, fontWeight: 800, fontSize: 88, color: COLORS.orange}}>{S.port}</div>
      </Card>
    </SafeArea>
  </AbsoluteFill>
);

const EditionCard: React.FC<{name: string; versions: string; accent: string; at: number; from: 'left' | 'right'}> = ({
  name,
  versions,
  accent,
  at,
  from,
}) => (
  <Card accent={accent} at={at} from={from} width={820} padding="30px 40px 34px" style={{textAlign: 'center'}}>
    <Label text={T.editionLabel} color={accent} />
    <div style={{fontFamily: FONTS.display, fontSize: 140, lineHeight: 1, color: COLORS.white, textShadow: `0 6px 0 rgba(0,0,0,0.6)`}}>
      {name}
    </div>
    <div style={{fontFamily: FONTS.sans, fontWeight: 600, fontSize: 44, color: COLORS.muted, marginTop: 10}}>{versions}</div>
  </Card>
);

export const CompatScene: React.FC = () => (
  <AbsoluteFill>
    <SafeArea gap={46}>
      <AnimatedText text={T.compatTitle} size={125} at={0} entrance="drop" />
      <EditionCard name={T.java} versions={S.javaVersions} accent={COLORS.orange} at={2} from="left" />
      <EditionCard name={T.bedrock} versions={S.bedrockVersions} accent={COLORS.green} at={8} from="right" />
    </SafeArea>
  </AbsoluteFill>
);

/** Pantalla final con todos los datos y el llamado a la acción */
export const FinalScene: React.FC = () => {
  const f = useBeatFrame();
  const g = useGlobalFrame();
  const beat = beatPulse(g);
  const breathe = 1 + Math.sin(f * 0.18) * 0.03 + beat * 0.04;
  const skullIn = interpolate(f, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  const row = (label: string, value: string, accent: string, at: number, size = 58) => (
    <Card accent={accent} bar="left" at={at} from={at % 2 ? 'right' : 'left'} width={860} padding="20px 30px">
      <Label text={label} color={accent} />
      <div style={{fontFamily: FONTS.mono, fontWeight: 800, fontSize: size, color: accent === COLORS.yellow ? COLORS.white : accent}}>
        {value}
      </div>
    </Card>
  );
  return (
    <AbsoluteFill>
      <SafeArea gap={22}>
        <div style={{transform: `scale(${skullIn * (1 + beat * 0.08)})`, filter: 'drop-shadow(0 0 26px rgba(255,30,30,0.75))'}}>
          <PixelSprite sprite={SKULL} cell={8} />
        </div>
        <AnimatedText text={`${S.name}|${S.nameSuffix}`} sizes={[150, 150]} at={0} stagger={3} entrance="zoom" lineHeight={0.95} />
        <div style={{height: 6}} />
        {row(T.ipLabel, S.ip, COLORS.yellow, 8, 64)}
        {row(T.portLabel, S.port, COLORS.orange, 13)}
        {row(T.discordLabel, S.discord, COLORS.discord, 18, 50)}
        <div style={{height: 6}} />
        <div style={{transform: `scale(${breathe})`}}>
          <AnimatedText text={T.cta} size={82} at={26} stagger={4} entrance="pop" lineHeight={1.05} pulse={false} />
        </div>
      </SafeArea>
    </AbsoluteFill>
  );
};
