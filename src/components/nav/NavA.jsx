import { useEffect, useRef, useState, useCallback } from 'react';
import '../../styles/navA.css';
import { CHAPTERS, chapterNum } from '../../data/chapters';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const Cur = ({ i }) => (
  <span className="cur"><small>{chapterNum(i)}</small><span>{CHAPTERS[i][1]}</span></span>
);

// navA: solid top bar that collapses into an opaque floating pill (current chapter + Resume + Ask).
const NavA = ({ resumeUrl, onAsk, askOpen }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [wide, setWide] = useState(() => window.innerWidth > 1180);
  const [active, setActive] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const opener = useRef(null);
  const sheetRef = useRef(null);
  const collapsedRef = useRef(false);

  const spy = useCallback(() => {
    setWide(window.innerWidth > 1180);
    const c = window.scrollY > 140;
    if (c !== collapsedRef.current) { collapsedRef.current = c; setCollapsed(c); setSheetOpen(false); }
    const y = 56 + 80;
    let a = 0;
    CHAPTERS.forEach(([id], i) => {
      const s = document.getElementById(id);
      if (s && s.getBoundingClientRect().top <= y) a = i;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) a = CHAPTERS.length - 1;
    setActive(a);
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(spy);
    window.addEventListener('scroll', spy, { passive: true });
    window.addEventListener('resize', spy);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', spy); window.removeEventListener('resize', spy); };
  }, [spy]);

  useEffect(() => {
    if (!sheetOpen) return;
    const a = sheetRef.current?.querySelector('[aria-current]') || sheetRef.current?.querySelector('a');
    a?.focus({ preventScroll: true });
    const key = (e) => { if (e.key === 'Escape') { e.preventDefault(); setSheetOpen(false); opener.current?.focus(); } };
    const click = (e) => { if (!sheetRef.current?.contains(e.target) && !e.target.closest('[data-picker]')) setSheetOpen(false); };
    document.addEventListener('keydown', key);
    document.addEventListener('click', click);
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('click', click); };
  }, [sheetOpen]);

  // Delegated jump for any in-page chapter link (nav, sheet, hero buttons).
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest('a[data-sec], a[href^="#"]');
      if (!a) return;
      const id = a.dataset.sec || a.getAttribute('href').slice(1);
      const i = CHAPTERS.findIndex(([c]) => c === id);
      if (i < 0) return;
      e.preventDefault();
      setSheetOpen(false);
      const s = document.getElementById(id);
      s?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#${id}`);
      (document.getElementById(`h-${id}`) || s)?.focus({ preventScroll: true });
      setActive(i);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const picker = (label) => (
    <button
      className="pk" type="button" data-picker aria-expanded={sheetOpen} aria-controls="chs"
      aria-label={`${label}, current: ${chapterNum(active)} ${CHAPTERS[active][1]}`}
      onClick={(e) => { opener.current = e.currentTarget; setSheetOpen((o) => !o); }}
    >
      <Cur i={active} /><span className="chev" aria-hidden="true">▾</span>
    </button>
  );
  const ask = (
    <button className="nask" type="button" data-ask aria-haspopup="dialog" aria-controls="rook-popover"
      aria-expanded={!!askOpen} aria-label="Ask Rook" onClick={(e) => onAsk(e.currentTarget)}>Ask</button>
  );

  return (
    <div className={`na${collapsed ? ' collapsed' : ''}`} data-wide={wide}>
      <header className="na-bar" aria-label="Site" aria-hidden={collapsed || undefined}>
        <a className="brand" href="#entry" data-sec="entry">Raj Kumar S</a>
        <nav aria-label="Chapters">
          <ol>
            {CHAPTERS.map(([id, n], i) => id === 'resume' ? null : (
              <li key={id}><a href={`#${id}`} data-sec={id} aria-current={i === active ? 'location' : undefined}><small>{chapterNum(i)}</small><span>{n}</span></a></li>
            ))}
          </ol>
        </nav>
        {picker('Chapters')}
        <a className="btn-res" href={resumeUrl} download>Resume</a>
        {ask}
      </header>
      <div className="na-pill" role="navigation" aria-label="Chapters (compact)" aria-hidden={!collapsed || undefined}>
        {picker('Chapters')}
        <a className="btn-res" href={resumeUrl} download>Resume</a>
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
