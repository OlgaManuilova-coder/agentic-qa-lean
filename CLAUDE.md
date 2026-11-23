# CLAUDE.md

## What this repo is

An **agentic QA system**: regression tests are CSV files of natural-language cases. Claude Code agents
execute them in real browsers through **Playwright MCP**, judge every observation against a
**business-logic oracle**, and write evidence-backed JSON results. Stable cases are later *promoted*
to deterministic Playwright specs in `tests/`. Demo target: **SauceDemo** (`TEST_ENV=saucedemo`).

New here? Read `README.md`, then `docs/architecture.md`.

## Commands

Slash commands (in Claude Code): `/qa-smoke`, `/qa-run <ids>`, `/qa-regression <selection>`,
`/qa-exploratory <charter>`, `/qa-bug <description>`.

npm scripts — read `package.json`; the important ones: `npm run env:check`, `npm run suites:lint`,
`npm run suites:list [-- <selection>]`, `npm run regression:plan -- <selection>`, `npm test`, `npm run specs:run`.

## Environment

Layered loader `scripts/lib/load-env.mjs`: `.env.defaults` → `.env.${TEST_ENV}` → `.env.local`
(gitignored); real process env wins. Default `TEST_ENV=saucedemo`. Load in code with
`import './config.js'`, read `process.env.X`. Variable names are stable across envs.

## Where things live

| What | Where |
|---|---|
| Agents (4) | `.claude/agents/` |
| Slash commands | `.claude/commands/` |
| Always-loaded rules (keep short) | `.claude/rules/` |
| On-demand knowledge: shared instructions, oracle, domain | `.claude/knowledge/` |
| Hooks (real-user enforcement) | `.claude/hooks/` + `.claude/settings.json` |
| Suites (CSV) + manifest | `regression/suites/`, `config/test-suites.json` |
| Browser lanes (MCP configs) | `.mcp.json`, `config/mcp-playwright-*.config.json` |
| Promoted specs | `tests/` |
| Run output (gitignored) | `results/<RUN_ID>/` |

## Essential rules

- Every QA agent reads `.claude/knowledge/shared-instructions.md` first.
- Never share a browser between parallel agents; one MCP server per lane; max `MAX_LANES`.
- Real-user interaction only (hook-enforced). Disabled control = validation works = PASS.
- Changing a CSV, the manifest or the oracle ⇒ run `npm run suites:lint` before committing.
- No code ⇒ no unit test: data and prompts are gated by `suites:lint`; `scripts/unit/` tests code only.
- Counts (suites, cases) are never written into docs — run `npm run suites:list`.
