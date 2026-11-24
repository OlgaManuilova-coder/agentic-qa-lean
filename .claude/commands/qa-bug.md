---
description: Reproduce a bug from a description, collect evidence and write a structured bug report (local markdown; the Enterprise edition files it into a tracker).
argument-hint: "<bug description> | <case id from a run, e.g. CHK-004 REG-2026-01-01-1200>"
---
<!-- © 2026 Olga Manuilova — Agentic QA Framework (lean edition). Apache License 2.0: keep this notice and the NOTICE file in all copies. https://github.com/OlgaManuilova-coder/agentic-qa-lean -->

# /qa-bug — reproduce and document a bug

Input: `$ARGUMENTS`

1. If the input is a case id + run id, read the finding from `results/<RUN_ID>/*.json`; otherwise use
   the description as is.
2. `RUN_ID` = `BUG-YYYY-MM-DD-HHMM`. Dispatch **qa-frontend-expert** in **Reproduce** mode on
   `playwright-chrome`: minimal steps, 2/2 reproductions, which demo accounts are affected.
3. Map the bug to a BL rule (or say "heuristic") and take the severity from the rule.
4. Write `results/<RUN_ID>/BUG.md` with this template and print it:

```markdown
# [<Area>] <one-line summary: what is wrong, where>
**Severity:** <Critical|High|Medium|Low> (rule <BL-…> | heuristic)
**Environment:** <TEST_ENV> — <FRONT_URL>   **Account:** <env var name, never the password>
**Reproducibility:** 2/2

## Steps to reproduce
1. …
## Expected
… (cite the rule)
## Actual
…
## Evidence
- screenshot: results/<RUN_ID>/screenshots/…
- console / network: …
## Notes
Affected accounts, workaround, suspected area.
```

Not reproducible ⇒ say so, attach what was tried, and do not label it a bug.
