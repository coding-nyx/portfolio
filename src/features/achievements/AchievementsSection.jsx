import './achievements.css';
import './certificate.css';
import './archive.css';
import { FiAward, FiChevronDown, FiFolder } from 'react-icons/fi';
import { LuFolderOpen } from 'react-icons/lu';
import { awardsData, certificationsData } from '../../data/portfolio.js';
import { publicText } from '../../utils/publicText.js';
import NextChapter from '../../shared/ui/NextChapter.jsx';
import ExternalLink from '../../shared/ui/ExternalLink.jsx';
import MotionDetails from '../../shared/ui/MotionDetails.jsx';
import { splitCertifications } from './splitCertifications.js';

function CertificationCard({ item, current = false }) {
  return (
    <article className={current ? 'proof-card proof-card--current' : 'proof-card'}>
      {current ? (
        <>
          <FiAward className="cert-badge-seal" size={30} aria-hidden="true" />
          <p className="cert-badge-eyebrow">{item.issuer.replace(/\s+\(([^)]+)\)$/, ' · $1')}</p>
          <h4>{item.name}</h4>
        </>
      ) : (
        <h3>{item.name}</h3>
      )}
      <p className="port-meta">
        {current ? `Issued ${item.date}` : `${item.issuer} · ${item.date}`}
      </p>
      {item.credentialUrl ? (
        <ExternalLink
          href={item.credentialUrl}
          aria-label={current ? `View credential: ${item.name} (opens in a new tab)` : undefined}
        >
          View credential ↗
        </ExternalLink>
      ) : current ? null : (
        <span className="port-meta">Certificate</span>
      )}
    </article>
  );
}

export default function AchievementsSection() {
  const milestones = [
    ...awardsData.map((item) => ({
      title: item.name,
      kind: 'Participation',
      proof: item.issuer,
      date: item.date,
      description: item.description,
    })),
  ];
  const { current, older } = splitCertifications(certificationsData);
  return (
    <div className="port-section achievements-c" data-design="Achievements C">
      <h2 id="h-achievements" tabIndex={-1}>
        Milestones
      </h2>
      <p className="port-meta">Hackathon participation and continued learning.</p>
      <div className="achievement-featured">
        {milestones.map((item) => (
          <article className="achievement-card" key={item.title}>
            <span className="port-meta">{item.kind}</span>
            <strong>{item.title}</strong>
            <span>
              {item.proof} · {item.date}
            </span>
            <p>{publicText(item.description)}</p>
          </article>
        ))}
      </div>
      {current.length > 0 ? (
        <div className="current-certs">
          <h3>Certifications</h3>
          <div className="proof-grid">
            {current.map((item) => (
              <CertificationCard key={item.name} item={item} current />
            ))}
          </div>
        </div>
      ) : null}
      {older.length > 0 ? (
        <MotionDetails className="older-certs cert-archive">
          <summary className="cert-archive-summary">
            <span className="cert-archive-icon" aria-hidden="true">
              <FiFolder className="cert-archive-closed-icon" />
              <LuFolderOpen className="cert-archive-open-icon" />
            </span>
            <span className="cert-archive-title">
              <strong>Older certifications</strong>
              <span className="cert-archive-meta">
                <span>2020</span>
                <span>{older.length} records</span>
              </span>
            </span>
            <span className="cert-archive-action">
              <span className="cert-archive-show">Show records</span>
              <span className="cert-archive-hide">Hide records</span>
              <FiChevronDown aria-hidden="true" />
            </span>
          </summary>
          <div className="cert-archive-content">
            <div className="proof-grid">
              {older.map((item) => (
                <CertificationCard key={item.name} item={item} />
              ))}
            </div>
          </div>
        </MotionDetails>
      ) : null}
      <NextChapter id="resume">Resume</NextChapter>
    </div>
  );
}
