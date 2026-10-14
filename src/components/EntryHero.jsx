import { useEffect, useRef } from 'react';
import '../styles/entryD2.css';
import { profileData } from '../data/portfolio';
import { chapterLabel } from '../data/chapters';

const Ico = ({ fill }) => (
  <svg className="ic" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><rect width="18" height="18" rx="5" fill={fill} /></svg>
);
const Toggle = () => (
  <svg className="tg" width="30" height="18" viewBox="0 0 30 18" aria-hidden="true"><rect width="30" height="18" rx="9" fill="#34C759" /><circle cx="21" cy="9" r="7" fill="#fff" /></svg>
);
const Chev = () => (
  <span className="chev"><svg width="5" height="8" viewBox="0 0 5 8" aria-hidden="true"><path d="M1 1l3 3-3 3" fill="none" stroke="#71717A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
);

// Entry D2: live CSS phone and inline SVG icons, with a wider responsive subtitle.
const EntryHero = ({ resumeUrl }) => {
  const name = useRef(null);
  useEffect(() => {
    const title = name.current;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    let cancelled = false;
    const fit = () => {
      if (cancelled || !context) return;
      const style = getComputedStyle(title);
      const desired = Math.max(48, Math.min(96, window.innerWidth * .08));
      context.font = `${style.fontWeight} ${desired}px ${style.fontFamily}`;
      const natural = context.measureText(title.textContent).width - (title.textContent.length - 1) * desired * .03;
      const size = Math.min(desired, desired * (title.clientWidth - 2) / natural);
      const value = `${Math.floor(size * 100) / 100}px`;
      if (title.style.getPropertyValue('--fit-name') !== value) title.style.setProperty('--fit-name', value);
    };
    const resize = new ResizeObserver(fit);resize.observe(title.parentElement);
    const styles = new MutationObserver(fit);styles.observe(document.head, {childList:true,subtree:true,characterData:true});
    styles.observe(title.closest('.entry-d2'), {attributes:true,attributeFilter:['style']});
    styles.observe(document.body, {attributes:true,attributeFilter:['style','data-theme']});
    window.addEventListener('resize', fit);
    document.fonts.addEventListener('loadingdone', fit);
    document.fonts.ready.then(fit);fit();
    return () => {cancelled=true;resize.disconnect();styles.disconnect();window.removeEventListener('resize',fit);document.fonts.removeEventListener('loadingdone',fit);};
  }, []);
  return (
  <div className="entry-d2">
    <div className="hero">
      <div className="t">
        <span className="role">{profileData.roleTitle} · Since May 2022</span>
        <p className="chl">{chapterLabel('entry')}</p>
        <h1 ref={name} id="h-entry" tabIndex={-1}>{profileData.name}</h1>
        <p className="line muted">{profileData.heroSummary}</p>
        <div className="acts">
          <a className="btn primary" href="#experience" data-sec="experience">View iOS work</a>
          <a className="btn ghost" href={resumeUrl} download>Resume ↓</a>
          <a className="btn ghost" href="#contact" data-sec="contact">Contact</a>
        </div>
      </div>
      <div className="stage">
        <div className="live" aria-hidden="true">
          <div className="ph">
            <div className="sc set">
              <div className="nb">Settings</div>
              <div className="grp">
                <div className="row"><Ico fill="#FF8A3D" />Wi‑Fi<span>Home</span></div>
                <div className="row"><Ico fill="#5B8CFF" />Bluetooth<Toggle /></div>
                <div className="row"><Ico fill="#34C759" />Battery<span>82%</span></div>
              </div>
              <div className="grp">
                <div className="row"><Ico fill="#A1A1AA" />General<Chev /></div>
                <div className="row"><Ico fill="#E4E4E7" />Privacy<Chev /></div>
              </div>
            </div>
          </div>
          <div className="fw">
            <div className="fc n2"><small>Steps this week</small><div className="bars"><s style={{ height: '40%' }} /><s style={{ height: '70%' }} /><s style={{ height: '55%' }} /><s style={{ height: '95%' }} /><s style={{ height: '60%' }} /></div></div>
            <div className="fc n1"><small>NATIVE UI · ILLUSTRATION</small><span className="tx">Components · Layout · State</span></div>
          </div>
          <div className="fc n3"><Toggle />Focus mode</div>
          <div className="fc n4"><small>Up next</small><b>Design review · 4 PM</b></div>
        </div>
      </div>
      <a className="cue" href="#bio" data-sec="bio"><span className="arr">↓</span> Bio</a>
    </div>
  </div>
);
};
export default EntryHero;
