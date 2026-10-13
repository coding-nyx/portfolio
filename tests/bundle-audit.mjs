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
    .filter(f => f.endsWith('.js') || f.endsWith('.css'))
    .map(f => join(DIST, 'assets', f)),
  ...readdirSync(DIST)
    .filter(f => f.endsWith('.html'))
    .map(f => join(DIST, f)),
];

const bundle = bundleFiles
  .map(f => readFileSync(f, 'utf8'))
  .join('\n');

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
  ['unverified improvement percentage', /\b(?:30|20|21|126|180)\s*%\s*(?:faster|less|more|improvement|reduction)/i],
  ['testimonial quotation', /quote\s*:\s*["'`]/],
  ['named endorsement attribution', /(?:Senior Software Engineer|Engineering Manager|Product Manager)\s*,\s*[A-Z]/],
  ['dead demo destination', /personal-trainer-mock/],
  ['private repository destination', /nexus-react-native/],
  ['unverified demo destination', /agent-agnes-ai/],
  ['retired site URL', /pac-dbe/],
  ['internal employment codename', /AXSpec2Code/i],
];

/** Must survive: legitimate public integrations. */
const REQUIRED = [
  ['LinkedIn profile URL', /linkedin\.com\/in\/raj-kumar-s/],
  ['résumé PDF path', /resume-modern\.pdf/],
  ['public companion repository', /coding-nyx\/hermes-companion-app/],
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

console.log(`\nBundle audit: ${clean ? 'CLEAN' : 'NOT CLEAN'}`);
process.exit(clean ? 0 : 1);