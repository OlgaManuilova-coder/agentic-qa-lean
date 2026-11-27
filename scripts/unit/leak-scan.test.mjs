// © 2026 Olga Manuilova — Agentic QA Framework (lean edition). Apache License 2.0: keep this notice and the NOTICE file in all copies. https://github.com/OlgaManuilova-coder/agentic-qa-lean
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MARKERS, scan } from '../leak-scan.mjs';

const repo = (files) => {
  const dir = mkdtempSync(join(tmpdir(), 'leak-'));
  execFileSync('git', ['init', '-q'], { cwd: dir });
  for (const [f, text] of Object.entries(files)) writeFileSync(join(dir, f), text);
  execFileSync('git', ['add', '-A'], { cwd: dir });
  return dir;
};

test('this public repository carries no private markers', () => {
  assert.deepEqual(scan(process.cwd()), []);
});

test('every marker is caught, with file and line; naming the editions is allowed', () => {
  for (const [marker] of MARKERS) {
    const dir = repo({ 'a.md': `ok line\nthe Enterprise edition adds more\n${marker}\n` });
    try {
      assert.deepEqual(scan(dir).map((h) => [h.file, h.line]), [['a.md', 3]]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

test('untracked files and binary files are not scanned', () => {
  const dir = repo({ 'b.bin': Buffer.concat([Buffer.from([0]), Buffer.from(MARKERS[0][0])]) });
  try {
    writeFileSync(join(dir, 'untracked.md'), MARKERS[0][0]);
    assert.deepEqual(scan(dir), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
