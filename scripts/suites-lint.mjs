#!/usr/bin/env node
// Gate for the regression suites: manifest <-> CSV consistency and the case format.
// Runs in CI on every merge request. A failure means "fix the data", never "skip the gate".

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ROOT, buildEnv } from './lib/load-env.mjs';
import { expandSelection, loadKnownRules, loadManifest, validateSuiteCsv } from './lib/suites.mjs';

const errors = [];
const manifest = loadManifest();
const { values } = buildEnv();
const knownVars = Object.keys(values);
const knownRules = loadKnownRules();

for (const key of ['_meta', 'defaults', 'browserPool', 'suites', 'selections']) {
  if (!(key in manifest)) errors.push(`config/test-suites.json: missing "${key}"`);
}

const seenSuiteIds = new Set();
const seenCaseIds = new Map();
const listedFiles = new Set();

for (const suite of manifest.suites || []) {
  const at = `suite ${suite.id}`;
  for (const f of ['id', 'name', 'file', 'domain', 'layer', 'priority', 'testCount', 'estimatedMinutes', 'agent']) {
    if (suite[f] === undefined || suite[f] === '') errors.push(`${at}: missing field "${f}"`);
  }
  if (seenSuiteIds.has(suite.id)) errors.push(`${at}: duplicate suite id`);
  seenSuiteIds.add(suite.id);
  if (!existsSync(join(ROOT, '.claude', 'agents', `${suite.agent}.md`)))
    errors.push(`${at}: agent "${suite.agent}" has no .claude/agents/${suite.agent}.md`);
  const path = join(ROOT, suite.file);
  listedFiles.add(suite.file);
  if (!existsSync(path)) {
    errors.push(`${at}: file not found ${suite.file}`);
    continue;
  }
  const { errors: csvErrors, records } = validateSuiteCsv(readFileSync(path, 'utf8'), {
    file: suite.file,
    knownVars,
    knownRules,
  });
  errors.push(...csvErrors);
  if (records.length !== suite.testCount)
    errors.push(`${at}: testCount is ${suite.testCount} but ${suite.file} has ${records.length} cases`);
  for (const r of records) {
    if (seenCaseIds.has(r.ID)) errors.push(`${suite.file}: case ${r.ID} duplicates one in ${seenCaseIds.get(r.ID)}`);
    else seenCaseIds.set(r.ID, suite.file);
  }
}

// Every CSV under regression/suites must be registered in the manifest.
function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : n.endsWith('.csv') ? [relative(ROOT, p).split('\\').join('/')] : [];
  });
}
for (const f of walk(join(ROOT, 'regression', 'suites'))) {
  if (!listedFiles.has(f)) errors.push(`${f}: CSV exists but is not registered in config/test-suites.json`);
}

for (const name of Object.keys(manifest.selections || {})) {
  if (name.startsWith('_')) continue;
  try {
    if (expandSelection(manifest, name).length === 0) errors.push(`selection "${name}" is empty`);
  } catch (e) {
    errors.push(e.message);
  }
}

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join('\n'));
  console.error(`\nsuites:lint FAILED (${errors.length} problem${errors.length === 1 ? '' : 's'})`);
  process.exit(1);
}
console.log(`suites:lint OK — ${seenSuiteIds.size} suites, ${seenCaseIds.size} cases`);
