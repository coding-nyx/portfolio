import './profile.css';
import { useState } from 'react';
import { experienceData, profileData } from '../../data/portfolio.js';
import SpringAction from '../../shared/ui/SpringAction.jsx';
import NextChapter from '../../shared/ui/NextChapter.jsx';

export default function ResumeSection({ resumeUrl }) {
  const [preview, setPreview] = useState(false);
  const role = experienceData[0];
  return (
    <div className="port-section resume-c" data-design="Resume C">
      <h2 id="h-resume" tabIndex={-1}>
        Resume
      </h2>
      <div className="resume-grid">
        <div className="resume-overview">
          <p className="port-eyebrow">Native UI · Product engineering</p>
          <h3>{role.role}</h3>
          <p>{profileData.resumeSummary}</p>
          <p className="port-meta">{role.company} · Since May 2022</p>
        </div>
        <aside className="resume-download">
          <SpringAction as="a" className="resume-download-button" href={resumeUrl} download>
            <span aria-hidden="true">↓</span>
            <span>
              <b>Download resume</b>
              <small>PDF · Updated November 2026</small>
            </span>
          </SpringAction>
          <SpringAction
            className="port-button secondary"
            aria-expanded={preview}
            aria-controls={preview ? 'resume-preview' : undefined}
            onClick={() => setPreview(!preview)}
          >
            {preview ? 'Hide' : 'Show'} preview
          </SpringAction>
          {preview && (
            <img
              id="resume-preview"
              src="/resume-preview.png"
              width="595"
              height="842"
              alt="Preview of Raj’s one-page résumé"
            />
          )}
          <a href={resumeUrl} target="_blank" rel="noreferrer">
            Open PDF ↗
          </a>
        </aside>
      </div>
      <NextChapter id="personal">Off the clock</NextChapter>
    </div>
  );
}
