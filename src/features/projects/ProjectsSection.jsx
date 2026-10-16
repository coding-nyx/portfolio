import { useEffect, useRef, useState } from 'react';
import { projects } from '../../data/portfolio.js';
import ProjectCarousel from './ProjectCarousel.jsx';
import ProjectGrid from './ProjectGrid.jsx';
import SpringAction from '../../shared/ui/SpringAction.jsx';
import ProjectDetailsDialog from './ProjectDetailsDialog.jsx';
import { useSiteMotion } from '../../shared/motion/useSiteMotion.js';
import './projects.css';

export default function ProjectsSection() {
  const stage = useRef(null),
    dialog = useRef(null),
    openRef = useRef(null),
    viewTop = useRef(null);
  const { enabled: motionEnabled } = useSiteMotion();
  const reduced = !motionEnabled;
  const [failed, setFailed] = useState(false);
  const [view, setView] = useState('adaptive');
  const [current, setCurrent] = useState(null);
  const [detail, setDetail] = useState(null);
  const islandView = !reduced && !failed && view === 'island';

  useEffect(() => {
    if (!islandView || !stage.current) return;
    let cancelled = false;
    let disposeScene;
    import('./island/createIsland.js')
      .then(({ createIsland }) => {
        if (cancelled || !stage.current) return;
        disposeScene = createIsland(stage.current, projects, {
          onSelect: setCurrent,
          onOpen: (index) => {
            openRef.current = stage.current;
            setDetail(index);
            dialog.current?.showModal();
          },
          onFailure: () => setFailed(true),
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      disposeScene?.();
    };
  }, [islandView]);

  const open = (index, event) => {
    openRef.current = event.currentTarget;
    setDetail(index);
    dialog.current.showModal();
  };
  const changeView = (next) => {
    setCurrent(null);
    setView(next);
    requestAnimationFrame(() =>
      viewTop.current?.scrollIntoView({ behavior: 'instant', block: 'start' }),
    );
  };
  const nearby = current == null ? null : projects[current];
  const selected = detail == null ? null : projects[detail];
  return (
    <div className="port-section projects-g3" data-design="Responsive project grid and carousel">
      <div className="island-top" ref={viewTop}>
        <h2 id="h-projects" tabIndex={-1}>
          Projects
        </h2>
        <div className="project-view-switch" role="group" aria-label="Project view">
          <button
            type="button"
            aria-pressed={!islandView}
            aria-controls="project-display"
            onClick={() => changeView('adaptive')}
          >
            <span className="projects-large-label">Grid</span>
            <span className="projects-small-label">Carousel</span>
          </button>
          <button
            type="button"
            aria-pressed={islandView}
            aria-controls="project-display"
            disabled={reduced || failed}
            onClick={() => changeView('island')}
          >
            Island
          </button>
        </div>
      </div>
      {failed && (
        <p className="island-fallback" role="status">
          3D is unavailable on this device. Showing the project cards.
        </p>
      )}
      <div id="project-display">
        {islandView ? (
          <div
            id="project-island"
            ref={stage}
            className="island-stage"
            tabIndex={0}
            role="group"
            aria-label="Project island. Click or tap a sign or the ground to walk. Arrow keys or WASD move; Enter opens the nearby project. Choose the grid or carousel to browse project cards."
          >
            <div className="island-loading">Loading project island…</div>
            <div className="island-pins" data-island-pins />
            <p className="island-hint">Tap a sign or the ground to walk · arrows / WASD</p>
            <div className="island-controls">
              {[
                ['l', '←', 'Left'],
                ['u', '↑', 'Up'],
                ['d', '↓', 'Down'],
                ['r', '→', 'Right'],
              ].map(([direction, icon, label]) => (
                <button
                  key={direction}
                  data-d={direction}
                  aria-label={`Walk ${label.toLowerCase()}`}
                >
                  {icon}
                </button>
              ))}
            </div>
            {nearby && (
              <div className="island-project-card" aria-live="polite">
                <span className="port-meta">{nearby.tags.slice(0, 2).join(' · ')}</span>
                <h3>{nearby.name}</h3>
                <span className="port-meta">{nearby.status}</span>
                <SpringAction className="port-button" onClick={(event) => open(current, event)}>
                  Open details →
                </SpringAction>
              </div>
            )}
          </div>
        ) : (
          <>
            <ProjectGrid
              projects={projects}
              onOpen={(project, event) => open(projects.indexOf(project), event)}
            />
            <div className="project-mobile-carousel">
              <ProjectCarousel
                enabled={motionEnabled}
                onOpenDetails={(project, event) => open(projects.indexOf(project), event)}
              />
            </div>
          </>
        )}
      </div>
      <ProjectDetailsDialog
        dialogRef={dialog}
        project={selected}
        onClose={() => {
          setDetail(null);
          const opener = openRef.current;
          if (opener?.isConnected && opener.checkVisibility())
            opener.focus({ preventScroll: true });
        }}
      />
      <SpringAction as="a" className="chapter-next" href="#skills">
        Next: <b>Skills ↓</b>
      </SpringAction>
    </div>
  );
}
