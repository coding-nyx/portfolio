import { useState, useEffect, useRef } from 'react';
import { MotionConfig, useReducedMotion } from 'framer-motion';
import styled from 'styled-components';
import { GlobalStyle } from './styles/GlobalStyle';
import { useTheme } from './context/ThemeContext';
import EntryHero from './components/EntryHero';
import BootSequence from './components/BootSequence';
import { logSystemLogin } from './firebase';
import CyberpunkOverlay from './components/effects/CyberpunkOverlay';
import SkipLink from './components/common/SkipLink';
import RookAgentModal from './components/agent/RookAgentModal';
import NavA from './components/nav/NavA';
import { chapterLabel } from './data/chapters';
import { BioB, ExperienceD, ProjectsG3v2, SkillsAD, AchievementsC, ResumeC, ContactD } from './components/chapters/PortfolioChapters';

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

const Chapter = ({ id, children, full }) => (
  <section id={id} className={full ? 'chapter full' : 'chapter'} aria-labelledby={`h-${id}`}>
    {id !== 'entry' && <p className="chl" id={`h-${id}`} tabIndex={-1}>{chapterLabel(id)}</p>}
    {children}
  </section>
);

function App() {
  const reduceMotion = useReducedMotion();
  const [bootComplete, setBootComplete] = useState(false);
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


  return (
    <MotionConfig reducedMotion="user" transition={reduceMotion ? { duration: 0 } : undefined}>
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
            <Chapter id="bio"><BioB resumeUrl={resumeUrl} /></Chapter>
            <Chapter id="experience"><ExperienceD /></Chapter>
            <Chapter id="projects"><ProjectsG3v2 /></Chapter>
            <Chapter id="skills"><SkillsAD /></Chapter>
            <Chapter id="achievements"><AchievementsC /></Chapter>
            <Chapter id="resume"><ResumeC resumeUrl={resumeUrl} /></Chapter>
            <Chapter id="contact"><ContactD /></Chapter>
          </Chapters>
          <RookAgentModal
            open={rookOpen}
            onOpenChange={setRookOpen}
            returnFocusRef={askOpener}
            onOpenResume={() => window.open(resumeUrl, '_blank')}
          />
          <footer style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)', fontSize: '0.8rem', position: 'relative', zIndex: 10, width: '100%' }}>
            © {new Date().getFullYear()} RAJ KUMAR S
          </footer>
        </MainWrapper>
      )}
    </MotionConfig>
  );
}

export default App;
