/**
 * Todo el timing del video, calculado desde el BPM de la música.
 * 120 BPM a 30 fps => 1 beat = 15 frames, 1 compás = 60 frames.
 * Si cambiás el BPM o los drops, regenerá el audio (scripts/generate_audio.py).
 */
export const FPS = 30;
export const BPM = 120;
export const BEAT = (FPS * 60) / BPM; // 15
export const b = (beats: number) => Math.round(beats * BEAT);

export const DROP_1 = b(16); // 8 s
export const DROP_2 = b(56); // 28 s
export const TOTAL_FRAMES = b(76); // 38 s

export type TransitionKind =
  | 'glitch'
  | 'flash'
  | 'punch'
  | 'slide'
  | 'wipe'
  | 'flip'
  | 'fade';

export type Direction = 'from-left' | 'from-right' | 'from-top' | 'from-bottom';

export type SceneId =
  | 'hook'
  | 'logo'
  | 'hardcore'
  | 'noProtection'
  | 'raids'
  | 'betrayal'
  | 'lives'
  | 'clans'
  | 'dominate'
  | 'stream'
  | 'rank'
  | 'ready'
  | 'ip'
  | 'compat'
  | 'final';

export type SceneDef = {
  id: SceneId;
  /** Frame global en el que la escena "golpea" (siempre sobre un beat) */
  at: number;
  /** Transición de entrada: termina justo en `at` */
  transition?: {kind: TransitionKind; frames: number; direction?: Direction};
};

export const SCENES: SceneDef[] = [
  {id: 'hook', at: 0},
  {id: 'logo', at: b(6), transition: {kind: 'glitch', frames: 10}},
  {id: 'hardcore', at: DROP_1, transition: {kind: 'flash', frames: 10}},
  {id: 'noProtection', at: b(22), transition: {kind: 'slide', frames: 10, direction: 'from-right'}},
  {id: 'raids', at: b(26), transition: {kind: 'punch', frames: 8}},
  {id: 'betrayal', at: b(30), transition: {kind: 'wipe', frames: 10, direction: 'from-left'}},
  {id: 'lives', at: b(34), transition: {kind: 'glitch', frames: 8}},
  {id: 'clans', at: b(40), transition: {kind: 'flip', frames: 12, direction: 'from-right'}},
  {id: 'dominate', at: b(44), transition: {kind: 'slide', frames: 8, direction: 'from-bottom'}},
  {id: 'stream', at: b(47), transition: {kind: 'punch', frames: 8}},
  {id: 'rank', at: b(50), transition: {kind: 'wipe', frames: 8, direction: 'from-right'}},
  {id: 'ready', at: b(53), transition: {kind: 'glitch', frames: 8}},
  {id: 'ip', at: DROP_2, transition: {kind: 'flash', frames: 8}},
  {id: 'compat', at: b(62), transition: {kind: 'slide', frames: 10, direction: 'from-left'}},
  {id: 'final', at: b(67), transition: {kind: 'glitch', frames: 10}},
];

/** Momentos dentro de escenas (en frames relativos al golpe de la escena) */
export const LOCAL = {
  hookWords: [1, 7, 13],
  countdown: [b(7), b(8), b(9)], // dentro de "logo": 6.5 s, 7 s, 7.5 s
  tntExplode: b(1),
  heartBreaks: [b(1), b(2), b(3)],
  livesPunch: b(4),
};

const at = (id: SceneId) => SCENES.find((s) => s.id === id)!.at;

/** Latidos del gancho (frames globales) */
export const HEARTBEATS = [0, b(2), b(4), b(5)];

export type Sfx =
  | 'heartbeat'
  | 'heart-break'
  | 'tnt-fuse'
  | 'explosion'
  | 'sword'
  | 'whoosh'
  | 'impact'
  | 'glitch'
  | 'pop';

export type SfxCue = {sfx: Sfx; at: number; volume?: number};

const whooshBefore = (frame: number, volume = 0.55): SfxCue => ({
  sfx: 'whoosh',
  at: frame - 9,
  volume,
});

