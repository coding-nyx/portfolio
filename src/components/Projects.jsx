import React, { useState } from 'react';
import styled from 'styled-components';
import { FaExternalLinkAlt, FaGithub, FaChevronDown, FaInfoCircle } from 'react-icons/fa';
import PixelCard from './common/PixelCard';
import { projects } from '../data/portfolio';

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
`;

const ProjectHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 10px;
  position: relative;
  z-index: 1;
  gap: 8px;
`;

const ProjectTitle = styled.h4`
  color: var(--neon-yellow);
  margin: 0;
  font-size: 1.1rem;

  /* Simplify for professional theme */
  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: #0f172a;
    font-weight: 700;
  }
`;

const Status = styled.span`
  font-size: 0.7rem;
  color: var(--neon-green);
  border: 1px solid var(--neon-green);
  padding: 2px 5px;
  white-space: nowrap;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    border: 1px solid #a7f3d0;
    background: #ecfdf5;
    color: #059669;
    border-radius: 4px;
    font-weight: 600;
  }
`;

const ScopeNote = styled.p`
  margin: 6px 0 0;
  font-size: 0.72rem;
  color: var(--text-dim);
  position: relative;
  z-index: 1;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: #64748b;
  }
`;

const Description = styled.p`
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--text-dim);
  margin: 10px 0 0;
  position: relative;
  z-index: 1;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: #475569;
  }
`;

const TechStack = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
  position: relative;
  z-index: 1;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: #334155;
  }
`;

const TechTag = styled.span`
  font-size: 0.7rem;
  background: var(--neon-cyan);
  color: var(--bg-color);
  padding: 2px 6px;
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

const CaseStudyRegion = styled.div`
  margin-top: 12px;
  position: relative;
  z-index: 1;
`;

const CaseStudyBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--neon-pink);
  color: #fff;
  border: none;
  padding: 6px 10px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.75rem;
  margin-top: 0;
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);

  &:hover {
    background: #d946ef;
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #2563eb;
    border-radius: 4px;
    clip-path: none;
    font-weight: 600;

    &:hover {
      background: #1d4ed8;
    }
  }
`;

const CaseStudyPanel = styled.div`
  display: ${props => (props.$isOpen ? 'block' : 'none')};
  margin-top: 10px;
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--text-dim);
  border-top: 1px dashed var(--text-dim);
  padding-top: 10px;

  dt {
    font-weight: 700;
    color: var(--text-main);
    margin-top: 8px;
  }

  dd {
    margin: 2px 0 0;
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: #475569;
    border-top-color: #e2e8f0;

    dt {
      color: #0f172a;
    }
  }
`;

const UnavailableNote = styled.p`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 10px 0 0;
  font-size: 0.72rem;
  line-height: 1.45;
  color: var(--text-dim);

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: #64748b;
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
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: #2563eb;
    font-weight: 600;

    &:hover {
      color: #1d4ed8;
      text-decoration: underline;
    }
  }
`;

const CASESTUDY_FIELDS = [
  ['problem', 'Problem'],
  ['approach', 'Approach'],
  ['scope', 'Scope / Type'],
  ['evidence', 'Evidence'],
  ['limitations', 'Limitations'],
];

const Projects = () => {
  const [openCaseStudy, setOpenCaseStudy] = useState(null);

  const toggleCaseStudy = (idx) => {
    setOpenCaseStudy(prev => (prev === idx ? null : idx));
  };

  return (
    <PixelCard title="Projects">
      <ProjectsGrid>
        {projects.map((project, idx) => {
          const liveLink = project.liveUrl || project.link;
          const hasCaseStudy = Boolean(project.caseStudy);
          const isOpen = hasCaseStudy && openCaseStudy === idx;
          const panelId = `case-study-${idx}`;

          return (
            <ProjectCard key={project.name}>
              <div>
                <ProjectHeader>
                  <ProjectTitle>{project.name}</ProjectTitle>
                  <Status>{project.status}</Status>
                </ProjectHeader>

                {project.scope && <ScopeNote>{project.scope}</ScopeNote>}

                <TechStack>
                  {project.tags.map(t => (
                    <TechTag key={t}>{t}</TechTag>
                  ))}
                </TechStack>

                <Description>{project.description}</Description>

                {hasCaseStudy && (
                  <CaseStudyRegion>
                    <CaseStudyBtn
                      type="button"
                      onClick={() => toggleCaseStudy(idx)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                    >
                      <FaChevronDown size={11} aria-hidden="true" />
                      {isOpen ? 'Hide case study' : 'View case study'}
                    </CaseStudyBtn>
                    <CaseStudyPanel id={panelId} $isOpen={isOpen}>
                      <dl>
                        {CASESTUDY_FIELDS
                          .filter(([key]) => project.caseStudy[key])
                          .map(([key, label]) => (
                            <div key={key}>
                              <dt>{label}</dt>
                              <dd>{project.caseStudy[key]}</dd>
                            </div>
                          ))}
                      </dl>
                    </CaseStudyPanel>
                  </CaseStudyRegion>
                )}

                {!liveLink && !project.repoUrl && project.linksUnavailableReason && (
                  <UnavailableNote>
                    <FaInfoCircle size={12} aria-hidden="true" />
                    <span>{project.linksUnavailableReason}</span>
                  </UnavailableNote>
                )}
              </div>

              <ProjectLinks>
                {liveLink && (
                  <ProjectLink
                    href={liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.linkLabel || 'Live demo'} of ${project.name}`}
                  >
                    <FaExternalLinkAlt aria-hidden="true" />
                    {project.linkLabel || 'Live'}
                  </ProjectLink>
                )}
                {project.repoUrl && (
                  <ProjectLink
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Source code for ${project.name}`}
                  >
                    <FaGithub aria-hidden="true" /> Source
                  </ProjectLink>
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