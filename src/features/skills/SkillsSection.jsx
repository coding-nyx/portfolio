import './skills.css';
import { SKILL_GROUPS, usedIn } from './skillEvidence.js';
import { useEffect, useRef, useState } from 'react';
import { skillsData } from '../../data/portfolio.js';
import NextChapter from '../../shared/ui/NextChapter.jsx';

export default function SkillsSection() {
  const [selected, setSelected] = useState(null);
  const last = useRef(null),
    detail = useRef(null),
    buttons = useRef([]);
  const close = () => {
    setSelected(null);
    last.current?.focus({ preventScroll: true });
  };
  useEffect(() => {
    if (selected) detail.current?.scrollIntoView({ behavior: 'instant', block: 'nearest' });
  }, [selected]);
  const used = selected ? usedIn(selected) : [];
  return (
    <div className="port-section skills-ad" data-design="Skills A+D">
      <h2 id="h-skills" tabIndex={-1}>
        Skills
      </h2>
      <p className="port-meta">Select a skill for examples from my work.</p>
      <div className="skill-groups">
        {SKILL_GROUPS.map((group) => (
          <section
            className="skill-cluster"
            key={group.name}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && selected && group.skills.includes(selected)) {
                event.preventDefault();
                event.stopPropagation();
                close();
              }
            }}
          >
            <h3>
              {group.name}
              <small>{group.skills.length} skills</small>
            </h3>
            <div className="skill-chips">
              {group.skills.map((skill) => {
                const index = skillsData.indexOf(skill);
                return (
                  <button
                    key={skill.name}
                    ref={(element) => {
                      buttons.current[index] = element;
                    }}
                    className={'skill-chip ' + group.className}
                    aria-expanded={selected?.name === skill.name}
                    aria-controls={selected?.name === skill.name ? 'skill-detail' : undefined}
                    onClick={(event) => {
                      last.current = event.currentTarget;
                      setSelected(selected?.name === skill.name ? null : skill);
                    }}
                    onKeyDown={(event) => {
                      const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[
                        event.key
                      ];
                      if (delta) {
                        event.preventDefault();
                        buttons.current[
                          (index + delta + skillsData.length) % skillsData.length
                        ]?.focus();
                      }
                    }}
                  >
                    {skill.name}
                  </button>
                );
              })}
            </div>
            {selected && group.skills.includes(selected) && (
              <div id="skill-detail" className="skill-detail" ref={detail} aria-live="polite">
                <div className="skill-detail-header">
                  <h4>{selected.name}</h4>
                  <button className="port-close" aria-label="Close skill details" onClick={close}>
                    ×
                  </button>
                </div>
                {selected.evidence && <p>{selected.evidence}</p>}
                <dl>
                  <dt>Used in</dt>
                  <dd>
                    {used.length
                      ? used.map((item) => (
                          <a key={item.label} href={item.href}>
                            {item.label} ↗
                          </a>
                        ))
                      : 'Listed in my portfolio stack.'}
                  </dd>
                </dl>
              </div>
            )}
          </section>
        ))}
      </div>
      <NextChapter id="achievements">Achievements</NextChapter>
    </div>
  );
}
