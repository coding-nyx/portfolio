import React from 'react';
import styled from 'styled-components';
import { FaHome, FaCode, FaUser, FaEnvelope, FaAdjust } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

const NavWrapper = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 65px;
  background: rgba(10, 10, 26, 0.95);
  border-top: 2px solid var(--neon-cyan);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -5px 20px rgba(0, 243, 255, 0.2);

  @media (min-width: 769px) {
    display: none;
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: rgba(255, 255, 255, 0.95);
    border-top: 1px solid var(--border-color);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.06);
  }
`;

const NavItem = styled.button`
  background: none;
  border: none;
  color: var(--text-dim);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.75rem;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  height: 100%;

  svg {
    font-size: 1.2rem;
    transition: all 0.3s ease;
  }

  &:active {
    transform: scale(0.95);
  }

  &:hover, &.active {
    color: var(--neon-cyan);
    text-shadow: 0 0 5px var(--neon-cyan);

    svg {
      filter: drop-shadow(0 0 3px var(--neon-cyan));
    }
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: var(--text-dim);

    &:hover, &.active {
      color: var(--neon-pink);
      text-shadow: none;

      svg {
        filter: none;
      }
    }
  }
`;

const MobileNav = () => {
  const { toggleTheme } = useTheme();

  const scrollToSection = (selector) => {
    // If scrolling to top (Home)
    if (selector === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.querySelector(selector);
      if (el) {
        // Offset for the fixed header/nav if needed, though we don't have a top fixed header currently.
        // We do have a bottom nav, so we might want to ensure the content isn't covered,
        // but scrollIntoView usually puts it at the top.
        // Let's use a manual calculation for better control if needed, but smooth scroll is easiest.
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <NavWrapper>
      <NavItem onClick={() => scrollToSection('home')} aria-label="Home">
        <FaHome />
        <span>HOME</span>
      </NavItem>

      <NavItem onClick={() => scrollToSection('#featured-work')} aria-label="Projects">
        <FaCode />
        <span>PROJ</span>
      </NavItem>

      <NavItem onClick={() => scrollToSection('[title="Experience"]')} aria-label="Experience">
        <FaUser />
        <span>EXP</span>
      </NavItem>

      <NavItem onClick={() => scrollToSection('#contact-section')} aria-label="Contact">
        <FaEnvelope />
        <span>MSG</span>
      </NavItem>

      <NavItem onClick={toggleTheme} aria-label="Toggle Theme">
        <FaAdjust />
        <span>MODE</span>
      </NavItem>
    </NavWrapper>
  );
};

export default MobileNav;
