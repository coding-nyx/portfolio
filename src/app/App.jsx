import '../shared/ui/sections.css';
import '../shared/ui/dialog.css';
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
import ProjectBanner from '../features/projects/ProjectBanner.jsx';
import SkillsSection from '../features/skills/SkillsSection.jsx';
import AchievementsSection from '../features/achievements/AchievementsSection.jsx';
import PersonalSection from '../features/personal/PersonalSection.jsx';
import ContactSection from '../features/contact/ContactSection.jsx';
import RookFeature from '../features/rook/RookFeature.jsx';
import SiteNavigation from './navigation/SiteNavigation.jsx';
import Chapter from './Chapter.jsx';
import { navigateToChapter } from './navigation/chapterNavigation.js';
import SiteFooter from './SiteFooter.jsx';
import usePortfolioAnalytics from './usePortfolioAnalytics.js';
import usePortfolioEngagement from './usePortfolioEngagement.js';
import { trackFootfallEvent } from '../services/footfallAnalytics.js';
import './afterHours.css';
import './sectionTheme.css';
import './typography.css';
import './responsive.css';
import '../features/projects/projectPalette.css';
import EmberField from '../shared/ui/EmberField.jsx';

export default function App() {
  const [rookOpen, setRookOpen] = useState(false);
  const [rookRequested, setRookRequested] = useState(false);
  const askOpener = useRef(null);
  const { theme } = useTheme();
  const resumeUrl = theme === 'cyberpunk' ? '/resume-cyberpunk.pdf' : '/resume-modern.pdf';

  useEffect(() => scheduleVisitAnalytics(), []);
  usePortfolioAnalytics();
  usePortfolioEngagement(rookOpen);

  const openRook = (element) => {
    if (!rookOpen) trackFootfallEvent('rook_open', { entry_point: 'navigation' });
    askOpener.current = element;
    setRookRequested(true);
    setRookOpen(true);
  };

  return (
    <>
      <GlobalStyle />
      <div className="after-hours">
        <EmberField />
        <SkipLink />
        <CyberpunkOverlay />
        <SiteNavigation resumeUrl={resumeUrl} askOpen={rookOpen} onAsk={openRook} />
        <main id="main-content" tabIndex={-1}>
          <Chapter id="entry" full>
            <HeroSection resumeUrl={resumeUrl} />
          </Chapter>
          <Chapter id="bio" number="02" label="The person behind the work">
            <BioSection />
          </Chapter>
          <Chapter id="experience" number="03" label="Professional work">
            <ExperienceSection />
          </Chapter>
          <Chapter id="projects" className="study-project-chapter">
            <ProjectBanner />
            <div className="study-project-content">
              <ProjectsSection />
            </div>
          </Chapter>
          <Chapter id="skills" number="05" label="The working toolkit">
            <SkillsSection />
          </Chapter>
          <Chapter id="achievements" number="06" label="Learning along the way">
            <AchievementsSection />
          </Chapter>
          <Chapter id="resume" number="07" label="The concise version">
            <ResumeSection resumeUrl={resumeUrl} />
          </Chapter>
          <Chapter id="personal" number="08" label="Away from the keyboard">
            <PersonalSection />
          </Chapter>
          <Chapter id="contact" number="09" label="Start a conversation">
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
          onOpenResume={() => {
            trackFootfallEvent('resume_open', { entry_point: 'rook' });
            window.open(resumeUrl, '_blank');
          }}
        />
        <SiteFooter />
      </div>
    </>
  );
}
