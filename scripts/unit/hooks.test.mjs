import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decide } from '../../.claude/hooks/enforce-real-user.mjs';

test('real-user hook allows read-only measurement', () => {
  assert.equal(decide({ function: '() => document.querySelector("img").naturalWidth' }).allow, true);
  assert.equal(decide({ function: '() => el.getBoundingClientRect()' }).allow, true);
});

test('real-user hook blocks forcing the UI', () => {
  assert.equal(decide({ function: '() => document.querySelector("#finish").click()' }).allow, false);
  assert.equal(decide({ function: '() => { btn.removeAttribute("disabled") }' }).allow, false);
  assert.equal(decide({ function: '() => fetch("/x")' }).allow, false);
});

test('real-user hook honours a reviewed @allow-eval exception', () => {
  assert.equal(decide({ function: '/* @allow-eval: GA4 dataLayer has no UI */ () => window.dataLayer' }).allow, true);
});
