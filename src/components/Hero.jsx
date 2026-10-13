import { publicText } from '../utils/publicText';
import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import PixelCard from './common/PixelCard';
import { profileData } from '../data/portfolio';
import { FaLinkedin, FaEnvelope, FaGamepad, FaFileAlt, FaDownload } from 'react-icons/fa';
import ThemedIcon from './common/ThemedIcon';
import GlitchText from './effects/GlitchText';
import Modal from './common/Modal';
import { useTheme } from '../context/ThemeContext';
import VirtualShell from './terminal/VirtualShell';

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  height: 100%;

  @media (min-width: 900px) {
    flex-direction: row;
    align-items: center;
    padding: 24px;
  }
`;

const ProfileSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  @media (min-width: 900px) {
    border-right: 1px solid rgba(0, 243, 255, 0.2);
    padding-right: 32px;
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    border-right-color: var(--border-color);
  }
`;

const InfoSection = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Avatar = styled.img`
  width: 180px;
  height: 180px;
  border: 4px solid var(--neon-cyan);
  filter: grayscale(100%) contrast(1.2);
  object-fit: cover;
  box-shadow: 10px 10px 0 rgba(0, 243, 255, 0.2);
  transition: all 0.3s;

  &:hover {
    filter: grayscale(0%) contrast(1);
    transform: translate(-5px, -5px);
    box-shadow: 15px 15px 0 var(--neon-pink);
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    border: 3px solid var(--card-bg);
    border-radius: 50%;
    filter: none;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1), 0 0 0 1px var(--border-color);

    &:hover {
      transform: scale(1.02);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12), 0 0 0 1px var(--border-strong);
    }
  }
`;

const GlitchName = styled.h1`
  font-size: 3rem;
  color: var(--neon-pink);
  text-shadow: 3px 3px var(--neon-cyan);
  margin: 24px 0 4px 0;
  text-transform: uppercase;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: var(--text-main);
    text-shadow: none;
    text-transform: none;
    font-weight: 700;
  }
`;

const Role = styled.h2`
  font-size: 1.2rem;
  color: var(--neon-green);
  background: rgba(80, 250, 123, 0.1);
  padding: 4px 8px;
  border-left: 3px solid var(--neon-green);

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: var(--text-dim);
    background: transparent;
    border-left: none;
    padding: 0;
    font-weight: 500;
  }
`;

const TerminalBox = styled.div`
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid var(--text-dim);
  padding: 16px;
  font-family: 'Courier New', monospace;
  position: relative;
  min-height: 150px;

  &::before {
    content: "guest@portfolio:~$ cat bio.txt";
    display: block;
    color: var(--neon-pink);
    border-bottom: 1px solid var(--text-dim);
    padding-bottom: 8px;
    margin-bottom: 8px;
    font-size: 0.9rem;
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: transparent;
    border: none;
    font-family: var(--font-main);
    padding: 0;
    min-height: auto;

    &::before {
      display: none;
    }
  }
`;

const TypingText = styled.p`
  color: var(--text-main);
  line-height: 1.6;
  margin: 0;
  /* Keep words intact — no mid-word chopping */
  overflow-wrap: break-word;
  word-break: normal;
  hyphens: none;
  white-space: normal;
`;

const Socials = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 24px;
  justify-content: center;
  flex-wrap: wrap; /* Ensure buttons wrap on mobile */

  @media (min-width: 900px) {
    justify-content: flex-start;
  }
`;

const SocialBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 8px;
  background: rgba(0, 243, 255, 0.1);
  border: 1px solid var(--neon-cyan);
  color: var(--neon-cyan);
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  font-family: inherit; /* Ensure buttons inherit font */

  &:hover {
    background: var(--neon-cyan);
    color: #000;
    box-shadow: 0 0 10px var(--neon-cyan);
  }

  &:focus-visible {
    outline: 2px solid var(--neon-cyan);
    outline-offset: 3px;
    box-shadow: 0 0 12px rgba(0, 243, 255, 0.55);
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    color: var(--text-main);
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    &:hover {
      background: var(--neon-cyan);
      color: var(--on-accent);
      border-color: var(--neon-cyan);
      box-shadow: 0 4px 6px -1px rgba(255, 138, 61, 0.2);
    }

    &:focus-visible {
      outline: 2px solid var(--neon-cyan);
      outline-offset: 3px;
      box-shadow: 0 0 0 4px rgba(255, 138, 61, 0.25);
    }
  }
`;

