import { useEffect, useRef, useState } from 'react';
import { FiArrowUpRight, FiChevronDown, FiMenu, FiX } from 'react-icons/fi';
import RookLauncher from '../../features/rook/RookLauncher.jsx';
import useChapterNavigation from './useChapterNavigation.js';
import { CHAPTERS, chapterNum } from '../../data/chapters.js';
import './navigation.css';

function chapterLabel(label) {
  return label === 'Achievements' ? 'Milestones' : label;
}

export default function SiteNavigation({ onAsk, askOpen, resumeUrl = '/resume-modern.pdf' }) {
  const { active, sheetOpen, setSheetOpen, opener, sheetRef } = useChapterNavigation();
  const [compact, setCompact] = useState(() => window.scrollY > 180);
  const navigation = useRef(null);
  const current = CHAPTERS[active];
  const currentLabel = chapterLabel(current[1]);
  const links = CHAPTERS.filter(([id]) => !['entry', 'resume'].includes(id));

  useEffect(() => {
    let frame;
    const sync = () => {
      frame = undefined;
      setCompact(window.scrollY > 180);
    };
    const queue = () => {
      if (frame === undefined) frame = requestAnimationFrame(sync);
    };
    queue();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue, { passive: true });
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
    };
  }, []);

  useEffect(() => {
    setSheetOpen(false);
    // Preserve a keyboard user's place if the same chapter control changes form.
    if (document.activeElement?.matches('[data-picker]')) {
      const selector = compact
        ? '.study-centered-pill [data-picker]'
        : '.study-open-header [data-picker]';
      const next = navigation.current?.querySelector(selector);
      if (next?.checkVisibility()) next.focus({ preventScroll: true });
    }
  }, [compact, setSheetOpen]);

  const picker = (opening = false) => (
    <button
      type="button"
      className={`study-current-picker${opening ? ' study-sections-picker' : ''}`}
      data-picker
      aria-label={
        opening
          ? `${sheetOpen ? 'Close' : 'Open'} navigation`
          : `Chapters, current: ${chapterNum(active)} ${currentLabel}`
      }
      aria-expanded={sheetOpen}
      aria-controls="study-chapter-menu"
      onClick={(event) => {
        event.stopPropagation();
        opener.current = event.currentTarget;
        setSheetOpen((open) => !open);
      }}
    >
      {opening ? (
        sheetOpen ? (
          <FiX aria-hidden="true" />
        ) : (
          <FiMenu aria-hidden="true" />
        )
      ) : (
        <>
          <span className="study-current-number">{chapterNum(active)}</span>
          <span className="study-current-label">{currentLabel}</span>
          <FiChevronDown className="study-picker-chevron" aria-hidden="true" />
        </>
      )}
    </button>
  );
  const resume = () => (
    <a className="study-resume" href={resumeUrl} download>
      Resume <FiArrowUpRight aria-hidden="true" />
    </a>
  );
  const renderLink = ([id, label], index, numbered = false) => (
    <a
      key={id}
      href={`#${id}`}
      data-sec={id}
      aria-current={current[0] === id ? 'location' : undefined}
    >
      {numbered && <span className="study-menu-number">{chapterNum(index)}</span>}
      <span>{chapterLabel(label)}</span>
    </a>
  );

  return (
    <div ref={navigation} className={`study-nav study-navigation${compact ? ' is-compact' : ''}`}>
      <header className="study-open-header" aria-label="Site" inert={compact || undefined}>
        <div className="study-nav-inner">
          <a className="study-brand" href="#entry" aria-label="NYX, back to entry">
            NYX<span> / </span>
            <small>Raj Kumar S</small>
          </a>
          <nav className="study-desktop-links" aria-label="Chapters">
            {links.map((chapter, index) => renderLink(chapter, index))}
          </nav>
          <div className="study-opening-picker">{picker(true)}</div>
          <div className="study-nav-actions">
            {resume()}
            <RookLauncher open={askOpen} onAsk={onAsk} />
          </div>
        </div>
      </header>
      <div
        className="study-centered-pill"
        role="navigation"
        aria-label="Current chapter and quick actions"
        inert={!compact || undefined}
      >
        {picker()}
        {resume()}
        <RookLauncher open={askOpen} onAsk={onAsk} />
      </div>
      {sheetOpen && (
        <nav
          className="study-mobile-links study-chapter-menu"
          id="study-chapter-menu"
          aria-label="Choose a chapter"
          ref={sheetRef}
        >
          <ol>
            {CHAPTERS.map((chapter, index) => (
              <li key={chapter[0]}>{renderLink(chapter, index, true)}</li>
            ))}
          </ol>
        </nav>
      )}
    </div>
  );
}
