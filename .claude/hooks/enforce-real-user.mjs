#!/usr/bin/env node
// © 2026 Olga Manuilova — Agentic QA Framework (lean edition). Apache License 2.0: keep this notice and the NOTICE file in all copies. https://github.com/OlgaManuilova-coder/agentic-qa-lean
// PreToolUse hook — agents must drive the browser like a real user.
//
// Blocks JavaScript evaluation through any browser MCP server (browser_evaluate,
// browser_run_code, evaluate_script) unless the payload is READ-ONLY measurement that has
// no user-facing equivalent (layout geometry, computed style, document title...).
// Why: a real user cannot click a disabled button or set a value through JS. A test that
// forces the UI proves nothing and hides real defects.
//
// Contract (Claude Code hooks): JSON on stdin; exit 0 = allow; exit 2 = block, stderr goes to the agent.
// Escape hatch for a reviewed, documented case: put /* @allow-eval: <reason> */ in the script.

import { readFileSync } from 'node:fs';

export const ALLOWED_PATTERNS = [
  /\bgetBoundingClientRect\s*\(/, // layout measurement
  /\bgetComputedStyle\s*\(/, // style / contrast audits
  /\bdocument\.title\b/, // SEO title read
  /\b(naturalWidth|naturalHeight)\b/, // broken-image audit
  /\blocalStorage\.getItem\s*\(/, // read-only state inspection
  /\bperformance\.(now|getEntries)/, // timing measurement
  /\/\*\s*@allow-eval:\s*\S.+?\*\//, // reviewed exception with a reason
];
export const MUTATING = [/\.click\s*\(/, /\.value\s*=/, /removeAttribute\s*\(\s*['"]disabled/, /dispatchEvent\s*\(/, /localStorage\.(setItem|clear|removeItem)/];

export function decide(toolInput = {}) {
  const code = String(toolInput.function ?? toolInput.code ?? toolInput.expression ?? toolInput.script ?? '');
  if (/\/\*\s*@allow-eval:\s*\S.+?\*\//.test(code)) return { allow: true };
  if (MUTATING.some((re) => re.test(code))) return { allow: false, reason: 'the script mutates the page (click/value/disabled/events/storage writes)' };
  if (ALLOWED_PATTERNS.some((re) => re.test(code))) return { allow: true };
  return { allow: false, reason: 'the script is not a recognised read-only measurement' };
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('enforce-real-user.mjs')) {
  let input = {};
  try {
    input = JSON.parse(readFileSync(0, 'utf8') || '{}');
  } catch {
    process.exit(0); // never break the session on malformed input
  }
  const verdict = decide(input.tool_input);
  if (!verdict.allow) {
    process.stderr.write(
      `BLOCKED by real-user rule: ${verdict.reason}.\n` +
        'Drive the UI like a customer (click/type/select/wait). A disabled control is a PASS for validation, not a reason to force it.\n' +
        'If the step truly needs a read-only measurement, keep it read-only; if the case cannot be done by a user, report it AMBIGUOUS.\n',
    );
    process.exit(2);
  }
  process.exit(0);
}
