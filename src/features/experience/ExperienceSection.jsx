import './experience.css';
import { careerRange } from './careerTimeline.js';
import { useRef, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { experienceData } from '../../data/portfolio.js';
import { publicText } from '../../utils/publicText.js';
import NextChapter from '../../shared/ui/NextChapter.jsx';

export default function ExperienceSection() {
  const [selected, setSelected] = useState(0);
  const uiDialog = useRef(null),
    uiOpener = useRef(null);
  const role = experienceData[selected];
  const notes =
    role.projects?.filter((item) =>
      [
        'adaptive-navigation-layout',
        'spreadsheet-layout-performance',
        'kanban-column-layout',
      ].includes(item.id),
    ) || [];
  return (
    <div className="port-section experience-d" data-design="Experience D">
      <h2 id="h-experience" tabIndex={-1}>
        Experience
      </h2>
      <p className="career-summary">Zoho · Full-time iOS engineering since May 2022</p>
      <div className="career-grid">
        <div className="career-tracks">
          <div className="career-axis" aria-hidden="true">
            <span>2019</span>
            <span>2021</span>
            <span>2023</span>
            <span>{new Date().getFullYear()}</span>
          </div>
          {experienceData.map((item, index) => (
            <button
              key={item.company + item.dates}
              className="career-bar"
              aria-pressed={selected === index}
              aria-controls="career-detail"
              onClick={() => setSelected(index)}
            >
              <span className="career-label">
                <b>{item.role}</b>
                <small>{item.company}</small>
                <small className="career-dates">{item.dates}</small>
              </span>
              <span className="career-track" aria-hidden="true">
                <span style={careerRange(item)} />
              </span>
            </button>
          ))}
        </div>
        <div className="career-panel" id="career-detail" aria-live="polite">
          <p className="port-eyebrow">{role.dates}</p>
          <h3>{role.role}</h3>
          <p className="port-meta">
            {role.company} · {role.type}
          </p>
          <p>{publicText(role.description)}</p>
          {role.projects && (
            <ul>
              {role.projects
                .filter((item) => !notes.includes(item))
                .map((item) => (
                  <li key={item.name}>
                    <b>{item.name}</b>
                    <p>{publicText(item.desc)}</p>
                    {item.details && (
                      <details className="career-work-details">
                        <summary>
                          How it works <FiChevronDown aria-hidden="true" />
                        </summary>
                        <div className="career-work-explanation">
                          <p>{publicText(item.details.intro)}</p>
                          <ol className="component-workflow">
                            {item.details.steps.map((step) => (
                              <li key={step.title}>
                                <h4>{step.title}</h4>
                                <p>{publicText(step.body)}</p>
                              </li>
                            ))}
                          </ol>
                          <section>
                            <h4>Adding features and new versions</h4>
                            <p>{publicText(item.details.updates)}</p>
                          </section>
                        </div>
                      </details>
                    )}
                  </li>
                ))}
            </ul>
          )}
          {role.uiWork && (
            <button
              className="ui-work-card"
              type="button"
              aria-haspopup="dialog"
              aria-controls="ui-work-dialog"
              onClick={(event) => {
                uiOpener.current = event.currentTarget;
                uiDialog.current.showModal();
              }}
            >
              <span>
                <b>{role.uiWork.title}</b>
                <span>{role.uiWork.summary}</span>
                <span className="ui-work-action">View examples</span>
              </span>
              <span className="ui-work-arrow" aria-hidden="true">
                ↗
              </span>
            </button>
          )}
        </div>
      </div>
      {role.uiWork && (
        <dialog
          ref={uiDialog}
          id="ui-work-dialog"
          className="portfolio-dialog ui-work-dialog"
          aria-labelledby="ui-work-title"
          aria-describedby="ui-work-intro"
          onClose={() => uiOpener.current?.focus({ preventScroll: true })}
        >
          <div className="portfolio-dialog-toolbar">
            <span>Component work</span>
            <button
              type="button"
              className="port-close"
              aria-label="Close UI work examples"
              onClick={() => uiDialog.current.close()}
            >
              ×
            </button>
          </div>
          <div className="portfolio-dialog-content">
            <h3 id="ui-work-title">{role.uiWork.title}</h3>
            <p id="ui-work-intro">{role.uiWork.intro}</p>
            <div className="ui-work-examples">
              {role.uiWork.examples.map((example) => (
                <section className="ui-work-example" key={example.title} aria-label={example.title}>
                  <h4>{example.title}</h4>
                  <dl>
                    {[
                      [example.contextLabel || 'Issue', example.context],
                      [example.analysisLabel || 'Investigation', example.analysis],
                      [example.changeLabel || 'Change', example.change],
                      [example.reasoningLabel || 'Why this approach', example.reasoning],
                    ]
                      .filter(([, content]) => content)
                      .map(([label, content]) => (
                        <div key={label}>
                          <dt>{label}</dt>
                          <dd>{content}</dd>
                        </div>
                      ))}
                  </dl>
                </section>
              ))}
            </div>
          </div>
        </dialog>
      )}
      <NextChapter id="projects">Projects</NextChapter>
    </div>
  );
}
