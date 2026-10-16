import { CHAPTERS } from '../../data/chapters.js';
import { projects } from '../../data/portfolio.js';
import { findRookProject, normalizeRookQuestion } from '../../services/rookKnowledge.js';

const chapterTopics = [
  ['resume', /\bresume\b|\bcv\b/],
  [
    'personal',
    /\bvolunteer\w*\b|\binterests?\b|\bhobbies\b|off the clock|outside work|\braces?\b|obstacle|devils? circuit|wild\s?warrior/,
  ],
  ['contact', /\bcontact\b|\bhire\b|\binterview\b|\bemail\b|\bget in touch\b/],
  [
    'achievements',
    /\bawards?\b|\bhackathon\b|\bcertifications?\b|\bcertificates?\b|\bachievements?\b/,
  ],
  ['projects', /\bprojects?\b|\brepositories\b|\brepos?\b|\bgithub\b|\bopen source\b/],
  [
    'experience',
    /\bexperience\b|\bcareer\b|\bwork\b|\bzoho\b|\bsdlc\b|\bkanban\b|\bspreadsheet\b|\bcomponents?\b|\binstruments\b|\buicollectionviewlayout\b|\bnavigation\b|\bmiddleware\b|\brevamp\b|\breleases?\b/,
  ],
  [
    'skills',
    /\bskills?\b|\bstack\b|\bswift\b|\bios\b|\buikit\b|\bswiftui\b|\bkotlin\b|\btypescript\b|\bcatalyst\b|\btechnolog\w*\b/,
  ],
  ['bio', /\babout raj\b|\bwho is raj\b|\bbackground\b|\bintroduc\w*\b/],
];

const starters = [
  { label: 'What does Raj work on?', question: 'What does Raj work on?' },
  { label: 'Linux & systems work', question: 'Linux and embedded systems' },
  { label: 'Contact Raj', question: 'Contact Raj' },
];

const chapterSuggestions = {
  experience: [
    {
      label: 'UI performance',
      question: 'How did Raj investigate spreadsheet scrolling performance?',
    },
    { label: 'Adaptive navigation', question: 'How did Raj build adaptive product navigation?' },
    { label: 'AI SDLC workflow', question: 'How does Raj’s AI SDLC prototype work?' },
  ],
  skills: [
    { label: 'iOS work examples', question: 'What iOS component work has Raj done?' },
    { label: 'Linux project', question: 'How did Raj build a0090-meta?' },
    { label: 'Agent tooling', question: 'What is Raj’s component integration MCP?' },
  ],
  projects: projects.map((project) => ({
    label: project.name,
    question: `Tell me about ${project.name}`,
  })),
  personal: [
    { label: 'Obstacle races', question: 'Which obstacle course races has Raj finished?' },
    { label: 'Volunteering', question: 'Is Raj interested in volunteering opportunities?' },
  ],
  achievements: [
    { label: 'Hackathon', question: 'What is Raj’s Smart India Hackathon participation?' },
    { label: 'Certifications', question: 'What certifications does Raj have?' },
  ],
  bio: starters,
  contact: [
    { label: 'Open résumé', question: 'Open Raj’s résumé' },
    { label: 'Explore projects', question: 'Show projects' },
  ],
  resume: [
    { label: 'Experience', question: 'What does Raj work on?' },
    { label: 'Explore projects', question: 'Show projects' },
  ],
};

// Commands are matched against the visitor's complete request, never model output.
// A request for an explanation (or an arbitrary URL) cannot become navigation.
export function getRookAction(question) {
  const text = normalizeRookQuestion(question)
    .replace(/[.!?]+$/, '')
    .replace(/^(?:please\s+)?(?:can|could|would) you\s+/, '')
    .replace(/^please\s+/, '')
    .replace(/\s+please$/, '');
  if (text === 'contact raj') return { type: 'scroll', target: 'contact' };
  const command = text.match(
    /^(open|show|view|visit|go to|take me to|jump to|scroll to)(?: me)? (?:the |raj's )?(.+?)(?: section| chapter| pdf)?$/,
  );
  if (!command) return null;
  const aliases = { cv: 'resume', 'off the clock': 'personal', 'about raj': 'bio' };
  const target = aliases[command[2]] || command[2];
  if (!CHAPTERS.some(([id]) => id === target)) return null;
  return target === 'resume' ? { type: 'open_resume' } : { type: 'scroll', target };
}

export function rookActionReply(action) {
  if (action.type === 'open_resume') return 'Raj’s résumé is available as a PDF.';
  const title = CHAPTERS.find(([id]) => id === action.target)?.[1];
  return `Here’s the ${title} section.`;
}

function relatedLinks(topic) {
  if (!topic) return [];
  if (topic.chapter === 'resume') return [{ label: 'Open résumé PDF', kind: 'resume' }];
  const title = CHAPTERS.find(([id]) => id === topic.chapter)?.[1];
  const links = [{ label: `View ${title.toLowerCase()}`, href: `#${topic.chapter}` }];
  const project = projects.find((item) => item.name === topic.projectName);
  if (project) {
    const sourceLinks =
      project.sourceLinks || (project.repoUrl ? [{ label: 'Source', url: project.repoUrl }] : []);
    for (const { label, url } of sourceLinks)
      links.push({ label: `${project.name} · ${label}`, href: url });
    if (project.liveUrl)
      links.push({
        label: `${project.name} · ${project.linkLabel || 'Open project'}`,
        href: project.liveUrl,
      });
  }
  return links;
}

export function getRookGuidance(question, messages = []) {
  const text = normalizeRookQuestion(question);
  const project = findRookProject(question);
  const previous = messages.findLast((message) => message.role === 'assistant')?.topic;
  const followUp =
    /^(?:(?:and\s+)?(?:how|why|what|which|is|was|does|did|can|could)\b.*\b(?:it|its|that|this|these|those|they|their)\b|tell me more\b|go deeper\b|technical details\b|what about (?:the )?(?:limitations|trade.?offs|architecture)\b)/.test(
      text,
    );
  const chapter = chapterTopics.find(([, pattern]) => pattern.test(text))?.[0];
  const topic = project
    ? { chapter: 'projects', projectName: project.name }
    : followUp
      ? previous || null
      : chapter
        ? { chapter }
        : null;
  // Qualify short follow-ups for both the live prompt and the saved-answer path.
  const contextualQuestion =
    followUp && !project && topic
      ? `${question}\n\nPortfolio topic: ${topic.projectName || topic.chapter}.`
      : question;
  return { topic, evidence: relatedLinks(topic), question: contextualQuestion };
}

export function getRookSuggestions(messages) {
  const used = new Set(
    messages
      .filter((message) => message.role === 'user')
      .map((message) => normalizeRookQuestion(message.content)),
  );
  const topic = messages.findLast((message) => message.role === 'assistant')?.topic;
  const candidates = topic?.projectName
    ? [
        { label: 'Architecture', question: `How did Raj build ${topic.projectName}?` },
        {
          label: 'Raj’s contribution',
          question: `What did Raj personally implement in ${topic.projectName}?`,
        },
        { label: 'Limitations', question: `What are the limitations of ${topic.projectName}?` },
      ]
    : chapterSuggestions[topic?.chapter] || starters;
  return candidates
    .filter(({ question }) => !used.has(normalizeRookQuestion(question)))
    .slice(0, 3);
}
