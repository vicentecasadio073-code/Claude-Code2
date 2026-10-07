import React, {useMemo} from 'react';

export type Sprite = {
  rows: readonly string[];
  palette: Record<string, string>;
};

type Props = {
  sprite: Sprite;
  /** Tamaño en px de cada pixel del sprite */
  cell: number;
  /** Color del contorno automático (null = sin contorno) */
  outline?: string | null;
  /** Oculta celdas (para partir el corazón) */
  mask?: (row: number, col: number) => boolean;
  /** Pinta celdas con otro color (flash de grieta, etc.) */
  override?: (row: number, col: number) => string | undefined;
  style?: React.CSSProperties;
};

export const PixelSprite: React.FC<Props> = ({
  sprite,
  cell,
  outline = '#120709',
  mask,
  override,
  style,
}) => {
  const {rows, palette} = sprite;
  const height = rows.length;
  const width = Math.max(...rows.map((r) => r.length));

  const cells = useMemo(() => {
    const filled = (r: number, c: number) =>
      r >= 0 && r < height && c >= 0 && c < width && (rows[r][c] ?? '.') !== '.';
    const out: {r: number; c: number; key: string | null}[] = [];
    // contorno automático en un borde de 1 celda alrededor del sprite
    for (let r = -1; r <= height; r++) {
      for (let c = -1; c <= width; c++) {
        if (filled(r, c)) {
          out.push({r, c, key: rows[r][c]});
        } else if (
          outline &&
          (filled(r - 1, c) || filled(r + 1, c) || filled(r, c - 1) || filled(r, c + 1))
        ) {
          out.push({r, c, key: null});
        }
      }
    }
    return out;
  }, [rows, height, width, outline]);

  return (
    <svg
      width={(width + 2) * cell}
      height={(height + 2) * cell}
      viewBox={`-1 -1 ${width + 2} ${height + 2}`}
      shapeRendering="crispEdges"
      style={{display: 'block', overflow: 'visible', ...style}}
    >
      {cells.map(({r, c, key}) => {
        const isOutline = key === null;
        if (mask) {
          // el contorno sigue a la celda vecina más cercana visible
          const ref = isOutline ? nearestFilled(rows, r, c) : [r, c];
          if (!ref || !mask(ref[0], ref[1])) return null;
        }
        const fill = (!isOutline && override?.(r, c)) || (isOutline ? outline! : palette[key!]);
        return <rect key={`${r}-${c}`} x={c} y={r} width={1.02} height={1.02} fill={fill} />;
      })}
    </svg>
  );
};

const nearestFilled = (rows: readonly string[], r: number, c: number): [number, number] | null => {
  for (const [dr, dc] of [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ]) {
    const ch = rows[r + dr]?.[c + dc];
    if (ch && ch !== '.') return [r + dr, c + dc];
  }
  return null;
};
