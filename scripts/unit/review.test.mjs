// Unit tests for the review helpers: accepted review candidates and the prompt frontmatter gate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyAccepted } from '../review-tests.mjs';
import { frontmatterErrors } from '../prompts-lint.mjs';

test('accepted review candidates are hidden, the rest stay open', () => {
  const f = [{ id: 'A-1', code: 'DUP-3' }, { id: 'A-2', code: 'DET-1' }];
  const { open, hidden } = applyAccepted(f, { 'A-1|DUP-3': 'kept: own failure signal' });
  assert.deepEqual(open.map((x) => x.id), ['A-2']);
  assert.deepEqual(hidden.map((x) => x.id), ['A-1']);
});

test('frontmatter gate catches the mistakes that silently drop a description', () => {
  assert.equal(frontmatterErrors('---\nname: x\ndescription: "Use for "this"."\n---\n').length, 1);
  assert.equal(frontmatterErrors('---\nname: x\ndescription: Use for: all\n---\n').length, 1);
  assert.equal(frontmatterErrors('---\nname: x\ndescription: >-\n  Long text\n---\n').length, 1);
  assert.equal(frontmatterErrors('---\nname: x\n---\n').length, 1, 'missing description');
  assert.deepEqual(frontmatterErrors('---\nname: x\ndescription: "Use for \\"this\\": ok."\n---\n'), []);
});
