import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    /* DEFAULT / CYBERPUNK THEME */
    --bg-color: #050510;
    --card-bg: #0a0a1a;
    --text-main: #f8f8f2;
    --text-dim: #6272a4;
    --border-color: #bd93f9;

    --neon-cyan: #00f3ff;
    --neon-pink: #bc13fe;
    --neon-yellow: #f1fa8c;
    --neon-green: #50fa7b;

    --font-main: 'Courier New', Courier, monospace;
    --border-radius: 0px;
    --grid-gap: 16px;
    --letter-spacing: 2px;
    --text-transform: uppercase;
    --transition-speed: 0.2s;

    /* Cyberpunk Grid Background */
    --bg-image:
      linear-gradient(rgba(0, 243, 255, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 243, 255, 0.05) 1px, transparent 1px);
    --bg-size: 40px 40px;
  }

  /* Portfolio theme — same dark surfaces and orange accent as Entry D2. */
  [data-theme='professional'],
  [data-theme='modern'] {
    color-scheme: dark;
    --bg-color: #0B0B0F;
    --card-bg: #15151B;
    --surface-raised: #1D1D25;
    --surface-hover: #25252E;
    --text-main: #F4F4F5;
    --text-muted: #D4D4D8;
    --text-dim: #A1A1AA;
    --border-color: #2C2C35;
    --border-strong: #3A3A46;
    --neon-cyan: #FF8A3D;
    --neon-pink: #FF8A3D;
    --neon-yellow: #FF8A3D;
    --neon-green: #86EFAC;
    --on-accent: #0B0B0F;
    --accent-hover: #FFA96A;
    --accent-soft: #2B211A;
    --accent-border: #614028;
    --success-soft: #14281D;
    --font-main: 'Space Grotesk', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    --border-radius: 12px;
    --letter-spacing: normal;
    --text-transform: none;
    --bg-image: none;
    --bg-size: auto;
  }

  * {
    box-sizing: border-box;
    transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
  }

  button,
  [role="button"],
  input[type="button"],
  input[type="submit"],
  input[type="reset"] {
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    -webkit-user-select: none;
  }

  /* Keyboard focus only — mouse clicks stay clean via :focus-visible */
  :focus {
    outline: none;
  }

  :focus:not(:focus-visible) {
    outline: none;
    box-shadow: none;
  }

  a:focus-visible,
  button:focus-visible,
  [role="button"]:focus-visible,
  summary:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible,
  [tabindex]:not([tabindex="-1"]):focus-visible {
    outline: 2px solid var(--neon-cyan);
    outline-offset: 3px;
  }

  [data-theme='professional'] a:focus-visible,
  [data-theme='professional'] button:focus-visible,
  [data-theme='professional'] [role="button"]:focus-visible,
  [data-theme='professional'] summary:focus-visible,
  [data-theme='professional'] input:focus-visible,
  [data-theme='professional'] select:focus-visible,
  [data-theme='professional'] textarea:focus-visible,
  [data-theme='professional'] [tabindex]:not([tabindex="-1"]):focus-visible,
  [data-theme='modern'] a:focus-visible,
  [data-theme='modern'] button:focus-visible,
  [data-theme='modern'] [role="button"]:focus-visible,
  [data-theme='modern'] summary:focus-visible,
  [data-theme='modern'] input:focus-visible,
  [data-theme='modern'] select:focus-visible,
  [data-theme='modern'] textarea:focus-visible,
  [data-theme='modern'] [tabindex]:not([tabindex="-1"]):focus-visible {
    outline: 2px solid var(--neon-cyan);
    outline-offset: 3px;
    box-shadow: 0 0 0 4px rgba(255, 138, 61, 0.25);
  }

  [data-theme='cyberpunk'] a:focus-visible,
  [data-theme='cyberpunk'] button:focus-visible,
  [data-theme='cyberpunk'] [role="button"]:focus-visible,
  [data-theme='cyberpunk'] summary:focus-visible,
  [data-theme='cyberpunk'] [tabindex]:not([tabindex="-1"]):focus-visible {
    outline: 2px solid var(--neon-cyan);
    outline-offset: 3px;
    box-shadow: 0 0 12px rgba(0, 243, 255, 0.55);
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }
  }

  [data-theme='professional'] input::placeholder,
  [data-theme='professional'] textarea::placeholder {
    color: var(--text-dim);
    opacity: 1;
  }

  body {
    margin: 0;
    padding: 0;
    background-color: var(--bg-color);
    color: var(--text-main);
    font-family: var(--font-main);
    background-image: var(--bg-image);
    background-size: var(--bg-size);
    line-height: 1.5;
  }

  h1, h2, h3, h4, h5, h6 {
    text-transform: var(--text-transform);
    letter-spacing: var(--letter-spacing);
    margin: 0 0 8px 0;
  }

  [data-theme='professional'] h1,
  [data-theme='professional'] h2,
  [data-theme='professional'] h3,
  [data-theme='professional'] h4,
  [data-theme='professional'] h5,
  [data-theme='professional'] h6,
  [data-theme='modern'] h1,
  [data-theme='modern'] h2,
  [data-theme='modern'] h3,
  [data-theme='modern'] h4,
  [data-theme='modern'] h5,
  [data-theme='modern'] h6 {
    color: var(--text-main);
    font-weight: 700;
    letter-spacing: -0.015em;
  }

  a {
    color: var(--neon-cyan);
    text-decoration: none;
    transition: all var(--transition-speed);

    &:hover {
      color: var(--neon-pink);
      text-shadow: 0 0 5px var(--neon-pink);
    }
  }

  [data-theme='professional'] a,
  [data-theme='modern'] a {
    color: var(--neon-cyan);
    text-shadow: none;

    &:hover {
      color: var(--accent-hover);
      text-shadow: none;
      text-decoration: underline;
    }
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: var(--bg-color);
  }
  ::-webkit-scrollbar-thumb {
    background: var(--neon-cyan);
    border-radius: 4px;
  }

  [data-theme='professional'] ::-webkit-scrollbar-thumb,
  [data-theme='modern'] ::-webkit-scrollbar-thumb {
     background: var(--border-strong);
     border-radius: 4px;
     &:hover {
       background: #94a3b8;
     }
  }

  [data-theme='professional'] ::selection,
  [data-theme='modern'] ::selection {
    background: rgba(255, 138, 61, 0.15);
    color: var(--text-main);
  }
`;
