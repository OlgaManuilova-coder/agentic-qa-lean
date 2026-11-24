#!/usr/bin/env node
// © 2026 Olga Manuilova — Agentic QA Framework (lean edition). MIT License: keep this notice in all copies. https://github.com/OlgaManuilova-coder/agentic-qa-lean
// Prints the suites (optionally of one selection) as a table. Counts are computed, never hand-written.
// Usage: npm run suites:list [-- <selection>]

import { expandSelection, loadManifest } from './lib/suites.mjs';

const manifest = loadManifest();
const name = process.argv[2];
const suites = name ? expandSelection(manifest, name) : manifest.suites;

const rows = suites.map((s) => [s.id, s.priority, s.domain, String(s.testCount), `${s.estimatedMinutes}m`, s.agent, s.name]);
const head = ['ID', 'PRIO', 'DOMAIN', 'CASES', 'EST', 'AGENT', 'NAME'];
const widths = head.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i].length)));
const fmt = (r) => r.map((c, i) => c.padEnd(widths[i])).join('  ');
console.log(fmt(head));
console.log(widths.map((w) => '-'.repeat(w)).join('  '));
rows.forEach((r) => console.log(fmt(r)));
const cases = suites.reduce((n, s) => n + s.testCount, 0);
const minutes = suites.reduce((n, s) => n + s.estimatedMinutes, 0);
console.log(`\n${suites.length} suites, ${cases} cases, ~${minutes} agent-minutes${name ? ` (selection: ${name})` : ''}`);
console.log(`Selections: ${Object.keys(manifest.selections).filter((k) => !k.startsWith('_')).join(', ')}`);
