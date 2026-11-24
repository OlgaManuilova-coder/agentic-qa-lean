# SMOKE-2026-11-23-live — GO

**Env:** saucedemo (https://www.saucedemo.com) · **Scope:** suite 000 Smoke + bug-hunt case QRK-001 · **Lanes:** 1 (real browser)

| Suite | Pass | Fail | Ambiguous | Blocked |
|---|---|---|---|---|
| 000 Smoke | 5 | 0 | 0 | 0 |

## Case results
| Case | Verdict | Rule | Evidence |
|---|---|---|---|
| SMK-001 Login page renders | PASS | BL-AUTH-001 | Username and Password inputs, enabled Login button |
| SMK-002 Standard user signs in | PASS | BL-AUTH-001 | Landed on `/inventory.html`, 6 product cards |
| SMK-003 Add one product to cart | PASS | BL-CART-001 | Button changed to "Remove"; cart badge "1" |
| SMK-004 Complete a checkout | PASS | BL-CHK-002, BL-CHK-003 | Item total $29.99, Tax $2.40, Total $32.39; "Thank you for your order!"; badge gone |
| SMK-005 Logout ends the session | PASS | BL-AUTH-006 | After logout, `/inventory.html` → login page: "You can only access '/inventory.html' when you are logged in." |

## Blocking findings
None.

## Ambiguities for a human (always-on detection: not asked by any step)
1. **Deep links return HTTP 404.** `/cart.html` and `/inventory.html` opened directly are served with status 404 by the static host and then rendered by the single-page-app fallback. The browser console shows 2 × "Failed to load resource: 404". Users see the page, but monitoring, crawlers and uptime checks see errors. *Decide: accepted hosting behaviour, or a defect?*
2. **New UI surface.** The order-complete page now has a **"Generate PDF order"** button that is not in the domain knowledge (`.claude/knowledge/domain/saucedemo.md`). *Action: add it to the domain file, and decide whether it needs a case.*

## Known defects (bug-hunt, not blocking)
- **QRK-001 FAIL** (expected; a deliberate defect of the demo account `PROBLEM_USER`): all 6 products show the same placeholder image. See [BUG-QRK-001.md](BUG-QRK-001.md).

## Recommendation
**GO.** All critical paths pass with exact evidence. Resolve the two ambiguities by updating the
domain file (item 2) and deciding on the deep-link status (item 1). QRK-001 is a known demo defect and does not block.
