/** Regression checks for active portfolio content, public claims, navigation contracts, and source architecture. */

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
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return ['vendor', 'prototypes'].includes(entry.name) ? [] : walk(full);
    return /\.(js|jsx)$/.test(entry.name) ? [full] : [];
  });

const SOURCE_FILES = walk(SRC);

const importData = async () => await import(join(SRC, 'data/portfolio.js'));

/* ------------------------------------------------------------------ *
 * 2. Case studies must exist and be reachable
 * ------------------------------------------------------------------ */

test('case-study UI is backed by real project data', async () => {
  const { projects } = await importData();
  const withCaseStudy = projects.filter((p) => p.caseStudy);

  assert.ok(
    withCaseStudy.length > 0,
    'No project has case-study data, so the case-study UI can never render',
  );
});

test('every case study separates problem, approach, scope and limitations', async () => {
  const { projects } = await importData();

  for (const project of projects.filter((p) => p.caseStudy)) {
    for (const field of ['problem', 'approach', 'scope', 'limitations']) {
      assert.ok(
        project.caseStudy[field] && String(project.caseStudy[field]).trim().length > 10,
        `${project.name}: case study is missing a substantive "${field}"`,
      );
    }
  }
});

test('curated projects merge Hermes clients and exclude the removed showcase', async () => {
  const { projects } = await importData();
  assert.deepEqual(
    projects.map((p) => p.name),
    ['WorkTracker', 'Hermes Companion', 'Tally', 'a0090-meta (hub-11 OS)', 'Ara → Agent OS'],
  );
});

/* ------------------------------------------------------------------ *
 * 3. Unsupported claims must not ship to the client
 * ------------------------------------------------------------------ */

// Patterns are matched against source text only. No confidential literal is
// ever placed in this file: these are generic public-facing claim shapes.
const FORBIDDEN = [
  [/\b\d+\s*%\s*(faster|improvement|reduction|less|more)\b/i, 'quantified improvement claim'],
  [
    /\b(reducing|cutting|slashing)\s+\w+\s+(?:time|dev(elopment)? time)\s+by\s*\d+/i,
    'unverified dev-time percentage',
  ],
  [/\b(top|top-)\s*10\s*%/i, 'unverified top-10% race ranking'],
  [/national\s+finalist/i, 'unverified finalist distinction'],
  [/\b\d+\s*\+\s*years?\b/i, 'hardcoded year count'],
  [/\b\d+\s*yrs?\s+\d+\s*mos?\b/i, 'hardcoded duration string'],
  [/\bslash(ed|ing)\b[^.]*\b\d+\s*%/i, 'unverified percentage improvement'],
];

