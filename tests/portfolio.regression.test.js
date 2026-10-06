/**
 * Regression suite — runs with the Node built-in test runner, no dependencies:
 *
 *   node --test tests/
 *
 * These checks cover the defects that shipped on the portfolio branch:
 *  1. Projects.jsx rendered components that were never declared (TechTag,
 *     Description) inside an unterminated template literal, which crashed the
 *     whole app to the error boundary even though build and lint passed.
 *  2. Case-study UI was gated on project.caseStudy while no project record had
 *     case-study data, so the feature was unreachable.
 *  3. Unsupported claims and named testimonials leaked from client-delivered
 *     data into the public bundle.
 *  4. Tenure wording drifted between surfaces (hero, résumé, terminal, assistant).
 *  5. Dead or non-public destinations were rendered as working links.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');

const read = (...parts) => readFileSync(join(ROOT, ...parts), 'utf8');

// Walk every client-delivered source file. Only src/ is bundled into the public
// JavaScript; public/ is static and has no such text.
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(js|jsx)$/.test(entry.name) ? [full] : [];
  });

const SOURCE_FILES = walk(SRC);

const importData = async () => await import(join(SRC, 'data/portfolio.js'));

/* ------------------------------------------------------------------ *
 * 1. The deleted-component crash
 * ------------------------------------------------------------------ */

test('Projects.jsx declares every styled component it renders', () => {
  const source = read('src/components/Projects.jsx');

  // Imported components and icons are resolved elsewhere; only same-file
  // styled declarations are this component's responsibility.
  const rendered = [...source.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)].map(m => m[1]);
  const declared = new Set(
    [...source.matchAll(/const\s+([A-Z][A-Za-z0-9]*)\s*=\s*styled/g)].map(m => m[1])
  );
  // Local component defined in the same file is fine too.
  [...source.matchAll(/(?:const|function)\s+([A-Z][A-Za-z0-9]*)\s*[=(]/g)].forEach(m =>
    declared.add(m[1])
  );

  // Anything not declared locally must come from an import (named or default).
  const imported = new Set(
    [...source.matchAll(/import\s+\{([^}]+)\}\s+from/g)]
      .flatMap(m => m[1].split(','))
      .map(n => n.trim().split(/\s+as\s+/).pop())
      .filter(Boolean)
  );
  [...source.matchAll(/import\s+([A-Z][A-Za-z0-9]*)\s*(?:,\s*\{[^}]*\})?\s*from/g)].forEach(m =>
    imported.add(m[1])
  );

  const missing = [...new Set(rendered)].filter(
    name => !declared.has(name) && !imported.has(name)
  );
  assert.deepEqual(
    missing,
    [],
    `Undeclared components rendered by Projects.jsx: ${missing}. This is the exact defect that crashed the app.`
  );
});

