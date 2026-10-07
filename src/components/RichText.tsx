import React from 'react';
import {COLORS} from '../theme';

type Segment = {text: string; color?: string};

/** "*rojo*", "~amarillo~" -> segmentos con color */
export const parseAccents = (text: string): Segment[] => {
  const out: Segment[] = [];
  const re = /(\*[^*]+\*|~[^~]+~)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) out.push({text: text.slice(last, m.index)});
    const raw = m[0];
    out.push({text: raw.slice(1, -1), color: raw[0] === '*' ? COLORS.red : COLORS.yellow});
    last = m.index! + raw.length;
  }
  if (last < text.length) out.push({text: text.slice(last)});
  return out;
};

/** Divide en líneas por "|" sin romper los acentos */
export const splitLines = (text: string) => text.split('|');

export const RichText: React.FC<{text: string; style?: React.CSSProperties}> = ({text, style}) => (
  <span style={style}>
    {parseAccents(text).map((s, i) => (
      <span key={i} style={s.color ? {color: s.color} : undefined}>
        {s.text}
      </span>
    ))}
  </span>
);