export const SFX_CUES: SfxCue[] = [
  ...HEARTBEATS.map((f, i) => ({sfx: 'heartbeat' as const, at: f, volume: 0.75 + i * 0.05})),
  ...LOCAL.hookWords.map((f) => ({sfx: 'pop' as const, at: f, volume: 0.5})),

  whooshBefore(at('logo')),
  {sfx: 'glitch', at: at('logo'), volume: 0.6},
  {sfx: 'impact', at: at('logo'), volume: 0.6},
  ...LOCAL.countdown.map((f) => ({sfx: 'pop' as const, at: at('logo') + f, volume: 0.7})),

  {sfx: 'impact', at: DROP_1, volume: 0.75},

  whooshBefore(at('noProtection')),
  {sfx: 'pop', at: at('noProtection'), volume: 0.5},

  whooshBefore(at('raids'), 0.4),
  {sfx: 'tnt-fuse', at: at('raids') - 4, volume: 0.6},
  {sfx: 'explosion', at: at('raids') + LOCAL.tntExplode, volume: 1},

  // el "clang" del sonido cae ~3 frames después de empezar
  {sfx: 'sword', at: at('betrayal') - 3, volume: 0.85},

  {sfx: 'glitch', at: at('lives') - 4, volume: 0.45},
  ...LOCAL.heartBreaks.map((f, i) => ({
    sfx: 'heart-break' as const,
    at: at('lives') + f,
    volume: 0.8 + i * 0.1,
  })),
  {sfx: 'impact', at: at('lives') + LOCAL.livesPunch, volume: 0.8},

  whooshBefore(at('clans')),
  {sfx: 'pop', at: at('clans'), volume: 0.5},
  whooshBefore(at('dominate'), 0.45),
  {sfx: 'pop', at: at('dominate'), volume: 0.5},
  whooshBefore(at('stream'), 0.45),
  {sfx: 'pop', at: at('stream'), volume: 0.5},
  whooshBefore(at('rank'), 0.45),
  {sfx: 'pop', at: at('rank'), volume: 0.5},
  {sfx: 'glitch', at: at('ready') - 3, volume: 0.5},

  {sfx: 'impact', at: DROP_2, volume: 0.75},
  whooshBefore(at('compat')),
  {sfx: 'pop', at: at('compat'), volume: 0.5},
  {sfx: 'pop', at: at('compat') + 8, volume: 0.5},
  {sfx: 'glitch', at: at('final') - 4, volume: 0.45},
  {sfx: 'impact', at: at('final'), volume: 0.55},
];

/** Screen shake: amp en px, decay en frames */
export type Impact = {at: number; amp: number; decay: number};

export const IMPACTS: Impact[] = [
  ...LOCAL.hookWords.map((f, i) => ({at: f, amp: 10 + i * 6, decay: 4})),
  {at: at('logo'), amp: 24, decay: 6},
  ...LOCAL.countdown.map((f, i) => ({at: at('logo') + f, amp: 10 + i * 6, decay: 4})),
  {at: DROP_1, amp: 46, decay: 8},
  {at: at('noProtection'), amp: 12, decay: 4},
  {at: at('raids') + LOCAL.tntExplode, amp: 60, decay: 9},
  {at: at('betrayal'), amp: 26, decay: 5},
  ...LOCAL.heartBreaks.map((f, i) => ({at: at('lives') + f, amp: 18 + i * 8, decay: 5})),
  {at: at('lives') + LOCAL.livesPunch, amp: 36, decay: 7},
  {at: at('clans'), amp: 10, decay: 4},
  {at: at('dominate'), amp: 10, decay: 4},
  {at: at('stream'), amp: 10, decay: 4},
  {at: at('rank'), amp: 12, decay: 4},
  {at: DROP_2, amp: 46, decay: 8},
  {at: at('compat'), amp: 10, decay: 4},
  {at: at('final'), amp: 18, decay: 6},
];

export type Flash = {at: number; color: string; strength: number; decay: number};

export const FLASHES: Flash[] = [
  {at: at('logo'), color: '#ff1a1a', strength: 0.55, decay: 5},
  {at: DROP_1, color: '#ffffff', strength: 0.85, decay: 6},
  {at: at('raids') + LOCAL.tntExplode, color: '#ffb347', strength: 0.9, decay: 7},
  {at: at('betrayal'), color: '#ffffff', strength: 0.35, decay: 3},
  ...LOCAL.heartBreaks.map((f) => ({at: at('lives') + f, color: '#ff1a1a', strength: 0.35, decay: 4})),
  {at: at('lives') + LOCAL.livesPunch, color: '#ff1a1a', strength: 0.6, decay: 6},
  {at: DROP_2, color: '#ffffff', strength: 0.85, decay: 6},
  {at: at('final'), color: '#ff1a1a', strength: 0.3, decay: 5},
];

/** Pulso visual en cada beat, sólo con la música "a full" */
export const PULSE_RANGES: [number, number][] = [
  [DROP_1, b(53)],
  [DROP_2, b(72)],
];
