import styled, { keyframes } from 'styled-components';
import { FaExternalLinkAlt, FaGithub } from 'react-icons/fa';
import PixelCard from './common/PixelCard';
import { projects } from '../data/portfolio';

const glitchAnim = keyframes`
  0% { transform: scale(1); clip-path: inset(0 0 0 0); }
  20% { clip-path: inset(10% 0 0 0); }
  40% { clip-path: inset(0 0 0 0); }
  60% { transform: scale(1.02); clip-path: inset(0 0 10% 0); }
  80% { clip-path: inset(0 0 0 0); }
  100% { transform: scale(1); clip-path: inset(0 0 0 0); }
`;

const pulseAnim = keyframes`
  0%, 100% { opacity: 1; text-shadow: 0 0 5px var(--neon-green); }
  50% { opacity: 0.7; text-shadow: 0 0 2px var(--neon-green); }
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  /* Add padding to prevent hover shadows/transform clipping at grid edges */
  padding: 5px;
`;

const ProjectCard = styled.div`
  /* Default Cyberpunk Style */
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--text-dim);
  padding: 15px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;

  /* Professional Theme Override */
  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #ffffff;
    border: 1px solid var(--border-color);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    border-radius: 10px;
    overflow: hidden;

    &:hover,
    &:focus-within {
      border-color: #3b82f6;
      box-shadow: 0 8px 16px -2px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }
  }

  [data-theme='cyberpunk'] &:hover,
  [data-theme='cyberpunk'] &:focus-within {
    border-color: var(--neon-pink);
    box-shadow: 3px 3px 0 var(--neon-cyan);
    transform: translate(-2px, -2px);

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 0, 255, 0.05);
      pointer-events: none;
      z-index: 0;
    }
  }
`;

const ProjectHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 10px;
    position: relative;
    z-index: 1;
`;

const ProjectTitle = styled.h4`
  color: var(--neon-yellow);
  margin: 0;
  font-size: 1.1rem;

  ${ProjectCard}:hover &,
  ${ProjectCard}:focus-within & {
    animation: ${glitchAnim} 0.5s cubic-bezier(.25, .46, .45, .94) both;
  }

  /* Simplify for professional theme */
  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: #0f172a;
    font-weight: 700;
  }

  [data-theme='professional'] ${ProjectCard}:hover &,
  [data-theme='professional'] ${ProjectCard}:focus-within &,
  [data-theme='modern'] ${ProjectCard}:hover &,
  [data-theme='modern'] ${ProjectCard}:focus-within & {
    animation: none;
    color: #2563eb;
  }
`;

const TechStack = styled.div`
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  margin-bottom: 10px;
  position: relative;
  z-index: 1;
`;

const TechTag = styled.span`
  font-size: 0.7rem;
  background: var(--neon-cyan);
  color: var(--bg-color);
  padding: 2px 5px;
  font-weight: bold;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-weight: 500;
  }
`;

const Description = styled.p`
  font-size: 0.85rem;
  color: #ccc;
  line-height: 1.4;
  flex-grow: 1;
  position: relative;
  z-index: 1;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: #334155;
  }
`;

const Status = styled.span`
  font-size: 0.7rem;
  color: var(--neon-green);
  border: 1px solid var(--neon-green);
  padding: 2px 5px;
  white-space: nowrap;
  animation: ${pulseAnim} 2s infinite;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    border: 1px solid #a7f3d0;
    background: #ecfdf5;
    color: #059669;
    border-radius: 4px;
    animation: none;
    font-weight: 600;
  }
`;

const ProjectLinks = styled.div`
  margin-top: 15px;
  display: flex;
  gap: 15px;
  position: relative;
  z-index: 1;
`;

const ProjectLink = styled.a`
  color: var(--neon-pink);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
  text-decoration: none;

  &:hover {
    color: var(--neon-yellow);
    text-shadow: 0 0 5px var(--neon-yellow);
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: #2563eb;
    font-weight: 600;

    &:hover {
      color: #1d4ed8;
      text-shadow: none;
      text-decoration: underline;
    }
  }
`;

const ProjectNote = styled.span`
  color: var(--text-dim);
  font-size: 0.85rem;
  font-style: italic;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: #94a3b8;
  }
`;

const Projects = () => {
  return (
    <PixelCard title="Projects">
      <ProjectsGrid>
        {projects.map((project, idx) => { // Changed from projectsData to projects
          const liveLink = project.liveUrl || project.link;
          const liveLabel = project.linkLabel || 'Live';

          return (
            <ProjectCard key={idx}>
              <div>
                  <ProjectHeader>
                      <ProjectTitle>{project.name}</ProjectTitle> {/* Changed from project.title to project.name */}
                      <Status>{project.status}</Status>
                  </ProjectHeader>
                  <TechStack>
                  {project.tags.map(t => <TechTag key={t}>{t}</TechTag>)} {/* Changed from project.tech to project.tags */}
                  </TechStack>
                  <Description>{project.description}</Description>
              </div>
              <ProjectLinks>
                {liveLink && (
                  <ProjectLink
                    href={liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${liveLabel} — ${project.name}`}
                  >
                    <FaExternalLinkAlt /> {liveLabel}
                  </ProjectLink>
                )}
                {project.repoUrl && ( // Changed from project.sourceUrl to project.repoUrl
                  <ProjectLink
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Source code for ${project.name}`} // Changed from project.title to project.name
                  >
                    <FaGithub /> Source
                  </ProjectLink>
                )}
                {!liveLink && !project.repoUrl && (
                  <ProjectNote>Source not public</ProjectNote>
                )}
              </ProjectLinks>
            </ProjectCard>
          );
        })}
      </ProjectsGrid>
    </PixelCard>
  );
};

export default Projects;
