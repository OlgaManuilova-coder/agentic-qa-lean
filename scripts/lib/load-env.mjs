// © 2026 Olga Manuilova — Agentic QA Framework (lean edition). Apache License 2.0: keep this notice and the NOTICE file in all copies. https://github.com/OlgaManuilova-coder/agentic-qa-lean
// Layered environment loader — the ONE way scripts and specs get configuration.
//
// Load order (later overrides earlier):
//   1. .env.defaults          tracked   cross-env constants
//   2. .env.${TEST_ENV}       tracked   per-env URLs / IDs (no secrets in a real project)
//   3. .env.local             ignored   machine-local overrides and secrets
//
// TEST_ENV resolution: process.env.TEST_ENV -> .env.test-env (ignored, one line TEST_ENV=x) -> DEFAULT_ENV.
// Real process environment variables always win over every file (so CI variables override).

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DEFAULT_ENV = 'saucedemo';

/** Parse a dotenv file body into an object. Supports comments, quotes and `export`. */
export function parseDotenv(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    const quoted = value.match(/^(['"])(.*)\1$/);
    if (quoted) value = quoted[2];
    else value = value.replace(/\s+#.*$/, '');
    out[m[1]] = value;
  }
  return out;
}

function readIfExists(file) {
  return existsSync(file) ? parseDotenv(readFileSync(file, 'utf8')) : null;
}

export function resolveTestEnv(root = ROOT, env = process.env) {
  if (env.TEST_ENV) return env.TEST_ENV;
  const pinned = readIfExists(join(root, '.env.test-env'));
  return pinned?.TEST_ENV || DEFAULT_ENV;
}

/**
 * Build the merged configuration without touching process.env.
 * Returns { testEnv, values, layers } where layers lists the files that were found.
 */
export function buildEnv(root = ROOT, env = process.env) {
  const testEnv = resolveTestEnv(root, env);
  const files = ['.env.defaults', `.env.${testEnv}`, '.env.local'];
  const values = {};
  const layers = [];
  for (const name of files) {
    const parsed = readIfExists(join(root, name));
    if (parsed) {
      Object.assign(values, parsed);
      layers.push(name);
    }
  }
  values.TEST_ENV = testEnv;
  for (const key of Object.keys(values)) {
    if (env[key] !== undefined && env[key] !== '') values[key] = env[key];
  }
  return { testEnv, values, layers };
}

/** Load into process.env (real env vars still win). Returns the same object as buildEnv. */
export function loadEnv(root = ROOT) {
  const result = buildEnv(root, process.env);
  for (const [k, v] of Object.entries(result.values)) {
    if (process.env[k] === undefined || process.env[k] === '') process.env[k] = v;
  }
  return result;
}
