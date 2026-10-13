import styled from 'styled-components';
import GlitchText from '../effects/GlitchText';

const StyledContainer = styled.div`
  background-color: var(--card-bg);
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;

  /* Portfolio theme base */
  border-radius: var(--border-radius, 12px);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04);
  padding: 24px;
  border: 1px solid var(--border-color);

  [data-theme='professional'] &:hover,
  [data-theme='modern'] &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04);
    border-color: var(--border-strong);
  }

  /* Cyberpunk Theme Overrides */
  [data-theme='cyberpunk'] & {
    padding: 24px;
    border: 2px solid var(--neon-cyan);
    box-shadow: 0 0 8px rgba(0, 243, 255, 0.15);
    border-radius: 0;

    /* Pixel/Chamfered corners */
    clip-path: polygon(
      0 20px,
      20px 0,
      100% 0,
      100% calc(100% - 20px),
      calc(100% - 20px) 100%,
      0 100%
    );

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 20px rgba(0, 243, 255, 0.4), inset 0 0 10px rgba(0, 243, 255, 0.15);
      z-index: 10;
    }

    /* Scanline effect overlay */
    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        to bottom,
        transparent 50%,
        rgba(0, 0, 0, 0.25) 50%
      );
      background-size: 100% 4px;
      pointer-events: none;
      z-index: 1;
      opacity: 0.35;
    }
  }
`;

export const CardTitle = styled.h3`
  color: var(--neon-cyan);
  padding-bottom: 8px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 600;

  /* Cyberpunk specific */
  [data-theme='cyberpunk'] & {
    border-bottom: 2px solid var(--neon-pink);
    &::before {
      content: ">";
      margin-right: 8px;
      color: var(--neon-pink);
      text-shadow: 0 0 8px var(--neon-pink);
    }
  }

  /* Professional specific */
  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: var(--text-main);
    font-weight: 700;
    text-transform: none;
    letter-spacing: -0.015em;
    border-bottom: 1px solid var(--surface-raised);
  }
`;

export const CardContent = styled.div`
  flex: 1;
  position: relative;
  z-index: 2;
  overflow: ${props => (props.$scrollable ? 'auto' : 'visible')};

  &::-webkit-scrollbar {
    width: 4px;
  }
`;

const PixelCard = ({ title, children, className, scrollable = false, ...props }) => {
  return (
    <StyledContainer className={className} {...props}>
      {title && <CardTitle><GlitchText text={title} /></CardTitle>}
      <CardContent $scrollable={scrollable}>{children}</CardContent>
    </StyledContainer>
  );
};

export default PixelCard;