test('Projects.jsx has balanced styled-components template literals', () => {
  const source = read('src/components/Projects.jsx');
  const declarations = [...source.matchAll(/=\s*styled(?:\.\w+)?\(?[^`]*?`/g)];

  // Each declaration opens a backtick; every one must be closed.
  const ticks = (source.match(/`/g) || []).length;
  assert.equal(
    ticks % 2,
    0,
    'Unbalanced backticks in Projects.jsx: an unterminated styled literal will swallow the code after it'
  );
  assert.ok(declarations.length > 0, 'expected styled component declarations');
});

/* ------------------------------------------------------------------ *
 * 2. Case studies must exist and be reachable
 * ------------------------------------------------------------------ */

test('case-study UI is backed by real project data', async () => {
  const { projects } = await importData();
  const withCaseStudy = projects.filter(p => p.caseStudy);

  assert.ok(
    withCaseStudy.length > 0,
    'No project has case-study data, so the case-study UI can never render'
  );
});

test('every case study separates problem, approach, scope and limitations', async () => {
  const { projects } = await importData();

  for (const project of projects.filter(p => p.caseStudy)) {
    for (const field of ['problem', 'approach', 'scope', 'limitations']) {
      assert.ok(
        project.caseStudy[field] && String(project.caseStudy[field]).trim().length > 10,
        `${project.name}: case study is missing a substantive "${field}"`
      );
    }
  }
});

test('the primary iOS project leads the project list', async () => {
  const { projects } = await importData();
  const first = projects[0].name.toLowerCase();

  assert.ok(
    first.includes('ios'),
    `Expected the iOS work to lead the list for the primary hiring lane, got "${projects[0].name}"`
  );
});

/* ------------------------------------------------------------------ *
 * 3. Unsupported claims must not ship to the client
 * ------------------------------------------------------------------ */

// Patterns are matched against source text only. No confidential literal is
// ever placed in this file: these are generic public-facing claim shapes.
const FORBIDDEN = [
  [/\b\d+\s*%\s*(faster|improvement|reduction|less|more)\b/i, 'quantified improvement claim'],
  [/\b(reducing|cutting|slashing)\s+\w+\s+(?:time|dev(elopment)? time)\s+by\s*\d+/i, 'unverified dev-time percentage'],
  [/\b(top|top-)\s*10\s*%/i, 'unverified top-10% race ranking'],
  [/national\s+finalist/i, 'unverified finalist distinction'],
  [/\b\d+\s*\+\s*years?\b/i, 'hardcoded year count'],
  [/\b\d+\s*yrs?\s+\d+\s*mos?\b/i, 'hardcoded duration string'],
  [/\bslash(ed|ing)\b[^.]*\b\d+\s*%/i, 'unverified percentage improvement'],
];

test('no unsupported quantitative claims in client-delivered source', () => {
  // Comments explain which strings were removed and why; the audit targets
  // shipped string literals, so comment-only matches are not violations.
  const stripComments = text =>
    text
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .split('\n')
      .map(line => line.replace(/(^|[^:])\/\/.*$/, '$1'))
      .join('\n');

  const failures = [];

  for (const file of SOURCE_FILES) {
    const text = stripComments(readFileSync(file, 'utf8'));
    for (const [pattern, label] of FORBIDDEN) {
      if (pattern.test(text)) failures.push(`${file.replace(ROOT, '.')}: ${label}`);
    }
  }

  assert.deepEqual(failures, [], `Unsupported claims found:\n${failures.join('\n')}`);
});

test('named testimonials are removed from client-delivered data', async () => {
  const { testimonialsData } = await importData();

  assert.deepEqual(
    testimonialsData,
    [],
    'Testimonials must stay an empty array until verified quotes and publication permission exist'
  );

  // The quotations and attributed names must be gone from bundled source, not
  // merely hidden from the UI. Only generic shape markers are checked here so
  // no removed literal has to be reproduced in this test.
  const combined = SOURCE_FILES.map(f => readFileSync(f, 'utf8')).join('\n');

  assert.ok(
    !/quote\s*:\s*["'`]/.test(combined),
    'A testimonial quotation is still present in client-delivered data'
  );
  assert.ok(
    !/(Senior Software Engineer|Engineering Manager|Product Manager)\s*,\s*\w/.test(combined),
    'A named attribution with an employer role is still present in client-delivered data'
  );
});

test('skill groups replace percentage bars', async () => {
  const { skillGroupsData } = await importData();

  assert.ok(skillGroupsData.length > 0, 'expected skill groups');
  for (const group of skillGroupsData) {
    assert.ok(
      Array.isArray(group.evidence) && group.evidence.length > 0,
      `${group.title}: skills need concrete evidence, not a rating`
    );
  }

  const skills = read('src/components/Skills.jsx');
  assert.ok(
    !/aria-valuenow/.test(skills) && !/ProgressBar/.test(skills),
    'Percentage proficiency bars must not be rendered'
  );
});

test('participation is retained without unsupported distinctions', async () => {
  const { awardsData, achievementsData } = await importData();

  // Confirmed participation is retained.
  assert.ok(
    JSON.stringify(awardsData).toLowerCase().includes('smart india hackathon'),
    'Confirmed hackathon participation must be retained'
  );
  assert.ok(
    JSON.stringify(achievementsData).toLowerCase().includes('obstacle'),
    'Confirmed obstacle-race participation must be retained'
  );

  // The distinction may only be denied, never asserted. An explicit denial
  // ("no finalist distinction is claimed") is honest and stays allowed.
  const text = `${JSON.stringify(awardsData)} ${JSON.stringify(achievementsData)}`;
  assert.ok(
    !/national\s+finalist/i.test(text),
    'A finalist distinction is not supported by a verified record'
  );
  assert.ok(
    !/\btop\s*10\s*%/i.test(text),
    'A top-10% race ranking is not supported by a verified event result'
  );
});

/* ------------------------------------------------------------------ *
 * 4. Tenure is derived, not hardcoded
 * ------------------------------------------------------------------ */

test('tenure is computed from the employment start date', async () => {
  const { calculateTenure, formatStartDate } = await import(join(SRC, 'utils/tenure.js'));

  // May 2022 -> October 2026 is 53 months: 4 years, 5 months.
  const oct2026 = new Date(2026, 9, 1);
  const tenure = calculateTenure('2022-05', oct2026);

  assert.equal(tenure.totalMonths, 53);
  assert.equal(tenure.years, 4);
  assert.equal(tenure.months, 5);
  assert.equal(formatStartDate('2022-05'), 'May 2022');
});

test('tenure handles exact-year and single-month boundaries', async () => {
  const { calculateTenure } = await import(join(SRC, 'utils/tenure.js'));

  assert.equal(calculateTenure('2022-05', new Date(2026, 4, 15)).totalMonths, 48);
  assert.equal(calculateTenure('2022-05', new Date(2022, 5, 1)).totalMonths, 1);
  assert.equal(calculateTenure('2022-05', new Date(2022, 4, 30)).totalMonths, 0);
});

test('tenure rejects malformed and future start dates', async () => {
  const { calculateTenure } = await import(join(SRC, 'utils/tenure.js'));

  assert.throws(() => calculateTenure('May 2022', new Date()), /Expected YYYY-MM/);
  assert.throws(() => calculateTenure('2022-13', new Date()), /Expected YYYY-MM/);
  assert.throws(() => calculateTenure('2030-01', new Date(2026, 0, 1)), /in the future/);
});

test('no surface hardcodes a year count or a stale duration', () => {
  const surfaces = [
    'src/data/portfolio.js',
    'src/utils/vfs.js',
    'src/components/terminal/VirtualShell.jsx',
    'src/services/minimaxClient.js',
  ];

  for (const surface of surfaces) {
    const text = read(surface);
    assert.ok(
      !/\b\d+\s*\+\s*years?\b/i.test(text),
      `${surface} must not hardcode a year count; use the derived tenure helper`
    );
    assert.ok(
      !/\b\d+\s*yrs?\s+\d+\s*mos?\b/i.test(text),
      `${surface} must not hardcode a duration string`
    );
  }
});

/* ------------------------------------------------------------------ *
 * 5. Destinations must be honest
 * ------------------------------------------------------------------ */

test('no dead or private destinations are published', () => {
  const combined = SOURCE_FILES.map(f => readFileSync(f, 'utf8')).join('\n');

  // Verified unavailable: 404 to unauthenticated visitors / private repo.
  assert.ok(
    !combined.includes('personal-trainer-mock.web.app'),
    'FitPro demo returns HTTP 404 and must not be published'
  );
  assert.ok(
    !combined.includes('coding-nyx/nexus-react-native'),
    'Nexus repository is private and 404s for recruiters'
  );
  assert.ok(
    !combined.includes('agent-agnes-ai.web.app'),
    'Nexus demo renders an unverified shell and must not be presented as working'
  );
});

test('working public repositories stay linked', async () => {
  const { projects } = await importData();
  const linked = projects.filter(p => p.repoUrl).map(p => p.repoUrl);

  for (const url of [
    'https://github.com/coding-nyx/hermes-companion-app',
    'https://github.com/coding-nyx/hermes-companion-web',
    'https://github.com/coding-nyx/a0090-meta',
    'https://github.com/coding-nyx/personal-trainer',
  ]) {
    assert.ok(linked.includes(url), `${url} is publicly reachable and must stay linked`);
  }
});

test('the APK destination is labelled as releases, not a live demo', async () => {
  const { projects } = await importData();
  const companion = projects.find(p => p.name === 'Hermes Companion App');

  assert.match(companion.liveUrl, /releases/);
  assert.match(
    companion.linkLabel,
    /release|apk/i,
    'A GitHub releases link must not be labelled "Live"'
  );
});

/* ------------------------------------------------------------------ *
 * 6. Recruiter-facing essentials
 * ------------------------------------------------------------------ */

test('hero exposes recruiter actions with unambiguous labels', () => {
  const hero = read('src/components/Hero.jsx');

  assert.ok(hero.includes('text="LinkedIn"'), 'Professional must be renamed to LinkedIn');
  assert.ok(hero.includes('text="Email"'), 'Informal must be renamed to Email');
  assert.ok(!hero.includes('Contact for Fun'), '"Contact for Fun" is ambiguous for recruiters');
  assert.ok(hero.includes('View Resume'), 'Résumé action must remain available');
});

test('recruiter content renders without waiting for a boot animation', () => {
  const app = read('src/App.jsx');

  assert.match(
    app,
    /const\s*\[bootComplete,\s*setBootComplete\]\s*=\s*useState\(true\)/,
    'Content must render immediately; boot is an optional interaction'
  );
});

test('the removed Testimonials component is not referenced', () => {
  const app = read('src/App.jsx');
  assert.ok(!app.includes('Testimonials'), 'App must not import or render Testimonials');
  assert.ok(
    !existsSync(join(SRC, 'components/Testimonials.jsx')),
    'Testimonials component should be deleted, not left dangling'
  );
});

test('résumé PDFs remain reachable from the app and the no-JS fallback', () => {
  const html = read('index.html');
  assert.ok(html.includes('/resume-modern.pdf'), 'modern résumé must stay linked');
  assert.ok(html.includes('/resume-cyberpunk.pdf'), 'cyberpunk résumé must stay linked');
  assert.ok(existsSync(join(ROOT, 'public/resume-modern.pdf')));
  assert.ok(existsSync(join(ROOT, 'public/resume-cyberpunk.pdf')));
});

/* ------------------------------------------------------------------ *
 * 7. Sharing metadata
 * ------------------------------------------------------------------ */

test('page has description, canonical and Open Graph metadata', () => {
  const html = read('index.html');

  for (const marker of [
    'name="description"',
    'rel="canonical"',
    'property="og:title"',
    'property="og:description"',
    'property="og:url"',
    'property="og:image"',
    'name="twitter:card"',
  ]) {
    assert.ok(html.includes(marker), `index.html is missing ${marker}`);
  }

  // The share preview must use the current site, not the older résumé host.
  assert.ok(!html.includes('pac-dbe.web.app'), 'do not propagate the old résumé website');
  assert.ok(html.includes('https://iamnyx.web.app/'));
});

/* ------------------------------------------------------------------ *
 * 8. Professional identity is preserved
 * ------------------------------------------------------------------ */

test('professional name and contact details are preserved', async () => {
  const { profileData, experienceData } = await importData();

  assert.equal(profileData.name, 'Raj Kumar S');
  assert.equal(profileData.socialLinks.linkedin, 'https://www.linkedin.com/in/raj-kumar-s');
  assert.match(profileData.socialLinks.email, /@/);

  const zoho = experienceData.find(e => e.company === 'Zoho' && e.type === 'Full-time');
  assert.ok(zoho, 'Zoho full-time role must be preserved');
  assert.equal(zoho.role, 'Member of Technical Staff');
  assert.equal(zoho.dates, 'May 2022 - Present');
});

test('no conversational nickname appears in professional material', async () => {
  const { profileData, experienceData, projects, skillGroupsData, awardsData, achievementsData } =
    await importData();

  // Only human-facing copy is checked. URLs legitimately contain the account
  // name, and the brief says public project URLs must not be removed to hide
  // a public identifier.
  const copy = [
    profileData.name,
    profileData.headline,
    profileData.summary,
    profileData.location,
    JSON.stringify(experienceData),
    JSON.stringify(skillGroupsData),
    JSON.stringify(awardsData),
    JSON.stringify(achievementsData),
    ...projects.map(p => `${p.name} ${p.description} ${p.scope || ''} ${(p.caseStudy && Object.values(p.caseStudy).join(' ')) || ''}`),
  ]
    .join(' ')
    .toLowerCase();

  assert.ok(!/\bnyx\b/.test(copy), 'Conversational nickname must not appear in professional copy');
});