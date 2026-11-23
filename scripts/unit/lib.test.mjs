// Unit tests for the executable code only (loader, CSV parser, scheduler, validator).
// Rule: no code => no unit test. Suites, prompts and docs are gated by suites:lint, not here.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseCsv } from '../lib/csv.mjs';
import { buildEnv, parseDotenv } from '../lib/load-env.mjs';
import { planLanes } from '../lib/scheduler.mjs';
import { CSV_HEADER, expandSelection, validateSuiteCsv } from '../lib/suites.mjs';

test('parseCsv handles quotes, escaped quotes and newlines inside fields', () => {
  const rows = parseCsv('a,b\n"x, y","line1\nline2 ""q"""\n');
  assert.deepEqual(rows, [['a', 'b'], ['x, y', 'line1\nline2 "q"']]);
});

test('parseDotenv ignores comments and strips quotes', () => {
  assert.deepEqual(parseDotenv('# c\nA=1\nexport B="two words"\nC=3 # trailing\n'), { A: '1', B: 'two words', C: '3' });
});

test('buildEnv layers files and lets real env win', () => {
  const dir = mkdtempSync(join(tmpdir(), 'env-'));
  writeFileSync(join(dir, '.env.defaults'), 'A=default\nB=default\n');
  writeFileSync(join(dir, '.env.demo'), 'B=demo\nC=demo\n');
  writeFileSync(join(dir, '.env.local'), 'C=local\n');
  const { values, layers } = buildEnv(dir, { TEST_ENV: 'demo', A: 'from-process' });
  assert.deepEqual(layers, ['.env.defaults', '.env.demo', '.env.local']);
  assert.equal(values.A, 'from-process');
  assert.equal(values.B, 'demo');
  assert.equal(values.C, 'local');
});

test('planLanes balances by longest-first and reports makespan', () => {
  const plan = planLanes(
    [
      { id: '1', estimatedMinutes: 10 },
      { id: '2', estimatedMinutes: 7 },
      { id: '3', estimatedMinutes: 5 },
      { id: '4', estimatedMinutes: 3 },
    ],
    2,
  );
  assert.equal(plan.total, 25);
  assert.equal(plan.makespan, 13);
  assert.deepEqual(plan.lanes.map((l) => l.suites), [['1', '4'], ['2', '3']]);
});

test('expandSelection supports include, where and exclude', () => {
  const m = {
    suites: [
      { id: '001', priority: 'P0', tags: ['a'] },
      { id: '002', priority: 'P1', tags: ['b'] },
      { id: '003', priority: 'P0', tags: ['b'] },
    ],
    selections: { p0: { where: { priority: 'P0' }, exclude: ['003'], include: ['002'] }, all: { all: true } },
  };
  assert.deepEqual(expandSelection(m, 'p0').map((s) => s.id), ['001', '002']);
  assert.equal(expandSelection(m, 'all').length, 3);
});

test('validateSuiteCsv reports bad tags and unknown placeholders', () => {
  const q = (v) => `"${v}"`;
  const row = ['AUTH-001', 'T', 'S', 'High', '', '', '', 'url={{FRONT_URL}}', '[NAV] go\nclick it', '[DOM] ok', '', '', '', '', 'Agent'];
  const bad = ['AUTH-002', 'T', 'S', 'High', '', '', '', '{{NOPE}}', '[NAV] go', '[DOM] ok', '', '', '', '', 'Agent'];
  const text = [CSV_HEADER.join(','), row.map(q).join(','), bad.map(q).join(',')].join('\n');
  const { errors } = validateSuiteCsv(text, { knownVars: ['FRONT_URL'] });
  assert.equal(errors.length, 2);
  assert.match(errors[0], /Steps line 2/);
  assert.match(errors[1], /\{\{NOPE\}\}/);
});
