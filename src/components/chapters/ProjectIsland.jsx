import { useEffect, useRef, useState } from 'react';
import { projects } from '../../data/portfolio';
import { createIsland } from './islandScene';
import '../../styles/island.css';

const sources = project => project.sourceLinks || (project.repoUrl ? [{ label: 'Source', url: project.repoUrl }] : []);
const SourceLinks = ({ project }) => sources(project).map(link => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label} ↗</a>);

export default function ProjectIsland() {
  const stage = useRef(null), dialog = useRef(null), openRef = useRef(null);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [failed, setFailed] = useState(false);
  const [view, setView] = useState('island');
  const [current, setCurrent] = useState(null);
  const [detail, setDetail] = useState(null);
  const listView = reduced || failed || view === 'list';

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(query.matches);
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);

  useEffect(() => {
    if (listView || !stage.current) return;
    return createIsland(stage.current, projects, {
      onSelect: setCurrent,
      onOpen: index => {
        openRef.current = stage.current;
        setDetail(index);
        dialog.current?.showModal();
      },
      onFailure: () => setFailed(true),
    });
  }, [listView]);

  const open = (index, event) => {
    openRef.current = event.currentTarget;
    setDetail(index);
    dialog.current.showModal();
  };
  const changeView = next => { setCurrent(null); setView(next); };
  const nearby = current == null ? null : projects[current];
  const selected = detail == null ? null : projects[detail];

  return <div className="port-section projects-g3" data-design="Projects G3v2">
    <div className="island-top">
      <h2>Projects</h2>
      <div className="project-view-switch" role="group" aria-label="Project view">
        <button type="button" aria-pressed={!listView} aria-controls="project-view" disabled={reduced || failed} onClick={() => changeView('island')}>Island</button>
        <button type="button" aria-pressed={listView} aria-controls="project-view" onClick={() => changeView('list')}>List</button>
      </div>
    </div>
    {(reduced || failed) && <p className="island-fallback" role="status">{reduced ? 'Reduced motion is on. Showing the project list.' : '3D is unavailable on this device. Showing the project list.'}</p>}
    {listView ? <section id="project-view" aria-label="Project list" className="project-list">
      <div className="island-list-grid">{projects.map((project, index) => <article className={`island-list-card ${project.featured ? 'featured' : ''}`} key={project.name}>
        {project.imageUrl && <img src={project.imageUrl} alt={`${project.name} screenshot`} loading="lazy" width="640" height="400" />}
        <span className="port-eyebrow">{project.featured ? 'Featured project' : 'Other work'}</span>
        <h3>{project.name}</h3><p className="port-meta">{project.tags.join(' · ')}</p><p>{project.description}</p>
        <div className="project-card-actions"><button className="port-button" onClick={event => open(index, event)}>Details</button><SourceLinks project={project} /></div>
      </article>)}</div>
    </section> : <div id="project-view" ref={stage} className="island-stage" tabIndex={0} role="group" aria-label="Project island. Click or tap a sign or the ground to walk. Arrow keys or WASD move; Enter opens the nearby project. Choose List for a plain view.">
      <div className="island-loading">Loading project island…</div><div className="island-pins" data-island-pins />
      <p className="island-hint">Tap a sign or the ground to walk · arrows / WASD</p>
      <div className="island-controls">{[['l','←','Left'],['u','↑','Up'],['d','↓','Down'],['r','→','Right']].map(([direction, icon, label]) => <button key={direction} data-d={direction} aria-label={`Walk ${label.toLowerCase()}`}>{icon}</button>)}</div>
      {nearby && <div className="island-project-card" aria-live="polite"><span className="port-meta">{nearby.tags.slice(0, 2).join(' · ')}</span><h3>{nearby.name}</h3><span className="port-meta">{nearby.status}</span><button className="port-button" onClick={event => open(current, event)}>Open details →</button></div>}
    </div>}
    <dialog className="project-dialog" ref={dialog} aria-labelledby="project-detail-title" onClose={() => { setDetail(null); openRef.current?.focus({preventScroll:true}); }}>
      <button className="port-close" aria-label="Close project details" onClick={() => dialog.current.close()}>×</button>
      {selected && <div className="project-dialog-content">
        <p className="port-eyebrow">{selected.status}</p><h3 id="project-detail-title">{selected.name}</h3><p className="port-meta">{selected.tags.join(' · ')}</p>
        {selected.imageUrl && <img src={selected.imageUrl} alt={`${selected.name} screenshot`} width="640" height="400" />}
        <p>{selected.description}</p>
        {selected.platforms && <dl className="project-platforms">{selected.platforms.map(platform => <div key={platform.name}><dt>{platform.name}</dt><dd>{[platform.language, platform.uiFramework].filter(Boolean).join(' · ')}</dd></div>)}</dl>}
        {selected.caseStudy && <dl className="project-case-study">{Object.entries(selected.caseStudy).map(([label, text]) => <div key={label}><dt>{label}</dt><dd>{text}</dd></div>)}</dl>}
        {selected.linksUnavailableReason && <p className="port-meta">{selected.linksUnavailableReason}</p>}
        <div className="project-card-actions">{selected.liveUrl && <a className="port-button" href={selected.liveUrl} target="_blank" rel="noreferrer">{selected.linkLabel || 'Open project'} ↗</a>}<SourceLinks project={selected} /></div>
      </div>}
    </dialog>
    <a className="chapter-next" href="#skills">Next: <b>Skills ↓</b></a>
  </div>;
}
