import { useCallback, useEffect, useMemo, useState } from 'react';
import { LazyMotion, MotionConfig } from 'framer-motion';
import { MotionContext } from './motionContext.js';
import useSystemReducedMotion from './useSystemReducedMotion.js';
import './motion.css';

const loadAnimationFeatures = () =>
  import('./animationFeatures.js').then((module) => module.default);

export function MotionProvider({ children }) {
  const systemReduced = useSystemReducedMotion();
  const [paused, setPaused] = useState(() => {
    try {
      return localStorage.getItem('portfolio-motion') === 'off';
    } catch {
      return false;
    }
  });
  const enabled = !systemReduced && !paused;
  const toggle = useCallback(() => setPaused((current) => !current), []);
  const value = useMemo(
    () => ({ enabled, systemReduced, toggle }),
    [enabled, systemReduced, toggle],
  );

  useEffect(() => {
    document.body.dataset.motion = enabled ? 'on' : 'off';
    return () => {
      delete document.body.dataset.motion;
    };
  }, [enabled]);

  useEffect(() => {
    try {
      localStorage.setItem('portfolio-motion', paused ? 'off' : 'on');
    } catch {
      /* The in-memory preference still works when storage is unavailable. */
    }
  }, [paused]);

  return (
    <MotionContext.Provider value={value}>
      <MotionConfig
        reducedMotion={enabled ? 'never' : 'always'}
        transition={!enabled ? { duration: 0 } : undefined}
      >
        <LazyMotion features={loadAnimationFeatures} strict>
          {children}
        </LazyMotion>
      </MotionConfig>
    </MotionContext.Provider>
  );
}
