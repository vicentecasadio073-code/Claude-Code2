import React from 'react';
import {Composition} from 'remotion';
import {HardcoreVideo} from './HardcoreVideo';
import {VIDEO} from './theme';
import {FPS, TOTAL_FRAMES} from './timeline';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="HardcoreTikTok"
    component={HardcoreVideo}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={VIDEO.width}
    height={VIDEO.height}
    defaultProps={{showSafeZone: false}}
  />
);
