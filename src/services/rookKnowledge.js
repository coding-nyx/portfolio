import { projects } from '../data/portfolio.js';

export function normalizeRookQuestion(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘]/g, "'")
    .toLowerCase()
    .trim();
}

const projectAliases = {
  WorkTracker: /\bwork\s?tracker\b/,
  'Hermes Companion': /\bhermes\b|\bcompanion\b|\btailscale\b/,
  Tally: /\btally\b/,
  'a0090-meta (hub-11 OS)':
    /\ba0090?(?:-meta)?\b|\bhub-?11\b|\brk3588\b|\blinux\b|\bkernel\b|\bembedded\b|\bdevice tree\b/,
  Ara: /\bara\b/,
};

export function findRookProject(question) {
  const text = normalizeRookQuestion(question);
  // An explicit project name takes precedence over another project's aliases:
  // “Can Hermes upload statements through Tally?” is a Tally question.
  const named = projects.find((project) => {
    const name = normalizeRookQuestion(project.name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?:^|\\W)${name}(?:$|\\W)`).test(text);
  });
  return named || projects.find((project) => projectAliases[project.name]?.test(text));
}
