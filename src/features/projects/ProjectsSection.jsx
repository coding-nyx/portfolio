import { useEffect, useRef, useState } from 'react';
import {
  FiArrowDown,
  FiArrowLeft,
  FiArrowRight,
  FiArrowUp,
  FiArrowUpRight,
  FiChevronDown,
} from 'react-icons/fi';
import { projects } from '../../data/portfolio.js';
import ProjectCarousel from './ProjectCarousel.jsx';
import ProjectGrid from './ProjectGrid.jsx';
import FeaturedProjectPicker from './FeaturedProjectPicker.jsx';
import SpringAction from '../../shared/ui/SpringAction.jsx';
import MotionDetails from '../../shared/ui/MotionDetails.jsx';
import { setDisclosureOpen } from '../../shared/motion/useDisclosureMotion.js';
import ProjectDetailsDialog, { ProjectSourceLinks } from './ProjectDetailsDialog.jsx';
import { useSiteMotion } from '../../shared/motion/useSiteMotion.js';
import { trackFootfallEvent } from '../../services/footfallAnalytics.js';
import './projects.css';
import './showcase.css';

function FeaturedProject({ project, index, onOpen }) {
  return (
    <article className="showcase-card" aria-labelledby="showcase-project-title">
      {project.imageUrl ? (
        <a
          className="showcase-preview"
          href={project.imageUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open full screenshot of ${project.name}`}
        >
          <img
            src={project.imageUrl}
            alt={project.imageAlt || `${project.name} screenshot`}
            width="720"
            height="450"
            loading="lazy"
          />
          {project.imageCaption && <span>{project.imageCaption}</span>}
        </a>
      ) : (
        <div className="showcase-overview">
          <span className="port-eyebrow">{project.scope}</span>
          <h4>{project.architecture?.title || project.name}</h4>
          <p>{project.architecture?.note || project.description}</p>
          {project.architecture && (
            <ol>
              {project.architecture.steps.map((step) => (
                <li key={step.name}>{step.name}</li>
              ))}
            </ol>
          )}
          <span className="port-meta">{project.tags.join(' / ')}</span>
        </div>
      )}
      <div className="showcase-copy">
        <div className="showcase-eyebrow">
          <span>{String(index + 1).padStart(2, '0')} / SELECTED PROJECT</span>
          <span>{project.status}</span>
        </div>
        <h3 id="showcase-project-title">{project.name}</h3>
        <p>{project.cardSummary || project.description}</p>
        <div className="showcase-actions">
          <button
            type="button"
            className="showcase-details"
            onClick={(event) => onOpen(index, event)}
          >
            View details <FiArrowUpRight aria-hidden="true" />
          </button>
          <ProjectSourceLinks project={project} />
        </div>
      </div>
    </article>
  );
}

export default function ProjectsSection() {
  const stage = useRef(null);
  const dialog = useRef(null);
  const openRef = useRef(null);
  const selectors = useRef([]);
  const { enabled: motionEnabled } = useSiteMotion();
  const [failed, setFailed] = useState(false);
  const [view, setView] = useState('carousel');
  const [current, setCurrent] = useState(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);
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

  const open = (index, event, entryPoint = 'grid') => {
    if (dialog.current?.open) return;
    trackFootfallEvent('project_open', { project_id: projects[index].id, entry_point: entryPoint });
    openRef.current = event.currentTarget;
    setDetail(index);
    dialog.current?.showModal();
  };
  const changeView = (next) => {
    setCurrent(null);
    setView(next);
  };
  const chooseWithKeyboard = (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    let next;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight')
      next = (featuredIndex + 1) % projects.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft')
      next = (featuredIndex - 1 + projects.length) % projects.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = projects.length - 1;
    else return;
    event.preventDefault();
    setFeaturedIndex(next);
    selectors.current[next]?.focus({ preventScroll: true });
  };
  const nearby = current == null ? null : projects[current];
  const selected = detail == null ? null : projects[detail];
  const activeView = islandView ? 'island' : view === 'island' ? 'carousel' : view;
  const activeViewLabel = {
    carousel: 'Carousel',
    featured: 'Featured',
    grid: 'Grid',
    island: 'Island',
  }[activeView];

  return (
    <div className="port-section projects-g3 after-hours-projects">
      <div className="island-top showcase-heading">
        <div>
          <p className="port-eyebrow">SELECTED WORK / PERSONAL PROJECTS</p>
          <h2 id="h-projects" tabIndex={-1}>
            Projects
          </h2>
        </div>
        <div
          className="project-view-switch showcase-desktop-view"
          role="group"
          aria-label="Project view"
        >
          {[
            ['carousel', 'Carousel'],
            ['featured', 'Featured'],
            ['grid', 'Grid'],
            ['island', 'Island'],
          ].map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              aria-pressed={activeView === mode}
              aria-controls="project-display"
              disabled={mode === 'island' && (!motionEnabled || failed)}
              title={
                mode === 'island' && !motionEnabled
                  ? 'Island respects your reduced-motion preference'
                  : undefined
              }
              onClick={() => changeView(mode)}
            >
              {label}
            </button>
          ))}
        </div>
        <MotionDetails className="showcase-mobile-view">
          <summary aria-label={`Project view: ${activeViewLabel}`}>
            <span>
              <span className="showcase-view-prefix">View: </span>
              {activeViewLabel}
            </span>
            <FiChevronDown aria-hidden="true" />
          </summary>
          <div className="showcase-view-options" role="group" aria-label="Browse projects as">
            {[
              ['carousel', 'Carousel'],
              ['featured', 'Featured'],
              ['grid', 'Grid'],
              ['island', 'Island'],
            ].map(([mode, label]) => (
              <button
                type="button"
                key={mode}
                aria-pressed={activeView === mode}
                disabled={mode === 'island' && (!motionEnabled || failed)}
                onClick={(event) => {
                  const disclosure = event.currentTarget.closest('details');
                  changeView(mode);
                  setDisclosureOpen(disclosure, false);
                  disclosure.querySelector('summary')?.focus({ preventScroll: true });
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {!motionEnabled && <p>Island is unavailable while reduced motion is enabled.</p>}
        </MotionDetails>
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
            aria-label="Project island. Click or tap a sign or the ground to walk. Arrow keys or WASD move; Enter opens the nearby project. Choose Carousel, Featured or Grid to browse project cards."
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
        ) : activeView === 'featured' ? (
          <div className="project-showcase">
            <FeaturedProjectPicker
              selectedIndex={featuredIndex}
              onSelect={setFeaturedIndex}
              onTriggerHidden={() =>
                selectors.current[featuredIndex]?.focus({ preventScroll: true })
              }
            />
            <div
              className="showcase-content"
              id="featured-project"
              aria-live="polite"
              aria-atomic="true"
            >
              <FeaturedProject
                project={projects[featuredIndex]}
                index={featuredIndex}
                onOpen={open}
              />
            </div>
            <nav
              className="showcase-directory"
              aria-label="Choose a featured project"
              onKeyDown={chooseWithKeyboard}
            >
              <p className="showcase-directory-label">EXPLORE THE COLLECTION</p>
              <ol>
                {projects.map((project, index) => (
                  <li key={project.id}>
                    <button
                      ref={(element) => {
                        selectors.current[index] = element;
                      }}
                      type="button"
                      aria-label={`Show ${project.name}`}
                      aria-pressed={index === featuredIndex}
                      aria-controls="featured-project"
                      onClick={() => setFeaturedIndex(index)}
                    >
                      <span className="showcase-number">{String(index + 1).padStart(2, '0')}</span>
                      <span className="showcase-directory-copy">
                        <b>{project.name}</b>
                        <small>{project.tags.slice(0, 3).join(' / ')}</small>
                      </span>
                      <FiArrowUpRight className="showcase-directory-arrow" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ol>
              <p className="showcase-directory-note">
                Personal projects, public source and ongoing experiments.
              </p>
            </nav>
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
