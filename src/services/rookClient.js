// The browser calls our server; provider credentials are never present here.
import { profileData, experienceData, projects, skillsData, awardsData, certificationsData } from '../data/portfolio.js';
import { publicText } from '../utils/publicText.js';

export async function askRookAgent({ messages, onChunk, onAction, onMode, signal }) {
  const history=messages.filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string'&&m.content.trim()).slice(-12).map(({role,content})=>({role,content:content.slice(0,2000)}));
  try {
    const response=await fetch('/api/rook',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:history}),signal});
    const data=await response.json();
    if(!response.ok||data.source!=='deepseek'||typeof data.answer!=='string'||!data.answer.trim())throw new Error(data.error||'unavailable');
    onMode?.({source:'deepseek',model:data.model});onChunk?.(data.answer);
    return data.answer;
  } catch(error) {
    if(signal?.aborted)throw error;
    onMode?.({source:'preset',error:error.message});
    const reply=generateFallbackResponse(history);
    const text=reply.replace(/\[ACTION:[^\]]+\]/g,'').trim();onChunk?.(text);
    const scroll=reply.match(/\[ACTION:SCROLL_TO:([a-z-]+)\]/);
    if(scroll){onAction?.({type:'scroll',target:scroll[1]});document.getElementById(scroll[1])?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
    if(reply.includes('[ACTION:OPEN_RESUME]'))onAction?.({type:'open_resume'});
    return text;
  }
}

export function generateFallbackResponse(messagesInput) {
  const msgs = Array.isArray(messagesInput)
    ? messagesInput
    : [{ role: 'user', content: String(messagesInput || '') }];
  const query = (msgs[msgs.length - 1]?.content || '').toLowerCase();
  const projectReply = (project) => `### ${project.name}\n\n${publicText(project.description)}\n\n${(project.sourceLinks || (project.repoUrl ? [{label:'Source',url:project.repoUrl}] : [])).map(link=>`[${link.label}](${link.url})`).join(' · ') || 'Public source is not available.'}\n[ACTION:SCROLL_TO:projects]`;

  const project = projects.find((p) => query.includes(p.name.toLowerCase())) ||
    (/linux|kernel|rk3588|embedded|device tree|hub-?11|a009/.test(query) ? projects.find((p) => p.name.startsWith('a0090')) : undefined) ||
    (/hermes|companion|tailscale/.test(query) ? projects.find((p) => p.name === 'Hermes Companion') : undefined);
  if (project) return projectReply(project);

  if (/contact|hire|interview|touch|reach|message|email|phone|@/.test(query)) {
    return "Use the Contact chapter to compose a message to Raj. Rook does not send messages.\n[ACTION:SCROLL_TO:contact]";
  }

  if (/spartan|race|racing|obstacle|endurance/.test(query)) {
    return 'Raj lists obstacle course racing among his interests. Race results are awaiting confirmation.';
  }
  if (/hackathon|smart india|sih|award|honor/.test(query)) {
    return awardsData.map((a) => `**${a.name}** — ${a.issuer}, ${a.date}`).join('\n') + '\n[ACTION:SCROLL_TO:achievements]';
  }
  if (/certificate|certification/.test(query)) {
    return certificationsData.map((c) => `• ${c.name} — ${c.issuer}, ${c.date}`).join('\n') + '\n[ACTION:SCROLL_TO:achievements]';
  }
  if (/education|college|school|degree|qualification|sairam|dav/.test(query)) {
    return 'Education details are not listed in this portfolio. Please ask Raj for confirmation.';
  }
  if (/resume|\bcv\b/.test(query)) return "Opening Raj's resume PDF.\n[ACTION:OPEN_RESUME]";
  if (/skill|stack|swift|ios|technolog|proficiency/.test(query)) {
    return skillsData.map((s) => `• ${s.name}`).join('\n') + '\n[ACTION:SCROLL_TO:skills]';
  }
  if (/zoho|work|experience|career|role|agentic|framework|component|pipeline|contract/.test(query)) {
    return `**Raj is a Member of Technical Staff at Zoho. Since May 2022.**\n\n${publicText(experienceData[0].description)}\n[ACTION:SCROLL_TO:experience]`;
  }
  if (/github|repo|project|code/.test(query)) {
    return projects.map((p) => `• ${p.repoUrl ? `[${p.name}](${p.repoUrl})` : p.name} — ${publicText(p.description)}`).join('\n') + '\n[ACTION:SCROLL_TO:projects]';
  }
  if (/raj|who|about|background|intro/.test(query)) {
    return `**${profileData.name}** — ${profileData.location}\n\n${publicText(profileData.summary)}\n[ACTION:SCROLL_TO:bio]`;
  }
  return 'Hi, I’m **Rook**. I answer questions about Raj’s work, public projects and background. Ask about iOS engineering, Linux & systems work, or use the Contact chapter to compose a message.';
}
