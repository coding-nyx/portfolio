import { useContext } from 'react';
import { MotionContext } from './motionContext.js';

export function useSiteMotion() {
  const context = useContext(MotionContext);
  if (!context) throw new Error('useSiteMotion requires MotionProvider.');
  return context;
}
