import { publicText } from '../utils/publicText';
import styled from 'styled-components';
import PixelCard from './common/PixelCard';
import { experienceData } from '../data/portfolio';
import { FaChevronRight } from 'react-icons/fa';
import ThemedIcon from './common/ThemedIcon';

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const JobItem = styled.div`
  border-left: 2px solid var(--neon-cyan);
  padding-left: 15px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: -6px;
    top: 0;
    width: 10px;
    height: 10px;
    background: var(--neon-pink);
    box-shadow: 0 0 5px var(--neon-pink);
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    border-left: 2px solid var(--border-color);
    &::before {
      background: #2563eb;
      box-shadow: 0 0 0 3px #dbeafe;
      border-radius: 50%;
    }
  }
`;

const JobHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
`;

const Company = styled.h4`
  color: var(--neon-yellow);
  margin: 0;
  font-size: 1.1rem;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: #0f172a;
    font-weight: 700;
  }
`;

const Dates = styled.span`
  font-size: 0.8rem;
  color: var(--text-dim);

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #f1f5f9;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 500;
  }
`;

const Role = styled.div`
  color: var(--neon-cyan);
  font-size: 0.9rem;
  margin: 5px 0;
  font-weight: bold;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: #2563eb;
    font-weight: 600;
  }
`;

const Description = styled.p`
  font-size: 0.85rem;
  line-height: 1.4;
  color: var(--text-main);
  margin-bottom: 10px;
`;

const ProjectList = styled.ul`
  list-style: none;
  padding-left: 10px;
  margin: 5px 0;
`;

const ProjectItem = styled.li`
  font-size: 0.85rem;
  margin-bottom: 5px;
  color: var(--text-dim);
  display: flex;
  gap: 8px;

  strong {
    color: var(--text-main);
  }
`;

const Experience = () => {
  return (
    <PixelCard title="Experience">
      <Timeline>
        {experienceData.map((exp, index) => (
          <JobItem key={index}>
            <JobHeader>
              <Company>{exp.company}</Company>
              <Dates>{exp.dates}</Dates>
            </JobHeader>
            <Role>{exp.role}</Role>
            {exp.description && <Description>{publicText(exp.description)}</Description>}
            {exp.projects && (
              <ProjectList>
                {exp.projects.map((proj, pIndex) => (
                  <ProjectItem key={pIndex}>
                    <ThemedIcon ascii=">> " icon={<FaChevronRight size={12} style={{marginTop: '3px'}} />} />
                    <span><strong>{proj.name}:</strong> {publicText(proj.desc)}</span>
                  </ProjectItem>
                ))}
              </ProjectList>
            )}
          </JobItem>
        ))}
      </Timeline>
    </PixelCard>
  );
};

export default Experience;
