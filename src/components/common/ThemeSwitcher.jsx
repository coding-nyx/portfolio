import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const SwitcherContainer = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 10px 0;
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
    padding: 8px 18px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 9999px;
    color: #475569;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    &:hover {
      color: #2563eb;
      border-color: #cbd5e1;
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
      aria-label={`Switch to ${theme === 'cyberpunk' ? 'Professional Light' : 'Cyberpunk Dark'} Mode`}
    >
      {theme === 'cyberpunk' ? (
        <>
          <FaSun style={{ color: 'var(--neon-yellow)' }} />
          <SwitcherText>[ SWITCH_TO_LIGHT_MODE ]</SwitcherText>
        </>
      ) : (
        <>
          <FaMoon style={{ color: '#4f46e5' }} />
          <SwitcherText>Switch to Cyberpunk Dark</SwitcherText>
        </>
      )}
    </SwitcherContainer>
  );
};

export default ThemeSwitcher;
