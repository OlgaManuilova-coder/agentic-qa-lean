#!/usr/bin/env node
// © 2026 Olga Manuilova — Agentic QA Framework (lean edition). MIT License: keep this notice in all copies. https://github.com/OlgaManuilova-coder/agentic-qa-lean
// Hard gate for prompt files (.claude/agents, .claude/commands, .claude/skills/*/SKILL.md):
// the frontmatter must parse. A broken frontmatter is silent at runtime — the file loads with no name
// and no description, so the agent or skill is never picked. Judgement on prompts is /prompt-review.
//   npm run prompts:lint

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './lib/load-env.mjs';

/** Frontmatter mistakes YAML cannot parse, plus block scalars the one-line readers cannot read. */
export function frontmatterErrors(text) {
  const m = /^---\n([\s\S]*?)\n---/.exec(text);
  if (!m) return ['no frontmatter block (--- … ---) at the top'];
  const out = [];
  const keys = new Set();
  for (const line of m[1].split('\n')) {
    const kv = /^([A-Za-z][\w-]*):[ \t]*(.*)$/.exec(line);
    if (!kv) continue;
    const [, key, value] = kv;
    keys.add(key);
    if (/^[>|]-?$/.test(value)) out.push(`\`${key}\`: block scalar; use one double-quoted line (prompt:facts reads one line)`);
    else if (value.startsWith('"')) {
      const inner = value.slice(1, value.endsWith('"') ? -1 : undefined);
      if (!value.endsWith('"') || /(^|[^\\])"/.test(inner)) out.push(`\`${key}\`: unescaped " inside a double-quoted value (escape it as \\")`);
    } else if (!/^['[{]/.test(value) && /: /.test(value)) out.push(`\`${key}\`: ": " in an unquoted value (quote the whole value)`);
  }
  if (!keys.has('description')) out.push('no `description` (it decides when the prompt is picked)');
  return out;
}

function promptFiles(root = ROOT) {
  const md = (d) => (existsSync(d) ? readdirSync(d).filter((f) => f.endsWith('.md')).map((f) => join(d, f)) : []);
  const skills = join(root, '.claude', 'skills');
  return [
    ...md(join(root, '.claude', 'agents')),
    ...md(join(root, '.claude', 'commands')),
    ...(existsSync(skills) ? readdirSync(skills).map((d) => join(skills, d, 'SKILL.md')).filter(existsSync) : []),
  ];
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const files = promptFiles();
  const errors = files.flatMap((f) => frontmatterErrors(readFileSync(f, 'utf8')).map((e) => `${relative(ROOT, f)}: ${e}`));
  errors.forEach((e) => console.error(`✗ ${e}`));
  if (errors.length) {
    console.error(`\nprompts:lint FAILED (${errors.length})`);
    process.exit(1);
  }
  console.log(`prompts:lint OK — ${files.length} prompt files, frontmatter parses`);
}
