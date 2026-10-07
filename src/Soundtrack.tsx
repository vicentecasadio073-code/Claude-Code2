import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {SFX_CUES} from './timeline';

const MUSIC_VOLUME = 0.7;
/** Ganancia general de efectos (la música y los SFX se suman, dejar margen) */
const SFX_GAIN = 0.75;

/** Música + efectos sincronizados con el timeline */
export const Soundtrack: React.FC = () => (
  <>
    <Audio src={staticFile('audio/music.wav')} volume={MUSIC_VOLUME} />
    {SFX_CUES.map((cue, i) => (
      <Sequence key={i} from={cue.at} layout="none" name={`sfx: ${cue.sfx}`}>
        <Audio src={staticFile(`audio/${cue.sfx}.wav`)} volume={(cue.volume ?? 1) * SFX_GAIN} />
      </Sequence>
    ))}
  </>
);
