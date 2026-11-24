# Shared Agent Instructions

**Every QA agent reads this file at the start of every run.** It holds only what applies to every
run; agent prompts cite it and never restate it (a fact stated once cannot drift).

## The four layers of an agent prompt

Every agent definition in `.claude/agents/` is written in the same four layers:

1. **Business logic** — the invariants it must protect → `oracles/business-logic.md`.
2. **Domain knowledge** — judgment about the product ("this shouldn't happen") → `domain/<product>.md`.
3. **Skill set** — technique: how to explore, which tool for what, how to collect evidence.
4. **Design decisions** — constraints: lanes, isolation, what never to do, output contract.

## Judge — classify every observation

Compare each observation against, in order: **RULES** (BL-* ids) → **SPEC** (the case's Assertions /
the ticket's acceptance criteria) → **BASELINE** (what passed last time) → **HEURISTICS** (domain file).

| Verdict | When | What you do |
|---|---|---|
| PASS ✅ | Observed = expected | Record it, move on |
| FAIL ❌ | Observed violates a rule, an assertion or a strong heuristic | Capture evidence, write a bug entry with severity |
| AMBIGUOUS ⚠️ | You cannot tell if it is intended (changed text, new warning, 5% slower, a step a user cannot do) | Report up with evidence; never silently pass or fail |
| BLOCKED ⛔ | Precondition not met / environment down | Stop the case, record why, continue with the next |

A rule violation is a FAIL **even if no step asked about it** — always-on bug detection.

## Browser interaction — real-user behaviour (hook-enforced)

- Drive the page like a customer: navigate, click, type, select, wait. Use the accessibility snapshot
  and visible text to find elements.
- JavaScript evaluation is blocked except read-only measurement (`.claude/hooks/enforce-real-user.mjs`).
- A disabled control is evidence that validation works — it is a PASS for that check, never something to force.
- Use **only the browser MCP server you were assigned** (`{{BROWSER_SERVER}}`). Never share a browser
  session with another agent; every lane is an isolated context.

## Evidence standard

Every FAIL and AMBIGUOUS carries: case id, step number, expected vs actual, a screenshot, the URL, and
the relevant console/network lines. Screenshots go to `results/<RUN_ID>/screenshots/<CASE_ID>-<step>.png`.
No evidence ⇒ the finding is not reported as FAIL.

## Test data and placeholders

`{{VAR}}` in a case is an environment variable (`npm run env:check` lists them). `{{timestamp}}` is the
current Unix time, `{{RUN_ID}}` the run id. Never hard-code a URL or account; never print a password in a
report — refer to it by its variable name.

## Output contract (one JSON per suite)

Write `results/<RUN_ID>/<SUITE_ID>.json`:

```json
{
  "runId": "REG-2026-01-01-1200", "suiteId": "004", "env": "saucedemo", "browser": "playwright-chrome",
  "startedAt": "ISO-8601", "finishedAt": "ISO-8601",
  "summary": { "total": 8, "pass": 7, "fail": 1, "ambiguous": 0, "blocked": 0 },
  "cases": [
    { "id": "CHK-004", "verdict": "FAIL", "rule": "BL-CHK-002", "severity": "Critical",
      "step": 5, "expected": "Tax: $4.32", "actual": "Tax: $4.31",
      "evidence": ["screenshots/CHK-004-5.png"], "notes": "rounding down instead of half-up" }
  ]
}
```

## Escalate instead of guessing

Stop and report AMBIGUOUS when: the case contradicts the oracle; the UI changed so the steps no longer
apply; the environment is unreachable twice in a row; a step would require forcing the UI.

---
*Agentic QA Framework (lean edition) · © 2026 Olga Manuilova · MIT License · [source](https://github.com/OlgaManuilova-coder/agentic-qa-lean)*
