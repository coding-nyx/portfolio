import { useEffect, useRef } from 'react';
import { CHAPTERS } from '../data/chapters.js';
import { trackFootfallEvent } from '../services/footfallAnalytics.js';
import { createEngagementMeter } from './engagementModel.js';

export default function usePortfolioEngagement(rookOpen) {
  const overlay = useRef(false),
    sample = useRef(null);
  useEffect(() => {
    overlay.current = rookOpen;
    sample.current?.();
  }, [rookOpen]);
  useEffect(() => {
    const meter = createEngagementMeter({ track: trackFootfallEvent });
    const chapters = CHAPTERS.map(([id]) => document.getElementById(id)).filter(Boolean);
    const check = () => {
      if (document.visibilityState === 'hidden' || !document.hasFocus()) {
        meter.pause();
        return;
      }
      if (overlay.current) {
        meter.activate('rook');
        return;
      }
      if (document.querySelector('dialog[open]')) {
        meter.activate('projects');
        return;
      }
      let best = null,
        area = 0;
      for (const chapter of chapters) {
        const rect = chapter.getBoundingClientRect();
        const visible = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
        if (visible > area) {
          area = visible;
          best = chapter.id;
        }
      }
      meter.activate(best);
    };
    sample.current = check;
    const active = () => {
      meter.activity();
      check();
    };
    const reset = () => {
      meter.reset();
      check();
    };
    const timer = setInterval(check, 1000);
    for (const name of ['pointerdown', 'keydown', 'scroll', 'touchstart', 'focus'])
      window.addEventListener(name, active, { passive: true });
    window.addEventListener('blur', check);
    window.addEventListener('pagehide', meter.pause);
    window.addEventListener('footfall-preference-change', reset);
    document.addEventListener('visibilitychange', check);
    check();
    return () => {
      clearInterval(timer);
      meter.pause();
      sample.current = null;
      for (const name of ['pointerdown', 'keydown', 'scroll', 'touchstart', 'focus'])
        window.removeEventListener(name, active);
      window.removeEventListener('blur', check);
      window.removeEventListener('pagehide', meter.pause);
      window.removeEventListener('footfall-preference-change', reset);
      document.removeEventListener('visibilitychange', check);
    };
  }, []);
}
