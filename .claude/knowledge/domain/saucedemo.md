# Domain Knowledge — SauceDemo

What agents need to *judge* behaviour in the demo shop, beyond the hard rules in
`../oracles/business-logic.md`. This is judgment context ("heuristics"), not a test script.
Facts here were observed on the public demo; if the live site disagrees, the live site wins and the
agent reports the difference as AMBIGUOUS so a human can update this file.

## Surface map

| Page | URL | What lives there |
|---|---|---|
| Login | `/` | Username, password, Login button, error banner |
| Inventory | `/inventory.html` | Product list, sort dropdown, cart icon with badge, burger menu |
| Item detail | `/inventory-item.html?id=<n>` | Name, description, price, image, Add/Remove, Back to products |
| Cart | `/cart.html` | Cart items, Continue Shopping, Checkout |
| Checkout: info | `/checkout-step-one.html` | First Name, Last Name, Zip/Postal Code (visible label, observed 2026-11-23), Cancel, Continue |
| Checkout: overview | `/checkout-step-two.html` | Items, payment/shipping info, Item total, Tax, Total, Cancel, Finish |
| Checkout: complete | `/checkout-complete.html` | Thank-you message, Back Home, Generate PDF order (new, observed 2026-11-23: no case yet) |

Burger menu items: All Items, About, Logout, Reset App State.

## Locators

The app exposes stable `data-test` attributes (e.g. `username`, `password`, `login-button`, `error`,
`product-sort-container`, `shopping-cart-badge`, `checkout`, `firstName`, `lastName`, `postalCode`,
`continue`, `finish`). Agents still drive the page **like a user** (by role and visible text, through
the accessibility snapshot); `data-test` is what the promoted Playwright specs in `tests/` use.

## Demo accounts and their built-in behaviour

SauceDemo ships deliberate defects per account — perfect for showing how agents find and report bugs.

| Account (env var) | Expected behaviour |
|---|---|
| `STANDARD_USER` | The reference user. Everything works. Use it for baseline cases. |
| `LOCKED_OUT_USER` | Cannot sign in (BL-AUTH-002). Passing case = the error shows. |
| `PROBLEM_USER` | Known to show wrong/identical product images, broken sorting and form fields that do not keep input. Cases run as this user are *expected* to FAIL — they demonstrate bug reporting. |
| `PERFORMANCE_GLITCH_USER` | Sign-in is slow. Measured against BL-PERF-001. |
| `ERROR_USER` | Some actions (sorting, removing from cart, finishing checkout) are known to misbehave or log errors. |
| `VISUAL_USER` | Visual differences (misaligned elements, wrong images/prices). Use for visual checks. |

All accounts share the public password in `USER_PASSWORD`.

## State

- There is no server-side cart: the cart lives in the browser (observed: `localStorage`). A fresh,
  isolated browser context = an empty cart. Use **Reset App State** in Cleanup.
- Signing in sets a session cookie; logout clears it.

## Heuristics ("this shouldn't happen", even if no rule says so)

- Prices always have two decimals and a `$` sign.
- An action that silently does nothing (click without visible effect) is suspicious — report it.
- Any uncaught error in the browser console during a happy path is worth reporting.
- A page that needs more than ~5 seconds to become interactive is worth reporting.

## Out of scope

"About" links to an external site — do not test external sites.
