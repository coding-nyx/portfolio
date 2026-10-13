import styled from 'styled-components';
import PixelCard from './common/PixelCard';
import { certificationsData } from '../data/portfolio';
import { FaExternalLinkAlt } from 'react-icons/fa';

const Details = styled.details`
  width: 100%;
  padding: 4px;

  summary {
    cursor: pointer;
    list-style: none;
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--neon-cyan);
    padding: 8px 8px;
    border: 1px solid var(--text-dim);
    background: rgba(0, 0, 0, 0.25);
    display: flex;
    align-items: center;
    gap: 8px;
    user-select: none;

    &::-webkit-details-marker {
      display: none;
    }

    &::before {
      content: '▸';
      display: inline-block;
      transition: transform 0.15s ease;
    }

    [data-theme='professional'] &,
    [data-theme='modern'] & {
      color: var(--text-main);
      background: var(--surface-raised);
      border: 1px solid var(--border-color);
      border-radius: 8px;
    }
  }

  &[open] summary::before {
    transform: rotate(90deg);
  }

  &[open] summary {
    margin-bottom: 12px;
  }
`;

const CertList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  padding: 4px;
`;

const CertCard = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--text-dim);
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

    &:hover {
      border-color: var(--accent-hover);
      box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }
  }

  [data-theme='cyberpunk'] &:hover {
    border-color: var(--neon-cyan);
    box-shadow: 2px 2px 0 var(--neon-pink);
    transform: translate(-1px, -1px);
  }
`;

const CertHeader = styled.div`
  margin-bottom: 8px;
`;

const CertName = styled.h4`
  color: var(--neon-cyan);
  font-size: 0.88rem;
  margin: 0 0 8px 0;
  line-height: 1.35;
  font-weight: 600;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: var(--text-main);
  }
`;

const IssuerTag = styled.span`
  font-size: 0.72rem;
  background: rgba(0, 243, 255, 0.1);
  color: var(--neon-cyan);
  padding: 4px 8px;
  display: inline-block;
  font-weight: 600;

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    background: var(--surface-raised);
    color: var(--text-dim);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-weight: 500;
  }
`;

const CertFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--border-color);
  font-size: 0.76rem;
  color: var(--text-dim);

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    border-top: 1px solid var(--surface-raised);
  }
`;

const CredentialLink = styled.a`
  color: var(--neon-pink);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  font-size: 0.76rem;
  font-weight: 600;

  &:hover {
    color: var(--neon-yellow);
  }

  [data-theme='professional'] &,
  [data-theme='modern'] & {
    color: var(--neon-cyan);

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Certifications = () => {
  const olderCerts = certificationsData.filter(c => c.older === true);
  const items = olderCerts.length > 0 ? olderCerts : certificationsData;

  return (
    <PixelCard title="Certifications">
      <Details>
        <summary>Older certifications (2020)</summary>
        <CertList>
          {items.map((cert, idx) => (
            <CertCard key={idx}>
              <div>
                <CertHeader>
                  <IssuerTag>{cert.issuer}</IssuerTag>
                </CertHeader>
                <CertName>{cert.name}</CertName>
              </div>
              <CertFooter>
                <span>{cert.date}</span>
                {cert.credentialUrl ? (
                  <CredentialLink href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
                    Verify <FaExternalLinkAlt size={9} />
                  </CredentialLink>
                ) : (
                  <span>Certificate</span>
                )}
              </CertFooter>
            </CertCard>
          ))}
        </CertList>
      </Details>
    </PixelCard>
  );
};

export default Certifications;
