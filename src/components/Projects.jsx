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

const SectionStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FeaturedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  padding: 4px;

  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
  }
`;

const OtherGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  padding: 4px;
`;

const ProjectCard = styled.div`
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--text-dim);
  padding: 16px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;

  ${props => props.$featured && `
    min-height: 320px;
  `}

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    border-radius: 10px;
    overflow: hidden;

    &:hover,
    &:focus-within {
      border-color: var(--accent-hover);
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

const ImageSlot = styled.div`
  width: 100%;
  aspect-ratio: 16 / 10;
  margin-bottom: 12px;
  border-radius: 6px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95));
  border: 1px solid rgba(148, 163, 184, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;

  [data-theme='cyberpunk'] & {
    background: linear-gradient(135deg, rgba(0, 20, 40, 0.9), rgba(20, 0, 40, 0.95));
    border-color: var(--text-dim);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const PlaceholderLabel = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.02em;
  text-align: center;
  padding: 12px;

  [data-theme='cyberpunk'] & {
    color: var(--text-dim);
  }
`;

const ProjectHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 8px;
    position: relative;
    z-index: 1;
    gap: 8px;
`;

const ProjectTitle = styled.h4`
  color: var(--neon-yellow);
  margin: 0;
  font-size: ${props => props.$featured ? '1.25rem' : '1.05rem'};

  ${ProjectCard}:hover &,
  ${ProjectCard}:focus-within & {
    animation: ${glitchAnim} 0.5s cubic-bezier(.25, .46, .45, .94) both;
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: var(--text-main);
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
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
`;

const TechTag = styled.span`
  font-size: 0.7rem;
  background: var(--neon-cyan);
  color: var(--bg-color);
  padding: 4px 4px;
  font-weight: bold;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: var(--surface-raised);
    color: var(--text-dim);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-weight: 500;
  }
`;

const Description = styled.p`
  font-size: ${props => props.$featured ? '0.92rem' : '0.82rem'};
  color: #ccc;
  line-height: 1.4;
  flex-grow: 1;
  position: relative;
  z-index: 1;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: var(--text-muted);
  }
`;

const Status = styled.span`
  font-size: 0.7rem;
  color: var(--neon-green);
  border: 1px solid var(--neon-green);
  padding: 4px 4px;
  white-space: nowrap;
  animation: ${pulseAnim} 2s infinite;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    border: 1px solid #a7f3d0;
    background: var(--success-soft);
    color: var(--neon-green);
    border-radius: 4px;
    animation: none;
    font-weight: 600;
  }
`;

const ProjectLinks = styled.div`
  margin-top: 16px;
  display: flex;
  gap: 16px;
  position: relative;
  z-index: 1;
`;

const ProjectLink = styled.a`
  color: var(--neon-pink);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;

  &:hover {
    color: var(--neon-yellow);
    text-shadow: 0 0 5px var(--neon-yellow);
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: var(--neon-cyan);
    font-weight: 600;

    &:hover {
      color: var(--accent-hover);
      text-shadow: none;
      text-decoration: underline;
    }
  }
`;

const SubSectionTitle = styled.h3`
  margin: 0 0 4px 0;
  font-size: 0.95rem;
  color: var(--text-dim);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: var(--text-dim);
  }
`;

function isReleasesUrl(url) {
  return typeof url === 'string' && /\/releases\/?$/i.test(url);
}

function liveCtaLabel(url) {
  return isReleasesUrl(url) ? 'Releases' : 'Live';
}

function ProjectCardItem({ project, featured }) {
  const liveLink = project.liveUrl || project.link;

  return (
    <ProjectCard $featured={featured}>
      <div>
        {featured && (
          <ImageSlot>
            {project.imageUrl ? (
              <img src={project.imageUrl} alt={`${project.name} screenshot`} />
            ) : (
              <PlaceholderLabel>{project.name}</PlaceholderLabel>
            )}
          </ImageSlot>
        )}
        <ProjectHeader>
          <ProjectTitle $featured={featured}>{project.name}</ProjectTitle>
          <Status>{project.status}</Status>
        </ProjectHeader>
        <TechStack>
          {project.tags.map(t => <TechTag key={t}>{t}</TechTag>)}
        </TechStack>
        <Description $featured={featured}>{project.description}</Description>
      </div>
      <ProjectLinks>
        {liveLink && (
          <ProjectLink
            href={liveLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${liveCtaLabel(liveLink)} for ${project.name}`}
          >
            <FaExternalLinkAlt /> {liveCtaLabel(liveLink)}
          </ProjectLink>
        )}
        {project.repoUrl && (
          <ProjectLink
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Source code for ${project.name}`}
          >
            <FaGithub /> Source
          </ProjectLink>
        )}
      </ProjectLinks>
    </ProjectCard>
  );
}

export const FeaturedProjects = () => {
  const featured = projects.filter(p => p.featured === true);

  return (
    <PixelCard title="Featured work" id="featured-work">
      <FeaturedGrid>
        {featured.map((project, idx) => (
          <ProjectCardItem key={`featured-${idx}`} project={project} featured />
        ))}
      </FeaturedGrid>
    </PixelCard>
  );
};

export const OtherProjects = () => {
  const other = projects.filter(p => p.featured !== true);

  if (other.length === 0) return null;

  return (
    <PixelCard title="Other work" id="other-work">
      <SubSectionTitle>Secondary projects</SubSectionTitle>
      <OtherGrid>
        {other.map((project, idx) => (
          <ProjectCardItem key={`other-${idx}`} project={project} featured={false} />
        ))}
      </OtherGrid>
    </PixelCard>
  );
};

/** @deprecated Prefer FeaturedProjects + OtherProjects mounts for IA order */
const Projects = () => (
  <SectionStack>
    <FeaturedProjects />
    <OtherProjects />
  </SectionStack>
);

export default Projects;
