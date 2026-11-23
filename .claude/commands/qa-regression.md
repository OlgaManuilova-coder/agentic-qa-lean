---
description: Run a named regression selection in parallel lanes and get a GO / NO-GO sign-off.
argument-hint: "<smoke|critical|regression|bug-hunt|full> [--lanes N] [--env <env>]"
---

# /qa-regression — parallel regression

Arguments: `$ARGUMENTS` (selection defaults to `regression`).

1. Show the plan to the user first: `npm run regression:plan -- <selection> [--lanes N]`.
2. Dispatch the **regression-orchestrator** agent with the selection, lane count, env and a
   `RUN_ID` = `REG-YYYY-MM-DD-HHMM`.
3. When it returns, dispatch **qa-lead-orchestrator** with `results/<RUN_ID>/run.json` to classify
   and sign off.
4. Print the lead's sign-off block and the path to `results/<RUN_ID>/REPORT.md`.
