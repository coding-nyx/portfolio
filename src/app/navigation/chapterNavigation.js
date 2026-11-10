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

// Read after responsive layout has settled; scroll anchoring and content changes
// can move chapters after the window's resize event has already fired.
export function activeChapterIndex({ document: page = document, window: viewport = window } = {}) {
  const navBottom = page.querySelector?.('.study-nav')?.getBoundingClientRect().bottom || 80;
  const activationLine = Math.max(136, navBottom + 36);
  let active = 0;
  CHAPTERS.forEach(([id], index) => {
    const section = page.getElementById(id);
    if (section && section.getBoundingClientRect().top <= activationLine) active = index;
  });
  if (viewport.innerHeight + viewport.scrollY >= page.documentElement.scrollHeight - 2) {
    active = CHAPTERS.length - 1;
  }
  return active;
}

export function observeChapterLayout(
  onChange,
  onResize,
  { document: page = document, window: viewport = window } = {},
) {
  let frame = null;
  let disposed = false;
  const schedule = () => {
    if (disposed || frame !== null) return;
    frame = viewport.requestAnimationFrame(() => {
      frame = null;
      onChange();
    });
  };
  const resize = () => {
    onResize();
    schedule();
  };
  const observer = viewport.ResizeObserver ? new viewport.ResizeObserver(schedule) : null;
  for (const [id] of CHAPTERS) {
    const section = page.getElementById(id);
    if (section) observer?.observe(section);
  }
  viewport.addEventListener('scroll', schedule, { passive: true });
  viewport.addEventListener('resize', resize);
  viewport.visualViewport?.addEventListener('resize', resize);
  schedule();

  return () => {
    disposed = true;
    if (frame !== null) viewport.cancelAnimationFrame(frame);
    observer?.disconnect();
    viewport.removeEventListener('scroll', schedule);
    viewport.removeEventListener('resize', resize);
    viewport.visualViewport?.removeEventListener('resize', resize);
  };
}
