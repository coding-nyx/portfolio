import './achievements.css';
import { awardsData, certificationsData } from '../../data/portfolio.js';
import { publicText } from '../../utils/publicText.js';
import NextChapter from '../../shared/ui/NextChapter.jsx';
import ExternalLink from '../../shared/ui/ExternalLink.jsx';
import { splitCertifications } from './splitCertifications.js';

function CertificationCard({ item }) {
  return (
    <article className="proof-card">
      <h3>{item.name}</h3>
      <p className="port-meta">
        {item.issuer} · {item.date}
      </p>
      {item.credentialUrl ? (
        <ExternalLink href={item.credentialUrl}>View credential ↗</ExternalLink>
      ) : (
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
        Professional milestones
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
              <CertificationCard key={item.name} item={item} />
            ))}
          </div>
        </div>
      ) : null}
      {older.length > 0 ? (
        <details className="older-certs">
          <summary>
            Older certifications (2020) <span>{older.length} records</span>
          </summary>
          <div className="proof-grid">
            {older.map((item) => (
              <CertificationCard key={item.name} item={item} />
            ))}
          </div>
        </details>
      ) : null}
      <NextChapter id="resume">Resume</NextChapter>
    </div>
  );
}
