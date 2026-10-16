import './achievements.css';
import { awardsData, certificationsData } from '../../data/portfolio.js';
import { publicText } from '../../utils/publicText.js';
import NextChapter from '../../shared/ui/NextChapter.jsx';
import ExternalLink from '../../shared/ui/ExternalLink.jsx';

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
      <details className="older-certs">
        <summary>
          Older certifications (2020) <span>{certificationsData.length} records</span>
        </summary>
        <div className="proof-grid">
          {certificationsData.map((item) => (
            <article className="proof-card" key={item.name}>
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
          ))}
        </div>
      </details>
      <NextChapter id="resume">Resume</NextChapter>
    </div>
  );
}
