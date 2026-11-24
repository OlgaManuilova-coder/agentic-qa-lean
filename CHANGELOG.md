# Changelog

## 0.2.0 — skills and a recorded run
- Skills: `qa-test-design`, `qa-review-tests`, `prompt-review` (light versions), each with a deterministic helper (`review:tests`, `prompt:facts`, `suites:lint --file`).
- Knowledge: `cases-that-catch-bugs.md`, `authoring-standard.md`.
- `examples/run-2026-11-23/`: a recorded live run against SauceDemo (smoke 5/5, bug QRK-001, two always-on findings).
- Fixed: CART-006 determinism ("any two products"), found by `review:tests`. Domain file updated from live evidence (Zip/Postal Code label, Generate PDF order).
- The three skills were reviewed by an independent agent with `/prompt-review`; 4 MAJOR and 17 MINOR/NIT findings applied.

## 0.1.0 — initial template
- First version of the template, demo target SauceDemo.
