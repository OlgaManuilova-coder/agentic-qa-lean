#!/usr/bin/env node
// © 2026 Olga Manuilova — Agentic QA Framework (lean edition). MIT License: keep this notice in all copies. https://github.com/OlgaManuilova-coder/agentic-qa-lean
// Prints which env layers loaded and which variables are set / empty / missing.
// Never prints values of variables that look like secrets.

import { buildEnv } from './lib/load-env.mjs';

const REQUIRED = ['FRONT_URL', 'STANDARD_USER', 'USER_PASSWORD'];
const SECRET_HINT = /(PASSWORD|TOKEN|SECRET|KEY)/i;

const { testEnv, values, layers } = buildEnv();

console.log(`TEST_ENV = ${testEnv}`);
console.log(`Layers   = ${layers.join(' -> ') || '(none found)'}`);
console.log('');

let failed = false;
for (const name of Object.keys(values).sort()) {
  const v = values[name];
  const shown = SECRET_HINT.test(name) ? (v ? '<set>' : '<empty>') : v || '<empty>';
  console.log(`  ${REQUIRED.includes(name) ? '*' : ' '} ${name.padEnd(28)} ${shown}`);
}
for (const name of REQUIRED) {
  if (!values[name]) {
    console.error(`\nMISSING required variable: ${name}`);
    failed = true;
  }
}
if (!layers.includes(`.env.${testEnv}`)) {
  console.error(`\nNo .env.${testEnv} file found — is TEST_ENV spelled correctly?`);
  failed = true;
}
console.log(failed ? '\nenv:check FAILED' : '\nenv:check OK  (* = required)');
process.exit(failed ? 1 : 0);
