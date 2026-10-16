import ProjectCard from './ProjectCard.jsx';

export default function ProjectGrid({ projects, onOpen }) {
  const featured = projects.filter((project) => project.featured);
  const secondary = projects.filter((project) => !project.featured);
  return (
    <section
      id="project-grid"
      className="project-list project-desktop-grid"
      aria-label="Project grid"
    >
      <div className="project-featured-grid">
        {featured.map((project) => (
          <ProjectCard key={project.name} project={project} onOpen={onOpen} />
        ))}
      </div>
      <div className="project-secondary-grid">
        <div className="project-visual-column">
          {secondary
            .filter((project) => project.imageUrl)
            .map((project) => (
              <ProjectCard key={project.name} project={project} onOpen={onOpen} />
            ))}
        </div>
        <div className="project-compact-column">
          {secondary
            .filter((project) => !project.imageUrl)
            .map((project) => (
              <ProjectCard key={project.name} project={project} compact onOpen={onOpen} />
            ))}
        </div>
      </div>
    </section>
  );
}
