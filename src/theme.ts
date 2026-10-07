import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import {loadFont as loadPixel} from '@remotion/google-fonts/PixelifySans';

const pixel = loadPixel('normal', {weights: ['700'], subsets: ['latin', 'latin-ext']});
const display = loadAnton('normal', {weights: ['400'], subsets: ['latin', 'latin-ext']});
const sans = loadInter('normal', {weights: ['600', '800'], subsets: ['latin', 'latin-ext']});
const mono = loadMono('normal', {weights: ['800'], subsets: ['latin', 'latin-ext']});

export const FONTS = {
  /** Títulos pixelados (gancho, MODO HARDCORE, etiquetas) */
  pixel: pixel.fontFamily,
  /** Frases de impacto (condensada bold de la marca) */
  display: display.fontFamily,
  /** Subtítulos */
  sans: sans.fontFamily,
  /** IP / puerto / discord */
  mono: mono.fontFamily,
};

export const COLORS = {
  bg: '#09090c',
  panel: 'rgba(16, 16, 20, 0.92)',
  panelBorder: 'rgba(255, 255, 255, 0.06)',
  white: '#f6f4f2',
  muted: '#b9b4b0',
  red: '#ff2d2d',
  redDeep: '#4a0a0a',
  orange: '#ff7a1a',
  yellow: '#ffc83d',
  blue: '#3b82f6',
  green: '#22c55e',
  purple: '#a855f7',
  discord: '#8b9cff',
};

export const VIDEO = {
  width: 1080,
  height: 1920,
  /** Zona segura de TikTok */
  safeTop: 150,
  safeBottom: 250,
  safeSide: 90,
};

/** Sombra "extruida" de los títulos, igual que el logo de la marca */
export const TITLE_SHADOW = `0 7px 0 ${COLORS.redDeep}, 0 14px 0 rgba(0,0,0,0.55), 0 0 60px rgba(255,45,45,0.25)`;
