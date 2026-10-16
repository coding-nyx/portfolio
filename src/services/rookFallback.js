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

export function generateFallbackResponse(messagesInput) {
  const msgs = Array.isArray(messagesInput)
    ? messagesInput
    : [{ role: 'user', content: String(messagesInput || '') }];
  const query = (msgs[msgs.length - 1]?.content || '').toLowerCase();
  const projectReply = (project) => {
    const caseStudy = project.caseStudy;
    const detail =
      caseStudy &&
      /architect|implement|built|memory|orchestrat|persona|compress|rag|import|recover|currency|how|mcp|hermes|chatgpt|upload|agent tool/.test(
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
    return `### ${project.name}\n\n${publicText(project.description)}${detail}\n\n${destinations}\n[ACTION:SCROLL_TO:projects]`;
  };

  const project =
    projects.find((p) =>
      p.name === 'Ara' ? /\bara\b/.test(query) : query.includes(p.name.toLowerCase()),
    ) ||
    (/linux|kernel|rk3588|embedded|device tree|hub-?11|a009/.test(query)
      ? projects.find((p) => p.name.startsWith('a0090'))
      : undefined) ||
    (/hermes|companion|tailscale/.test(query)
      ? projects.find((p) => p.name === 'Hermes Companion')
      : undefined);
  if (project) return projectReply(project);

  if (
    /\b(?:contact|hire|interview|touch|reach|message|email)\b|phone\s*(?:number|contact)|^phone\??$|@/.test(
      query,
    )
  ) {
    return 'Use the Contact chapter to compose a message to Raj. Rook does not send messages.\n[ACTION:SCROLL_TO:contact]';
  }

  if (/volunteer/.test(query)) {
    return `${profileData.name}: ${profileData.volunteeringInterest} Choose Volunteering in the Contact form to get in touch.\n[ACTION:SCROLL_TO:contact]`;
  }
  if (/outside work|off the clock|hobbies|interests|beyond (?:work|the screen)/.test(query)) {
    return `A few of Raj’s interests: ${interestsData.join(', ')}.\n\n${profileData.volunteeringInterest}\n[ACTION:SCROLL_TO:personal]`;
  }
  if (/spartan|race|racing|obstacle|endurance|devils? circuit|wild\s?warrior/.test(query)) {
    return (
      'Outside work, Raj takes part in obstacle course races.\n\n' +
      achievementsData
        .map((race) => `• **${race.title} (${race.year})** — ${race.status}`)
        .join('\n') +
      '\n\nThese are personal milestones.\n[ACTION:SCROLL_TO:personal]'
    );
  }
  if (/hackathon|smart india|sih|award|honor/.test(query)) {
    return (
      awardsData.map((a) => `**${a.name}** — ${a.issuer}, ${a.date}`).join('\n') +
      '\n[ACTION:SCROLL_TO:achievements]'
    );
  }
  if (/certificate|certification/.test(query)) {
    return (
      certificationsData.map((c) => `• ${c.name} — ${c.issuer}, ${c.date}`).join('\n') +
      '\n[ACTION:SCROLL_TO:achievements]'
    );
  }
  if (/education|college|school|degree|qualification|sairam|dav/.test(query)) {
    return 'Education details are not listed in this portfolio. Please ask Raj for confirmation.';
  }
  if (/resume|\bcv\b/.test(query)) return "Opening Raj's resume PDF.\n[ACTION:OPEN_RESUME]";
  if (/catalyst/.test(query)) {
    const skill = skillsData.find((item) => item.name === 'Zoho Catalyst');
    return `**${skill.name}**\n\n${publicText(skill.evidence)}\n[ACTION:SCROLL_TO:skills]`;
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
    return `**${work.name}**\n\n${publicText(work.desc)}${detail}\n[ACTION:SCROLL_TO:experience]`;
  }
  if (
    /navigation|split.?view|three.panel|rail.?view|tab.?bar|traitcollection|layout componentization/.test(
      query,
    )
  ) {
    const work = experienceData[0].projects.find(
      (item) => item.id === 'adaptive-navigation-layout',
    );
    return `**${work.name}**\n\n${publicText(work.desc)}\n[ACTION:SCROLL_TO:experience]`;
  }
  if (/revamp|redesign|middleware|api migration/.test(query)) {
    const work = experienceData[0].projects.find((item) => item.id === 'production-app-revamp');
    return `**${work.name}**\n\n${publicText(work.desc)}\n\n${publicText(profileData.deliverySummary)}\n[ACTION:SCROLL_TO:experience]`;
  }
  if (/releases?|bug fixes|feature (?:additions|inclusions)|product delivery/.test(query)) {
    return `**Production iOS delivery**\n\n${publicText(profileData.deliverySummary)}\n[ACTION:SCROLL_TO:experience]`;
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
    return `**Raj is a Member of Technical Staff at Zoho. Since May 2022.**\n\n${publicText(role.description)}${detail}\n[ACTION:SCROLL_TO:experience]`;
  }
  if (/skill|stack|swift|ios|technolog|proficiency/.test(query)) {
    return skillsData.map((s) => `• ${s.name}`).join('\n') + '\n[ACTION:SCROLL_TO:skills]';
  }
  if (/github|repo|project|code/.test(query)) {
    return (
      projects
        .map(
          (p) =>
            `• ${p.repoUrl ? `[${p.name}](${p.repoUrl})` : p.name} — ${publicText(p.description)}`,
        )
        .join('\n') + '\n[ACTION:SCROLL_TO:projects]'
    );
  }
  if (/raj|who|about|background|intro/.test(query)) {
    return `**${profileData.name}** — ${profileData.location}\n\n${publicText(profileData.summary)}\n[ACTION:SCROLL_TO:bio]`;
  }
  return 'Hi, I’m **Rook**. I answer questions about Raj’s work, public projects and background. Ask about iOS engineering, Linux & systems work, or use the Contact chapter to compose a message.';
}
