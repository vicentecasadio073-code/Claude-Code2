import React from 'react';
import {AbsoluteFill} from 'remotion';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import type {TransitionPresentation} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {flip} from '@remotion/transitions/flip';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {Embers} from './components/Embers';
import {FlashOverlay, SafeZoneGuide, ScreenShake, Vignette} from './components/Overlays';
import {PixelBackground} from './components/PixelBackground';
import {SceneProvider} from './components/SceneContext';
import {CompatScene, FinalScene, IpScene} from './scenes/ClosingScenes';
import {ClansScene, DominateScene, RankScene, ReadyScene, StreamScene} from './scenes/CommunityScenes';
import {BetrayalScene, HardcoreTitleScene, LivesScene, NoProtectionScene, RaidsScene} from './scenes/HardcoreScenes';
import {HookScene, LogoScene} from './scenes/IntroScenes';
import {Soundtrack} from './Soundtrack';
import {flash, glitch, punch} from './transitions/custom';
import {SCENES, TOTAL_FRAMES} from './timeline';
import type {SceneDef, SceneId} from './timeline';

const SCENE_COMPONENTS: Record<SceneId, React.FC> = {
  hook: HookScene,
  logo: LogoScene,
  hardcore: HardcoreTitleScene,
  noProtection: NoProtectionScene,
  raids: RaidsScene,
  betrayal: BetrayalScene,
  lives: LivesScene,
  clans: ClansScene,
  dominate: DominateScene,
  stream: StreamScene,
  rank: RankScene,
  ready: ReadyScene,
  ip: IpScene,
  compat: CompatScene,
  final: FinalScene,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const presentationFor = (t: NonNullable<SceneDef['transition']>): TransitionPresentation<any> => {
  switch (t.kind) {
    case 'glitch':
      return glitch();
    case 'flash':
      return flash();
    case 'punch':
      return punch();
    case 'slide':
      return slide({direction: t.direction ?? 'from-right'});
    case 'wipe':
      return wipe({direction: t.direction ?? 'from-left'});
    case 'flip':
      return flip({direction: t.direction ?? 'from-right'});
    case 'fade':
      return fade();
  }
};

/**
 * Cada escena empieza `transition.frames` antes de su beat, así la transición
 * termina justo en el golpe. La escena i dura hasta el beat de la siguiente.
 */
const buildSeries = () => {
  const items: React.ReactNode[] = [];
  SCENES.forEach((scene, i) => {
    const hit = scene.transition?.frames ?? 0;
    const start = scene.at - hit;
    const next = SCENES[i + 1];
    const end = next ? next.at : TOTAL_FRAMES;
    const Comp = SCENE_COMPONENTS[scene.id];
    if (scene.transition) {
      items.push(
        <TransitionSeries.Transition
          key={`${scene.id}-t`}
          presentation={presentationFor(scene.transition)}
          timing={linearTiming({durationInFrames: hit})}
        />,
      );
    }
    items.push(
      <TransitionSeries.Sequence key={scene.id} durationInFrames={end - start} name={scene.id}>
        <SceneProvider hit={hit} globalStart={start}>
          <Comp />
        </SceneProvider>
      </TransitionSeries.Sequence>,
    );
  });
  return items;
};

export type HardcoreVideoProps = {showSafeZone: boolean};

export const HardcoreVideo: React.FC<HardcoreVideoProps> = ({showSafeZone}) => (
  <AbsoluteFill style={{backgroundColor: '#060608'}}>
    <ScreenShake strength={0.35}>
      <PixelBackground />
    </ScreenShake>
    <Embers count={60} seed="back" sizeScale={0.8} />
    <ScreenShake>
      <TransitionSeries>{buildSeries()}</TransitionSeries>
    </ScreenShake>
    <Embers count={18} seed="front" speed={1.4} sizeScale={1.5} />
    <Vignette />
    <FlashOverlay />
    <Soundtrack />
    {showSafeZone && <SafeZoneGuide />}
  </AbsoluteFill>
);
