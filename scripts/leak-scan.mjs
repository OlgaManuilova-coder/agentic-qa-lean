#!/usr/bin/env node
// © 2026 Olga Manuilova — Agentic QA Framework (lean edition). Apache License 2.0: keep this notice and the NOTICE file in all copies. https://github.com/OlgaManuilova-coder/agentic-qa-lean
// Leak scan for a public repository: fails when a tracked file carries a marker that only private material has
// (the private editions' copyright notice, links to the private repositories, a proprietary-licence line).
// Mentioning the Enterprise edition or the Assured Autonomy Framework by name is fine; copying their files is not.
// The markers are assembled from parts so this file does not match itself.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const OWNER = 'OlgaManuilova' + '-coder/';
export const MARKERS = [
  ['(Enterprise ' + 'edition). Keep this notice', 'notice of a private Enterprise-edition file'],
  [OWNER + 'agentic-sdlc-' + 'full', 'link to a private repository'],
  [OWNER + 'agentic-qa-' + 'full', 'link to a private repository'],
  [OWNER + 'assured-' + 'autonomy', 'link to a private repository'],
  ['Proprietary and ' + 'confidential', 'proprietary licence line'],
];

/** Scan the tracked files under root. Returns [{file, line, why}]. */
export function scan(root) {
  const files = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
  const hits = [];
  for (const file of files) {
    let text;
    try {
      const buf = readFileSync(join(root, file));
      if (buf.includes(0)) continue; // binary
      text = buf.toString('utf8');
    } catch {
      continue; // a deleted-but-tracked path or a submodule
    }
    const lower = text.toLowerCase();
    for (const [marker, why] of MARKERS) {
      const at = lower.indexOf(marker.toLowerCase());
      if (at >= 0) hits.push({ file, line: text.slice(0, at).split('\n').length, why });
    }
  }
  return hits;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const hits = scan(process.cwd());
  if (!hits.length) {
    console.log('leak:scan OK — no private markers in tracked files');
    process.exit(0);
  }
  for (const h of hits) console.error(`✗ ${h.file}:${h.line} ${h.why}`);
  console.error('Remove the private material (or its notice) before this can be public.');
  process.exit(1);
}
