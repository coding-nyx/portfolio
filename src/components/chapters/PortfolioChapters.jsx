import { useEffect, useRef, useState } from 'react';
import { profileData, experienceData, skillsData, projects, awardsData, achievementsData, certificationsData, interestsData } from '../../data/portfolio';
import { publicText } from '../../utils/publicText';
import { sendEmail } from '../../services/emailService';
import ProjectIsland from './ProjectIsland';
import '../../styles/chapters.css';

const EMAIL_CONFIGURED = Boolean(import.meta.env.VITE_EMAILJS_SERVICE_ID && import.meta.env.VITE_EMAILJS_TEMPLATE_ID && import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

const LinkOut = ({ href, children, ...props }) => <a href={href} target="_blank" rel="noreferrer" {...props}>{children}</a>;
const Next = ({ id, children }) => <a className="chapter-next" href={`#${id}`} data-sec={id}>Next: <b>{children} ↓</b></a>;

export function BioB({ resumeUrl }) {
  const rows = [ ['⌖', 'Location', profileData.location], ['◇', 'Role', experienceData[0].role], ['◷', 'Experience', 'Since May 2022'], ['⌘', 'Stack', 'Swift · UIKit · SwiftUI · SPM'] ];
  return <div className="port-section bio-b" data-design="Bio B">
    <div className="bio-card"><div className="bio-top"><img className="bio-avatar" src={profileData.profileImage} alt="Raj Kumar S" width="72" height="72" /><h2>{profileData.name}</h2><p>iOS / Apple Platform Engineer</p><div className="bio-actions"><a href={resumeUrl} download><span aria-hidden="true">↓</span>Resume</a><a href="#contact"><span aria-hidden="true">✉</span>Contact</a><a href="#experience"><span aria-hidden="true">⌘</span>Work</a></div></div>
    <div className="bio-group">{rows.map(([icon,label,value]) => <div className="bio-row" key={label}><i aria-hidden="true">{icon}</i><b>{label}</b><span>{value}</span></div>)}</div>
    <div className="bio-group"><details className="bio-about"><summary><i aria-hidden="true">✎</i>About me<span aria-hidden="true">⌄</span></summary><p>{publicText(profileData.summary)}</p><ul className="interest-list">{interestsData.map(i => <li key={i}>{i}</li>)}</ul></details></div>
    <div className="social-row"><LinkOut href={profileData.socialLinks.github}>GitHub ↗</LinkOut><LinkOut href={profileData.socialLinks.linkedin}>LinkedIn ↗</LinkOut><a href={`mailto:${profileData.socialLinks.email}`}>Email ↗</a></div></div><Next id="experience">Experience</Next>
  </div>;
}

// Dates already supplied by portfolio.js determine the career bars; no invented tenure counts.
const careerRange = (item) => {
  const [from, to] = item.dates.split(' - ');
  const end = to === 'Present' ? new Date() : new Date(to);
  const start = new Date(from);
  const min = new Date('Nov 2019'), max = new Date();
  return { left: `${100 * (start-min)/(max-min)}%`, width: `${Math.max(2,100*(end-start)/(max-min))}%` };
};

export function ExperienceD() {
  const [selected,setSelected] = useState(0);
  const role = experienceData[selected];
  return <div className="port-section experience-d" data-design="Experience D"><h2>Experience</h2><div className="career-summary"><span><b>{new Set(experienceData.map(r=>r.company)).size}</b> companies</span><span><b>{experienceData.length}</b> roles</span><span>Since May 2022 at Zoho</span></div><div className="career-grid"><div className="career-tracks"><div className="career-axis" aria-hidden="true"><span>2019</span><span>2021</span><span>2023</span><span>2026</span></div>{experienceData.map((r,i)=><button key={`${r.company}-${r.dates}`} className="career-bar" aria-pressed={selected===i} aria-controls="career-detail" onClick={()=>setSelected(i)}><span className="career-label"><b>{r.role}</b><small>{r.company}</small></span><span className="career-track" aria-hidden="true"><span style={careerRange(r)} /></span><span className="sr-only">{r.dates}</span></button>)}</div><div className="career-panel" id="career-detail" aria-live="polite"><p className="port-eyebrow">{role.dates}</p><h3>{role.role}</h3><p className="port-meta">{role.company} · {role.type}</p><p>{publicText(role.description)}</p>{role.projects && <ul>{role.projects.map(p=><li key={p.name}><b>{p.name}</b><p>{publicText(p.desc)}</p></li>)}</ul>}</div></div><Next id="projects">Projects</Next></div>;
}

const SKILL_GROUPS = [
  { name:'Mobile', skills:skillsData.filter(s=>s.category==='Mobile'), className:'daily' },
  { name:'App & web', skills:skillsData.filter(s=>['Language','Frontend','Backend'].includes(s.category)), className:'comfortable' },
  { name:'Systems & tooling', skills:skillsData.filter(s=>['AI','OS'].includes(s.category)), className:'systems' },
];
// Use the confirmed category data rather than inventing daily/learning claims.
function usedIn(skill) {
  if (/Swift|UIKit|SPM/.test(skill.name)) return [{label:'Zoho · mobile platforms',href:'#experience'}];
  if (/Kotlin|Android/.test(skill.name)) return [{label:'Hermes Companion',href:'#projects'}];
  if (/Linux/.test(skill.name)) return [{label:'a0090-meta (hub-11 OS)',href:'#projects'}];
  return projects.filter(p=>p.tags.some(t=>skill.name.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(skill.name.split(' / ')[0].toLowerCase()))).map(p=>({label:p.name,href:'#projects'}));
}
export function SkillsAD() {
  const [selected,setSelected] = useState(null);
  const last = useRef(null);
  const buttons = useRef([]);
  const close = () => { setSelected(null);last.current?.focus({preventScroll:true}); };
  useEffect(()=>{if(!selected)return;const esc=e=>{if(e.key==='Escape'){setSelected(null);last.current?.focus({preventScroll:true});}};window.addEventListener('keydown',esc);return()=>window.removeEventListener('keydown',esc);},[selected]);
  const used = selected ? usedIn(selected) : [];
  return <div className="port-section skills-ad" data-design="Skills A+D"><h2>Skills</h2><p className="port-meta">Tap a skill to see where it is used.</p><div className="skills-wrap"><div className="skill-groups">{SKILL_GROUPS.map(g=><section className="skill-cluster" key={g.name}><h3>{g.name}<small>{g.skills.length} skills</small></h3><div className="skill-chips">{g.skills.map(s=>{const i=skillsData.indexOf(s);return <button key={s.name} ref={el=>{buttons.current[i]=el;}} className={`skill-chip ${g.className}`} aria-expanded={selected?.name===s.name} aria-controls="skill-detail" onClick={e=>{last.current=e.currentTarget;setSelected(s);}} onKeyDown={e=>{const delta={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[e.key];if(delta){e.preventDefault();buttons.current[(i+delta+skillsData.length)%skillsData.length]?.focus();}}}>{s.name}</button>;})}</div></section>)}</div><aside id="skill-detail" className="skill-detail" aria-live="polite">{selected?<><button className="port-close" aria-label="Close skill details" onClick={close}>×</button><span className="port-eyebrow">{selected.category}</span><h3>{selected.name}</h3><dl><dt>Used in</dt><dd>{used.length?used.map(u=><a key={u.label} href={u.href}>{u.label} ↗</a>):'Listed in Raj’s portfolio stack.'}</dd></dl></>:<p className="port-meta">Select a skill to see its portfolio context.</p>}</aside></div><Next id="achievements">Achievements</Next></div>;
}

export function AchievementsC() {
  const [expanded,setExpanded] = useState(null);
  const evidence = [ ...awardsData.map(a=>({title:a.name,kind:'Participation',proof:a.issuer,date:a.date,detail:`${a.issuer} participation · ${a.date}.`})), ...achievementsData.filter(a=>!a.pendingConfirmation).map(a=>({title:a.title,kind:'Achievement',proof:a.event,date:'',detail:publicText(a.description)})) ];
  return <div className="port-section achievements-c" data-design="Achievements C"><h2>Achievements</h2><p className="port-meta">Confirmed milestones and their supporting records.</p><p className="port-eyebrow">Featured evidence</p><div className="achievement-featured">{evidence.map((a,i)=><button className="achievement-card" key={a.title} aria-expanded={expanded===i} onClick={()=>setExpanded(expanded===i?null:i)} onKeyDown={e=>{if(e.key==='Escape')setExpanded(null);}}><span className="port-meta">{a.kind}</span><strong>{a.title}</strong><span>{a.proof}</span><span className="port-meta">{a.date}</span><span className="evidence-toggle">{expanded===i?'Hide':'Show'} evidence {expanded===i?'−':'+'}</span>{expanded===i&&<span className="evidence-body">{a.detail}</span>}</button>)}</div><details className="older-certs"><summary>Older certifications (2020) <span>{certificationsData.length} records</span></summary><div className="proof-grid">{certificationsData.map(c=><article className="proof-card" key={c.name}><h3>{c.name}</h3><p className="port-meta">{c.issuer} · {c.date}</p>{c.credentialUrl?<LinkOut href={c.credentialUrl}>View credential ↗</LinkOut>:<span className="port-meta">Certificate</span>}</article>)}</div></details><Next id="resume">Resume</Next></div>;
}

export function ResumeC({ resumeUrl }) {
  const [preview,setPreview] = useState(false);
  return <div className="port-section resume-c" data-design="Resume C"><h2>Resume</h2><div className="resume-grid"><div className="resume-overview"><p className="port-eyebrow">Role</p><h3>{experienceData[0].role}</h3><div className="resume-facts"><div><p className="port-eyebrow">Experience</p><p>Since May 2022</p></div><div><p className="port-eyebrow">Focus</p><p>iOS · Apple platforms</p></div></div><p className="port-eyebrow">Top skills</p><ul className="resume-skill-list">{skillsData.slice(0,4).map(s=><li key={s.name}>{s.name}</li>)}</ul><p className="port-eyebrow">Last two roles</p><ol className="resume-roles">{experienceData.slice(0,2).map(r=><li key={r.role}><b>{r.role}</b><span>{r.company} · {r.dates}</span></li>)}</ol></div><aside className="resume-download"><a className="resume-download-button" href={resumeUrl} download><span aria-hidden="true">↓</span><span><b>Download resume</b><small>PDF · existing résumé</small></span></a><p className="port-meta">Opens in any PDF viewer</p><button className="port-button secondary" aria-expanded={preview} aria-controls="resume-preview" onClick={()=>setPreview(!preview)}>{preview?'Hide':'Show'} preview</button>{preview&&<img id="resume-preview" src="/resume-preview.png" width="595" height="842" alt="First page of Raj’s existing resume" />}<a href={resumeUrl} target="_blank" rel="noreferrer">Open PDF ↗</a></aside></div><Next id="contact">Contact</Next></div>;
}

export function ContactD() {
  const [form,setForm] = useState({ name:'',email:'',subject:'Job',message:'' });
  const [errors,setErrors] = useState({});
  const [status,setStatus] = useState('');
  const [sending,setSending] = useState(false);
  const refs = useRef({});
  const changed = e => {setForm({...form,[e.target.name]:e.target.value});setErrors({...errors,[e.target.name]:undefined});setStatus('');};
  const reset = () => {setForm({name:'',email:'',subject:'Job',message:''});setErrors({});setStatus('');};
  const submit = async e => {
    e.preventDefault();
    const found={};
    if(!form.name.trim())found.name='Enter your name.';
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))found.email='Enter a valid reply email.';
    if(!form.message.trim())found.message='Write a message.';
    setErrors(found);
    if(Object.keys(found).length){refs.current[Object.keys(found)[0]]?.focus();return;}
    setSending(true);setStatus('');
    try {
      if(EMAIL_CONFIGURED){
        await sendEmail({name:form.name.trim(),email:form.email.trim(),message:`Subject: ${form.subject}\n\n${form.message.trim()}`});
        setStatus('sent');
      } else {
        window.location.href=`mailto:${profileData.socialLinks.email}?subject=${encodeURIComponent(form.subject+' — '+form.name.trim())}&body=${encodeURIComponent(form.message.trim()+'\n\nFrom: '+form.name+' <'+form.email+'>')}`;
        setStatus('draft');
      }
    } catch {setStatus('error');} finally {setSending(false);}
  };
  return <div className="port-section contact-d" data-design="Contact D"><h2>Contact</h2><div className="mail-sheet"><form noValidate onSubmit={submit}><div className="mail-toolbar"><button type="button" onClick={reset} disabled={sending}>Clear</button><b>New message</b><button type="submit" className="mail-send" disabled={sending} aria-label="Send message">{sending?'Sending…':'Send ↑'}</button></div><div className="mail-row"><span>To</span><b>{profileData.name}</b></div>{[['name','From','Your name','text'],['email','Reply to','Your email','email']].map(([name,label,placeholder,type])=><div className="mail-field" key={name}><label className="mail-row" htmlFor={`contact-${name}`}><span>{label}</span><input id={`contact-${name}`} ref={el=>{refs.current[name]=el;}} type={type} name={name} autoComplete={name} placeholder={placeholder} value={form[name]} onChange={changed} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name]?`contact-error-${name}`:undefined} /></label>{errors[name]&&<p className="field-error" id={`contact-error-${name}`}>{errors[name]}</p>}</div>)}<fieldset className="mail-subject"><legend>Subject</legend>{['Job','Freelance','Just hi'].map(s=><label key={s}><input type="radio" name="subject" value={s} checked={form.subject===s} onChange={changed} />{s}</label>)}</fieldset><div className="mail-body"><label className="sr-only" htmlFor="contact-message">Message</label><textarea id="contact-message" ref={el=>{refs.current.message=el;}} name="message" placeholder="Write your message…" value={form.message} onChange={changed} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message?'contact-error-message':undefined} rows="7" />{errors.message&&<p className="field-error" id="contact-error-message">{errors.message}</p>}</div>{!EMAIL_CONFIGURED&&<p className="mail-delivery-note">Send opens an email draft you can review and send in your mail app.</p>}{Object.values(errors).some(Boolean)&&<p className="mail-status field-error" role="alert">Please check the highlighted fields.</p>}{status&&<div className="mail-status" role={status==='error'?'alert':'status'}>{status==='sent'?<><b>Message sent.</b><p>Thank you for reaching out.</p><button type="button" onClick={reset}>Write another message</button></>:status==='draft'?'Email draft opened. Send it in your mail app.':<>The message could not be sent. Try again or <a href={`mailto:${profileData.socialLinks.email}`}>email Raj directly</a>.</>}</div>}</form></div><div className="social-row"><a href={`mailto:${profileData.socialLinks.email}`}>Email ↗</a><LinkOut href={profileData.socialLinks.linkedin}>LinkedIn ↗</LinkOut><LinkOut href={profileData.socialLinks.github}>GitHub ↗</LinkOut></div></div>;
}

export function ProjectsG3v2() { return <ProjectIsland />; }
