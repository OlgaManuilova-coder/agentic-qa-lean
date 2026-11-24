#!/usr/bin/env node
// Deterministic first pass of /qa-review-tests: flags candidate quality problems in CSV cases.
// It never edits anything. Every hit is a CANDIDATE: the reviewing agent confirms it before it
// becomes a finding (some vague words are fine in context).
//   npm run review:tests [-- <suite-id> ... | changed] [--file <csv>] [--json] [--all]
// Candidates a reviewer accepted (with a reason) live in config/review-accepted.json and are hidden.
// Unknown suite ids are an error (exit 2), never a silent "no candidates".
// Structure (columns, tags, placeholders, rule ids) is already gated by `npm run suites:lint`.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { ROOT } from './lib/load-env.mjs';
import { parseCsvRecords } from './lib/csv.mjs';
import { loadManifest } from './lib/suites.mjs';

const VAGUE_ACTION = /\b(any|some|several|etc\.?|appropriate|relevant|as needed|if needed|various)\b/i;
const VAGUE_ORACLE = /\b(correct(ly)?|proper(ly)?|works?|working|fine|ok|as expected|appropriate|valid|reasonable|looks? (good|right)|normal(ly)?|successful(ly)?)\b/i;
const CONCRETE = /'[^']+'|"[^"]+"|\$?\d|\/[a-z]|\{\{[A-Z_]+\}\}/;

const lines = (cell) => String(cell || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();

/** Review one suite's records. Returns candidate findings. */
export function reviewRecords(records, file = '') {
  const findings = [];
  const add = (id, dimension, code, detail) => findings.push({ file, id, dimension, code, detail });
  const seenSteps = new Map();
  const seenTitles = new Map();
  for (const r of records) {
    // Determinism: actions two agents could perform differently.
    for (const l of lines(r.Steps)) {
      if (/^\[ACT\]/.test(l) && VAGUE_ACTION.test(l)) add(r.ID, 'Determinism', 'DET-1', `vague action: "${l}"`);
    }
    // Testability: assertions with no objective oracle.
    for (const l of lines(r.Assertions)) {
      if (VAGUE_ORACLE.test(l) && !CONCRETE.test(l)) add(r.ID, 'Testability', 'TST-1', `assertion without an exact oracle: "${l}"`);
    }
    // Bug-catching intent (cases-that-catch-bugs.md §2) and grounding (§3).
    if (!String(r.Failure_Signals || '').trim()) add(r.ID, 'Bug-catching intent', 'BUG-1', 'Failure_Signals is empty: what bug would this case catch?');
    if (!String(r.Business_Rule || '').trim()) add(r.ID, 'Grounding', 'GRD-1', 'no Business_Rule: severity and expected behaviour are ungrounded');
    // Duplication.
    const steps = norm(r.Steps);
    const body = steps + '|' + norm(r.Assertions);
    if (steps && seenSteps.has(body)) add(r.ID, 'Duplication', 'DUP-1', `same steps AND assertions as ${seenSteps.get(body)}`);
    else if (steps && seenSteps.has(steps)) add(r.ID, 'Duplication', 'DUP-3', `info: same steps as ${seenSteps.get(steps)}, different assertions; merge, or keep if each has its own failure signal`);
    if (steps) {
      if (!seenSteps.has(body)) seenSteps.set(body, r.ID);
      if (!seenSteps.has(steps)) seenSteps.set(steps, r.ID);
    }
    const title = norm(r.Title);
    if (seenTitles.has(title)) add(r.ID, 'Duplication', 'DUP-2', `same title as ${seenTitles.get(title)}`);
    else seenTitles.set(title, r.ID);
  }
  return findings;
}

/** Split findings into still-open and accepted (config/review-accepted.json: "<ID>|<CODE>" -> reason). */
export function applyAccepted(findings, accepted = {}) {
  const open = [];
  const hidden = [];
  for (const f of findings) (accepted[`${f.id}|${f.code}`] ? hidden : open).push(f);
  return { open, hidden };
}

function loadAccepted() {
  try {
    return JSON.parse(readFileSync(join(ROOT, 'config', 'review-accepted.json'), 'utf8'));
  } catch {
    return {};
  }
}

/** Suites whose CSV changed (tracked diff vs HEAD + untracked files), mapped through the manifest. */
export function changedSuiteIds(manifest, files) {
  return manifest.suites.filter((s) => files.includes(s.file)).map((s) => s.id);
}

function gitFiles() {
  const run = (a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  try {
    return [...run(['diff', '--name-only', 'HEAD']), ...run(['ls-files', '--others', '--exclude-standard'])];
  } catch {
    return [];
  }
}

function main(args) {
  const manifest = loadManifest();
  const fileIdx = args.indexOf('--file');
  const all = [];
  let label;
  if (fileIdx >= 0) {
    const f = args[fileIdx + 1];
    all.push(...reviewRecords(parseCsvRecords(readFileSync(resolve(ROOT, f), 'utf8')).records, f));
    label = `file ${f}`;
  } else {
    let ids = args.filter((a) => !a.startsWith('--'));
    if (ids.includes('changed')) {
      ids = changedSuiteIds(manifest, gitFiles());
      if (!ids.length) return console.log('review:tests — no suite CSV changed');
    }
    const unknown = ids.filter((id) => !manifest.suites.some((s) => s.id === id));
    if (unknown.length) {
      console.error(`unknown suite id(s): ${unknown.join(', ')}. Valid: ${manifest.suites.map((s) => s.id).join(', ')}`);
      process.exit(2);
    }
    const suites = ids.length ? manifest.suites.filter((s) => ids.includes(s.id)) : manifest.suites;
    for (const s of suites) all.push(...reviewRecords(parseCsvRecords(readFileSync(join(ROOT, s.file), 'utf8')).records, s.file));
    label = `${suites.length} suite(s)`;
  }
  const { open, hidden } = args.includes('--all') ? { open: all, hidden: [] } : applyAccepted(all, loadAccepted());
  const note = hidden.length ? ` (${hidden.length} accepted in config/review-accepted.json; --all shows them)` : '';
  if (args.includes('--json')) return console.log(JSON.stringify(open, null, 2));
  if (!open.length) return console.log(`review:tests — no candidates in ${label}${note}`);
  console.log('ID        CODE   DIMENSION             DETAIL');
  for (const f of open) console.log(`${f.id.padEnd(9)} ${f.code.padEnd(6)} ${f.dimension.padEnd(21)} ${f.detail}`);
  console.log(`\n${open.length} candidate(s) in ${label}${note}. Confirm each before treating it as a finding.`);
}

if (process.argv[1]?.endsWith('review-tests.mjs')) main(process.argv.slice(2));
