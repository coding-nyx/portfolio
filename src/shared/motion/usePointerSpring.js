import { useCallback, useEffect } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

export default function usePointerSpring(enabled, distance = 4) {
  const targetX = useMotionValue(0),
    targetY = useMotionValue(0);
  const x = useSpring(targetX, { stiffness: 250, damping: 22, mass: 0.6 });
  const y = useSpring(targetY, { stiffness: 250, damping: 22, mass: 0.6 });
  const reset = useCallback(() => {
    targetX.set(0);
    targetY.set(0);
  }, [targetX, targetY]);
  useEffect(() => {
    reset();
    if (!enabled) {
      x.jump(0);
      y.jump(0);
    }
  }, [enabled, distance, reset, x, y]);
  const move = useCallback(
    (event) => {
      if (!enabled || event.pointerType === 'touch') return;
      const box = event.currentTarget.getBoundingClientRect();
      if (!box.width || !box.height) return;
      targetX.set(
        Math.max(-1, Math.min(1, ((event.clientX - box.left) / box.width) * 2 - 1)) * distance,
      );
      targetY.set(
        Math.max(-1, Math.min(1, ((event.clientY - box.top) / box.height) * 2 - 1)) * distance,
      );
    },
    [enabled, distance, targetX, targetY],
  );
  return { x, y, reset, move };
}
