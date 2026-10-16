// The browser calls our server; provider credentials are never present here.
import {
  profileData,
  experienceData,
  projects,
  skillsData,
  awardsData,
  certificationsData,
  achievementsData,
  interestsData,
} from '../data/portfolio.js';
import { publicText } from '../utils/publicText.js';
import { findRookProject, normalizeRookQuestion } from './rookKnowledge.js';

export function generateFallbackResponse(messagesInput) {
  const msgs = Array.isArray(messagesInput)
    ? messagesInput
    : [{ role: 'user', content: String(messagesInput || '') }];
  const query = normalizeRookQuestion(msgs[msgs.length - 1]?.content || '');
  const projectReply = (project) => {
    const caseStudy = project.caseStudy;
    const detail =
      caseStudy &&
      /architect|implement|built|memory|orchestrat|persona|compress|rag|import|recover|currency|how|mcp|hermes|chatgpt|upload|agent tool|limitations?|trade.?offs?|contribution|personally|scope/.test(
        query,
      )
        ? `\n\n${publicText(caseStudy.approach)}${caseStudy.integration ? `\n\n${publicText(caseStudy.integration)}` : ''}\n\n${publicText(caseStudy.limitations)}`
        : '';
    const links = [
      ...(project.liveUrl
        ? [{ label: project.linkLabel || 'Open project', url: project.liveUrl }]
        : []),
      ...(project.sourceLinks ||
        (project.repoUrl ? [{ label: 'Source', url: project.repoUrl }] : [])),
    ]
      .map((link) => `[${link.label}](${link.url})`)
      .join(' · ');
    const destinations = links
      ? `${links}${project.linksUnavailableReason ? `\n\n${publicText(project.linksUnavailableReason)}` : ''}`
      : publicText(project.linksUnavailableReason) || 'Public source is not available.';
    if (/limitations?|trade.?offs?/.test(query)) {
      const limitations =
        caseStudy?.limitations || 'Technical limitations are not specified in the portfolio.';
      return `### ${project.name} — limitations\n\n${publicText(limitations)}\n\n${destinations}`;
    }
    if (caseStudy && /personally|contribution|scope/.test(query))
      return `### ${project.name} — Raj’s contribution\n\n${publicText(caseStudy.scope)}\n\n${publicText(caseStudy.approach)}\n\n${destinations}`;
    return `### ${project.name}\n\n${publicText(project.description)}${detail}\n\n${destinations}`;
  };

  const project = findRookProject(query);
  if (project) return projectReply(project);

  if (
    /\b(?:contact|hire|interview|touch|reach|message|email)\b|phone\s*(?:number|contact)|^phone\??$|@/.test(
      query,
    )
  ) {
    return 'Use the Contact chapter to compose a message to Raj. Rook does not send messages.';
  }

  if (/volunteer/.test(query)) {
    return `${profileData.name}: ${profileData.volunteeringInterest} Choose Volunteering in the Contact form to get in touch.`;
  }
  if (/outside work|off the clock|hobbies|interests|beyond (?:work|the screen)/.test(query)) {
    return `A few of Raj’s interests: ${interestsData.join(', ')}.\n\n${profileData.volunteeringInterest}`;
  }
  if (/spartan|race|racing|obstacle|endurance|devils? circuit|wild\s?warrior/.test(query)) {
    return (
      'Outside work, Raj takes part in obstacle course races.\n\n' +
      achievementsData
        .map((race) => `• **${race.title} (${race.year})** — ${race.status}`)
        .join('\n') +
      '\n\nThese are personal milestones.'
    );
  }
  if (/hackathon|smart india|sih|award|honor/.test(query)) {
    return awardsData.map((a) => `**${a.name}** — ${a.issuer}, ${a.date}`).join('\n');
  }
  if (/certificate|certification/.test(query)) {
    return certificationsData.map((c) => `• ${c.name} — ${c.issuer}, ${c.date}`).join('\n');
  }
  if (/education|college|school|degree|qualification|sairam|dav/.test(query)) {
    return 'Education details are not listed in this portfolio. Please ask Raj for confirmation.';
  }
  if (/resume|\bcv\b/.test(query)) return 'Raj’s résumé is available in the Resume chapter.';
  if (/catalyst/.test(query)) {
    const skill = skillsData.find((item) => item.name === 'Zoho Catalyst');
    return `**${skill.name}**\n\n${publicText(skill.evidence)}`;
  }
  if (
    /sdlc|agentic|component generation|generate.*component|spec.driven|development workflow/.test(
      query,
    )
  ) {
    const work = experienceData[0].projects.find((item) => item.id === 'ai-sdlc-prototype');
    const detail = /how|explain|workflow|steps|process|test|plan/.test(query)
      ? `\n\n${publicText(work.details.intro)}\n\n${work.details.steps.map((step, index) => `${index + 1}. **${step.title}** — ${publicText(step.body)}`).join('\n')}\n\n${publicText(work.details.updates)}`
      : '';
    return `**${work.name}**\n\n${publicText(work.desc)}${detail}`;
  }
  if (
    /navigation|split.?view|three.panel|rail.?view|tab.?bar|traitcollection|layout componentization/.test(
      query,
    )
  ) {
    const work = experienceData[0].projects.find(
      (item) => item.id === 'adaptive-navigation-layout',
    );
    return `**${work.name}**\n\n${publicText(work.desc)}`;
  }
  if (/revamp|redesign|middleware|api migration/.test(query)) {
    const work = experienceData[0].projects.find((item) => item.id === 'production-app-revamp');
    return `**${work.name}**\n\n${publicText(work.desc)}\n\n${publicText(profileData.deliverySummary)}`;
  }
  if (/releases?|bug fixes|feature (?:additions|inclusions)|product delivery/.test(query)) {
    return `**Production iOS delivery**\n\n${publicText(profileData.deliverySummary)}`;
  }
  const sheetQuestion =
    /spreadsheet|sheetview|collectionviewlayout|reindex|stutter|layout cach|scrolling performance/.test(
      query,
    );
  const kanbanQuestion = /kanban|column.background|dynamic.*cards?/.test(query);
  const integrationQuestion = /mcp|integration|documentation|component api/.test(query);
  if (
    sheetQuestion ||
    kanbanQuestion ||
    integrationQuestion ||
    /zoho|work|experience|career|role|agentic|framework|component|pipeline|contract|navigation/.test(
      query,
    )
  ) {
    const role = experienceData[0];
    const specificWork = role.projects.find(
      (work) =>
        work.id ===
        (sheetQuestion
          ? 'spreadsheet-layout-performance'
          : kanbanQuestion
            ? 'kanban-column-layout'
            : integrationQuestion
              ? 'component-integration-mcp'
              : null),
    );
    const detail = specificWork
      ? `\n\n**${specificWork.name}**\n${publicText(specificWork.desc)}`
      : '';
    return `**Raj is a Member of Technical Staff at Zoho. Since May 2022.**\n\n${publicText(role.description)}${detail}`;
  }
  if (/skill|stack|swift|ios|technolog|proficiency/.test(query)) {
    return skillsData.map((s) => `• ${s.name}`).join('\n');
  }
  if (/github|repo|project|code/.test(query)) {
    return projects
      .map(
        (p) =>
          `• ${p.repoUrl ? `[${p.name}](${p.repoUrl})` : p.name} — ${publicText(p.description)}`,
      )
      .join('\n');
  }
  if (/raj|who|about|background|intro/.test(query)) {
    return `**${profileData.name}** — ${profileData.location}\n\n${publicText(profileData.summary)}`;
  }
  return 'Hi, I’m **Rook**. I answer questions about Raj’s work, public projects and background. Ask about iOS engineering, Linux & systems work, or use the Contact chapter to compose a message.';
}
