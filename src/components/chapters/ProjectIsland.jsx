import { useEffect, useRef, useState } from 'react';
import { projects } from '../../data/portfolio';
import { createIsland } from './islandScene';
import '../../styles/island.css';

export default function ProjectIsland() {
  const stage = useRef(null), dialog = useRef(null);
  const [reduced,setReduced] = useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [failed,setFailed] = useState(false);
  const [current,setCurrent] = useState(null);
  const [detail,setDetail] = useState(null);
  const openRef = useRef(null);
  useEffect(()=>{const q=window.matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setReduced(q.matches);q.addEventListener('change',change);return()=>q.removeEventListener('change',change);},[]);
  useEffect(()=>{
    if(reduced || !stage.current)return;
    return createIsland(stage.current, projects, {onSelect:setCurrent,onOpen:i=>{setDetail(i);dialog.current?.showModal();},onFailure:()=>setFailed(true)});
  },[reduced]);
  const open = (i,e) => {openRef.current=e?.currentTarget;setDetail(i);dialog.current.showModal();};
  const p = current==null?null:projects[current];
  const d = detail==null?null:projects[detail];
  return <div className="port-section projects-g3" data-design="Projects G3v2"><div className="island-top"><h2>Projects</h2><a className="island-skip" href="#project-list">Skip to list ↓</a></div>{(reduced||failed)&&<p className="island-fallback" role="status">{reduced?'Reduced motion is on, so the 3D scene is skipped.':'3D is unavailable on this device.'} All projects are listed below.</p>}
    {!reduced&&!failed&&<div ref={stage} className="island-stage" tabIndex={0} role="group" aria-label="Project island. Click or tap a sign or the ground to walk. Arrow keys or WASD move; Enter opens the nearby project. Use the list below for a plain view."><div className="island-loading">Loading project island…</div><div className="island-pins" data-island-pins /><p className="island-hint">Tap a sign or the ground to walk · arrows / WASD</p><div className="island-controls">{[['l','←','Left'],['u','↑','Up'],['d','↓','Down'],['r','→','Right']].map(([dir,icon,label])=><button key={dir} data-d={dir} aria-label={`Walk ${label.toLowerCase()}`}>{icon}</button>)}</div>{p&&<div className="island-project-card" aria-live="polite"><span className="port-meta">{p.tags.slice(0,2).join(' · ')}</span><h3>{p.name}</h3><span className="port-meta">{p.status}</span><button className="port-button" onClick={e=>open(current,e)}>Open details →</button></div>}</div>}
    <section id="project-list" tabIndex={-1} aria-label="All projects" className="project-list"><h3>All projects</h3><div className="island-list-grid">{projects.map((p,i)=><article className={`island-list-card ${p.featured?'featured':''}`} key={p.name}>{p.imageUrl&&<img src={p.imageUrl} alt={`${p.name} screenshot`} loading="lazy" width="640" height="400" />}<span className="port-eyebrow">{p.featured?'Featured project':'Other work'}</span><h3>{p.name}</h3><p className="port-meta">{p.tags.join(' · ')}</p><p>{p.description}</p><div className="project-card-actions"><button className="port-button" onClick={e=>open(i,e)}>Details</button>{p.repoUrl&&<a href={p.repoUrl} target="_blank" rel="noreferrer">Source ↗</a>}</div></article>)}</div></section>
    <dialog className="project-dialog" ref={dialog} aria-labelledby="project-detail-title" onClose={()=>{setDetail(null);openRef.current?.focus({preventScroll:true});}}><button className="port-close" aria-label="Close project details" onClick={()=>dialog.current.close()}>×</button>{d&&<div className="project-dialog-content"><p className="port-eyebrow">{d.status}</p><h3 id="project-detail-title">{d.name}</h3><p className="port-meta">{d.tags.join(' · ')}</p>{d.imageUrl&&<img src={d.imageUrl} alt={`${d.name} screenshot`} width="640" height="400" />}<p>{d.description}</p>{d.caseStudy&&<dl className="project-case-study">{Object.entries(d.caseStudy).map(([label,text])=><div key={label}><dt>{label}</dt><dd>{text}</dd></div>)}</dl>}{d.linksUnavailableReason&&<p className="port-meta">{d.linksUnavailableReason}</p>}<div className="project-card-actions">{d.liveUrl&&<a className="port-button" href={d.liveUrl} target="_blank" rel="noreferrer">{d.liveUrl.includes('/releases')?'Releases':'Open project'} ↗</a>}{d.repoUrl&&<a href={d.repoUrl} target="_blank" rel="noreferrer">Source ↗</a>}</div></div>}</dialog><a className="chapter-next" href="#skills">Next: <b>Skills ↓</b></a>
  </div>;
}
