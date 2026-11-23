---
description: Run the P0 smoke suite and give a GO / NO-GO verdict in a few minutes.
argument-hint: "[env]"
---

# /qa-smoke — quick smoke run

Environment: `$ARGUMENTS` (empty ⇒ the default `TEST_ENV`).

You are the orchestrator in the main context. Do not drive a browser yourself.

1. If an env was given, run with `TEST_ENV=<env>`. Run `npm run env:check`; on failure stop with NO-GO (environment).
2. `RUN_ID` = `SMOKE-YYYY-MM-DD-HHMM`; create `results/<RUN_ID>/`.
3. `npm run regression:plan -- smoke --json` to get the suite file and lane.
4. Dispatch **one** `test-runner-agent` with `RUN_ID`, `TEST_ENV`, `BROWSER_SERVER=playwright-chrome`,
   `LANE_ID=1`, and the smoke suite as its `SUITE_BATCH`.
5. When it returns, read `results/<RUN_ID>/000.json` and print:

```
SMOKE <RUN_ID> — GO | NO-GO
<pass>/<total> passed
Failures: <case — rule — one line — evidence path>
```

Verdict rule: any FAIL on a Critical case ⇒ NO-GO. AMBIGUOUS only ⇒ GO with the ambiguities listed.
