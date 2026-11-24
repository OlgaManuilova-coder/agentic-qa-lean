# Example: a real live run (2026-11-23)

This folder is a **recorded run** of this reference implementation against the public
[SauceDemo](https://www.saucedemo.com) shop. The agent drove a real browser like a user. These files are what such a run leaves behind, so you can see the output before running anything yourself.

| File | What it is | Produced by |
|---|---|---|
| [`000.json`](000.json) | Per-case results of the smoke suite (`regression/suites/smoke/000-smoke.csv`), in the output contract from `.claude/knowledge/shared-instructions.md` | `test-runner-agent` |
| [`REPORT.md`](REPORT.md) | The run summary and GO / NO-GO verdict, including findings **outside** the scripted cases | `qa-lead-orchestrator` |
| [`BUG-QRK-001.md`](BUG-QRK-001.md) | A bug found by the bug-hunt case QRK-001, written to the `/qa-bug` template | `/qa-bug` |

## How to read it

1. Start with `REPORT.md`: verdict first, then findings.
2. Open `000.json` and check that every PASS has concrete evidence (exact values, URLs), not "looks fine".
3. Read `BUG-QRK-001.md`: rule, severity, exact steps, expected vs actual.
4. Compare with the cases in `regression/suites/smoke/000-smoke.csv` to see how a plain-English row became a verdict.

## What to notice

- **Exact oracles:** the checkout totals were checked to the cent ($29.99 + $2.40 = $32.39), not "totals shown".
- **Always-on detection:** two observations were reported that no step asked for (HTTP 404 on deep links, a new "Generate PDF order" button). They are graded **AMBIGUOUS**, not PASS or FAIL, so a human decides.
- **Rule-based bug finding:** QRK-001 failed against business rule BL-INV-004 ("each product shows its own image"). The agent found it by judging against the rule, not by matching a pixel.

Screenshots are not committed (they live in the gitignored `results/` folder of a run). The evidence
here is the textual evidence the agent recorded.
