import { useRef, useState } from 'react';
import { AnimatePresence, m as Motion, useIsPresent } from 'framer-motion';
import { TbArrowLeft, TbArrowRight, TbArrowUpRight, TbCpu, TbRobot } from 'react-icons/tb';
import { projects } from '../../data/portfolio.js';
import { ProjectSourceLinks } from './ProjectDetailsDialog.jsx';
import './carousel.css';

const slideMotion = {
  enter: (direction) => ({ x: `${direction * 100}%` }),
  center: { x: '0%' },
  exit: (direction) => ({ x: `${direction * -100}%` }),
};

function ProjectVisual({ project }) {
  if (project.imageUrl)
    return (
      <div className="pc-image">
        <img
          src={project.imageUrl}
          alt={project.imageAlt || `${project.name} screenshot`}
          width="640"
          height="400"
          loading="lazy"
        />
        {project.imageCaption && <span>{project.imageCaption}</span>}
      </div>
    );
  const linux = project.tags.includes('Linux Kernel');
  const nodes = linux
    ? ['RK3588 board', 'Device tree + kernel', 'FIT boot image']
    : ['React Native interface', 'Orchestrator', 'Specialist agents + memory'];
  return (
    <div
      className={`pc-blueprint ${linux ? 'pc-blueprint-linux' : ''}`}
      aria-label={`${project.name} architecture sketch`}
    >
      {linux ? (
        <TbCpu size={38} strokeWidth={1.25} aria-hidden="true" />
      ) : (
        <TbRobot size={38} strokeWidth={1.25} aria-hidden="true" />
      )}
      <span className="pc-blueprint-label">{linux ? 'BUILD OVERVIEW' : 'ARCHITECTURE SKETCH'}</span>
      <ol>
        {nodes.map((node) => (
          <li key={node}>{node}</li>
        ))}
      </ol>
    </div>
  );
}

function ProjectSlide({ project, index, slideId, direction, enabled, onOpenDetails }) {
  const present = useIsPresent();
  return (
    <Motion.article
      id={present ? slideId : undefined}
      inert={!present}
      aria-hidden={!present}
      className="pc-surface"
      style={{ zIndex: present ? 2 : 1 }}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${projects.length}: ${project.name}`}
      custom={direction}
      variants={slideMotion}
      initial={enabled ? 'enter' : false}
      animate="center"
      exit={enabled ? 'exit' : 'center'}
      transition={{ duration: enabled ? 0.2 : 0, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <ProjectVisual project={project} />
      <div className="pc-copy">
        <span className="pc-status">{project.status}</span>
        <h3>{project.name}</h3>
        <p>{project.cardSummary || project.description}</p>
        <ul className="pc-tags" aria-label="Technologies">
          {project.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <div className="pc-actions">
          <Motion.button
            type="button"
            className="pc-details"
            whileTap={enabled ? { scale: 0.96 } : undefined}
            onClick={(event) => onOpenDetails(project, event)}
          >
            Details <TbArrowUpRight size={16} aria-hidden="true" />
          </Motion.button>
          <ProjectSourceLinks project={project} />
          {!project.repoUrl && !project.sourceLinks?.length && (
            <span className="pc-private">Private source</span>
          )}
        </div>
      </div>
    </Motion.article>
  );
}

export default function ProjectCarousel({ enabled, onOpenDetails }) {
  const [{ index, direction }, setSlide] = useState({ index: 0, direction: 1 });
  const selectors = useRef([]),
    gesture = useRef(null);
  const project = projects[index];
  const carouselId = 'project-view';
  const headingId = 'h-projects';
  const slideId = `${carouselId}-slide`;
  const shift = (delta) =>
    setSlide((current) => ({
      index: (current.index + delta + projects.length) % projects.length,
      direction: delta,
    }));
  const choose = (next) =>
    setSlide((current) => ({ index: next, direction: next >= current.index ? 1 : -1 }));

  const keyboard = (event) => {
    if (event.altKey || event.metaKey || event.ctrlKey) return;
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % projects.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + projects.length) % projects.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = projects.length - 1;
    else return;
    event.preventDefault();
    if (event.key === 'ArrowRight') shift(1);
    else if (event.key === 'ArrowLeft') shift(-1);
    else choose(next);
    if (event.target.closest('[data-project-select]'))
      selectors.current[next]?.focus({ preventScroll: true });
  };

  const startSwipe = (event) => {
    if (!event.isPrimary || event.button !== 0 || event.target.closest('a,button')) return;
    gesture.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const finishSwipe = (event) => {
    const start = gesture.current;
    gesture.current = null;
    if (!start) return;
    const dx = event.clientX - start.x,
      dy = event.clientY - start.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) shift(dx < 0 ? 1 : -1);
  };

  return (
    <section
      className="project-carousel pc-portfolio"
      id={carouselId}
      role="region"
      aria-roledescription="carousel"
      aria-labelledby={headingId}
      onKeyDown={keyboard}
    >
      <div className="pc-selectors" role="group" aria-label="Choose a project">
        {projects.map((item, position) => (
          <button
            ref={(element) => {
              selectors.current[position] = element;
            }}
            key={item.name}
            type="button"
            data-project-select
            aria-label={`Show ${item.name}`}
            aria-pressed={position === index}
            aria-controls={slideId}
            onClick={() => choose(position)}
          >
            <span aria-hidden="true">0{position + 1}</span>
            {item.name}
          </button>
        ))}
      </div>
      <div
        className="pc-viewport"
        onPointerDown={startSwipe}
        onPointerUp={finishSwipe}
        onPointerCancel={() => {
          gesture.current = null;
        }}
      >
        <Motion.div
          className="pc-paper pc-paper-back"
          aria-hidden="true"
          animate={{ rotate: -2.5, x: -8, y: -5 }}
          transition={{ duration: enabled ? 0.3 : 0 }}
        />
        <Motion.div
          className="pc-paper pc-paper-middle"
          aria-hidden="true"
          animate={{ rotate: 1.5, x: 7, y: -1 }}
          transition={{ duration: enabled ? 0.3 : 0 }}
        />
        <div className="pc-window">
          <AnimatePresence initial={false} custom={direction}>
            <ProjectSlide
              key={project.name}
              project={project}
              index={index}
              slideId={slideId}
              direction={direction}
              enabled={enabled}
              onOpenDetails={onOpenDetails}
            />
          </AnimatePresence>
        </div>
      </div>
      <div className="pc-controls">
        <button
          type="button"
          aria-label="Previous project"
          aria-controls={slideId}
          onClick={() => shift(-1)}
        >
          <TbArrowLeft size={19} aria-hidden="true" />
        </button>
        <p role="status" aria-live="polite" aria-atomic="true">
          <b>{String(index + 1).padStart(2, '0')}</b> / {String(projects.length).padStart(2, '0')}
          <span>{project.name}</span>
        </p>
        <button
          type="button"
          aria-label="Next project"
          aria-controls={slideId}
          onClick={() => shift(1)}
        >
          <TbArrowRight size={19} aria-hidden="true" />
        </button>
      </div>
      <p className="pc-hint">Swipe the card, use the arrows, or choose a project above.</p>
    </section>
  );
}
