import './profile.css';
import { useState } from 'react';
import { profileData } from '../../data/portfolio.js';
import SpringAction from '../../shared/ui/SpringAction.jsx';
import NextChapter from '../../shared/ui/NextChapter.jsx';

export default function ResumeSection({ resumeUrl }) {
  const [preview, setPreview] = useState(false);
  return (
    <div className="port-section resume-c" data-design="Resume C">
      <h2 id="h-resume" tabIndex={-1}>
        Resume
      </h2>
      <div className="resume-grid">
        <div className="resume-overview">
          <p className="port-eyebrow">Native UI · Product engineering</p>
          <h3>{profileData.roleTitle}</h3>
          <p>
            A concise overview of my component engineering, performance work, integration tooling
            and selected projects.
          </p>
          <p className="port-meta">Member of Technical Staff at Zoho · Since May 2022</p>
        </div>
        <aside className="resume-download">
          <SpringAction as="a" className="resume-download-button" href={resumeUrl} download>
            <span aria-hidden="true">↓</span>
            <span>
              <b>Download resume</b>
              <small>PDF · Updated October 2026</small>
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
              alt="First page of Raj’s resume"
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
