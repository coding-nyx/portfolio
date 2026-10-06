import styled from 'styled-components';
import PixelCard from './common/PixelCard';
import { FaApple, FaMicrochip, FaRobot, FaCloud } from 'react-icons/fa';
import { skillGroupsData } from '../data/portfolio';

const SkillsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 5px;

  @media (max-width: 650px) {
    grid-template-columns: 1fr;
  }
`;

const DomainCard = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--text-dim);
  padding: 18px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;

  [data-theme='cyberpunk'] &:hover,
  [data-theme='cyberpunk'] &:focus-within {
    border-color: var(--neon-cyan);
    box-shadow: 3px 3px 0 var(--neon-cyan);
    transform: translate(-2px, -2px);
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #ffffff;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

    &:hover,
    &:focus-within {
      border-color: #3b82f6;
      box-shadow: 0 8px 16px -2px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }
  }
`;

const DomainHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  position: relative;
  z-index: 1;
`;

const DomainTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;

  [data-theme='cyberpunk'] & {
    color: var(--neon-yellow);
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: #0f172a;
    font-weight: 700;
  }
`;

const DomainSubtitle = styled.p`
  font-size: 0.8rem;
  color: #ccc;
  margin: 0 0 12px 0;
  line-height: 1.4;
  position: relative;
  z-index: 1;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: #64748b;
  }
`;

const EvidenceList = styled.ul`
  margin: 0;
  padding-left: 18px;
  position: relative;
  z-index: 1;

  li {
    font-size: 0.82rem;
    line-height: 1.5;
    color: var(--text-dim);
    margin-bottom: 6px;
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    li {
      color: #475569;
    }
  }
`;

const TechStack = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed var(--border-color);
  position: relative;
  z-index: 1;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    border-top: 1px solid #f1f5f9;
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

/**
 * Skill groups replace the previous 0-100 percentage bars.
 *
 * Those bars (including Adaptability 90% and Teamwork 90%) had no defined basis
 * and were not defensible in a hiring conversation, so they were removed rather
 * than rescaled into another unsupported rating.
 */
const ICONS = {
  'ios-mobile': <FaApple size={16} />,
  'agentic-ai': <FaRobot size={16} />,
  'systems-linux': <FaMicrochip size={16} />,
  'android-web': <FaCloud size={16} />,
};

const Skills = () => {
  return (
    <PixelCard title="Skills & Evidence">
      <SkillsContainer>
        {skillGroupsData.map(group => (
          <DomainCard key={group.id}>
            <div>
              <DomainHeader>
                <DomainTitle>
                  {ICONS[group.id]}
                  <span>{group.title}</span>
                </DomainTitle>
              </DomainHeader>
              <DomainSubtitle>{group.subtitle}</DomainSubtitle>
              <EvidenceList>
                {group.evidence.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </EvidenceList>
            </div>
            <TechStack>
              {group.tags.map(tag => (
                <TechTag key={tag}>{tag}</TechTag>
              ))}
            </TechStack>
          </DomainCard>
        ))}
      </SkillsContainer>
    </PixelCard>
  );
};

export default Skills;