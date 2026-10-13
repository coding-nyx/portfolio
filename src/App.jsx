import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { GlobalStyle } from './styles/GlobalStyle';
import { useTheme } from './context/ThemeContext';
import Hero from './components/Hero';
import EntryHero from './components/EntryHero';
import Skills from './components/Skills';
import Experience from './components/Experience';
import { FeaturedProjects, OtherProjects } from './components/Projects';
import Achievements from './components/Achievements';
import Interests from './components/Interests';
import Contact from './components/Contact';
import BootSequence from './components/BootSequence';
import Certifications from './components/Certifications';
import Awards from './components/Awards';
import Testimonials from './components/Testimonials';
import { logSystemLogin } from './firebase';
import BackToTop from './components/common/BackToTop';
import CyberpunkOverlay from './components/effects/CyberpunkOverlay';
import ThemeSwitcher from './components/common/ThemeSwitcher';
import SkipLink from './components/common/SkipLink';
import IOSSandbox from './components/sandbox/IOSSandbox';
import RookAgentModal from './components/agent/RookAgentModal';
import NavA from './components/nav/NavA';
import { chapterLabel } from './data/chapters';

const MainWrapper = styled.div`
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding-top: var(--navh);
`;

// Chapters stack in the locked order (scope 2026-10-13). Spacing scale 12/16/24/32.
const Chapters = styled.main`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;

  @media (max-width: 700px) {
    padding: 0 12px 24px;
    gap: 24px;
  }
`;

const Group = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  align-items: start;

  @media (min-width: 1101px) {
    grid-template-columns: ${({ $cols }) => $cols || '1fr'};
  }
`;

const Chapter = ({ id, children, full }) => (
  <section id={id} className={full ? 'chapter full' : 'chapter'} aria-labelledby={`h-${id}`}>
    {id !== 'entry' && <p className="chl" id={`h-${id}`} tabIndex={-1}>{chapterLabel(id)}</p>}
    {children}
  </section>
);

const ResumeCard = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  padding: 24px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background: var(--card-bg);

  a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0 16px;
    border-radius: 999px;
    border: 1px solid var(--neon-cyan);
    color: var(--neon-cyan);
    text-decoration: none;
    font-weight: 600;
  }
  p { margin: 0; flex: 1 1 240px; color: var(--text-main); }
`;

function App() {
  const [bootComplete, setBootComplete] = useState(false);
  const [rookPrompt, setRookPrompt] = useState(null);
  const [rookOpen, setRookOpen] = useState(false);
  const askOpener = useRef(null);
  const { theme } = useTheme();
  const resumeUrl = theme === 'cyberpunk' ? '/resume-cyberpunk.pdf' : '/resume-modern.pdf';

  useEffect(() => {
    if (bootComplete) logSystemLogin();
  }, [bootComplete]);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const askRook = (prompt) => setRookPrompt(prompt);

  return (
    <>
      <GlobalStyle />
      {!bootComplete && <BootSequence onComplete={() => setBootComplete(true)} />}

      {bootComplete && (
        <MainWrapper>
          <SkipLink />
          <CyberpunkOverlay />
          <NavA
            resumeUrl={resumeUrl}
            askOpen={rookOpen}
            onAsk={(el) => { askOpener.current = el; setRookOpen(true); }}
          />
          <Chapters id="main-content">
            <Chapter id="entry" full><EntryHero resumeUrl={resumeUrl} /></Chapter>
            <Chapter id="bio">
              <Group $cols="3fr 1fr">
                <Hero onAskRook={askRook} />
                <Interests />
              </Group>
            </Chapter>
            <Chapter id="experience"><Experience /></Chapter>
            <Chapter id="projects">
              <Group>
                <FeaturedProjects />
                <OtherProjects />
                <IOSSandbox />
              </Group>
            </Chapter>
            <Chapter id="skills"><Skills /></Chapter>
            <Chapter id="achievements">
              <Group>
                <Certifications />
                <Group $cols="1fr 1fr">
                  <Achievements />
                  <Awards />
                </Group>
                <Testimonials />
              </Group>
            </Chapter>
            <Chapter id="resume">
              <ResumeCard>
                <p>Resume for Raj Kumar S, iOS engineer at Zoho since May 2022.</p>
                <a href="/resume-modern.pdf" target="_blank" rel="noreferrer">Open resume (PDF)</a>
                <a href="/resume-cyberpunk.pdf" target="_blank" rel="noreferrer">Terminal edition (PDF)</a>
              </ResumeCard>
            </Chapter>
            <Chapter id="contact"><Contact onOpenRook={askRook} /></Chapter>
          </Chapters>
          <BackToTop />
          <RookAgentModal
            open={rookOpen}
            onOpenChange={setRookOpen}
            returnFocusRef={askOpener}
            externalPrompt={rookPrompt}
            onClearExternalPrompt={() => setRookPrompt(null)}
            onOpenResume={() => window.open(resumeUrl, '_blank')}
          />
          <footer style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)', fontSize: '0.8rem', position: 'relative', zIndex: 10, width: '100%' }}>
            <ThemeSwitcher />
            <br />
            © {new Date().getFullYear()} RAJ KUMAR S
          </footer>
        </MainWrapper>
      )}
    </>
  );
}

export default App;
