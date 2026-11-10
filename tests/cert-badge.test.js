import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { splitCertifications } from '../src/features/achievements/splitCertifications.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(join(ROOT, ...parts), 'utf8');

// Same derivation AchievementsSection uses for the current-card eyebrow.
const formatCertIssuerEyebrow = (issuer) =>
  String(issuer ?? '').replace(/\s+\(([^)]+)\)$/, ' · $1');

test('current-cert eyebrow is derived from issuer and not hardcoded to Anthropic', () => {
  assert.equal(formatCertIssuerEyebrow('Anthropic (Claude Academy)'), 'Anthropic · Claude Academy');
  assert.equal(formatCertIssuerEyebrow('Google (Play Academy)'), 'Google · Play Academy');
  assert.equal(formatCertIssuerEyebrow('Coursera'), 'Coursera');
  assert.equal(
    formatCertIssuerEyebrow('GUVI Geek Networks, IITM Research Park'),
    'GUVI Geek Networks, IITM Research Park',
  );
  const source = read('src/features/achievements/AchievementsSection.jsx');
  assert.equal(
    source.includes("item.issuer.replace(/\\s+\\(([^)]+)\\)$/, ' · $1')"),
    true,
    'component must derive the eyebrow with the signed issuer replace',
  );
  assert.equal(source.includes('ANTHROPIC'), false);
  assert.equal(source.includes('Claude Academy'), false);
});

test('current certification cards keep real certificationsData records', async () => {
  const { certificationsData } = await import(join(ROOT, 'src/data/portfolio.js'));
  const { current, older } = splitCertifications(certificationsData);

  assert.equal(current.length, 4);
  assert.equal(older.length, 11);
  assert.deepEqual(
    current.map((item) => ({
      name: item.name,
      issuer: item.issuer,
      date: item.date,
      credentialUrl: item.credentialUrl,
    })),
    [
      {
        name: 'Introduction to Model Context Protocol',
        issuer: 'Anthropic (Claude Academy)',
        date: 'Nov 2026',
        credentialUrl: 'https://academy.claude.com/badges/791b09bc-5aba-4881-bd9c-2a6ec2f56fe0',
      },
      {
        name: 'AI Capabilities and Limitations',
        issuer: 'Anthropic (Claude Academy)',
        date: 'Nov 2026',
        credentialUrl: 'https://academy.claude.com/badges/2520b8e1-c4ef-40ff-b5c1-f48a42569734',
      },
      {
        name: 'AI Fluency for builders',
        issuer: 'Anthropic (Claude Academy)',
        date: 'Nov 2026',
        credentialUrl: 'https://academy.claude.com/badges/baaaec90-f909-4f9f-ad94-e3f04b4b176a',
      },
      {
        name: 'Play Store Listing Certificate',
        issuer: 'Google (Play Academy)',
        date: 'Nov 2026',
        credentialUrl: undefined,
      },
    ],
  );
});

test('badge styling and current-only aria-labels are scoped to current.map', () => {
  const source = read('src/features/achievements/AchievementsSection.jsx');
  assert.match(source, /import '\.\/badge\.css';/);
  assert.match(
    source,
    /current\.map\(\(item\) => \(\s*<CertificationCard key=\{item\.name\} item=\{item\} current \/>/s,
  );
  assert.match(
    source,
    /older\.map\(\(item\) => \(\s*<CertificationCard key=\{item\.name\} item=\{item\} \/>/s,
  );
  assert.match(
    source,
    /aria-label=\{current \? `View credential: \$\{item\.name\} \(opens in a new tab\)` : undefined\}/,
  );
  assert.match(
    source,
    /current \? `Issued \$\{item\.date\}` : `\$\{item\.issuer\} · \$\{item\.date\}`/,
  );
  assert.equal(source.includes('<h4>{item.name}</h4>'), true);
  assert.equal(source.includes('<h3>{item.name}</h3>'), true);
  assert.equal((source.match(/<CertificationCard /g) || []).length, 2);
});

test('Play Store Listing Certificate has no credential link and stays in Current', async () => {
  const { certificationsData } = await import(join(ROOT, 'src/data/portfolio.js'));
  const { current, older } = splitCertifications(certificationsData);
  const play = current.find((item) => item.name === 'Play Store Listing Certificate');
  const source = read('src/features/achievements/AchievementsSection.jsx');

  assert.ok(play, 'Play Store cert must be in Current');
  assert.equal(play.issuer, 'Google (Play Academy)');
  assert.equal(play.date, 'Nov 2026');
  assert.equal(play.credentialUrl, undefined);
  assert.equal('credentialUrl' in play, false);
  assert.equal(
    older.some((item) => item.name === 'Play Store Listing Certificate'),
    false,
  );
  assert.equal(older.length, 11);
  assert.deepEqual(
    current.map((item) => item.name),
    [
      'Introduction to Model Context Protocol',
      'AI Capabilities and Limitations',
      'AI Fluency for builders',
      'Play Store Listing Certificate',
    ],
  );
  assert.equal(formatCertIssuerEyebrow(play.issuer), 'Google · Play Academy');

  // Current cards with no URL render nothing (no dummy link or Certificate fallback).
  assert.equal(source.includes('item.credentialUrl ? ('), true);
  assert.equal(source.includes(') : current ? null : ('), true);
  assert.equal(source.includes('<span className="port-meta">Certificate</span>'), true);
});
