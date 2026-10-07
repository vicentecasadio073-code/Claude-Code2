import React, {createContext, useContext} from 'react';
import {useCurrentFrame} from 'remotion';

/**
 * Cada escena arranca `hit` frames antes de su beat (lo que dura la transición de entrada).
 * useBeatFrame() devuelve el frame relativo al golpe: 0 = el beat de la escena.
 */
const SceneContext = createContext({hit: 0, globalStart: 0});

export const SceneProvider: React.FC<{hit: number; globalStart: number; children: React.ReactNode}> = ({
  hit,
  globalStart,
  children,
}) => <SceneContext.Provider value={{hit, globalStart}}>{children}</SceneContext.Provider>;

export const useBeatFrame = () => {
  const frame = useCurrentFrame();
  const {hit} = useContext(SceneContext);
  return frame - hit;
};

/** Frame global (para sincronizar con el pulso de la música) */
export const useGlobalFrame = () => {
  const frame = useCurrentFrame();
  const {globalStart} = useContext(SceneContext);
  return frame + globalStart;
};
