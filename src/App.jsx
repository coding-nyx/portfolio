import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { GlobalStyle } from './styles/GlobalStyle';
import { useTheme } from './context/ThemeContext';
import Hero from './components/Hero';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Achievements from './components/Achievements';
import Interests from './components/Interests';
import Contact from './components/Contact';
import BootSequence from './components/BootSequence';
import Certifications from './components/Certifications';
import Awards from './components/Awards';
import SystemAlert from './components/SystemAlert';
import { logSystemLogin } from './firebase';
import BackToTop from './components/common/BackToTop';
import CyberpunkOverlay from './components/effects/CyberpunkOverlay';
import ThemeSwitcher from './components/common/ThemeSwitcher';
import MobileNav from './components/common/MobileNav';
import SkipLink from './components/common/SkipLink';
import IOSSandbox from './components/sandbox/IOSSandbox';
import RookAgentModal from './components/agent/RookAgentModal';

const MainWrapper = styled.div`
  min-height: 100vh;
  position: relative;
  /* Ensure centering on ultra-wide screens */
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const BentoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--grid-gap);
  padding: 20px;
  width: 100%;
  max-width: 1400px;
  /* Margin auto is good, but flex center on parent is safer for some browsers */
  margin: 0 auto;
  flex: 1;
  padding-bottom: 50px;

  @media (max-width: 768px) {
    padding-bottom: 100px; /* Extra padding for mobile nav */
  }

  /* Mobile Layout */
  grid-template-areas:
    "H"
    "J"
    "E"
    "B"
    "S"
    "L"
    "A"
    "W"
    "I"
    "C";

  /* Tablet Layout */
  @media (min-width: 700px) and (max-width: 1100px) {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "H H"
      "J J"
      "E E"
      "B B"
      "S S"
      "L L"
      "A W"
      "I I"
      "C C";
  }

  /* Desktop Layout */
  @media (min-width: 1101px) {
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: min-content;

    grid-template-areas:
      "H H H H"
      "J J E E"
      "B B B B"
      "S S S S"
      "L L A W"
      "I I I I"
      "C C C C";
  }
`;

// Wrappers to assign grid areas
const HeroArea = styled.div` grid-area: H; `;
const SkillsArea = styled.div` grid-area: S; `;
const ExperienceArea = styled.div` grid-area: E; `;
const ProjectsArea = styled.div` grid-area: J; `;
const SandboxArea = styled.div` grid-area: B; `;
const AchievementsArea = styled.div` grid-area: A; `;
const InterestsArea = styled.div` grid-area: I; `;
const ContactArea = styled.div` grid-area: C; `;
const CertificationsArea = styled.div` grid-area: L; `;
const AwardsArea = styled.div` grid-area: W; `;

function App() {
  const [bootComplete, setBootComplete] = useState(true);
  const [rookPrompt, setRookPrompt] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (bootComplete) {
      logSystemLogin();
    }
  }, [bootComplete]);

  // Apply theme to body via data-attribute
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
      <GlobalStyle />
      {!bootComplete && <BootSequence onComplete={() => setBootComplete(true)} />}

      {bootComplete && (
        <MainWrapper>
          <SkipLink />
          <CyberpunkOverlay />
          <SystemAlert onOpenRook={(prompt) => setRookPrompt(prompt || "Tell me about Raj, his background, and his work")} />
          <BentoGrid id="main-content">
            <HeroArea><Hero onAskRook={(prompt) => setRookPrompt(prompt)} /></HeroArea>
            <ProjectsArea><Projects /></ProjectsArea>
            <ExperienceArea><Experience /></ExperienceArea>
            <SandboxArea><IOSSandbox /></SandboxArea>
            <SkillsArea><Skills /></SkillsArea>
            <CertificationsArea><Certifications /></CertificationsArea>
            <AchievementsArea><Achievements /></AchievementsArea>
            <AwardsArea><Awards /></AwardsArea>
            <InterestsArea><Interests /></InterestsArea>
            <ContactArea><Contact onOpenRook={(prompt) => setRookPrompt(prompt)} /></ContactArea>
          </BentoGrid>
          <BackToTop />
          <MobileNav />
          <RookAgentModal
            externalPrompt={rookPrompt}
            onClearExternalPrompt={() => setRookPrompt(null)}
            onOpenResume={() => window.open(theme === 'cyberpunk' ? '/resume-cyberpunk.pdf' : '/resume-modern.pdf', '_blank')}
          />
          <div style={{textAlign: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '0.8rem', position: 'relative', zIndex: 10, width: '100%'}}>
            <ThemeSwitcher />
            <br/>
            SYSTEM STATUS: ONLINE | © {new Date().getFullYear()} RAJ KUMAR S
          </div>
        </MainWrapper>
      )}
    </>
  )
}

export default App
