import '../shared/ui/sections.css';
import '../shared/ui/dialog.css';
import './app.css';
import { useEffect, useRef, useState } from 'react';
import { GlobalStyle } from '../shared/theme/GlobalStyle.js';
import { useTheme } from '../shared/theme/useTheme.js';
import CyberpunkOverlay from '../shared/theme/CyberpunkOverlay.jsx';
import SkipLink from '../shared/ui/SkipLink.jsx';
import { scheduleVisitAnalytics } from '../services/analytics.js';
import HeroSection from '../features/profile/HeroSection.jsx';
import BioSection from '../features/profile/BioSection.jsx';
import ResumeSection from '../features/profile/ResumeSection.jsx';
import ExperienceSection from '../features/experience/ExperienceSection.jsx';
import ProjectsSection from '../features/projects/ProjectsSection.jsx';
import SkillsSection from '../features/skills/SkillsSection.jsx';
import AchievementsSection from '../features/achievements/AchievementsSection.jsx';
import PersonalSection from '../features/personal/PersonalSection.jsx';
import ContactSection from '../features/contact/ContactSection.jsx';
import RookFeature from '../features/rook/RookFeature.jsx';
import SiteNavigation from './navigation/SiteNavigation.jsx';
import Chapter from './Chapter.jsx';
import { navigateToChapter } from './navigation/chapterNavigation.js';
import SiteFooter from './SiteFooter.jsx';

export default function App() {
  const [rookOpen, setRookOpen] = useState(false);
  const [rookRequested, setRookRequested] = useState(false);
  const askOpener = useRef(null);
  const { theme } = useTheme();
  const resumeUrl = theme === 'cyberpunk' ? '/resume-cyberpunk.pdf' : '/resume-modern.pdf';

  useEffect(() => scheduleVisitAnalytics(), []);

  const openRook = (element) => {
    askOpener.current = element;
    setRookRequested(true);
    setRookOpen(true);
  };

  return (
    <>
      <GlobalStyle />
      <div className="portfolio-app">
        <SkipLink />
        <CyberpunkOverlay />
        <SiteNavigation resumeUrl={resumeUrl} askOpen={rookOpen} onAsk={openRook} />
        <main className="portfolio-chapters" id="main-content" tabIndex={-1}>
          <Chapter id="entry" full>
            <HeroSection resumeUrl={resumeUrl} />
          </Chapter>
          <Chapter id="bio">
            <BioSection />
          </Chapter>
          <Chapter id="experience">
            <ExperienceSection />
          </Chapter>
          <Chapter id="projects">
            <ProjectsSection />
          </Chapter>
          <Chapter id="skills">
            <SkillsSection />
          </Chapter>
          <Chapter id="achievements">
            <AchievementsSection />
          </Chapter>
          <Chapter id="resume">
            <ResumeSection resumeUrl={resumeUrl} />
          </Chapter>
          <Chapter id="personal">
            <PersonalSection />
          </Chapter>
          <Chapter id="contact">
            <ContactSection />
          </Chapter>
        </main>
        <RookFeature
          requested={rookRequested}
          open={rookOpen}
          onOpenChange={setRookOpen}
          returnFocusRef={askOpener}
          onNavigate={(id) => {
            setRookOpen(false);
            navigateToChapter(id);
          }}
          onOpenResume={() => window.open(resumeUrl, '_blank')}
        />
        <SiteFooter />
      </div>
    </>
  );
}
