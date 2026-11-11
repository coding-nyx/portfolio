import { useEffect, useRef, useState } from 'react';
import { FiArrowDown, FiArrowLeft, FiArrowRight, FiArrowUp, FiArrowUpRight } from 'react-icons/fi';
import { projects } from '../../data/portfolio.js';
import ProjectCarousel from './ProjectCarousel.jsx';
import ProjectGrid from './ProjectGrid.jsx';
import SpringAction from '../../shared/ui/SpringAction.jsx';
import ProjectDetailsDialog from './ProjectDetailsDialog.jsx';
import { useSiteMotion } from '../../shared/motion/useSiteMotion.js';
import { trackFootfallEvent } from '../../services/footfallAnalytics.js';
import './projects.css';

export default function ProjectsSection() {
  const stage = useRef(null);
  const dialog = useRef(null);
  const openRef = useRef(null);
  const { enabled: motionEnabled } = useSiteMotion();
  const [failed, setFailed] = useState(false);
  const [view, setView] = useState('grid');
  const [previousView, setPreviousView] = useState('grid');
  const [current, setCurrent] = useState(null);
  const [detail, setDetail] = useState(null);
  const islandView = motionEnabled && !failed && view === 'island';

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
            if (dialog.current?.open) return;
            trackFootfallEvent('project_open', {
              project_id: projects[index].id,
              entry_point: 'island',
            });
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

  const open = (index, event, entryPoint) => {
    if (dialog.current?.open) return;
    trackFootfallEvent('project_open', { project_id: projects[index].id, entry_point: entryPoint });
    openRef.current = event.currentTarget;
    setDetail(index);
    dialog.current?.showModal();
  };
  const changeView = (next) => {
    if (next !== 'island') setPreviousView(next);
    setCurrent(null);
    setView(next);
  };
  const nearby = current == null ? null : projects[current];
  const selected = detail == null ? null : projects[detail];
  const activeView = islandView ? 'island' : view === 'island' ? previousView : view;

  return (
    <div className="port-section projects-g3 after-hours-projects">
      <div className="island-top projects-heading">
        <div>
          <p className="port-eyebrow">SELECTED WORK / PERSONAL PROJECTS</p>
          <h2 id="h-projects" tabIndex={-1}>
            Projects
          </h2>
        </div>
        <div className="project-view-controls">
          <div className="project-view-switch" role="group" aria-label="Project view">
            {[
              ['grid', 'Grid'],
              ['carousel', 'Carousel'],
            ].map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                aria-pressed={activeView === mode}
                aria-controls="project-display"
                onClick={() => changeView(mode)}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            className="project-island-action"
            type="button"
            aria-controls="project-display"
            disabled={!motionEnabled || failed}
            title={
              !motionEnabled
                ? 'Island respects your reduced-motion preference'
                : failed
                  ? '3D is unavailable on this device'
                  : undefined
            }
            onClick={() => changeView(islandView ? previousView : 'island')}
          >
            {islandView ? (
              <>
                <FiArrowLeft aria-hidden="true" /> Back to projects
              </>
            ) : (
              <>
                Explore the island <FiArrowUpRight aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </div>
      {failed && (
        <p className="island-fallback" role="status">
          3D is unavailable on this device. You can still browse every project here.
        </p>
      )}
      <div id="project-display" data-view={activeView}>
        {islandView ? (
          <div
            id="project-island"
            ref={stage}
            className="island-stage"
            tabIndex={0}
            role="group"
            aria-label="Project island. Click or tap a sign or the ground to walk. Arrow keys or WASD move; Enter opens the nearby project. Choose Grid, Carousel or Back to projects to return to project cards."
          >
            <div className="island-loading">Loading project island…</div>
            <div className="island-pins" data-island-pins />
            <p className="island-hint">Tap a sign or the ground to walk · arrows / WASD</p>
            <div className="island-controls">
              {[
                ['l', FiArrowLeft, 'left'],
                ['u', FiArrowUp, 'up'],
                ['d', FiArrowDown, 'down'],
                ['r', FiArrowRight, 'right'],
              ].map(([direction, Icon, label]) => (
                <button key={direction} data-d={direction} aria-label={`Walk ${label}`}>
                  <Icon aria-hidden="true" />
                </button>
              ))}
            </div>
            {nearby && (
              <div className="island-project-card" aria-live="polite">
                <span className="port-meta">{nearby.tags.slice(0, 2).join(' · ')}</span>
                <h3>{nearby.name}</h3>
                <span className="port-meta">{nearby.status}</span>
                <SpringAction
                  className="port-button"
                  onClick={(event) => open(current, event, 'island')}
                >
                  Open details <FiArrowUpRight aria-hidden="true" />
                </SpringAction>
              </div>
            )}
          </div>
        ) : activeView === 'carousel' ? (
          <ProjectCarousel
            enabled={motionEnabled}
            onOpenDetails={(project, event) => open(projects.indexOf(project), event, 'carousel')}
          />
        ) : (
          <ProjectGrid
            projects={projects}
            onOpen={(project, event) => open(projects.indexOf(project), event, 'grid')}
          />
        )}
      </div>
      <ProjectDetailsDialog
        dialogRef={dialog}
        project={selected}
        motionEnabled={motionEnabled}
        onClose={() => {
          setDetail(null);
          const opener = openRef.current;
          if (opener?.isConnected && opener.checkVisibility())
            opener.focus({ preventScroll: true });
        }}
      />
      <SpringAction as="a" className="chapter-next" href="#skills">
        Next: <b>Skills</b> <FiArrowDown aria-hidden="true" />
      </SpringAction>
    </div>
  );
}
