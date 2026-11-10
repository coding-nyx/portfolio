import { useEffect } from 'react';
import { CHAPTERS } from '../data/chapters.js';
import { projects, profileData } from '../data/portfolio.js';
import { trackFootfallEvent } from '../services/footfallAnalytics.js';

export function chapterIsVisible(rect, viewportHeight) {
  const visible = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
  return (
    viewportHeight > 0 && rect.height > 0 && visible >= Math.min(rect.height, viewportHeight) / 2
  );
}

// App-owned observation composes chapters and links without coupling portfolio features.
export default function usePortfolioAnalytics() {
  useEffect(() => {
    const sent = new Set();
    const timers = new Map();
    let frame;
    const chapterElements = CHAPTERS.map(([id]) => document.getElementById(id)).filter(Boolean);
    const check = () => {
      frame = undefined;
      for (const element of chapterElements) {
        const visible =
          document.visibilityState !== 'hidden' &&
          chapterIsVisible(element.getBoundingClientRect(), window.innerHeight);
        if (!visible && timers.has(element.id)) {
          clearTimeout(timers.get(element.id));
          timers.delete(element.id);
        } else if (visible && !sent.has(element.id) && !timers.has(element.id)) {
          timers.set(
            element.id,
            setTimeout(() => {
              timers.delete(element.id);
              if (
                document.visibilityState !== 'hidden' &&
                chapterIsVisible(element.getBoundingClientRect(), window.innerHeight) &&
                trackFootfallEvent('section_view', { chapter_id: element.id })
              )
                sent.add(element.id);
            }, 1000),
          );
        }
      }
    };
    const schedule = () => {
      if (frame === undefined) frame = requestAnimationFrame(check);
    };
    const links = new Map();
    for (const project of projects) {
      if (project.liveUrl)
        links.set(project.liveUrl, { destination: 'project_live', project_id: project.id });
      for (const link of project.sourceLinks || [{ url: project.repoUrl }])
        if (link.url)
          links.set(link.url, { destination: 'project_source', project_id: project.id });
    }
    links.set(profileData.socialLinks.linkedin, { destination: 'linkedin' });
    links.set(profileData.socialLinks.github, { destination: 'github' });
    const activated = (event) => {
      if (
        event.defaultPrevented ||
        (event.type === 'auxclick' ? event.button !== 1 : event.button !== 0)
      )
        return;
      const link = event.target.closest?.('a[href]');
      if (!link) return;
      const url = new URL(link.href, window.location.origin);
      if (
        url.origin === window.location.origin &&
        ['/resume-modern.pdf', '/resume-cyberpunk.pdf'].includes(url.pathname)
      ) {
        const entry = link.closest('#entry')
          ? 'hero'
          : link.closest('#resume')
            ? 'resume'
            : 'navigation';
        trackFootfallEvent('resume_open', { entry_point: entry });
      } else if (url.protocol === 'mailto:' && link.closest('#contact'))
        trackFootfallEvent('contact_draft_open');
      else if (links.has(link.href)) trackFootfallEvent('outbound_click', links.get(link.href));
    };
    document.addEventListener('click', activated);
    document.addEventListener('auxclick', activated);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('visibilitychange', schedule);
    const idleCallback = typeof window.requestIdleCallback === 'function';
    const idle = idleCallback
      ? window.requestIdleCallback(schedule, { timeout: 3000 })
      : window.setTimeout(schedule, 1000);
    return () => {
      if (idleCallback) window.cancelIdleCallback(idle);
      else clearTimeout(idle);
      if (frame !== undefined) cancelAnimationFrame(frame);
      for (const timer of timers.values()) clearTimeout(timer);
      document.removeEventListener('click', activated);
      document.removeEventListener('auxclick', activated);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', schedule);
    };
  }, []);
}
