# Business-Logic Oracle — SauceDemo

The **oracle** is the list of invariants the product must hold no matter what a ticket says.
Agents judge every observation against it: behaviour that violates a rule is a **FAIL even when no
test step asked about it**. Test cases link to rules through the `Business_Rule` column, and
`npm run suites:lint` rejects a case that cites a rule id missing from this file.

Format: one table per domain. `Severity if broken` tells the reporting agent how to grade the bug.
When you adopt the template for your product, replace these rows with your product's rules — keep
the id scheme `BL-<DOMAIN>-<NNN>` and never reuse a retired id.

## Domain: Authentication (BL-AUTH)

| ID | Rule | Severity if broken |
|---|---|---|
| BL-AUTH-001 | Valid credentials of an active user open the inventory page (`/inventory.html`). | Critical |
| BL-AUTH-002 | A locked-out user cannot sign in and sees an error saying the user is locked out. | High |
| BL-AUTH-003 | Submitting without username shows "Username is required"; with username but without password shows "Password is required". | Medium |
| BL-AUTH-004 | Wrong credentials keep the user on the login page with a "do not match" error; the password is not echoed anywhere. | High |
| BL-AUTH-005 | Every page behind login (inventory, item, cart, checkout) redirects an anonymous visitor to the login page with an error that names the page. | Critical |
| BL-AUTH-006 | Logout ends the session: after logout, opening `/inventory.html` directly lands on the login page. | Critical |

## Domain: Inventory (BL-INV)

| ID | Rule | Severity if broken |
|---|---|---|
| BL-INV-001 | The inventory lists every product with name, description, price (`$` + two decimals), image and an "Add to cart" button. | High |
| BL-INV-002 | Sorting re-orders the visible list: Name (A to Z) is the default; Z to A, Price low→high and high→low order strictly by that key. | Medium |
| BL-INV-003 | Opening a product (name or image) shows a detail page with the same name, description and price as the list. | Medium |
| BL-INV-004 | Each product shows its own image; no two different products share one image, and no image is broken. | Medium |

## Domain: Cart (BL-CART)

| ID | Rule | Severity if broken |
|---|---|---|
| BL-CART-001 | "Add to cart" turns the button into "Remove" and increments the cart badge by one. | High |
| BL-CART-002 | "Remove" (on list, detail or cart page) decrements the badge; at zero items the badge is not shown. | High |
| BL-CART-003 | Cart contents survive navigation between pages and a page reload within the session. | High |
| BL-CART-004 | The cart page lists every added item once with quantity 1, its name and its price. | High |

## Domain: Checkout (BL-CHK)

| ID | Rule | Severity if broken |
|---|---|---|
| BL-CHK-001 | Checkout step one requires First Name, Last Name and Postal Code; the first missing field is reported as "Error: <Field> is required". | High |
| BL-CHK-002 | Overview: Item total = sum of item prices; Tax = 8% of item total rounded to cents; Total = Item total + Tax. | Critical |
| BL-CHK-003 | "Finish" shows the order-complete page with a thank-you message and empties the cart (badge disappears). | Critical |
| BL-CHK-004 | "Cancel" on step one returns to the cart with the cart unchanged; "Cancel" on the overview returns to the inventory with the cart unchanged. | Medium |

## Domain: App shell (BL-UI)

| ID | Rule | Severity if broken |
|---|---|---|
| BL-UI-001 | Menu → "Reset App State" empties the cart and returns every product button to "Add to cart". | Medium |
| BL-UI-002 | The page renders without layout breakage at a 390×844 mobile viewport: no horizontal scroll, menu and cart reachable. | Medium |

## Domain: Performance heuristics (BL-PERF)

| ID | Rule | Severity if broken |
|---|---|---|
| BL-PERF-001 | Sign-in of a standard user reaches the inventory in under 3 seconds. A slower sign-in is a FAIL with the measured time as evidence. | Medium |

---
*Agentic QA Framework (lean edition) · © 2026 Olga Manuilova · Apache License 2.0 · [source](https://github.com/OlgaManuilova-coder/agentic-qa-lean)*
