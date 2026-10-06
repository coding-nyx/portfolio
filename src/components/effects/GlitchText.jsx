import React from 'react';
import styled, { css } from 'styled-components';
import { useTheme } from '../../context/ThemeContext';

const GlitchWrapper = styled.span`
  position: relative;
  display: inline-block;

  /* Only apply glitch hover in cyberpunk mode */
  ${props => props.$theme === 'cyberpunk' && css`
    &:hover {
      text-shadow: 2px 2px var(--neon-cyan), -2px -2px var(--neon-pink);
      transition: text-shadow 0.1s ease;

      &::before, &::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0.8;
      }

      &::before {
        transform: translate(-2px, 0);
        color: var(--neon-cyan);
        z-index: -1;
      }

      &::after {
        transform: translate(2px, 0);
        color: var(--neon-pink);
        z-index: -2;
      }
    }
  `}
`;

// Dictionary for Cyberpunk text replacements
const CYBERPUNK_DICTIONARY = {
  "Experience": "MEMORY BANKS",
  "Skills": "INSTALLED MODULES",
  "Projects": "EXECUTABLE PROGRAMS",
  "Contact": "COMMS UPLINK",
  "About": "BIO_METRICS",
  "Achievements": "TROPHY DATA",
  "Awards": "RECOGNITION PROTOCOLS",
  "Certifications": "AUTH KEYS",
  "Interests": "BACKGROUND PROCESSES",

  "LinkedIn": "NETWORK_LINK",
  "Email": "EMAIL_UPLINK",
  "Say Hello": "GAME_START"
};

const GlitchText = ({ text }) => {
  const { theme } = useTheme();

  // If cyberpunk, check if we have a cool replacement
  const displayText = (theme === 'cyberpunk' && CYBERPUNK_DICTIONARY[text])
    ? CYBERPUNK_DICTIONARY[text]
    : text;

  return (
    <GlitchWrapper $theme={theme} data-text={displayText}>
      {displayText}
    </GlitchWrapper>
  );
};

export default GlitchText;
