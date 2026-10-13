import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const SwitcherContainer = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 8px 0;
  cursor: pointer;
  background: none;
  border: none;
  font-family: inherit;

  font-size: 0.9rem;
  color: var(--text-dim);
  transition: all 0.2s ease;

  &:hover {
    color: var(--neon-cyan);
  }

  &:focus-visible {
    color: var(--neon-cyan);
  }

  [data-theme='cyberpunk'] &:focus-visible {
    text-shadow: 0 0 8px var(--neon-cyan);
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    padding: 8px 8px;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 9999px;
    color: var(--text-dim);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    &:hover {
      color: var(--neon-cyan);
      border-color: var(--border-strong);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }
  }
`;

const SwitcherText = styled.span`
  letter-spacing: 0.5px;
  font-weight: 500;
`;


const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <SwitcherContainer
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${theme === 'cyberpunk' ? 'Portfolio' : 'Cyberpunk Dark'} Mode`}
    >
      {theme === 'cyberpunk' ? (
        <>
          <FaSun style={{ color: 'var(--neon-yellow)' }} />
          <SwitcherText>Portfolio theme</SwitcherText>
        </>
      ) : (
        <>
          <FaMoon style={{ color: 'var(--neon-cyan)' }} />
          <SwitcherText>Switch to Cyberpunk Dark</SwitcherText>
        </>
      )}
    </SwitcherContainer>
  );
};

export default ThemeSwitcher;
