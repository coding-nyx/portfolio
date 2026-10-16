import { useEffect, useMemo } from 'react';
import { LazyMotion, MotionConfig } from 'framer-motion';
import { MotionContext } from './motionContext.js';
import useSystemReducedMotion from './useSystemReducedMotion.js';
import './motion.css';

const loadAnimationFeatures = () =>
  import('./animationFeatures.js').then((module) => module.default);

export function MotionProvider({ children }) {
  const systemReduced = useSystemReducedMotion();
  const enabled = !systemReduced;
  const value = useMemo(() => ({ enabled }), [enabled]);

  useEffect(() => {
    document.body.dataset.motion = enabled ? 'on' : 'off';
    return () => {
      delete document.body.dataset.motion;
    };
  }, [enabled]);

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
