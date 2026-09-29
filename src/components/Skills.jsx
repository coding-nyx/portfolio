import styled from 'styled-components';
import PixelCard from './common/PixelCard';
import { skillsData } from '../data/portfolio';

const CATEGORY_ORDER = ['Mobile', 'Language', 'Frontend', 'Backend', 'AI', 'OS'];

const CATEGORY_LABELS = {
  Mobile: 'Mobile',
  Language: 'Language / Frontend',
  Frontend: 'Language / Frontend',
  Backend: 'Backend / AI / OS',
  AI: 'Backend / AI / OS',
  OS: 'Backend / AI / OS',
};

const GROUP_ORDER = ['Mobile', 'Language / Frontend', 'Backend / AI / OS'];

const SkillsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 5px;
`;

const CategoryBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CategoryTitle = styled.h4`
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--neon-yellow);

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: #0f172a;
  }
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 6px 12px;
  background: var(--neon-cyan);
  color: var(--bg-color);
  border: 1px solid transparent;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #f1f5f9;
    color: #334155;
    border: 1px solid #e2e8f0;
    border-radius: 9999px;
    font-weight: 500;
  }

  [data-theme='cyberpunk'] & {
    clip-path: polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px);
  }
`;

function groupSkills(skills) {
  const groups = {};
  for (const skill of skills) {
    if (skill.category === 'Core') continue; // soft skills out
    const label = CATEGORY_LABELS[skill.category] || skill.category;
    if (!groups[label]) groups[label] = [];
    groups[label].push(skill);
  }
  return GROUP_ORDER
    .filter(label => groups[label]?.length)
    .map(label => ({ label, skills: groups[label] }));
}

const Skills = () => {
  const groups = groupSkills(skillsData);

  return (
    <PixelCard title="Skills">
      <SkillsContainer>
        {groups.map(group => (
          <CategoryBlock key={group.label}>
            <CategoryTitle>{group.label}</CategoryTitle>
            <ChipRow>
              {group.skills.map(s => (
                <Chip key={s.name}>{s.name}</Chip>
              ))}
            </ChipRow>
          </CategoryBlock>
        ))}
      </SkillsContainer>
    </PixelCard>
  );
};

export default Skills;
