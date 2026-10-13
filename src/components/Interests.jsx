import styled from 'styled-components';
import PixelCard from './common/PixelCard';
import { FaRunning, FaTerminal, FaCogs, FaGamepad } from 'react-icons/fa';

const InterestsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  padding: 4px;
`;

const InterestCard = styled.div`
  /* Cyberpunk style matching ProjectCard */
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--text-dim);
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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
    border-color: var(--neon-yellow);
    box-shadow: 2px 2px 0 var(--neon-cyan);
    transform: translate(-1px, -1px);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const IconWrapper = styled.div`
  color: var(--neon-yellow);
  display: flex;
  align-items: center;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: var(--neon-cyan);
  }
`;

const Title = styled.h4`
  color: var(--neon-yellow);
  font-size: 0.88rem;
  margin: 0;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: var(--text-main);
    font-weight: 600;
  }
`;

const Subtitle = styled.p`
  font-size: 0.78rem;
  color: #ccc;
  margin: 0 0 8px 0;
  line-height: 1.4;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: var(--text-dim);
  }
`;

const Tag = styled.span`
  font-size: 0.68rem;
  background: var(--neon-cyan);
  color: var(--bg-color);
  padding: 4px 8px;
  font-weight: bold;
  align-self: flex-start;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: var(--surface-raised);
    color: var(--text-dim);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-weight: 500;
  }
`;

const interestsList = [
  {
    icon: <FaRunning size={14} />,
    title: "Obstacle Course Races",
    desc: "Endurance training, Spartan races, and extreme physical grit.",
    tag: "Athletics & Stamina"
  },
  {
    icon: <FaTerminal size={14} />,
    title: "Linux Rice & Dotfiles",
    desc: "Wayland, Hyprland/i3 setup, kernel tweaks, and minimal CLI setups.",
    tag: "Systems & Unix"
  },
  {
    icon: <FaCogs size={14} />,
    title: "System Architecture",
    desc: "Deterministic state machines, agentic pipelines, and low latency.",
    tag: "Deep Tech"
  },
  {
    icon: <FaGamepad size={14} />,
    title: "Retro Gaming & Emulation",
    desc: "ARM architecture, hardware emulation, and low-level ROM hacking.",
    tag: "Low-Level Fun"
  }
];

const Interests = () => {
  return (
    <PixelCard title="Interests & Passions">
      <InterestsGrid>
        {interestsList.map((item, idx) => (
          <InterestCard key={idx}>
            <div>
              <Header>
                <IconWrapper>{item.icon}</IconWrapper>
                <Title>{item.title}</Title>
              </Header>
              <Subtitle>{item.desc}</Subtitle>
            </div>
            <Tag>{item.tag}</Tag>
          </InterestCard>
        ))}
      </InterestsGrid>
    </PixelCard>
  );
};

export default Interests;
