import ProjectMotionCard from './ProjectMotionCard.jsx';
import SpringAction from '../../shared/ui/SpringAction.jsx';
import { ProjectSourceLinks } from './ProjectDetailsDialog.jsx';

export default function ProjectCard({ project, compact = false, onOpen }) {
  return (
    <ProjectMotionCard featured={project.featured} compact={compact}>
      {project.imageUrl && (
        <img
          src={project.imageUrl}
          alt={project.imageAlt || `${project.name} screenshot`}
          loading="lazy"
          width="640"
          height="400"
        />
      )}
      {project.imageCaption && (
        <span className="project-image-caption">{project.imageCaption}</span>
      )}
      <span className="port-eyebrow">
        {project.developmentStatus
          ? project.status
          : project.featured
            ? 'Featured project'
            : project.tags.includes('Linux Kernel')
              ? 'Embedded Linux'
              : 'Personal project'}
      </span>
      <h3>{project.name}</h3>
      <p className="port-meta">{project.tags.join(' · ')}</p>
      <p>{project.cardSummary || project.description}</p>
      <div className="project-card-actions">
        <SpringAction
          className="port-button"
          aria-label={`View ${project.name} details`}
          onClick={(event) => onOpen(project, event)}
        >
          Details
        </SpringAction>
        <ProjectSourceLinks project={project} />
      </div>
    </ProjectMotionCard>
  );
}
