import type {Sprite} from './PixelSprite';

export const SKULL: Sprite = {
  rows: [
    '...WWWWWWWW...',
    '.WWWWWWWWWWWW.',
    'WWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWW',
    'WWKKKWWWWKKKWW',
    'WKKRKKWWKKRKKW',
    'WWKKKWWWWKKKWW',
    'LWWWWWWWWWWWWL',
    '.LLWWWKKWWWLL.',
    '..LWWWWWWWWL..',
    '..WKWKWKWKWW..',
    '..LWWWWWWWWL..',
    '...LLLLLLLL...',
  ],
  palette: {W: '#f3f1ee', L: '#b8b4b0', K: '#1a0c0f', R: '#ff2a2a'},
};

export const HEART: Sprite = {
  rows: [
    '.RRR...RRR.',
    'RWWRR.RRRRR',
    'RWRRRRRRRRR',
    'RRRRRRRRRRR',
    'RRRRRRRRRRD',
    '.RRRRRRRRD.',
    '..RRRRRRD..',
    '...RRRRD...',
    '....RRD....',
    '.....D.....',
  ],
  palette: {R: '#ec1c2a', D: '#9a0d17', W: '#ffb4b4'},
};

export const HEART_EMPTY: Sprite = {
  rows: HEART.rows,
  palette: {R: '#2b1517', D: '#1f0f11', W: '#3a1d20'},
};

/** Columna donde se parte cada fila del corazón (grieta en zigzag) */
export const HEART_CRACK = [5, 6, 5, 4, 5, 6, 5, 4, 5, 6];

export const TNT: Sprite = {
  rows: [
    '......GS......',
    '......G.......',
    'RRDRRDRRDRRDRR',
    'RRDRRDRRDRRDRR',
    'RRDRRDRRDRRDRR',
    'WWWWWWWWWWWWWW',
    'WKKKWKWWKWKKKW',
    'WWKWWKKWKWWKWW',
    'WWKWWKWKKWWKWW',
    'WWKWWKWWKWWKWW',
    'WWWWWWWWWWWWWW',
    'RRDRRDRRDRRDRR',
    'RRDRRDRRDRRDRR',
    'RRDRRDRRDRRDRR',
  ],
  palette: {R: '#e2322b', D: '#8f1712', W: '#f2efe9', K: '#1b1b1b', G: '#8a8a8a', S: '#ffd23a'},
};

/** Espada en diagonal (punta arriba a la derecha) */
export const SWORD: Sprite = {
  rows: [
    '..............LW',
    '.............LWS',
    '............LWS.',
    '...........LWS..',
    '..........LWS...',
    '.........LWS....',
    '........LWS.....',
    '.......LWS......',
    '..GG..LWS.......',
    '..GYGLWS........',
    '...GYWS.........',
    '....HYG.........',
    '...H.GYG........',
    '..H...GG........',
    '.P..............',
    'PP..............',
  ],
  palette: {
    W: '#f4f7fb',
    L: '#c6d2e0',
    S: '#7d8ea3',
    G: '#b8860b',
    Y: '#ffd23a',
    H: '#6b3f1f',
    P: '#ffd23a',
  },
};

export const FIRE: Sprite = {
  rows: [
    '.....R......',
    '....RR......',
    '....RRR..R..',
    '...RRORR.RR.',
    '..RRROORRRR.',
    '..RROOORRORR',
    '.RROOYOOOORR',
    '.RROYYYOOORR',
    'RROOYYYYOORR',
    'RROYYWYYYORR',
    'RROYYWWYYORR',
    '.RROYYYYYOR.',
    '..RROOOOORR.',
    '...RRRRRR...',
  ],
  palette: {R: '#e8321e', O: '#ff8a1f', Y: '#ffd23a', W: '#fff4c2'},
};

export const SHIELD: Sprite = {
  rows: [
    'BBBBBBBBBBBB',
    'BLLLLYYLLLLB',
    'BLLLLYYLLLBB',
    'BLYYYYYYYYBB',
    'BLYYYYYYYYBB',
    'BLLLLYYLLLBB',
    'BLLLLYYLLLBB',
    '.BLLLYYLLBB.',
    '.BLLLYYLLBB.',
    '..BLLLLLBB..',
    '...BLLLBB...',
    '....BBBB....',
  ],
  palette: {B: '#1f4fbf', L: '#4d8dff', Y: '#ffd23a'},
};

export const CROWN: Sprite = {
  rows: [
    'Y.....Y.....Y',
    'YY...YYY...YY',
    'YYY.YYYYY.YYY',
    'YYYYYYRYYYYYY',
    'YYYYYRRRYYYYY',
    'YYYYYYRYYYYYY',
    'DDDDDDDDDDDDD',
  ],
  palette: {Y: '#ffc83d', D: '#b07a12', R: '#ff2d2d'},
};

export const CAMERA: Sprite = {
  rows: [
    '...GGG...GGG...',
    '..GLLLG.GLLLG..',
    '..GLDLG.GLDLG..',
    '...GGG...GGG...',
    'GGGGGGGGGGGG...',
    'GLLLLLLLLLLG.GG',
    'GLLLLLLLLLLGGLG',
    'GLLLLLLLLLLGGLG',
    'GLLLLLLLLLLG.GG',
    'GGGGGGGGGGGG...',
  ],
  palette: {G: '#5b6170', L: '#9aa1b0', D: '#2a2d35'},
};

export const STAR: Sprite = {
  rows: ['..Y..', '.YWY.', 'YWWWY', '.YWY.', '..Y..'],
  palette: {Y: '#ffc83d', W: '#fff4c2'},
};
