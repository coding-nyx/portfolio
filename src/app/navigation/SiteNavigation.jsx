import useChapterNavigation from './useChapterNavigation.js';
import { AnimatePresence, m as Motion } from 'framer-motion';
import { useSiteMotion } from '../../shared/motion/useSiteMotion.js';
import RookLauncher from '../../features/rook/RookLauncher.jsx';
import SpringAction from '../../shared/ui/SpringAction.jsx';
import './navigation.css';
import { CHAPTERS, chapterNum } from '../../data/chapters.js';

function Cur({ i }) {
  const { enabled } = useSiteMotion();
  return (
    <span className="cur-slot">
      <AnimatePresence initial={false} mode="wait">
        <Motion.span
          className="cur"
          key={i}
          initial={enabled ? { opacity: 0, y: 5 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: enabled ? -5 : 0 }}
          transition={{ duration: enabled ? 0.12 : 0 }}
        >
          <small>{chapterNum(i)}</small>
          <span>{CHAPTERS[i][1]}</span>
        </Motion.span>
      </AnimatePresence>
    </span>
  );
}

// navA: solid top bar that collapses into an opaque floating pill (current chapter + Resume + Ask).
const SiteNavigation = ({ resumeUrl, onAsk, askOpen }) => {
  const { collapsed, wide, active, sheetOpen, setSheetOpen, opener, sheetRef } =
    useChapterNavigation();

  const picker = (label) => (
    <button
      className="pk"
      type="button"
      data-picker
      aria-expanded={sheetOpen}
      aria-controls="chs"
      aria-label={`${label}, current: ${chapterNum(active)} ${CHAPTERS[active][1]}`}
      onClick={(e) => {
        opener.current = e.currentTarget;
        setSheetOpen((o) => !o);
      }}
    >
      <Cur i={active} />
      <span className="chev" aria-hidden="true">
        ▾
      </span>
    </button>
  );
  const ask = <RookLauncher open={askOpen} onAsk={onAsk} />;

  return (
    <div className={`na${collapsed ? ' collapsed' : ''}`} data-wide={wide}>
      <header className="na-bar" aria-label="Site" aria-hidden={collapsed || undefined}>
        <nav aria-label="Chapters">
          <ol>
            {CHAPTERS.map(([id, n], i) =>
              id === 'resume' ? null : (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    data-sec={id}
                    aria-current={i === active ? 'location' : undefined}
                  >
                    <small>{chapterNum(i)}</small>
                    <span>{n}</span>
                  </a>
                </li>
              ),
            )}
          </ol>
        </nav>
        {picker('Chapters')}
        <SpringAction as="a" className="btn-res" href={resumeUrl} download>
          Resume
        </SpringAction>
        {ask}
      </header>
      <div
        className="na-pill"
        role="navigation"
        aria-label="Chapters (compact)"
        aria-hidden={!collapsed || undefined}
      >
        {picker('Chapters')}
        <SpringAction as="a" className="btn-res" href={resumeUrl} download>
          Resume
        </SpringAction>
        {ask}
      </div>
      {sheetOpen && (
        <div className="sheet" id="chs" role="region" aria-label="Chapters" ref={sheetRef}>
          <ol>
            {CHAPTERS.map(([id, n], i) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  data-sec={id}
                  aria-current={i === active ? 'location' : undefined}
                >
                  <small>{chapterNum(i)}</small>
                  <span>{n}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};
export default SiteNavigation;
