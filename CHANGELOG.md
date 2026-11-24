# Changelog

## 0.3.0 — Apache License 2.0 and authorship
- License changed from MIT to the **Apache License 2.0**. Its section 4(d) requires every redistribution and derivative work to keep the attribution in `NOTICE`. Versions before 0.3.0 remain available under MIT.
- Copyright notice in every source, prompt and documentation file; `NOTICE`, `CITATION.cff` ("Cite this repository" on GitHub) and an Attribution section in the README.

## 0.2.1 — independent review of the skills
- Independent `/prompt-review` of the three skills (fresh agent): 0 blockers, 3 major, 6 minor; all fixed. Expected values come from the oracle or the domain file only, never from the build; the checkout decision table is complete (one more missing case found: Last Name with Postal Code filled).
- New hard gate `npm run prompts:lint` (in `npm run check` and CI): a prompt whose frontmatter does not parse loads with no description and is never picked.
- `config/review-accepted.json`: review candidates a reviewer kept, with the reason; `review:tests --all` shows them.
- `--file` accepts absolute paths in `review:tests` and `suites:lint`.

## 0.2.0 — skills and a recorded run
- Skills: `qa-test-design`, `qa-review-tests`, `prompt-review` (light versions), each with a deterministic helper (`review:tests`, `prompt:facts`, `suites:lint --file`).
- Knowledge: `cases-that-catch-bugs.md`, `authoring-standard.md`.
- `examples/run-2026-11-23/`: a recorded live run against SauceDemo (smoke 5/5, bug QRK-001, two always-on findings).
- Fixed: CART-006 determinism ("any two products"), found by `review:tests`. Domain file updated from live evidence (Zip/Postal Code label, Generate PDF order).
- The three skills were reviewed by an independent agent with `/prompt-review`; 4 MAJOR and 17 MINOR/NIT findings applied.

## 0.1.0 — initial template
- First version of the template, demo target SauceDemo.

---
*Agentic QA Framework (lean edition) · © 2026 Olga Manuilova · Apache License 2.0 · [source](https://github.com/OlgaManuilova-coder/agentic-qa-lean)*
