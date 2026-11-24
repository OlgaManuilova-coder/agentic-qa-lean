#!/usr/bin/env node
// © 2026 Olga Manuilova — Agentic QA Framework (lean edition). MIT License: keep this notice in all copies. https://github.com/OlgaManuilova-coder/agentic-qa-lean
// Deterministic fact collection for /prompt-review: everything about a prompt file that a script can
// know, so the reviewing agent spends its judgement on what a script cannot.
//   npm run prompt:facts -- <name | path | all | changed> [--json]
// The facts are NOT exhaustive: only backticked paths with known prefixes are checked. Bare file names,
// relative links and numbers in prose still need a human or agent read.
// <name> resolves to .claude/agents/<name>.md, .claude/commands/<name>.md, .claude/skills/<name>/SKILL.md.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ROOT } from './lib/load-env.mjs';

export const SIZE_WARN = 8000; // chars; agent/command/SKILL.md files are loaded whole on every use
const PREFIXES = ['.claude/', 'scripts/', 'config/', 'docs/', 'regression/', 'tests/', 'test-data/', 'examples/'];
const rel = (p) => relative(ROOT, p).split('\\').join('/');

export function resolveTargets(arg, root = ROOT) {
  const c = join(root, '.claude');
  const listMd = (d) => (existsSync(d) ? readdirSync(d).filter((f) => f.endsWith('.md')).map((f) => join(d, f)) : []);
  const skills = existsSync(join(c, 'skills')) ? readdirSync(join(c, 'skills')).map((d) => join(c, 'skills', d, 'SKILL.md')).filter(existsSync) : [];
  if (arg === 'all') return [...listMd(join(c, 'agents')), ...listMd(join(c, 'commands')), ...skills];
  if (arg === 'changed') {
    let files = [];
    try {
      const run = (a) => execFileSync('git', a, { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
      files = [...run(['diff', '--name-only', 'HEAD']), ...run(['ls-files', '--others', '--exclude-standard'])];
    } catch {}
    // Only loaded-whole prompts; a skill's supporting files are reviewed as part of their skill.
    return [...new Set(files)].filter((f) => /^\.claude\/(agents|commands)\/[^/]+\.md$|^\.claude\/skills\/[^/]+\/SKILL\.md$/.test(f)).map((f) => join(root, f)).filter(existsSync);
  }
  if (existsSync(join(root, arg)) && statSync(join(root, arg)).isFile()) return [join(root, arg)];
  return [join(c, 'agents', `${arg}.md`), join(c, 'commands', `${arg}.md`), join(c, 'skills', arg, 'SKILL.md')].filter(existsSync);
}

export function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  return Object.fromEntries(m[1].split('\n').map((l) => l.match(/^([a-z_-]+):\s*(.*)$/i)).filter(Boolean).map((x) => [x[1], x[2]]));
}

/** Facts for one prompt text. `exists(path)` and `scripts` are injectable for tests. */
export function collectFacts(text, { exists = (p) => existsSync(join(ROOT, p)), scripts = {} } = {}) {
  const fm = frontmatter(text);
  const body = text.replace(/^---\n[\s\S]*?\n---\n?/, '');
  const paths = [...new Set([...body.matchAll(/`([^`\s]+)`/g)].map((m) => m[1].replace(/[),.;:]+$/, '').replace(/#.*$/, '')))]
    .filter((p) => PREFIXES.some((pre) => p.startsWith(pre)) && !/[<>*{}$]|…/.test(p));
  const npm = [...new Set([...body.matchAll(/npm run ([a-z:-]+)/g)].map((m) => m[1]))];
  const counts = [...body.matchAll(/\b\d+[\s-]+(agents?|suites?|cases?|commands?|skills?|hooks?|tests?|columns?|steps?|dimensions?)\b/gi)].map((m) => m[0]);
  const vague = [...body.matchAll(/\b(consider|try to|if possible|as appropriate|etc\.?|and so on|maybe|might want to)\b/gi)].map((m) => m[0]);
  return {
    chars: text.length,
    overSize: text.length > SIZE_WARN,
    frontmatter: fm ? Object.keys(fm) : [],
    missingFrontmatter: fm ? ['name', 'description'].filter((k) => !fm[k] && !(k === 'name' && fm.description)) : ['frontmatter'],
    descriptionChars: fm?.description?.length ?? 0,
    danglingPaths: paths.filter((p) => !exists(p)),
    unknownNpmScripts: npm.filter((s) => !(s in scripts)),
    hardCodedCounts: counts,
    vaguePhrases: vague,
    numberedSteps: (body.match(/^\s*\d+\.\s/gm) || []).length,
    // An explicit output contract: an Output/Return/Report heading, or a numbered step that prints/reports/returns.
    hasOutputSection: /^#+\s*(output|return|report)|^\s*\d+\.\s.*\b(print|report|return)/im.test(body),
  };
}

export function callers(name, root = ROOT) {
  const re = new RegExp(`(^|[^A-Za-z0-9_-])/?${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-z0-9_-]|$)`);
  const hits = [];
  const walk = (d) => {
    for (const n of readdirSync(d)) {
      if (['node_modules', '.git', 'results', 'test-results'].includes(n)) continue;
      const p = join(d, n);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(md|mjs|json|yml)$/.test(n) && re.test(readFileSync(p, 'utf8'))) hits.push(rel(p));
    }
  };
  walk(root);
  return hits;
}

function main(args) {
  const arg = args.find((a) => !a.startsWith('--')) || 'all';
  const targets = resolveTargets(arg);
  if (!targets.length) {
    console.error(arg === 'changed' ? 'no changed agent, command or SKILL.md files' : `no prompt file found for "${arg}"`);
    process.exit(1);
  }
  const scripts = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).scripts || {};
  const out = targets.map((t) => {
    const name = t.endsWith('SKILL.md') ? t.split('/').at(-2) : t.split('/').at(-1).replace(/\.md$/, '');
    return { file: rel(t), name, ...collectFacts(readFileSync(t, 'utf8'), { scripts }), callers: callers(name).filter((c) => c !== rel(t)) };
  });
  if (args.includes('--json')) return console.log(JSON.stringify(out, null, 2));
  for (const f of out) {
    const flags = [
      f.overSize && `size ${f.chars} > ${SIZE_WARN}`,
      f.missingFrontmatter.length && `frontmatter missing: ${f.missingFrontmatter.join(', ')}`,
      f.danglingPaths.length && `dangling paths: ${f.danglingPaths.join(', ')}`,
      f.unknownNpmScripts.length && `unknown npm scripts: ${f.unknownNpmScripts.join(', ')}`,
      f.hardCodedCounts.length && `hard-coded counts: ${f.hardCodedCounts.join(', ')}`,
      f.vaguePhrases.length && `vague phrases: ${[...new Set(f.vaguePhrases)].join(', ')}`,
      !f.hasOutputSection && 'no Output/Return/Report section',
    ].filter(Boolean);
    console.log(`${f.file}  (${f.chars} chars, ${f.numberedSteps} numbered steps, ${f.callers.length} callers)`);
    console.log(flags.length ? flags.map((x) => `  - ${x}`).join('\n') : '  - no candidates');
    if (f.callers.length) console.log(`  callers: ${f.callers.join(', ')}`);
  }
}

if (process.argv[1]?.endsWith('prompt-facts.mjs')) main(process.argv.slice(2));
