import { useEffect, useRef, useState, useCallback } from 'react';
import { CHAPTERS } from '../../data/chapters.js';
import { CHAPTER_SELECT_EVENT, motionIsReduced, navigateToChapter } from './chapterNavigation.js';

export default function useChapterNavigation() {
  const [collapsed, setCollapsed] = useState(false);
  const [wide, setWide] = useState(() => window.innerWidth > 1360);
  const [active, setActive] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const opener = useRef(null);
  const sheetRef = useRef(null);
  const collapsedRef = useRef(false);
  const selectedRef = useRef(null),
    selectionTimer = useRef(null);

  const spy = useCallback(() => {
    setWide(window.innerWidth > 1360);
    const c = window.scrollY > 140;
    if (c !== collapsedRef.current) {
      collapsedRef.current = c;
      setCollapsed(c);
      setSheetOpen(false);
    }
    const y = 56 + 80;
    let a = 0;
    CHAPTERS.forEach(([id], i) => {
      const s = document.getElementById(id);
      if (s && s.getBoundingClientRect().top <= y) a = i;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2)
      a = CHAPTERS.length - 1;
    setActive(selectedRef.current ?? a);
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(spy);
    window.addEventListener('scroll', spy, { passive: true });
    window.addEventListener('resize', spy);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', spy);
      window.removeEventListener('resize', spy);
    };
  }, [spy]);

  useEffect(() => {
    let disposed = false,
      frame;
    const syncHash = () => {
      const id = window.location.hash.slice(1);
      if (!CHAPTERS.some(([chapter]) => chapter === id)) return;
      const section = document.getElementById(id);
      section?.scrollIntoView({ behavior: 'instant', block: 'start' });
      document.getElementById('h-' + id)?.focus({ preventScroll: true });
      spy();
    };
    document.fonts.ready.then(() => {
      if (!disposed) frame = requestAnimationFrame(syncHash);
    });
    window.addEventListener('hashchange', syncHash);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', syncHash);
    };
  }, [spy]);

  useEffect(() => {
    if (!sheetOpen) return;
    const a =
      sheetRef.current?.querySelector('[aria-current]') || sheetRef.current?.querySelector('a');
    a?.focus({ preventScroll: true });
    const key = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setSheetOpen(false);
        opener.current?.focus();
      }
    };
    const click = (e) => {
      if (!sheetRef.current?.contains(e.target) && !e.target.closest('[data-picker]'))
        setSheetOpen(false);
    };
    document.addEventListener('keydown', key, true);
    document.addEventListener('click', click);
    return () => {
      document.removeEventListener('keydown', key, true);
      document.removeEventListener('click', click);
    };
  }, [sheetOpen]);

  // Delegated jump for any in-page chapter link (nav, sheet, hero buttons).
  useEffect(() => {
    const release = () => {
      selectedRef.current = null;
      clearTimeout(selectionTimer.current);
      spy();
    };
    const select = (event) => {
      const index = CHAPTERS.findIndex(([id]) => id === event.detail?.id);
      if (index < 0) return;
      setSheetOpen(false);
      selectedRef.current = index;
      clearTimeout(selectionTimer.current);
      setActive(index);
      selectionTimer.current = setTimeout(release, motionIsReduced() ? 0 : 1600);
    };
    const onClick = (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      const anchor = event.target.closest('a[data-sec], a[href^="#"]');
      if (!anchor || anchor.target === '_blank') return;
      const id = anchor.dataset.sec || anchor.getAttribute('href').slice(1);
      if (!CHAPTERS.some(([chapter]) => chapter === id)) return;
      event.preventDefault();
      navigateToChapter(id);
    };
    document.addEventListener('click', onClick);
    window.addEventListener(CHAPTER_SELECT_EVENT, select);
    window.addEventListener('scrollend', release);
    window.addEventListener('wheel', release, { passive: true });
    window.addEventListener('touchstart', release, { passive: true });
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener(CHAPTER_SELECT_EVENT, select);
      window.removeEventListener('scrollend', release);
      window.removeEventListener('wheel', release);
      window.removeEventListener('touchstart', release);
      clearTimeout(selectionTimer.current);
    };
  }, [spy]);

  return { collapsed, wide, active, sheetOpen, setSheetOpen, opener, sheetRef };
}