test('no unsupported quantitative claims in client-delivered source', () => {
  // Comments explain which strings were removed and why; the audit targets
  // shipped string literals, so comment-only matches are not violations.
  const stripComments = (text) =>
    text
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .split('\n')
      .map((line) => line.replace(/(^|[^:])\/\/.*$/, '$1'))
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
  // The quotations and attributed names must be gone from bundled source, not
  // merely hidden from the UI. Only generic shape markers are checked here so
  // no removed literal has to be reproduced in this test.
  const combined = SOURCE_FILES.map((f) => readFileSync(f, 'utf8')).join('\n');

  assert.ok(
    !/quote\s*:\s*["'`]/.test(combined),
    'A testimonial quotation is still present in client-delivered data',
  );
  assert.ok(
    !/(Senior Software Engineer|Engineering Manager|Product Manager)\s*,\s*\w/.test(combined),
    'A named attribution with an employer role is still present in client-delivered data',
  );
});

test('skill groups replace percentage bars', async () => {
  const { SKILL_GROUPS } = await import(join(SRC, 'features/skills/skillEvidence.js'));
  assert.ok(SKILL_GROUPS.length > 0);
  for (const group of SKILL_GROUPS) {
    assert.ok(group.skills.length > 0);
    assert.ok(
      group.skills.some((skill) => typeof skill.evidence === 'string' && skill.evidence.length > 0),
      `${group.name} needs concrete evidence`,
    );
  }

  const skills = read('src/features/skills/SkillsSection.jsx');
  assert.ok(
    !/aria-valuenow/.test(skills) && !/ProgressBar/.test(skills),
    'Percentage proficiency bars must not be rendered',
  );
});

test('participation is retained without unsupported distinctions', async () => {
  const { awardsData, achievementsData } = await importData();

  // Confirmed participation is retained.
  assert.ok(
    JSON.stringify(awardsData).toLowerCase().includes('smart india hackathon'),
    'Confirmed hackathon participation must be retained',
  );
  assert.ok(
    JSON.stringify(achievementsData).toLowerCase().includes('obstacle'),
    'Confirmed obstacle-race participation must be retained',
  );

  // The distinction may only be denied, never asserted. An explicit denial
  // ("no finalist distinction is claimed") is honest and stays allowed.
  const text = `${JSON.stringify(awardsData)} ${JSON.stringify(achievementsData)}`;
  assert.ok(
    !/national\s+finalist/i.test(text),
    'A finalist distinction is not supported by a verified record',
  );
  assert.ok(
    !/\btop\s*10\s*%/i.test(text),
    'A top-10% race ranking is not supported by a verified event result',
  );
});

/* ------------------------------------------------------------------ *
 * 4. Tenure is derived, not hardcoded
 * ------------------------------------------------------------------ */

test('employment wording stays anchored to the confirmed start date', async () => {
  const { experienceData, profileData } = await importData();
  assert.equal(experienceData[0].startDate, '2022-05');
  assert.match(profileData.summary, /since May 2022/i);
});

/* ------------------------------------------------------------------ *
 * 5. Destinations must be honest
 * ------------------------------------------------------------------ */

test('unapproved unavailable destinations are not published', () => {
  const combined = SOURCE_FILES.map((f) => readFileSync(f, 'utf8')).join('\n');

  // Verified unavailable: 404 to unauthenticated visitors / private repo.
  assert.ok(
    !combined.includes('personal-trainer-mock.web.app'),
    'FitPro demo returns HTTP 404 and must not be published',
  );
  assert.ok(
    !combined.includes('coding-nyx/nexus-react-native'),
    'Ara repository is private and 404s for recruiters',
  );
  assert.ok(
    !combined.includes('agent-nexus.web.app'),
    'Superseded Ara interface URL should not remain in public content',
  );
});

test('deprecated Ara links to Agent OS in development and labels the earlier preview', async () => {
  const { projects } = await importData();
  const ara = projects.find((p) => p.name === 'Ara → Agent OS');
  assert.equal(ara.liveUrl, 'https://agent-agnes-ai.web.app/');
  assert.equal(ara.linkLabel, 'Earlier Ara prototype');
  assert.match(ara.status, /in development/i);
  assert.equal(ara.developmentStatus, 'in-progress');
  assert.match(ara.description, /Ara is deprecated/);
  assert.match(ara.caseStudy.scope, /pinned Hermes runtime supplies native agent execution/);
  assert.match(ara.linksUnavailableReason, /not an Agent OS demo/);
  assert.equal(ara.repoUrl, 'https://github.com/coding-nyx/agent-os');
});

test('working public repositories stay linked', async () => {
  const { projects } = await importData();
  const linked = projects
    .flatMap((p) => [p.repoUrl, ...(p.sourceLinks || []).map((link) => link.url)])
    .filter(Boolean);

  for (const url of [
    'https://github.com/coding-nyx/hermes-companion-app',
    'https://github.com/coding-nyx/a0090-meta',
    'https://github.com/coding-nyx/worktracker',
  ]) {
    assert.ok(linked.includes(url), `${url} is publicly reachable and must stay linked`);
  }
});

test('the APK destination is labelled as releases, not a live demo', async () => {
  const { projects } = await importData();
  const companion = projects.find((p) => p.name === 'Hermes Companion');

  assert.match(companion.liveUrl, /releases/);
  assert.match(
    companion.linkLabel,
    /release|apk/i,
    'A GitHub releases link must not be labelled "Live"',
  );
});

/* ------------------------------------------------------------------ *
 * 6. Recruiter-facing essentials
 * ------------------------------------------------------------------ */

test('hero exposes recruiter actions with unambiguous labels', () => {
  const hero = read('src/features/profile/HeroSection.jsx');
  assert.match(
    hero,
    /href="#experience"[^>]*>\s*View iOS work\s*</,
    'native work needs a direct hiring path',
  );
  assert.match(
    hero,
    /href=\{resumeUrl\}[^>]*download>\s*Resume/,
    'résumé download must remain available',
  );
  assert.match(hero, /href="#contact"[^>]*>\s*Contact\s*</, 'contact action must remain available');
});

test('recruiter content renders without waiting for a boot animation', () => {
  const app = read('src/app/App.jsx');

  assert.doesNotMatch(app, /BootSequence|bootComplete/);
  assert.match(app, /<HeroSection/);
  assert.match(app, /<ContactSection/);
  assert.ok(!existsSync(join(SRC, 'components/BootSequence.jsx')));
});

test('the removed Testimonials component is not referenced', () => {
  const app = read('src/app/App.jsx');
  assert.ok(!app.includes('Testimonials'), 'App must not import or render Testimonials');
  assert.ok(
    !existsSync(join(SRC, 'components/Testimonials.jsx')),
    'Testimonials component should be deleted, not left dangling',
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
  assert.equal(profileData.socialLinks.email, 'hello@iamnyx.dev');

  const zoho = experienceData.find((e) => e.company === 'Zoho' && e.type === 'Full-time');
  assert.ok(zoho, 'Zoho full-time role must be preserved');
  assert.equal(zoho.role, 'Member of Technical Staff');
  assert.equal(zoho.dates, 'May 2022 - Present');
});

test('no conversational nickname appears in professional material', async () => {
  const { profileData, experienceData, projects, skillsData, awardsData, achievementsData } =
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
    JSON.stringify(skillsData),
    JSON.stringify(awardsData),
    JSON.stringify(achievementsData),
    ...projects.map(
      (p) =>
        `${p.name} ${p.description} ${p.scope || ''} ${(p.caseStudy && Object.values(p.caseStudy).join(' ')) || ''}`,
    ),
  ]
    .join(' ')
    .toLowerCase();

  assert.ok(!/\bnyx\b/.test(copy), 'Conversational nickname must not appear in professional copy');
});

// Prevent another parallel implementation from silently accumulating outside the app graph.
test('production source modules are reachable from the app or server entry point', () => {
  const visited = new Set();
  const visiting = new Set();
  function visit(file) {
    assert.ok(!visiting.has(file), `Circular production dependency: ${file}`);
    if (visited.has(file)) return;
    visited.add(file);
    if (!/\.(?:js|jsx|mjs)$/.test(file)) return;
    visiting.add(file);
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/(?:from\s*|import\s*\(?\s*)['"]([^'"]+)['"]/g)) {
      if (!match[1].startsWith('.')) continue;
      const target = join(dirname(file), match[1]);
      if (existsSync(target)) visit(target);
    }
    visiting.delete(file);
  }
  visit(join(SRC, 'main.jsx'));
  visit(join(ROOT, 'server/rook.mjs'));
  assert.deepEqual(
    SOURCE_FILES.filter((file) => !visited.has(file)),
    [],
    'Remove unused modules or connect them through an explicit entry point.',
  );
});

