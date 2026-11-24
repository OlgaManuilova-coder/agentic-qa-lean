# Regression suites

One folder per domain, one CSV per suite: `<domain>/<NNN>-<slug>.csv`.
Format: [`docs/csv-format.md`](../../docs/csv-format.md). Registry: [`config/test-suites.json`](../../config/test-suites.json).

```bash
npm run suites:list            # all suites with counts and estimates
npm run suites:list -- smoke   # one selection
npm run suites:lint            # validate after any edit
```

`quirks/005-demo-user-quirks.csv` runs as SauceDemo's intentionally broken demo accounts. Its FAILs
are **expected**: the suite exists to show how agents detect and report real defects.

---
*Agentic QA Framework (lean edition) · © 2026 Olga Manuilova · Apache License 2.0 · [source](https://github.com/OlgaManuilova-coder/agentic-qa-lean)*
