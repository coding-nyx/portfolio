import styled, { keyframes, css } from 'styled-components';
import { useTheme } from './useTheme.js';

const scanlineAnim = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`;

const flickerAnim = keyframes`
  0% { opacity: 0.9; }
  5% { opacity: 0.8; }
  10% { opacity: 0.9; }
  15% { opacity: 0.95; }
  20% { opacity: 0.9; }
  50% { opacity: 0.95; }
  80% { opacity: 0.9; }
  90% { opacity: 0.85; }
  100% { opacity: 0.9; }
`;

const OverlayContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  pointer-events: none;
  overflow: hidden;

  /* Only show in cyberpunk mode */
  ${(props) =>
    props.$themeMode !== 'cyberpunk' &&
    css`
      display: none;
    `}
`;

const Scanlines = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 0) 50%,
    rgba(0, 0, 0, 0.2) 50%,
    rgba(0, 0, 0, 0.2)
  );
  background-size: 100% 4px;
  opacity: 0.15;
`;

const MovingLine = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 20px;
  background: rgba(0, 243, 255, 0.1);
  box-shadow: 0 0 10px rgba(0, 243, 255, 0.2);
  animation: ${scanlineAnim} 6s linear infinite;
  opacity: 0.3;
`;

const Vignette = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, transparent 60%, rgba(0, 0, 0, 0.6) 100%);
`;

const CRTFlicker = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(18, 16, 16, 0.05);
  animation: ${flickerAnim} 0.15s infinite;
  opacity: 0.1;
`;

const CyberpunkOverlay = () => {
  const { theme } = useTheme();

  if (theme !== 'cyberpunk') return null;

  return (
    <OverlayContainer $themeMode={theme}>
      <Vignette />
      <Scanlines />
      <MovingLine />
      <CRTFlicker />
    </OverlayContainer>
  );
};

export default CyberpunkOverlay;