test('contact form validates fields and safely encodes an email draft', async () => {
  const { createContactForm, validateContactForm, contactDraftUrl } = await import(
    join(SRC, 'features/contact/contactModel.js')
  );
  assert.deepEqual(Object.keys(validateContactForm(createContactForm())), [
    'name',
    'email',
    'message',
  ]);
  const form = {
    name: 'A & B',
    email: ' person@example.com ',
    subject: 'Volunteering',
    message: 'Hello?\nCan we talk & plan?',
  };
  assert.deepEqual(validateContactForm(form), {});
  const draft = new URL(contactDraftUrl(form, 'raj@example.com'));
  assert.equal(draft.protocol, 'mailto:');
  assert.equal(draft.searchParams.get('subject'), 'Volunteering — A & B');
  assert.equal(
    draft.searchParams.get('body'),
    'Hello?\nCan we talk & plan?\n\nFrom: A & B <person@example.com>',
  );
});

test('architecture lint rejects reversed layers, sibling features and unresolved imports', async () => {
  const { ESLint } = await import('eslint');
  const eslint = new ESLint({ cwd: ROOT });
  const violations = [
    ['src/shared/ui/BoundaryProbe.jsx', '../../app/App.jsx'],
    ['src/features/rook/BoundaryProbe.jsx', '../contact/ContactSection.jsx'],
    ['src/services/boundaryProbe.js', '../features/contact/ContactSection.jsx'],
    ['src/features/rook/BoundaryProbe.jsx', '../../data/portfolio'],
  ];
  for (const [filePath, dependency] of violations) {
    const [result] = await eslint.lintText(`export { default } from '${dependency}';`, {
      filePath,
    });
    assert.ok(
      result.messages.some((message) => message.ruleId === 'architecture/module-boundaries'),
      `${filePath} must reject ${dependency}`,
    );
  }
});
