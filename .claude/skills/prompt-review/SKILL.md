---
name: prompt-review
description: Review a prompt file of this agentic QA system — an agent (.claude/agents), a command (.claude/commands) or a skill (.claude/skills) — for interface, executability, single source of truth, context economy and instruction craft, and return evidence-backed findings with concrete rewrites. Use when asked to "review this agent", "is this skill any good", "check the prompts I changed", or before committing a new or edited prompt. Read-only. Not for CSV test cases (use /qa-review-tests).
argument-hint: "<name | path | changed | all>"
---
<!-- © 2026 Olga Manuilova — Agentic QA Framework (lean edition). Apache License 2.0: keep this notice and the NOTICE file in all copies. https://github.com/OlgaManuilova-coder/agentic-qa-lean -->

# /prompt-review — review the prompts that run the system

An agent, command or skill file is **code that an LLM executes**. It rots the way code does: a cited
path moves, a script is renamed, a rule gets copied and then drifts, a step stops being executable, a
caller relies on behaviour it no longer has. This skill reviews one prompt, or a set of prompts, with the
same method every time.

> Reference implementation: the **review** pass across five dimensions. Applying fixes is left to the
> user: findings come with concrete rewrites, and nothing is written.

## Steps

1. **Resolve the target.**
   - A name: the agent, command or skill with that name. A path: that file.
   - `changed`: agents, commands and `SKILL.md` files changed against `HEAD`, plus untracked ones. A skill's supporting files are reviewed **as part of their skill**, never as separate targets.
   - `all`: every prompt, as a triage table only: `| file | chars | candidates | callers | risk H/M/L |`. Then stop and name the top 3 to review individually.
2. **Collect facts first (deterministic):** `npm run prompts:lint` (hard gate: frontmatter parses; stop if it fails), then `npm run prompt:facts -- <name | path | changed | all> --json`. It reports `chars`, `overSize`, the frontmatter (`missingFrontmatter`), `danglingPaths`, `unknownNpmScripts`, `hardCodedCounts`, `vaguePhrases`, `numberedSteps`, `hasOutputSection` and `callers[]`. If it exits non-zero, report the message and stop.
   - Every item is a **candidate**: confirm it before it becomes a finding. Supporting files may trigger candidates through their own example text; drop those with a reason.
   - The facts are **not exhaustive**: they check only backticked paths with known prefixes. Also check bare file names, relative links and any number in prose by reading.
3. **Read the target whole**, including the supporting files its steps cite. Then read each file in `callers[]`. A caller that **invokes** the target (a command, agent or skill step) must use its current name and arguments and expect the output it produces. A file that only **mentions** it (README, docs) must describe it correctly.
4. **Review against the five dimensions** in [`review-dimensions.md`](review-dimensions.md). The standard a prompt must meet is [`.claude/knowledge/authoring-standard.md`](../../knowledge/authoring-standard.md).
5. **Report in chat** (no file):

```
| ID | Dimension | Severity | file:line | Evidence (quote / missing path / count) | Fix (the rewritten line) |
Verdict: SHIP | SHIP WITH FIXES | REWORK
```

## Rules for findings
- **Evidence or it is not a finding.** Quote the line, name the missing path, show the number.
- **Severity:** BLOCKER (the prompt cannot do its job, or a caller breaks), MAJOR (it will produce wrong or inconsistent output in realistic runs), MINOR (cost, clarity), NIT.
- **House style is not a finding** unless it breaks a rule in the authoring standard.
- **Do not judge product claims from memory.** If a prompt asserts how the product behaves, check it against `.claude/knowledge/oracles/business-logic.md` and `.claude/knowledge/domain/saucedemo.md`. If they disagree, **or the oracle is silent on a behaviour the prompt asserts**, report it; do not pick a winner.
- **A target with its own severity scale or verdict** must map one to the other explicitly. A missing mapping is a D5 finding.
- **Verdict:** any BLOCKER means REWORK; any MAJOR means SHIP WITH FIXES; otherwise SHIP.

Review this skill with itself: `/prompt-review prompt-review`.
