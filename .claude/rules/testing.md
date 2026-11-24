<!-- © 2026 Olga Manuilova — Agentic QA Framework (lean edition). Apache License 2.0: keep this notice and the NOTICE file in all copies. https://github.com/OlgaManuilova-coder/agentic-qa-lean -->
# Always-on testing rules

Loaded into every session and every sub-agent — keep this file SHORT. Task-specific detail lives in
`.claude/knowledge/` and is cited, not copied.

- Every QA agent reads `.claude/knowledge/shared-instructions.md` first.
- URLs and accounts come from env variables (`npm run env:check`), never hard-coded.
- One browser MCP server per agent; never share a browser between parallel agents.
- Max parallel browser agents = `MAX_LANES` (default 2).
- Drive the UI like a real user; JS evaluation is hook-blocked except read-only measurement.
- Verdicts: PASS / FAIL / AMBIGUOUS / BLOCKED. A BL-* violation is a FAIL even if no step asked.
- No evidence (screenshot + expected vs actual) ⇒ no FAIL.
- Everything a run writes goes under `results/<RUN_ID>/` (gitignored); design scratch files (proposed rows) go directly under `results/`.
- Never write passwords or tokens into reports, CSVs or commits.
