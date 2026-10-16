import { createContext, useContext, useEffect, useState } from 'react';
import useSystemReducedMotion from '../hooks/useSystemReducedMotion';

const MotionContext = createContext({ enabled: true, systemReduced: false, toggle: () => {} });

export function MotionProvider({ children }) {
  const systemReduced = useSystemReducedMotion();
  const [paused, setPaused] = useState(() => {
    try { return localStorage.getItem('portfolio-motion') === 'off'; }
    catch { return false; }
  });
  const enabled = !systemReduced && !paused;
  useEffect(() => {
    document.body.dataset.motion = enabled ? 'on' : 'off';
    return () => { delete document.body.dataset.motion; };
  }, [enabled]);
  useEffect(() => {
    try { localStorage.setItem('portfolio-motion', paused ? 'off' : 'on'); }
    catch { /* Motion controls also work without storage. */ }
  }, [paused]);
  return <MotionContext.Provider value={{ enabled, systemReduced, toggle: () => setPaused(current => !current) }}>{children}</MotionContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSiteMotion = () => useContext(MotionContext);
