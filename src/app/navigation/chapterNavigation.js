import { CHAPTERS } from '../../data/chapters.js';

export const CHAPTER_SELECT_EVENT = 'portfolio:chapter-select';

export function motionIsReduced() {
  return (
    document.body.dataset.motion === 'off' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function navigateToChapter(id) {
  if (!CHAPTERS.some(([chapter]) => chapter === id)) return false;
  const section = document.getElementById(id);
  if (!section) return false;
  window.dispatchEvent(new CustomEvent(CHAPTER_SELECT_EVENT, { detail: { id } }));
  section.scrollIntoView({ behavior: motionIsReduced() ? 'auto' : 'smooth', block: 'start' });
  window.history.replaceState(null, '', `#${id}`);
  (document.getElementById(`h-${id}`) || section).focus({ preventScroll: true });
  return true;
}
