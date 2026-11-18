import { projects } from '../data/portfolio.js';

export function normalizeRookQuestion(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘]/g, "'")
    .toLowerCase()
    .trim();
}

export function isRookAvailabilityQuestion(question) {
  const text = normalizeRookQuestion(question);
  if (isRookEmploymentAvailabilityQuestion(text)) return true;
  if (!/\bfreelanc(?:e|ing)\b|\bconsult(?:ing|ancy)\b/.test(text)) return false;
  if (
    /\b(?:college|startups?|earlier|past|previous|historical|history|was|were|did|had)\b|\b(?:has|have)\b.*\b(?:done|built|developed|worked)\b/.test(
      text,
    )
  )
    return false;

  return /\b(?:availab(?:le|ility)|taking|accepting|offers?|offering|services?|rates?|pricing|charge|cost|hours?|hire|engagements?|consulting|consultancy)\b|\b(?:take on|open to|open for)\b|^(?:freelance|freelancing)\??$/.test(
    text,
  );
}

// "What is his current role?" is about experience; "Is he open to new roles?" is availability.
function isRookEmploymentAvailabilityQuestion(text) {
  return (
    !/\bvolunteer/.test(text) &&
    /\b(?:full[- ]?time|jobs?|roles?|positions?|opportunit(?:y|ies)|employment|work)\b/.test(
      text,
    ) &&
    /\b(?:open to|open for|available|availability|looking for|seeking|interested in|accepting|hiring|hire)\b/.test(
      text,
    )
  );
}

export function isRookContactQuestion(question) {
  const text = normalizeRookQuestion(question);
  // "Contact integration" names technical work; "contact me about it" is an enquiry.
  return /\b(?:hire|interview|touch|reach|message|email)\b|\bcontact\b(?![ -]+(?:framework|access|integration|librar(?:y|ies))\b)|\bphone\s*(?:number|contact)\b|^phone\??$|@/.test(
    text,
  );
}

export function isRookPlatformQuestion(question) {
  const text = normalizeRookQuestion(question);
  if (isRookContactQuestion(text)) return false;

  if (/\bsdlc\b|\bcomponent[ -]+integration[ -]+mcp\b/.test(text)) return false;

  if (
    /\bapple intelligence\b|\bspeech[ -]?analy[sz](?:er|is)\b|\bspeech[ -]+(?:recognition|transcription)\b|\bcontinuity\b|\bvision(?:kit)?\b|\bcontacts\b|\bcontact[ -]+(?:framework|access|integration|librar(?:y|ies))\b|\b(?:ios|apple|native|platform)[ -]+(?:(?:platform|feature)[ -]+)?(?:librar(?:y|ies)|frameworks?|wrappers?|capabilit(?:y|ies)|apis?)\b|\bbyok\b|\bbring[ -]your[ -]own[ -](?:api[ -])?key\b|\binbuilt\b|\bzoho(?:'s)?\s+r\s*(?:&|and)\s*d\b/.test(
      text,
    )
  )
    return true;

  return (
    /\b(?:feature|functionality)[ -]+(?:integration(?:[ -]+pipelines?)?|pipelines?)\b/.test(text) &&
    !/\bsdlc\b|\bcomponent[ -]+(?:generation|integration)\b|\bspec[ -]driven\b/.test(text)
  );
}

const projectAliases = {
  WorkTracker: /\bwork\s?tracker\b/,
  'Hermes Companion': /\bhermes\b|\bcompanion\b|\btailscale\b/,
  Tally: /\btally\b/,
  'RK3588 Linux Distribution':
    /\ba0090?(?:-meta)?\b|\bhub-?11\b|\brk3588\b|\blinux\b|\bkernel\b|\bembedded\b|\bdevice tree\b/,
  'Ara → Agent OS': /\bara\b|\bagent[ -]os\b/,
  Hands: /\bshizuku\b|\bvirtual display\b/,
};

// "Hands" is also an everyday English word ("hands on experience"), so the bare
// name only resolves when the question is about device control or names the project.
const ambiguousProjectNames = {
  Hands:
    /\bandroid\b|\bcontrol(?:ler)?\b|\bagent\b|\bshizuku\b|\bvirtual display\b|\baccessibility\b|\bmcp\b/,
};
const leadingProjectQuestion = /^(?:tell me about|what(?:'s| is)|about|describe)\b[^.?!]*\bhands\b/;
// Object position: "How did Raj build Hands?" names the project, not the noun.
const trailingProjectName = /(?:^|\W)hands\s*\??\s*$/;

export function findRookProject(question) {
  const text = normalizeRookQuestion(question);
  // An explicit project name takes precedence over another project's aliases:
  // “Can Hermes upload statements through Tally?” is a Tally question.
  const named = projects.find((project) => {
    const context = ambiguousProjectNames[project.name];
    return [project.name, ...(project.aliases || [])].some((label) => {
      const name = normalizeRookQuestion(label).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!new RegExp(`(?:^|\\W)${name}(?:$|\\W)`).test(text)) return false;
      if (!context || label !== project.name) return true;
      return (
        context.test(text) || leadingProjectQuestion.test(text) || trailingProjectName.test(text)
      );
    });
  });
  return named || projects.find((project) => projectAliases[project.name]?.test(text));
}
