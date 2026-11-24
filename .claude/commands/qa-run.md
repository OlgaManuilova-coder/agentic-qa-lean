---
description: Run one or more specific CSV suites (by id) on one browser lane.
argument-hint: "<suite-id> [suite-id ...] [--browser playwright-firefox] [--env <env>]"
---
<!-- © 2026 Olga Manuilova — Agentic QA Framework (lean edition). MIT License: keep this notice in all copies. https://github.com/OlgaManuilova-coder/agentic-qa-lean -->

# /qa-run — run specific suites

Arguments: `$ARGUMENTS`

1. Parse suite ids, optional `--browser` (default `playwright-chrome`) and `--env`.
2. Look the ids up in `config/test-suites.json`; unknown id ⇒ stop and list valid ids (`npm run suites:list`).
3. `npm run env:check` (with `TEST_ENV` if given). `RUN_ID` = `RUN-YYYY-MM-DD-HHMM`.
4. Dispatch **one** `test-runner-agent` with the suites as its ordered `SUITE_BATCH`,
   output files `results/<RUN_ID>/<SUITE_ID>.json`.
5. Print a per-suite totals table and every FAIL / AMBIGUOUS with its evidence path.
