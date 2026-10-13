import styled from 'styled-components';
import PixelCard from './common/PixelCard';
import { awardsData } from '../data/portfolio';
import { FaAward } from 'react-icons/fa';

const AwardCard = styled.div`
  /* Cyberpunk style matching ProjectCard */
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--text-dim);
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;

  /* Professional Theme */
  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

    &:hover {
      border-color: var(--accent-hover);
      box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }
  }

  [data-theme='cyberpunk'] &:hover {
    border-color: var(--neon-cyan);
    box-shadow: 2px 2px 0 var(--neon-pink);
    transform: translate(-1px, -1px);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const Title = styled.h4`
  color: var(--neon-cyan);
  font-size: 0.98rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: var(--text-main);
    font-weight: 700;

    svg {
      color: var(--accent-hover);
    }
  }
`;

const StatusBadge = styled.span`
  font-size: 0.68rem;
  padding: 4px 8px;
  border: 1px solid var(--neon-cyan);
  color: var(--neon-cyan);
  text-transform: uppercase;
  font-weight: 600;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: var(--accent-soft);
    color: var(--accent-hover);
    border-color: var(--accent-border);
    border-radius: 4px;
  }
`;

const IssuerTag = styled.div`
  color: var(--neon-pink);
  font-size: 0.78rem;
  font-weight: 600;
  margin-bottom: 8px;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: var(--text-dim);
  }
`;

const Description = styled.p`
  color: #ccc;
  font-size: 0.82rem;
  line-height: 1.45;
  margin: 0 0 12px 0;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: var(--text-dim);
  }
`;

const TagRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 8px;
  border-top: 1px dashed var(--border-color);

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    border-top: 1px solid var(--surface-raised);
  }
`;

const Tag = styled.span`
  font-size: 0.7rem;
  background: var(--neon-cyan);
  color: var(--bg-color);
  padding: 4px 8px;
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

const AwardsContainer = styled.div`
  height: 100%;
  padding: 4px;
  display: flex;
  flex-direction: column;
`;

const Awards = () => {
  return (
    <PixelCard title="Awards & Honors">
      <AwardsContainer>
        {awardsData.map((award, idx) => (
          <AwardCard key={idx}>
            <div>
              <Header>
                <Title>
                  <FaAward size={16} />
                  <span>{award.name}</span>
                </Title>
                <StatusBadge>[Participant]</StatusBadge>
              </Header>
              <IssuerTag>{award.issuer} • {award.date}</IssuerTag>
              <Description>
                Participated in Smart India Hackathon in August 2020.
              </Description>
            </div>
            <TagRow>
              <Tag>Hackathon</Tag>
              <Tag>Participant</Tag>
            </TagRow>
          </AwardCard>
        ))}
      </AwardsContainer>
    </PixelCard>
  );
};

export default Awards;
