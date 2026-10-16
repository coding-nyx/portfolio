import { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { useSiteMotion } from '../../context/MotionContext';
import RookLauncher from '../common/RookLauncher';
import SpringAction from '../common/SpringAction';
import '../../styles/navA.css';
import { CHAPTERS, chapterNum } from '../../data/chapters';

const reduced = () => document.body.dataset.motion === 'off' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Cur({ i }) {
  const { enabled } = useSiteMotion();
  return <span className="cur-slot"><AnimatePresence initial={false} mode="wait">
    <Motion.span className="cur" key={i} initial={enabled ? { opacity: 0, y: 5 } : false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: enabled ? -5 : 0 }} transition={{ duration: enabled ? .12 : 0 }}>
      <small>{chapterNum(i)}</small><span>{CHAPTERS[i][1]}</span>
    </Motion.span>
  </AnimatePresence></span>;
}

// navA: solid top bar that collapses into an opaque floating pill (current chapter + Resume + Ask).
const NavA = ({ resumeUrl, onAsk, askOpen }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [wide, setWide] = useState(() => window.innerWidth > 1360);
  const [active, setActive] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const opener = useRef(null);
  const sheetRef = useRef(null);
  const collapsedRef = useRef(false);
  const selectedRef = useRef(null), selectionTimer = useRef(null);

  const spy = useCallback(() => {
    setWide(window.innerWidth > 1360);
    const c = window.scrollY > 140;
    if (c !== collapsedRef.current) { collapsedRef.current = c; setCollapsed(c); setSheetOpen(false); }
    const y = 56 + 80;
    let a = 0;
    CHAPTERS.forEach(([id], i) => {
      const s = document.getElementById(id);
      if (s && s.getBoundingClientRect().top <= y) a = i;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) a = CHAPTERS.length - 1;
    setActive(selectedRef.current ?? a);
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(spy);
    window.addEventListener('scroll', spy, { passive: true });
    window.addEventListener('resize', spy);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', spy); window.removeEventListener('resize', spy); };
  }, [spy]);

  useEffect(() => {
    let disposed = false, frame;
    const syncHash = () => {
      const id = window.location.hash.slice(1);
      if (!CHAPTERS.some(([chapter]) => chapter === id)) return;
      const section = document.getElementById(id);
      section?.scrollIntoView({behavior:'instant', block:'start'});
      document.getElementById('h-' + id)?.focus({preventScroll:true});
      spy();
    };
    document.fonts.ready.then(() => {
      if (!disposed) frame = requestAnimationFrame(syncHash);
    });
    window.addEventListener('hashchange', syncHash);
    return () => { disposed = true; cancelAnimationFrame(frame); window.removeEventListener('hashchange', syncHash); };
  }, [spy]);

  useEffect(() => {
    if (!sheetOpen) return;
    const a = sheetRef.current?.querySelector('[aria-current]') || sheetRef.current?.querySelector('a');
    a?.focus({ preventScroll: true });
    const key = (e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setSheetOpen(false); opener.current?.focus(); } };
    const click = (e) => { if (!sheetRef.current?.contains(e.target) && !e.target.closest('[data-picker]')) setSheetOpen(false); };
    document.addEventListener('keydown', key, true);
    document.addEventListener('click', click);
    return () => { document.removeEventListener('keydown', key, true); document.removeEventListener('click', click); };
  }, [sheetOpen]);

  // Delegated jump for any in-page chapter link (nav, sheet, hero buttons).
  useEffect(() => {
    const release = () => { selectedRef.current = null; clearTimeout(selectionTimer.current); spy(); };
    const onClick = (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest('a[data-sec], a[href^="#"]');
      if (!a || a.target === '_blank') return;
      const id = a.dataset.sec || a.getAttribute('href').slice(1);
      const i = CHAPTERS.findIndex(([c]) => c === id);
      if (i < 0) return;
      e.preventDefault();
      setSheetOpen(false);
      selectedRef.current = i;
      clearTimeout(selectionTimer.current);
      const s = document.getElementById(id);
      window.dispatchEvent(new CustomEvent('portfolio:chapter-select', { detail: { id } }));
      s?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#${id}`);
      (document.getElementById(`h-${id}`) || s)?.focus({ preventScroll: true });
      setActive(i);
      selectionTimer.current = setTimeout(release, reduced() ? 0 : 1600);
    };
    document.addEventListener('click', onClick);
    window.addEventListener('scrollend', release);
    window.addEventListener('wheel', release, { passive: true });
    window.addEventListener('touchstart', release, { passive: true });
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('scrollend', release);
      window.removeEventListener('wheel', release);
      window.removeEventListener('touchstart', release);
      clearTimeout(selectionTimer.current);
    };
  }, [spy]);

  const picker = (label) => (
    <button
      className="pk" type="button" data-picker aria-expanded={sheetOpen} aria-controls="chs"
      aria-label={`${label}, current: ${chapterNum(active)} ${CHAPTERS[active][1]}`}
      onClick={(e) => { opener.current = e.currentTarget; setSheetOpen((o) => !o); }}
    >
      <Cur i={active} /><span className="chev" aria-hidden="true">▾</span>
    </button>
  );
  const ask = <RookLauncher open={askOpen} onAsk={onAsk} />;

  return (
    <div className={`na${collapsed ? ' collapsed' : ''}`} data-wide={wide}>
      <header className="na-bar" aria-label="Site" aria-hidden={collapsed || undefined}>
        <nav aria-label="Chapters">
          <ol>
            {CHAPTERS.map(([id, n], i) => id === 'resume' ? null : (
              <li key={id}><a href={`#${id}`} data-sec={id} aria-current={i === active ? 'location' : undefined}><small>{chapterNum(i)}</small><span>{n}</span></a></li>
            ))}
          </ol>
        </nav>
        {picker('Chapters')}
        <SpringAction as="a" className="btn-res" href={resumeUrl} download>Resume</SpringAction>
        {ask}
      </header>
      <div className="na-pill" role="navigation" aria-label="Chapters (compact)" aria-hidden={!collapsed || undefined}>
        {picker('Chapters')}
        <SpringAction as="a" className="btn-res" href={resumeUrl} download>Resume</SpringAction>
        {ask}
      </div>
      {sheetOpen && (
        <div className="sheet" id="chs" role="region" aria-label="Chapters" ref={sheetRef}>
          <ol>
            {CHAPTERS.map(([id, n], i) => (
              <li key={id}><a href={`#${id}`} data-sec={id} aria-current={i === active ? 'location' : undefined}><small>{chapterNum(i)}</small><span>{n}</span></a></li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};
export default NavA;
