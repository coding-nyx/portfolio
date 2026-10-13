import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useTheme } from '../context/ThemeContext';

const turnOn = keyframes`
  0% { transform: scale(1, 0.005) scaleY(0); filter: brightness(30); opacity: 0; }
  20% { transform: scale(1, 0.005) scaleY(1); filter: brightness(10); opacity: 1; }
  50% { transform: scale(1, 0.005) scaleY(1); filter: brightness(1); }
  70% { transform: scale(1.3, 0.005) scaleY(1); }
  100% { transform: scale(1, 1) scaleY(1); filter: brightness(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const textGlow = keyframes`
  0% { text-shadow: 0 0 5px var(--neon-green); opacity: 0.8; }
  50% { text-shadow: 0 0 20px var(--neon-green), 0 0 10px var(--neon-green); opacity: 1; }
  100% { text-shadow: 0 0 5px var(--neon-green); opacity: 0.8; }
`;

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  /* Theme-based Background */
  background-color: ${props => props.$theme === 'professional' ? 'var(--bg-color)' : '#000'};

  /* Animation based on theme */
  animation: ${props => props.$theme === 'professional'
    ? css`${fadeIn} 0.5s ease-out forwards`
    : css`${turnOn} 0.4s ease-out forwards`
  };
`;

const LogContainer = styled.div`
  font-family: ${props => props.$theme === 'professional' ? 'inherit' : "'Courier New', monospace"};
  color: ${props => props.$theme === 'professional' ? 'var(--text-muted)' : 'var(--neon-green)'};
  width: 80%;
  max-width: 600px;
  text-align: left;
`;

const LogLine = styled.div`
  margin: 4px 0;
  opacity: 0;
  animation: fadeIn 0.1s forwards;

  @keyframes fadeIn {
    to { opacity: 1; }
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${props => props.$theme === 'cyberpunk' ? '#333' : 'var(--border-color)'};
  margin-top: 24px;
  position: relative;
  border-radius: ${props => props.$theme === 'cyberpunk' ? '0' : '4px'};
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.$progress}%;
    background: ${props => props.$theme === 'cyberpunk' ? 'var(--neon-cyan)' : 'linear-gradient(90deg, #FF8A3D, #FFA96A)'};
    box-shadow: ${props => props.$theme === 'cyberpunk' ? '0 0 10px var(--neon-cyan)' : 'none'};
    transition: width 0.1s linear;
  }
`;

const AccessText = styled.h1`
  color: ${props => props.$theme === 'cyberpunk' ? 'var(--neon-pink)' : 'var(--text-main)'};
  font-size: 2rem;
  font-weight: ${props => props.$theme === 'cyberpunk' ? 'bold' : '600'};
  margin-top: 24px;
  text-align: center;
  text-transform: ${props => props.$theme === 'cyberpunk' ? 'uppercase' : 'none'};
  letter-spacing: ${props => props.$theme === 'cyberpunk' ? '5px' : 'normal'};
  animation: ${props => props.$theme === 'cyberpunk' ? textGlow : 'none'} 1.5s infinite;
`;

const SkipButton = styled.button`
  position: absolute;
  bottom: 20px;
  right: 20px;
  color: var(--text-dim);
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  opacity: 0.6;
  animation: pulse 2s infinite;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  z-index: 100;
  transition: opacity 0.3s;

  &:hover {
    opacity: 1;
    text-decoration: underline;
  }

  &:focus-visible {
    opacity: 1;
    outline: 1px solid var(--neon-cyan);
    text-decoration: none;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }
`;

const BootSequence = ({ onComplete }) => {
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const { theme } = useTheme();

  const bootLogs = theme === 'professional' ? [
    "Loading application...",
    "Initializing components...",
    "Fetching profile data...",
    "Optimizing assets...",
    "Ready."
  ] : [
    "INITIALIZING KERNEL...",
    "LOADING MEMORY MODULES...",
    "CHECKING PERIPHERALS...",
    "MOUNTING FILE SYSTEM...",
    "ESTABLISHING SECURE CONNECTION...",
    "LOADING PROFILE DATA...",
    "RENDERING UI COMPONENTS...",
    "SYSTEM OPTIMIZATION...",
    "DONE."
  ];

  const handleSkip = useCallback(() => {
    if (skipped) return;
    setSkipped(true);
    setComplete(true);
    onComplete();
  }, [onComplete, skipped]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSkip]);

  useEffect(() => {
    if (skipped) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      handleSkip();
      return;
    }

    let currentLog = 0;

    const logInterval = setInterval(() => {
      if (currentLog < bootLogs.length) {
        setLogs(prev => [...prev, bootLogs[currentLog]]);
        setProgress(((currentLog + 1) / bootLogs.length) * 100);
        currentLog++;
      } else {
        clearInterval(logInterval);
        setTimeout(() => setComplete(true), 500);
        setTimeout(onComplete, 2000); // Wait a bit after completion before hiding
      }
    }, 150); // Speed of logs

    return () => clearInterval(logInterval);
  }, [onComplete, skipped]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container $theme={theme}>
      {!complete ? (
        <>
          <LogContainer $theme={theme}>
            {logs.map((log, i) => (
              <LogLine key={i}>{theme === 'cyberpunk' ? '>' : ''} {log}</LogLine>
            ))}
            <ProgressBar
              $progress={progress}
              $theme={theme}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="System Boot Progress"
            />
          </LogContainer>
          <SkipButton
            onClick={handleSkip}
            type="button"
            aria-label="Skip initialization sequence"
          >
            {theme === 'cyberpunk' ? '[ SKIP_INTRO ]' : 'Skip Intro'}
          </SkipButton>
        </>
      ) : (
        <AccessText $theme={theme}>{theme === 'cyberpunk' ? 'SYSTEM ONLINE' : 'Welcome'}</AccessText>
      )}
    </Container>
  );
};

export default BootSequence;
