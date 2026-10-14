import { createElement, useEffect, useRef, useState } from 'react';
import { FiMapPin, FiBriefcase, FiCalendar, FiLayers, FiChevronDown, FiCopy } from 'react-icons/fi';
import { profileData, experienceData, skillsData, projects, awardsData, achievementsData, certificationsData, interestsData } from '../../data/portfolio';
import { publicText } from '../../utils/publicText';
import { sendEmail } from '../../services/emailService';
import ProjectIsland from './ProjectIsland';
import '../../styles/chapters.css';

const EMAIL_CONFIGURED = Boolean(import.meta.env.VITE_EMAILJS_SERVICE_ID && import.meta.env.VITE_EMAILJS_TEMPLATE_ID && import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

const LinkOut = ({ href, children, ...props }) => <a href={href} target="_blank" rel="noreferrer" {...props}>{children}</a>;
const Next = ({ id, children }) => <a className="chapter-next" href={`#${id}`} data-sec={id}>Next: <b>{children} ↓</b></a>;

export function BioB() {
  const rows = [
    [FiMapPin, 'Location', profileData.location],
    [FiBriefcase, 'Role', experienceData[0].role],
    [FiCalendar, 'Experience', 'Since May 2022'],
    [FiLayers, 'Stack', 'Swift · UIKit · SwiftUI · SPM'],
  ];
  return <div className="port-section bio-b" data-design="Bio B">
    <div className="bio-card">
      <div className="bio-top">
        <img className="bio-avatar" src={profileData.profileImage} alt="Raj Kumar S" width="96" height="96" />
        <h2>{profileData.name}</h2><p>{profileData.roleTitle}</p>
      </div>
      <p className="bio-intro">{publicText(profileData.summary)}</p>
      <div className="bio-group">{rows.map(([icon, label, value]) => <div className="bio-row" key={label}>
        <i aria-hidden="true">{createElement(icon, {size:20, focusable:false})}</i><b>{label}</b><span>{value}</span>
      </div>)}</div>
      <details className="bio-interests"><summary>Outside work <FiChevronDown aria-hidden="true" /></summary>
        <ul className="interest-list">{interestsData.map(interest => <li key={interest}>{interest}</li>)}</ul>
      </details>
    </div><Next id="experience">Experience</Next>
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
  const [selected, setSelected] = useState(0);
  const uiDialog = useRef(null), uiOpener = useRef(null);
  const role = experienceData[selected];
  const notes = role.projects?.filter(item => ['adaptive-navigation-layout', 'spreadsheet-layout-performance', 'kanban-column-layout'].includes(item.id)) || [];
  return <div className="port-section experience-d" data-design="Experience D">
    <h2>Experience</h2>
    <p className="career-summary">Zoho · Full-time iOS engineering since May 2022</p>
    <div className="career-grid">
      <div className="career-tracks">
        <div className="career-axis" aria-hidden="true"><span>2019</span><span>2021</span><span>2023</span><span>{new Date().getFullYear()}</span></div>
        {experienceData.map((item, index) => <button key={item.company + item.dates} className="career-bar" aria-pressed={selected === index} aria-controls="career-detail" onClick={() => setSelected(index)}>
          <span className="career-label"><b>{item.role}</b><small>{item.company}</small><small className="career-dates">{item.dates}</small></span>
          <span className="career-track" aria-hidden="true"><span style={careerRange(item)} /></span>
        </button>)}
      </div>
      <div className="career-panel" id="career-detail" aria-live="polite">
        <p className="port-eyebrow">{role.dates}</p><h3>{role.role}</h3><p className="port-meta">{role.company} · {role.type}</p>
        <p>{publicText(role.description)}</p>
        {role.projects && <ul>{role.projects.filter(item => !notes.includes(item)).map(item => <li key={item.name}>
          <b>{item.name}</b><p>{publicText(item.desc)}</p>
          {item.details && <details className="career-work-details">
            <summary>How it works <FiChevronDown aria-hidden="true" /></summary>
            <div className="career-work-explanation">
              <p>{publicText(item.details.intro)}</p>
              <ol className="component-workflow">{item.details.steps.map(step => <li key={step.title}><h4>{step.title}</h4><p>{publicText(step.body)}</p></li>)}</ol>
              <section><h4>Adding features and new versions</h4><p>{publicText(item.details.updates)}</p></section>
            </div>
          </details>}
        </li>)}</ul>}
        {role.uiWork && <button className="ui-work-card" type="button" aria-haspopup="dialog" aria-controls="ui-work-dialog" onClick={event => {uiOpener.current = event.currentTarget; uiDialog.current.showModal();}}>
          <span><b>{role.uiWork.title}</b><span>{role.uiWork.summary}</span><span className="ui-work-action">View examples</span></span>
          <span className="ui-work-arrow" aria-hidden="true">↗</span>
        </button>}
      </div>
    </div>
    {role.uiWork && <dialog ref={uiDialog} id="ui-work-dialog" className="project-dialog ui-work-dialog" aria-labelledby="ui-work-title" aria-describedby="ui-work-intro" onClose={() => uiOpener.current?.focus({preventScroll:true})}>
      <div className="project-dialog-toolbar"><span>Component work</span><button type="button" className="port-close" aria-label="Close UI work examples" onClick={() => uiDialog.current.close()}>×</button></div>
      <div className="project-dialog-content">
        <h3 id="ui-work-title">{role.uiWork.title}</h3><p id="ui-work-intro">{role.uiWork.intro}</p>
        <div className="ui-work-examples">{role.uiWork.examples.map(example => <section className="ui-work-example" key={example.title} aria-label={example.title}>
          <h4>{example.title}</h4>
          <dl>{[[example.contextLabel || 'Issue', example.context], [example.analysisLabel || 'Investigation', example.analysis], [example.changeLabel || 'Change', example.change], [example.reasoningLabel || 'Why this approach', example.reasoning]].filter(([, content]) => content).map(([label, content]) => <div key={label}><dt>{label}</dt><dd>{content}</dd></div>)}</dl>
        </section>)}</div>
      </div>
    </dialog>}
    <Next id="projects">Projects</Next>
  </div>;
}

const SKILL_GROUPS = [
  { name:'Mobile', skills:skillsData.filter(s=>s.category==='Mobile'), className:'daily' },
  { name:'App & web', skills:skillsData.filter(s=>['Language','Frontend','Backend'].includes(s.category)), className:'comfortable' },
  { name:'Systems & tooling', skills:skillsData.filter(s=>['AI','OS'].includes(s.category)), className:'systems' },
];
// Use the confirmed category data rather than inventing daily/learning claims.
function usedIn(skill) {
  if (/Swift|UIKit|SPM/.test(skill.name)) return [{label:'Zoho · native component work',href:'#experience'}];
  if (/Kotlin|Android/.test(skill.name)) return [{label:'Hermes Companion',href:'#projects'}];
  if (/Linux/.test(skill.name)) return [{label:'a0090-meta (hub-11 OS)',href:'#projects'}];
  if (/MCP/.test(skill.name)) return [{label:'Zoho · component integration tooling',href:'#experience'},{label:'WorkTracker',href:'#projects'}];
  if (/Catalyst/.test(skill.name)) return [{label:'MCP hosting, internal docs and issue tracking',href:'#skills'}];
  return projects.filter(p=>p.tags.some(t=>skill.name.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(skill.name.split(' / ')[0].toLowerCase()))).map(p=>({label:p.name,href:'#projects'}));
}
export function SkillsAD() {
  const [selected, setSelected] = useState(null);
  const last = useRef(null), detail = useRef(null), buttons = useRef([]);
  const close = () => { setSelected(null); last.current?.focus({preventScroll:true}); };
  useEffect(() => {
    if (selected) detail.current?.scrollIntoView({behavior:'instant', block:'nearest'});
  }, [selected]);
  const used = selected ? usedIn(selected) : [];
  return <div className="port-section skills-ad" data-design="Skills A+D">
    <h2>Skills</h2><p className="port-meta">Select a skill for examples from my work.</p>
    <div className="skill-groups">{SKILL_GROUPS.map(group => <section className="skill-cluster" key={group.name} onKeyDown={event => {
      if (event.key === 'Escape' && selected && group.skills.includes(selected)) { event.preventDefault(); event.stopPropagation(); close(); }
    }}>
      <h3>{group.name}<small>{group.skills.length} skills</small></h3>
      <div className="skill-chips">{group.skills.map(skill => {
        const index = skillsData.indexOf(skill);
        return <button key={skill.name} ref={element => { buttons.current[index] = element; }} className={'skill-chip ' + group.className} aria-expanded={selected?.name === skill.name} aria-controls={selected?.name === skill.name ? 'skill-detail' : undefined} onClick={event => {
          last.current = event.currentTarget; setSelected(selected?.name === skill.name ? null : skill);
        }} onKeyDown={event => {
          const delta = {ArrowRight:1, ArrowDown:1, ArrowLeft:-1, ArrowUp:-1}[event.key];
          if (delta) { event.preventDefault(); buttons.current[(index + delta + skillsData.length) % skillsData.length]?.focus(); }
        }}>{skill.name}</button>;
      })}</div>
      {selected && group.skills.includes(selected) && <div id="skill-detail" className="skill-detail" ref={detail} aria-live="polite">
        <div className="skill-detail-header"><h4>{selected.name}</h4><button className="port-close" aria-label="Close skill details" onClick={close}>×</button></div>
        {selected.evidence && <p>{selected.evidence}</p>}
        <dl><dt>Used in</dt><dd>{used.length ? used.map(item => <a key={item.label} href={item.href}>{item.label} ↗</a>) : 'Listed in my portfolio stack.'}</dd></dl>
      </div>}
    </section>)}</div><Next id="achievements">Achievements</Next>
  </div>;
}

export function AchievementsC() {
  const milestones = [
    ...awardsData.map(item => ({title:item.name, kind:'Participation', proof:item.issuer, date:item.date, description:item.description})),
    ...achievementsData.filter(item => !item.pendingConfirmation).map(item => ({title:item.title, kind:'Achievement', proof:item.event, description:item.description})),
  ];
  return <div className="port-section achievements-c" data-design="Achievements C">
    <h2>Achievements</h2><p className="port-meta">Participation and continued learning.</p>
    <div className="achievement-featured">{milestones.map(item => <article className="achievement-card" key={item.title}>
      <span className="port-meta">{item.kind}</span><strong>{item.title}</strong><span>{item.proof} · {item.date}</span><p>{publicText(item.description)}</p>
    </article>)}</div>
    <details className="older-certs"><summary>Older certifications (2020) <span>{certificationsData.length} records</span></summary>
      <div className="proof-grid">{certificationsData.map(item => <article className="proof-card" key={item.name}><h3>{item.name}</h3><p className="port-meta">{item.issuer} · {item.date}</p>{item.credentialUrl ? <LinkOut href={item.credentialUrl}>View credential ↗</LinkOut> : <span className="port-meta">Certificate</span>}</article>)}</div>
    </details><Next id="resume">Resume</Next>
  </div>;
}

export function ResumeC({ resumeUrl }) {
  const [preview, setPreview] = useState(false);
  return <div className="port-section resume-c" data-design="Resume C">
    <h2>Resume</h2><div className="resume-grid">
      <div className="resume-overview"><p className="port-eyebrow">Native UI · Product engineering</p><h3>{profileData.roleTitle}</h3><p>A concise overview of my component engineering, performance work, integration tooling and selected projects.</p><p className="port-meta">Member of Technical Staff at Zoho · Since May 2022</p></div>
      <aside className="resume-download">
        <a className="resume-download-button" href={resumeUrl} download><span aria-hidden="true">↓</span><span><b>Download resume</b><small>PDF · Updated October 2026</small></span></a>
        <button className="port-button secondary" aria-expanded={preview} aria-controls={preview ? 'resume-preview' : undefined} onClick={() => setPreview(!preview)}>{preview ? 'Hide' : 'Show'} preview</button>
        {preview && <img id="resume-preview" src="/resume-preview.png" width="595" height="842" alt="First page of Raj’s resume" />}
        <a href={resumeUrl} target="_blank" rel="noreferrer">Open PDF ↗</a>
      </aside>
    </div><Next id="contact">Contact</Next>
  </div>;
}

export function ContactD() {
  const [copyStatus,setCopyStatus] = useState('');
  const [form,setForm] = useState({ name:'',email:'',subject:'Job',message:'' });
  const [errors,setErrors] = useState({});
  const [status,setStatus] = useState('');
  const [sending,setSending] = useState(false);
  const refs = useRef({});
  const draftUrl = `mailto:${profileData.socialLinks.email}?subject=${encodeURIComponent(form.subject+' — '+form.name.trim())}&body=${encodeURIComponent(form.message.trim()+'\n\nFrom: '+form.name.trim()+' <'+form.email.trim()+'>')}`;
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(profileData.socialLinks.email); setCopyStatus('Email copied.'); }
    catch { setCopyStatus('Select the email address above to copy it.'); }
  };
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
        setStatus('unavailable');
      }
    } catch {setStatus('error');} finally {setSending(false);}
  };
  return <div className="port-section contact-d" data-design="Contact D"><h2>Contact</h2><div className="contact-direct"><span className="port-meta">Email</span><div className="contact-email-row"><a className="contact-address" href={`mailto:${profileData.socialLinks.email}`}>{profileData.socialLinks.email}</a><button className="contact-copy" type="button" aria-label="Copy email address" title="Copy email" onClick={copyEmail}><FiCopy size={16} aria-hidden="true" /></button></div><p className="contact-copy-status" role="status">{copyStatus}</p></div><details className="contact-composer" open><summary>Write a message <FiChevronDown aria-hidden="true" /></summary><div className="mail-sheet"><form noValidate onSubmit={submit}><div className="mail-toolbar"><button type="button" onClick={reset} disabled={sending}>Clear</button><b>New message</b></div><div className="mail-row"><span>To</span><b>{profileData.name}</b></div>{[['name','Name','Your name','text'],['email','Email','Your email','email']].map(([name,label,placeholder,type])=><div className="mail-field" key={name}><label className="mail-row" htmlFor={`contact-${name}`}><span>{label}</span><input id={`contact-${name}`} ref={el=>{refs.current[name]=el;}} type={type} name={name} autoComplete={name} placeholder={placeholder} value={form[name]} onChange={changed} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name]?`contact-error-${name}`:undefined} /></label>{errors[name]&&<p className="field-error" id={`contact-error-${name}`}>{errors[name]}</p>}</div>)}<fieldset className="mail-subject"><legend>Subject</legend>{['Job','Freelance','Just hi'].map(s=><label key={s}><input type="radio" name="subject" value={s} checked={form.subject===s} onChange={changed} />{s}</label>)}</fieldset><div className="mail-body"><label className="sr-only" htmlFor="contact-message">Message</label><textarea id="contact-message" ref={el=>{refs.current.message=el;}} name="message" placeholder="Write your message…" value={form.message} onChange={changed} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message?'contact-error-message':undefined} rows="7" />{errors.message&&<p className="field-error" id="contact-error-message">{errors.message}</p>}</div><div className="mail-submit"><button type="submit" className="port-button" disabled={sending || !EMAIL_CONFIGURED} aria-label="Send message">{sending?'Sending…':'Send message ↑'}</button></div>{!EMAIL_CONFIGURED&&<p className="mail-delivery-note">Direct sending is unavailable. <a href={draftUrl}>Open an email draft</a> to send through your mail app.</p>}{Object.values(errors).some(Boolean)&&<p className="mail-status field-error" role="alert">Please check the highlighted fields.</p>}{status&&<div className="mail-status" role={status==='error'?'alert':'status'}>{status==='sent'?<><b>Message sent.</b><p>Thank you for reaching out.</p><button type="button" onClick={reset}>Write another message</button></>:<>The message could not be sent. Try again or <a href={draftUrl}>open an email draft</a> to review and send through your mail app.</>}</div>}</form></div></details><div className="social-row"><LinkOut href={profileData.socialLinks.linkedin}>LinkedIn ↗</LinkOut><LinkOut href={profileData.socialLinks.github}>GitHub ↗</LinkOut></div></div>;
}

export function ProjectsG3v2() { return <ProjectIsland />; }
