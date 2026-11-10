import './achievements.css';
import './badge.css';
import { awardsData, certificationsData } from '../../data/portfolio.js';
import { publicText } from '../../utils/publicText.js';
import NextChapter from '../../shared/ui/NextChapter.jsx';
import ExternalLink from '../../shared/ui/ExternalLink.jsx';
import { splitCertifications } from './splitCertifications.js';

function CertificationCard({ item, current = false }) {
  return (
    <article className={current ? 'proof-card proof-card--current' : 'proof-card'}>
      {current ? (
        <>
          <svg
            className="cert-badge-seal"
            viewBox="0 0 32 32"
            width="30"
            height="30"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M14.49 3.85Q16.00 3.00 17.51 3.85Q19.03 4.70 20.76 4.72Q22.50 4.74 23.39 6.23Q24.27 7.73 25.77 8.61Q27.26 9.50 27.28 11.24Q27.30 12.97 28.15 14.49Q29.00 16.00 28.15 17.51Q27.30 19.03 27.28 20.76Q27.26 22.50 25.77 23.39Q24.27 24.27 23.39 25.77Q22.50 27.26 20.76 27.28Q19.03 27.30 17.51 28.15Q16.00 29.00 14.49 28.15Q12.97 27.30 11.24 27.28Q9.50 27.26 8.61 25.77Q7.73 24.27 6.23 23.39Q4.74 22.50 4.72 20.76Q4.70 19.03 3.85 17.51Q3.00 16.00 3.85 14.49Q4.70 12.97 4.72 11.24Q4.74 9.50 6.23 8.61Q7.73 7.73 8.61 6.23Q9.50 4.74 11.24 4.72Q12.97 4.70 14.49 3.85Z"
              fill="currentColor"
              fillOpacity=".08"
              stroke="currentColor"
              strokeWidth="1.25"
            />
            <path
              d="m10.5 16 3.7 3.7 7.3-7.4"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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
              <CertificationCard key={item.name} item={item} current />
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
