import { useSyncExternalStore } from 'react';

const query =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
const subscribe = (notify) => {
  query?.addEventListener('change', notify);
  return () => query?.removeEventListener('change', notify);
};
const snapshot = () => query?.matches ?? true;
const serverSnapshot = () => true;

export default function useSystemReducedMotion() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
