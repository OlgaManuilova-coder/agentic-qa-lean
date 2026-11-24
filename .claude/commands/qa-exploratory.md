---
description: Time-boxed exploratory session with a charter; returns findings and proposed new CSV cases.
argument-hint: "<area or charter> [--minutes 20] [--user PROBLEM_USER]"
---
<!-- © 2026 Olga Manuilova — Agentic QA Framework (lean edition). Apache License 2.0: keep this notice and the NOTICE file in all copies. https://github.com/OlgaManuilova-coder/agentic-qa-lean -->

# /qa-exploratory — charter-based exploration

Arguments: `$ARGUMENTS`

1. Turn the argument into a charter: *Explore <area> with <account/data> to discover <risk>*.
   Pick the risk from the BL rules of that area (`.claude/knowledge/oracles/business-logic.md`).
2. `RUN_ID` = `EXP-YYYY-MM-DD-HHMM`.
3. Dispatch **qa-frontend-expert** in **Exploratory** mode with the charter, time-box (default 20 min),
   `BROWSER_SERVER=playwright-chrome`, and the account to use.
4. Print the session report: findings (with severity and evidence), what was not covered, and the
   **proposed CSV rows** ready to paste into a suite.
