import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  OLDER_CERT_YEAR,
  certificationYear,
  splitCertifications,
} from '../src/features/achievements/splitCertifications.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

test('certificationYear parses a trailing month-year date', () => {
  assert.equal(certificationYear('Nov 2026'), 2026);
  assert.equal(certificationYear('Jul 2020'), 2020);
  assert.equal(certificationYear('May 2020'), 2020);
});

test('certificationYear returns null for unparseable values without throwing', () => {
  assert.equal(certificationYear(undefined), null);
  assert.equal(certificationYear(null), null);
  assert.equal(certificationYear(''), null);
  assert.equal(certificationYear('TBD'), null);
  assert.equal(certificationYear('November'), null);
  assert.equal(certificationYear({}), null);
});

test('splitCertifications puts 2020-and-earlier in older and everything else in current', () => {
  const input = [
    { name: 'Future', date: 'Jan 2027' },
    { name: 'Current', date: 'Nov 2026' },
    { name: 'Cutoff', date: 'Jul 2020' },
    { name: 'Earlier', date: '2019' },
  ];
  const { current, older } = splitCertifications(input);

  assert.equal(OLDER_CERT_YEAR, 2020);
  assert.deepEqual(
    current.map((item) => item.name),
    ['Future', 'Current'],
  );
  assert.deepEqual(
    older.map((item) => item.name),
    ['Cutoff', 'Earlier'],
  );
});

test('splitCertifications preserves input order within each group', () => {
  const input = [
    { name: 'B-current', date: 'Nov 2026' },
    { name: 'A-older', date: 'May 2020' },
    { name: 'C-current', date: 'Jan 2026' },
    { name: 'D-older', date: 'Jul 2020' },
  ];
  const { current, older } = splitCertifications(input);

  assert.deepEqual(
    current.map((item) => item.name),
    ['B-current', 'C-current'],
  );
  assert.deepEqual(
    older.map((item) => item.name),
    ['A-older', 'D-older'],
  );
});

test('splitCertifications treats unparseable dates as current and does not crash', () => {
  const input = [
    { name: 'Missing date' },
    { name: 'Blank', date: '' },
    { name: 'Words only', date: 'Sometime soon' },
    { name: 'Valid older', date: 'May 2020' },
    null,
    { name: 'Valid current', date: 'Nov 2026' },
  ];

  assert.doesNotThrow(() => splitCertifications(input));
  assert.doesNotThrow(() => splitCertifications(undefined));
  assert.doesNotThrow(() => splitCertifications(null));

  const { current, older } = splitCertifications(input);
  assert.deepEqual(
    current.map((item) => item?.name ?? item),
    ['Missing date', 'Blank', 'Words only', null, 'Valid current'],
  );
  assert.deepEqual(
    older.map((item) => item.name),
    ['Valid older'],
  );
  assert.deepEqual(splitCertifications(undefined), { current: [], older: [] });
});

test('live certificationsData splits Nov 2026 entries as current and 2020 entries as older', async () => {
  const { certificationsData } = await import(join(ROOT, 'src/data/portfolio.js'));
  const { current, older } = splitCertifications(certificationsData);

  assert.deepEqual(
    current.map((item) => item.name),
    [
      'Introduction to Model Context Protocol',
      'AI Capabilities and Limitations',
      'AI Fluency for builders',
    ],
  );
  assert.equal(older.length, 11);
  assert.ok(older.every((item) => certificationYear(item.date) === 2020));
  assert.equal(
    current.length + older.length,
    certificationsData.length,
    'split must keep every certification',
  );
  assert.deepEqual(
    [...current, ...older].map((item) => item.name),
    [
      ...certificationsData.filter((item) => certificationYear(item.date) !== 2020),
      ...certificationsData.filter((item) => certificationYear(item.date) === 2020),
    ].map((item) => item.name),
  );
});
