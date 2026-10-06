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
    background: #ffffff;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

    &:hover {
      border-color: #3b82f6;
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
    color: #0f172a;
    font-weight: 700;

    svg {
      color: #3b82f6;
    }
  }
`;

const StatusBadge = styled.span`
  font-size: 0.68rem;
  padding: 2px 6px;
  border: 1px solid var(--neon-cyan);
  color: var(--neon-cyan);
  text-transform: uppercase;
  font-weight: 600;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: #eff6ff;
    color: #1d4ed8;
    border-color: #bfdbfe;
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
    color: #475569;
  }
`;

const Description = styled.p`
  color: #ccc;
  font-size: 0.82rem;
  line-height: 1.45;
  margin: 0 0 12px 0;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: #64748b;
  }
`;

const TagRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  padding-top: 10px;
  border-top: 1px dashed var(--border-color);

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    border-top: 1px solid #f1f5f9;
  }
`;

const Tag = styled.span`
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

const AwardsContainer = styled.div`
  height: 100%;
  padding: 5px;
  display: flex;
  flex-direction: column;
`;

const Awards = () => {
  return (
    <PixelCard title="Hackathons & Participation">
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
              <IssuerTag>{award.issuer} · {award.date}</IssuerTag>
              <Description>{award.description}</Description>
            </div>
            <TagRow>
              <Tag>Hackathon</Tag>
              <Tag>Rapid Prototyping</Tag>
            </TagRow>
          </AwardCard>
        ))}
      </AwardsContainer>
    </PixelCard>
  );
};

export default Awards;
