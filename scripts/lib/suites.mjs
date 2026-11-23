// Suite manifest helpers: load config/test-suites.json, expand named selections,
// and validate CSV suites against the case format (docs/csv-format.md).

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './load-env.mjs';
import { parseCsvRecords } from './csv.mjs';

export const CSV_HEADER = [
  'ID', 'Title', 'Section', 'Priority', 'Business_Rule', 'Edge_Case_Refs', 'Preconditions',
  'Test_Data', 'Steps', 'Assertions', 'Cross_Layer_Checks', 'Failure_Signals', 'Cleanup',
  'References', 'Automation_Status',
];
export const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
export const AUTOMATION_STATUSES = ['Agent', 'Candidate', 'Automated', 'Manual'];
export const STEP_TAGS = ['NAV', 'ACT', 'WAIT', 'ASSERT', 'NOTE'];
export const ASSERTION_TAGS = ['DOM', 'STATE', 'URL', 'TEXT', 'VISUAL', 'A11Y'];
export const CROSS_LAYER_TAGS = ['NETWORK', 'CONSOLE', 'API', 'STORAGE', 'PERF'];
/** Placeholders that are filled at run time, not from env files. */
export const RUNTIME_PLACEHOLDERS = ['timestamp', 'RUN_ID', 'LANE_ID'];

export function loadManifest(root = ROOT) {
  return JSON.parse(readFileSync(join(root, 'config', 'test-suites.json'), 'utf8'));
}

/** Expand a named selection ({include} | {all, exclude} | {where, include, exclude}) to suites. */
export function expandSelection(manifest, name) {
  const rule = manifest.selections?.[name];
  if (!rule) throw new Error(`Unknown selection "${name}". Known: ${Object.keys(manifest.selections || {}).join(', ')}`);
  const byId = new Map(manifest.suites.map((s) => [s.id, s]));
  let picked;
  if (rule.all) picked = [...manifest.suites];
  else if (rule.where) {
    picked = manifest.suites.filter((s) =>
      Object.entries(rule.where).every(([k, v]) => {
        if (k === 'tag') return (s.tags || []).includes(v);
        if (k === 'tagAny') return v.some((t) => (s.tags || []).includes(t));
        return Array.isArray(v) ? v.includes(s[k]) : s[k] === v;
      }),
    );
  } else picked = [];
  for (const id of rule.include || []) {
    const s = byId.get(id);
    if (!s) throw new Error(`Selection "${name}" includes unknown suite ${id}`);
    if (!picked.includes(s)) picked.push(s);
  }
  const exclude = new Set(rule.exclude || []);
  return picked.filter((s) => !exclude.has(s.id));
}

function tagsOf(cell) {
  return cell
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => (l.match(/^\[([A-Z0-9_]+)\]/) || [])[1] || null);
}

/**
 * Validate one suite CSV. Returns { errors: string[], records }.
 * knownVars: names usable as {{VAR}}; knownRules: BL ids that exist in the oracle (Set or null to skip).
 */
export function validateSuiteCsv(text, { file = '<csv>', knownVars = [], knownRules = null } = {}) {
  const errors = [];
  let parsed;
  try {
    parsed = parseCsvRecords(text);
  } catch (e) {
    return { errors: [`${file}: ${e.message}`], records: [] };
  }
  const { header, records } = parsed;
  if (header.join('|') !== CSV_HEADER.join('|')) {
    errors.push(`${file}: header mismatch.\n    expected: ${CSV_HEADER.join(',')}\n    found:    ${header.join(',')}`);
    return { errors, records };
  }
  const vars = new Set([...knownVars, ...RUNTIME_PLACEHOLDERS]);
  for (const r of records) {
    const at = `${file}:${r.__line} ${r.ID || '(no id)'}`;
    if (r.__width !== CSV_HEADER.length) errors.push(`${at}: has ${r.__width} cells, expected ${CSV_HEADER.length}`);
    if (!/^[A-Z][A-Z0-9]*-\d{3}[a-z]?$/.test(r.ID)) errors.push(`${at}: ID must look like PREFIX-001`);
    if (!r.Title.trim()) errors.push(`${at}: empty Title`);
    if (!PRIORITIES.includes(r.Priority)) errors.push(`${at}: Priority must be one of ${PRIORITIES.join('/')}`);
    if (!AUTOMATION_STATUSES.includes(r.Automation_Status))
      errors.push(`${at}: Automation_Status must be one of ${AUTOMATION_STATUSES.join('/')}`);
    for (const [col, allowed] of [['Steps', STEP_TAGS], ['Assertions', ASSERTION_TAGS], ['Cross_Layer_Checks', CROSS_LAYER_TAGS]]) {
      const tags = tagsOf(r[col]);
      if (col !== 'Cross_Layer_Checks' && tags.length === 0) errors.push(`${at}: ${col} is empty`);
      tags.forEach((t, i) => {
        if (!t || !allowed.includes(t)) errors.push(`${at}: ${col} line ${i + 1} must start with one of [${allowed.join('] [')}]`);
      });
    }
    for (const col of CSV_HEADER) {
      for (const m of String(r[col]).matchAll(/\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/g)) {
        if (!vars.has(m[1])) errors.push(`${at}: unknown placeholder {{${m[1]}}} in ${col}`);
      }
    }
    if (knownRules && r.Business_Rule) {
      for (const id of r.Business_Rule.split(/[;,\s]+/).filter(Boolean)) {
        if (!knownRules.has(id)) errors.push(`${at}: Business_Rule ${id} not found in the BL oracle`);
      }
    }
  }
  return { errors, records };
}

/** Collect BL-* ids defined (as headings or table rows) in the oracle markdown. */
export function loadKnownRules(root = ROOT) {
  const file = join(root, '.claude', 'knowledge', 'oracles', 'business-logic.md');
  if (!existsSync(file)) return null;
  const ids = new Set();
  for (const m of readFileSync(file, 'utf8').matchAll(/^(?:#+\s*|\|\s*)(BL-[A-Z]+-\d{3})\b/gm)) ids.add(m[1]);
  return ids;
}
