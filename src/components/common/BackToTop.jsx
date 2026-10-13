import { useState, useEffect } from 'react';
import styled from 'styled-components';

const Button = styled.button`
  position: fixed;
  bottom: 80px; /* Moved up to not overlap with SystemAlert/ThemeSwitcher */
  right: 20px;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 99;
  opacity: ${props => props.$visible ? 0.8 : 0};
  visibility: ${props => props.$visible ? 'visible' : 'hidden'};
  pointer-events: ${props => props.$visible ? 'all' : 'none'};
  transition: opacity 0.3s ease, visibility 0s linear ${props => props.$visible ? '0s' : '0.3s'};

  /* Cyberpunk Styles */
  [data-theme='cyberpunk'] & {
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid var(--neon-cyan);
    color: var(--neon-cyan);
    clip-path: polygon(
      0 5px, 5px 0,
      100% 0, 100% calc(100% - 5px),
      calc(100% - 5px) 100%, 0 100%
    );

    &:hover {
      background: var(--neon-cyan);
      color: #000;
      transform: translateY(-3px);
      box-shadow: 0 0 10px var(--neon-cyan);
      opacity: 1;
    }
  }

  /* Professional Styles */
  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    color: var(--text-main);
    border-radius: 50%;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);

    &:hover {
      background: var(--neon-cyan); /* Accent color */
      color: var(--on-accent);
      border-color: var(--neon-cyan);
      transform: translateY(-3px);
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      opacity: 1;
    }
  }
`;

const BackToTop = () => {
  const [visible, setVisible] = useState(false);
  // useTheme hook is available but strictly not needed if we rely on css selectors,
  // but good to keep consistency if we needed logic.

  const toggleVisible = () => {
    const scrolled = document.documentElement.scrollTop;
    if (scrolled > 300) {
      setVisible(true);
    } else if (scrolled <= 300) {
      setVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisible);
    return () => window.removeEventListener('scroll', toggleVisible);
  }, []);

  return (
    <Button
      onClick={scrollToTop}
      $visible={visible}
      aria-label="Back to Top"
      title="Back to Top"
    >
      <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>&#9650;</span>
    </Button>
  );
};

export default BackToTop;
