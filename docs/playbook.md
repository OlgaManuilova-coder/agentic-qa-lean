# Playbook: adopting the template on a new project

A step-by-step guide for bringing agentic QA to a new product in about a week. Each step has a
**done when** check. Do not skip ahead: every step makes the next one cheaper.

## Day 0: Prepare (½ day)

1. **Fork or copy** this repository into your group (`git clone`, then a new remote).
2. Run `npm install`, `npx playwright install chromium firefox`, `npm run check`.
3. Open the folder in Claude Code, approve the MCP servers, and run `/qa-smoke` against SauceDemo.

**Done when** you have seen a green smoke run and a red `bug-hunt` run with readable bug reports.
Now you know what "working" looks like before you change anything.

## Day 1: Point it at your product

1. Create `.env.<env>`, for example `.env.staging`:
   ```env
   FRONT_URL=https://staging.example.com
   STANDARD_USER=qa.buyer@example.com
   ADMIN_USER=qa.admin@example.com
   ```
2. Create `.env.local` (gitignored) with the passwords: `USER_PASSWORD=…`.
3. Update `CORE_VARS` in `config.js` and `REQUIRED` in `scripts/env-check.mjs` to your required variables.
4. Set `DEFAULT_ENV` in `scripts/lib/load-env.mjs`, or create `.env.test-env` with `TEST_ENV=staging`.
5. Delete or archive the SauceDemo env, aliases and suites, or keep them as a reference in a branch.

**Done when** `npm run env:check` is green for your env.

## Day 1–2: Write the oracle

The oracle is the most valuable artefact. Write it with a BA or PO.

1. List the product domains: auth, catalog, cart, checkout, orders, admin…
2. For each one, write **invariants**: statements that must always hold. Good invariants are:
   - *observable* ("total = items + tax + shipping"), not internal;
   - *unconditional* or explicit about conditions ("for a B2B user with net terms…");
   - *graded*: what severity a violation is.
3. Give each a stable id `BL-<DOMAIN>-NNN`. Never reuse ids.
4. Replace `.claude/knowledge/oracles/business-logic.md`.

**Done when** each domain has 5–15 rules and a second person has reviewed them.

## Day 2: Write the domain knowledge

Replace `.claude/knowledge/domain/saucedemo.md` with `domain/<product>.md`:

- **surface map**: pages and URLs, and what lives where;
- **roles and accounts**: what each test user can do;
- **state**: what persists where, and how to reset it;
- **heuristics**: "this shouldn't happen" knowledge from senior testers and the bug history;
- **out of scope**: external sites, third-party widgets.

Then update the references in `.claude/agents/*.md` (search for `saucedemo.md`).

**Done when** a new team member could test the product with only that file.

## Day 3: Smoke suite first

1. Write `regression/suites/smoke/000-smoke.csv` with 5–10 end-to-end cases that cover the critical paths.
2. Register it in `config/test-suites.json` and run `npm run suites:lint`.
3. Run `/qa-smoke` three times.
4. For every flaky or AMBIGUOUS result, fix the **case** (clearer step, exact assertion, missing precondition), not the agent.

**Done when** three consecutive smoke runs give the same verdicts.

## Day 4–5: Grow by domain

1. One suite per domain, 6–15 cases each. Follow `docs/csv-format.md`.
2. Add selections, for example `critical` (P0) and `regression` (all but experimental).
3. Tune `estimatedMinutes` from real runs (the orchestrator reports actual vs estimate).
4. Use `/qa-exploratory` on each domain. Turn its proposed CSV rows into cases.

**Done when** `/qa-regression regression` runs end to end and produces a sign-off the team trusts.

## Week 2: Promote and automate

1. Mark consistently passing cases as `Candidate` and write specs in `tests/`.
2. Enable the GitLab pipeline. The `validate` and `specs` jobs need no secrets.
3. Optional: add `ANTHROPIC_API_KEY` as a masked CI/CD variable and schedule the `agentic-smoke` job (CI/CD → Schedules).

**Done when** every MR runs the gates and the specs, and a scheduled agentic smoke runs nightly.

## Ongoing: keep it healthy

| Signal | Action |
|---|---|
| A case is AMBIGUOUS twice | Rewrite the case, or add the missing knowledge to the domain file |
| Agents disagree on severity | The rule is unclear, so rewrite it in the oracle |
| A bug escaped to production | Add a BL rule or heuristic, then a case |
| A run takes much longer than planned | Re-tune `estimatedMinutes`, add a lane, or promote cases to specs |
| `CLAUDE.md` or rules keep growing | Move the content down a tier into `.claude/knowledge/` and cite it |

## When to move to the full template

Move when you need any of these: bugs filed automatically to GitLab Issues or Jira; credentials kept
out of files; per-ticket testing flows with a human approval point; an API or backend specialist;
autonomous bug-fix MRs; scheduled agentic regression in CI. The full template has all of them on the
same foundation, so your suites, oracle and domain file carry over unchanged.
