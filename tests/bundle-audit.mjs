/**
 * Production bundle audit.
 *
 *   npm run build && node tests/bundle-audit.mjs
 *
 * Confirms the built public JavaScript/HTML carries no removed claim, dead
 * destination, testimonial or internal identifier, while preserving the
 * legitimate public integrations that must survive.
 *
 * Deliberately reports only clean/not-clean and generic categories. It never
 * prints a matched value, and no confidential literal appears in this file.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

if (!existsSync(DIST)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

const bundleFiles = [
  ...readdirSync(join(DIST, 'assets'))
    .filter((f) => f.endsWith('.js') || f.endsWith('.css'))
    .map((f) => join(DIST, 'assets', f)),
  ...readdirSync(DIST)
    .filter((f) => f.endsWith('.html'))
    .map((f) => join(DIST, f)),
];

const bundle = bundleFiles.map((f) => readFileSync(f, 'utf8')).join('\n');

/**
 * Must be absent from the public bundle.
 *
 * These are generic shapes and already-public URLs — no confidential value is
 * written here.
 */
const FORBIDDEN = [
  ['hardcoded year count', /\b\d+\s*\+\s*years?\b/],
  ['hardcoded duration string', /\b\d+\s*yrs?\s+\d+\s*mos?\b/],
  ['unverified race ranking', /\btop[\s-]*10\s*%/i],
  ['unverified finalist distinction', /national\s+finalist/i],
  [
    'unverified improvement percentage',
    /\b(?:30|20|21|126|180)\s*%\s*(?:faster|less|more|improvement|reduction)/i,
  ],
  ['testimonial quotation', /quote\s*:\s*["'`]/],
  [
    'named endorsement attribution',
    /(?:Senior Software Engineer|Engineering Manager|Product Manager)\s*,\s*[A-Z]/,
  ],
  ['dead demo destination', /personal-trainer-mock/],
  ['private repository destination', /nexus-react-native/],
  ['superseded Ara preview destination', /agent-nexus\.web\.app/],
  ['retired site URL', /pac-dbe/],
  ['retired contact email', /raju9112000/],
  ['internal employment codename', /AXSpec2Code/i],
];

/** Must survive: legitimate public integrations. */
const REQUIRED = [
  ['LinkedIn profile URL', /linkedin\.com\/in\/raj-kumar-s/],
  ['résumé PDF path', /resume-modern\.pdf/],
  ['public companion repository', /coding-nyx\/hermes-companion-app/],
  ['Ara interface preview', /agent-agnes-ai\.web\.app/],
  ['contact mailto', /mailto:/],
];

let clean = true;

console.log('Removed claim / identifier categories:');
for (const [label, pattern] of FORBIDDEN) {
  const hit = pattern.test(bundle);
  if (hit) clean = false;
  console.log(`  ${hit ? 'NOT CLEAN' : 'clean     '}  ${label}`);
}

console.log('\nLegitimate public content that must remain:');
for (const [label, pattern] of REQUIRED) {
  const present = pattern.test(bundle);
  if (!present) clean = false;
  console.log(`  ${present ? 'present  ' : 'MISSING  '}  ${label}`);
}

console.log(`\nPublic-content audit: ${clean ? 'CLEAN' : 'NOT CLEAN'}`);
if (!clean) process.exit(1);

// Audit the dependency graph, not just individual chunk names. Motion features
// load immediately after bootstrap, so they count toward the first-view budget.
const manifestPath = join(DIST, '.vite/manifest.json');
if (!existsSync(manifestPath)) throw new Error('Build manifest is required for bundle budgets.');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const initialKeys = new Set();
function includeStaticDependencies(key) {
  if (initialKeys.has(key)) return;
  if (!manifest[key]) throw new Error(`Unknown build manifest entry: ${key}`);
  initialKeys.add(key);
  for (const dependency of manifest[key].imports || []) includeStaticDependencies(dependency);
}
includeStaticDependencies('index.html');
includeStaticDependencies('src/shared/motion/animationFeatures.js');
const { gzipSync } = await import('node:zlib');
let initialBytes = 0;
let compressedBytes = 0;
for (const key of initialKeys) {
  const content = readFileSync(join(DIST, manifest[key].file));
  initialBytes += content.byteLength;
  compressedBytes += gzipSync(content).byteLength;
}
for (const key of [
  'src/features/rook/RookDialog.jsx',
  'src/features/projects/island/createIsland.js',
  'src/vendor/three.module.min.js',
]) {
  if (!manifest[key]?.isDynamicEntry || initialKeys.has(key))
    throw new Error(`Optional feature must remain deferred: ${key}`);
}
console.log(
  `First-view JavaScript (including motion): ${(initialBytes / 1000).toFixed(1)} kB / ${(compressedBytes / 1000).toFixed(1)} kB gzip`,
);
assertBudget(initialBytes, 450000, 'minified');
assertBudget(compressedBytes, 150000, 'gzip');

function assertBudget(actual, limit, label) {
  if (actual > limit)
    throw new Error(`First-view JavaScript exceeds the ${limit / 1000} kB ${label} budget.`);
}

console.log('Bundle loading and startup budgets: PASS');
