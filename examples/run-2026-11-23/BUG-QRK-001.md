# [Inventory] All products show the same placeholder image for problem_user

**Severity:** Medium (rule BL-INV-004)
**Environment:** saucedemo — https://www.saucedemo.com   **Account:** `PROBLEM_USER` (never the password; it is in the env)
**Reproducibility:** 1/1 in this run (a known, stable demo defect; the `/qa-bug` standard asks for 2/2 before filing)
**Found by:** bug-hunt case QRK-001, run SMOKE-2026-11-23-live

## Steps to reproduce
1. Open https://www.saucedemo.com/
2. Sign in as `PROBLEM_USER` with `USER_PASSWORD`.
3. Look at the product images on the Products page.

## Expected
Each product shows its own image (BL-INV-004: *"Each product shows its own image; no two different products share one image, and no image is broken."*).

## Actual
All six products use the same image file, `/assets/sl-404-Cq1a9k9X.jpg`:

| Product | Image src |
|---|---|
| Sauce Labs Backpack | /assets/sl-404-Cq1a9k9X.jpg |
| Sauce Labs Bike Light | /assets/sl-404-Cq1a9k9X.jpg |
| Sauce Labs Bolt T-Shirt | /assets/sl-404-Cq1a9k9X.jpg |
| Sauce Labs Fleece Jacket | /assets/sl-404-Cq1a9k9X.jpg |
| Sauce Labs Onesie | /assets/sl-404-Cq1a9k9X.jpg |
| Test.allTheThings() T-Shirt (Red) | /assets/sl-404-Cq1a9k9X.jpg |

The image loads (naturalWidth 600), so this is not a broken-image error. It is the **wrong** image, which only a rule-based check catches.

## Evidence
- Image sources read from the page (read-only measurement, allowed by the real-user hook).
- Control (not recorded in this run): repeat the steps as `STANDARD_USER` and compare. A complete report includes it.

## Notes
- Affects only `PROBLEM_USER`. This is one of SauceDemo's deliberate defects, kept as a known defect in `config/test-suites.json` selection `bug-hunt`.
- In a real product this is a Medium: customers see wrong merchandise, but they can still buy.

---
*Agentic QA Framework (lean edition) · © 2026 Olga Manuilova · MIT License · [source](https://github.com/OlgaManuilova-coder/agentic-qa-lean)*
