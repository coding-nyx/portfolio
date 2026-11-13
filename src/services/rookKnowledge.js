import { projects } from '../data/portfolio.js';

export function normalizeRookQuestion(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘]/g, "'")
    .toLowerCase()
    .trim();
}

export function isRookFreelanceAvailabilityQuestion(question) {
  const text = normalizeRookQuestion(question);
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
};

export function findRookProject(question) {
  const text = normalizeRookQuestion(question);
  // An explicit project name takes precedence over another project's aliases:
  // “Can Hermes upload statements through Tally?” is a Tally question.
  const named = projects.find((project) => {
    return [project.name, ...(project.aliases || [])].some((label) => {
      const name = normalizeRookQuestion(label).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(?:^|\\W)${name}(?:$|\\W)`).test(text);
    });
  });
  return named || projects.find((project) => projectAliases[project.name]?.test(text));
}