const IframeWrapper = styled.div`
  width: 100%;
  height: 60vh;
  min-height: 400px;
  background: #f0f0f0;
  border: 1px solid var(--text-dim);
  margin-bottom: 24px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  [data-theme='cyberpunk'] & {
    border: 1px solid var(--neon-cyan);
    box-shadow: 0 0 10px rgba(0, 243, 255, 0.2);
  }
`;

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  opacity: ${props => props.$loading ? 0 : 1};
  transition: opacity 0.3s;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  position: absolute;
  border: 4px solid rgba(0, 243, 255, 0.1);
  border-top: 4px solid var(--neon-cyan);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    border: 4px solid rgba(0, 0, 0, 0.08);
    border-top: 4px solid var(--neon-cyan);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  margin-top: auto;
  justify-content: center;
  flex-wrap: wrap;
`;

const ModalBtn = styled(SocialBtn)`
  text-decoration: none;
  min-width: 150px;
  justify-content: center;
`;

const Hero = ({ onAskRook }) => {
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const bioText = publicText(profileData.summary);
  const { theme } = useTheme();

  // Determine resume file based on theme (cyberpunk vs professional)
  const resumeUrl = theme === 'cyberpunk' ? '/resume-cyberpunk.pdf' : '/resume-modern.pdf';
  const resumeTitle = theme === 'cyberpunk' ? 'IDENTITY FILE DETECTED' : 'Resume Preview';

  // Handle open resume to reset loading state
  const handleOpenResume = () => {
    setIframeLoading(true);
    setIsResumeOpen(true);
  };

  return (
    <>
      <PixelCard>
        <HeroContent>
          <ProfileSection>
            <Avatar src={profileData.profileImage || "https://ui-avatars.com/api/?name=Raj+Kumar+S&background=0a0a1a&color=00f3ff&size=150"} alt="Avatar" />
            <GlitchName>{profileData.name}</GlitchName>
            <Role>{profileData.headline}</Role>
            <p style={{color: 'var(--text-dim)', marginTop: '8px'}}>{profileData.location}</p>
          </ProfileSection>

          <InfoSection>
            {theme === 'cyberpunk' ? (
              <VirtualShell
                onOpenResume={handleOpenResume}
                onAskRook={onAskRook}
              />
            ) : (
              <TerminalBox>
                <TypingText>{bioText}</TypingText>
              </TerminalBox>
            )}

            <Socials>
              <SocialBtn
                href={profileData.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit LinkedIn Profile"
              >
                <ThemedIcon ascii="" icon={<FaLinkedin size={16} />} />
                <GlitchText text="Professional" />
              </SocialBtn>

              <SocialBtn
                as="button"
                type="button"
                onClick={handleOpenResume}
                aria-label="View Resume"
              >
                <ThemedIcon ascii="" icon={<FaFileAlt size={16} />} />
                <GlitchText text={theme === 'cyberpunk' ? "Identity File" : "Resume"} />
              </SocialBtn>

              <SocialBtn href={`mailto:${profileData.socialLinks.email}`} aria-label="Send Email">
                <ThemedIcon ascii="" icon={<FaEnvelope size={16} />} />
                <GlitchText text="Informal" />
              </SocialBtn>

              <SocialBtn
                as="button"
                type="button"
                onClick={() => document.getElementById('contact-section')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
                aria-label="Contact for Fun"
              >
                <ThemedIcon ascii="" icon={<FaGamepad size={16} />} />
                <GlitchText text="Say Hello" />
              </SocialBtn>
            </Socials>
          </InfoSection>
        </HeroContent>
      </PixelCard>

      <Modal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
        title={resumeTitle}
      >
        <IframeWrapper>
          {iframeLoading && <Spinner />}
          <StyledIframe
            src={`${resumeUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            title="Resume Preview"
            onLoad={() => setIframeLoading(false)}
            $loading={iframeLoading}
          />
        </IframeWrapper>

        <ActionButtons>
          <ModalBtn href={resumeUrl} download>
            <FaDownload /> Download PDF
          </ModalBtn>
        </ActionButtons>
      </Modal>
    </>
  );
};

export default Hero;
