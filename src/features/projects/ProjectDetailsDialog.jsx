import { useLayoutEffect, useRef } from 'react';
import SpringAction from '../../shared/ui/SpringAction.jsx';

export function ProjectSourceLinks({ project }) {
  const links =
    project.sourceLinks || (project.repoUrl ? [{ label: 'Source', url: project.repoUrl }] : []);
  return links.map((link) => (
    <a
      key={link.url}
      href={link.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`${link.label} for ${project.name}`}
    >
      {link.label} ↗
    </a>
  ));
}

function ProjectArchitecture({ architecture }) {
  return (
    <figure className="project-architecture" aria-label={architecture.title}>
      <figcaption>{architecture.title}</figcaption>
      <p className="architecture-note">{architecture.note}</p>
      <ol className="architecture-flow">
        {architecture.steps.map((step) => (
          <li key={step.name}>
            {step.name}
            {step.detail && <small>{step.detail}</small>}
          </li>
        ))}
        <li>
          <b>{architecture.branchesTitle}</b>
          <ul>
            {architecture.branches.map((branch) => (
              <li key={branch}>{branch}</li>
            ))}
          </ul>
        </li>
      </ol>
      <div className="architecture-foundations">
        {architecture.foundations.map((foundation) => (
          <div key={foundation.name}>
            <b>{foundation.name}</b>
            <p>{foundation.detail}</p>
          </div>
        ))}
      </div>
      {architecture.capabilities && (
        <p className="architecture-capabilities">
          <b>Additional capabilities:</b> {architecture.capabilities.join(' · ')}
        </p>
      )}
    </figure>
  );
}

export default function ProjectDetailsDialog({
  dialogRef,
  project,
  relatedProject,
  onOpenRelated,
  onClose,
  titleId = 'project-detail-title',
  motionEnabled,
}) {
  const heading = useRef(null);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (project && dialog?.open) {
      dialog.scrollTop = 0;
      heading.current?.focus({ preventScroll: true });
    }
  }, [dialogRef, project]);

  return (
    <dialog
      className="portfolio-dialog"
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
    >
      <div className="portfolio-dialog-toolbar">
        <span>Project details</span>
        <button
          className="port-close"
          aria-label="Close project details"
          onClick={() => dialogRef.current.close()}
        >
          ×
        </button>
      </div>
      {project && (
        <div className="portfolio-dialog-content">
          <p className="port-eyebrow">{project.status}</p>
          <h3 ref={heading} id={titleId} tabIndex={-1}>
            {project.name}
          </h3>
          <p className="port-meta">{project.tags.join(' · ')}</p>
          {project.imageUrl && (
            <a
              className="project-screenshot"
              href={project.imageUrl}
              target="_blank"
              rel="noreferrer"
            >
              <img
                src={project.imageUrl}
                alt={project.imageAlt || `${project.name} screenshot`}
                data-image-layout={project.imageLayout}
                width="640"
                height="400"
              />
              <span>
                {project.imageCaption ? `${project.imageCaption} · ` : ''}Open full screenshot ↗
              </span>
            </a>
          )}
          <p>{project.description}</p>
          {project.architecture && <ProjectArchitecture architecture={project.architecture} />}
          {project.platforms && (
            <dl className="project-platforms">
              {project.platforms.map((platform) => (
                <div key={platform.name}>
                  <dt>{platform.name}</dt>
                  <dd>{[platform.language, platform.uiFramework].filter(Boolean).join(' · ')}</dd>
                </div>
              ))}
            </dl>
          )}
          {relatedProject && (
            <div className="project-card-actions">
              <SpringAction
                className="port-button secondary"
                onClick={onOpenRelated}
                motionEnabled={motionEnabled}
              >
                Related project · {relatedProject.name}
              </SpringAction>
            </div>
          )}
          {project.caseStudy && (
            <dl className="project-case-study">
              {Object.entries(project.caseStudy).map(([label, text]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{text}</dd>
                </div>
              ))}
            </dl>
          )}
          {project.linksUnavailableReason && (
            <p className="port-meta">{project.linksUnavailableReason}</p>
          )}
          <div className="project-card-actions">
            {project.liveUrl && (
              <SpringAction
                as="a"
                className="port-button"
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                motionEnabled={motionEnabled}
              >
                {project.linkLabel || 'Open project'} ↗
              </SpringAction>
            )}
            <ProjectSourceLinks project={project} />
          </div>
        </div>
      )}
    </dialog>
  );
}
