import { useCallback, useEffect, useState } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';
import { useSiteMotion } from './useSiteMotion.js';

const pointerQuery = '(hover: hover) and (pointer: fine)';
const spring = { stiffness: 140, damping: 26, mass: 0.7 };

export default function usePointerParallax() {
  const { enabled } = useSiteMotion();
  const [finePointer, setFinePointer] = useState(false);
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const x = useSpring(targetX, spring);
  const y = useSpring(targetY, spring);
  const active = enabled && finePointer;
  const reset = useCallback(() => {
    targetX.set(0);
    targetY.set(0);
  }, [targetX, targetY]);

  useEffect(() => {
    const query = window.matchMedia(pointerQuery);
    const update = () => setFinePointer(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    reset();
    if (!active) {
      x.jump(0);
      y.jump(0);
    }
    const onVisibility = () => {
      if (document.hidden) reset();
    };
    window.addEventListener('blur', reset);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('blur', reset);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [active, reset, x, y]);

  const move = useCallback(
    (event) => {
      if (!active || event.pointerType === 'touch') return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const horizontal = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const vertical = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
      targetX.set(Math.max(-1, Math.min(1, horizontal)) * 8);
      targetY.set(Math.max(-1, Math.min(1, vertical)) * 4);
    },
    [active, targetX, targetY],
  );

  return { x, y, move, reset };
}
