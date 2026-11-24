---
name: qa-test-design
description: Design test cases for a feature or business rule with classic techniques — equivalence partitioning, boundary values, decision tables, state transitions — and turn them into ready-to-lint CSV rows. Use when asked to "write test cases for X", "what should we test in checkout", "cover rule BL-CHK-001", or when a suite misses a breaking dimension. Produces proposed rows; does not edit suites unless asked. Not for judging existing cases (use /qa-review-tests).
argument-hint: "<feature | rule id | suite id>"
---
<!-- © 2026 Olga Manuilova — Agentic QA Framework (lean edition). Apache License 2.0: keep this notice and the NOTICE file in all copies. https://github.com/OlgaManuilova-coder/agentic-qa-lean -->

# /qa-test-design — from a rule to cases that catch bugs

Techniques decide **which** cases to write; `cases-that-catch-bugs.md` decides whether each one is
worth keeping. Read before you design: `.claude/knowledge/shared-instructions.md`,
`.claude/knowledge/cases-that-catch-bugs.md` and `docs/csv-format.md`.

## Steps

1. **Scope:** for a suite id, take the rules cited in its `Business_Rule` column. Then list the rules involved (`.claude/knowledge/oracles/business-logic.md`), the surfaces (`.claude/knowledge/domain/saucedemo.md`), and the existing cases that already cite those rules (`grep -rn "BL-…" regression/suites`).
2. **Pick techniques** with the table below. Most features need two or three of them.
3. **Derive conditions** for each technique: write down the partitions, the boundaries, the table or the transitions *before* writing any case.
4. **Walk the breaking dimensions** (`cases-that-catch-bugs.md` §6) and add what the techniques missed. Write down what you deliberately skip.
5. **Write rows** in the format of `docs/csv-format.md` (header and column order are enforced by `npm run suites:lint`). Each row has exact oracles, a `Business_Rule`, and a `Failure_Signals` line that says what bug it catches. **Take every expected value from the oracle or the domain file.** If neither defines it, do not observe the build: propose a rule and mark the row as needing a human (`.claude/knowledge/cases-that-catch-bugs.md` §4).
6. **Self-check (required):** save the rows with the CSV header to `results/proposed-<feature>.csv`, then run `npm run suites:lint -- --file results/proposed-<feature>.csv` and `npm run review:tests -- --file results/proposed-<feature>.csv`. Fix every error and every confirmed candidate.
7. **Return** a coverage table (condition → case id), the breaking dimensions you skipped with a reason for each, and the proposed rows in a fenced `csv` block. Add them to a suite only if the user asks: append the rows, raise that suite's `testCount` (and `estimatedMinutes`) in `config/test-suites.json`, then run `npm run suites:lint` and `npm run review:tests -- <id>`.

## Techniques

| Technique | Use when | How |
|---|---|---|
| **Equivalence partitioning** | An input has classes that should behave the same | One case per valid class and per invalid class |
| **Boundary values** | Ranges, lengths, money, counts | Minimum, maximum, and one step outside each; for money, the rounding edge (x.xx5) |
| **Decision table** | Several conditions combine into one outcome | One column per condition combination that matters; merge columns that do not change the outcome |
| **State transitions** | A flow with states (cart → checkout → complete) | Every valid transition once, plus the invalid ones a user can actually attempt (back, reload, deep link) |

## Worked example on the demo: checkout information form (BL-CHK-001)

**Rule:** First Name, Last Name and Postal Code are required. The first missing field is reported as `Error: <Field> is required`.

**Decision table** (R = filled in, – = empty):

| First | Last | Postal | Expected | Covered by |
|---|---|---|---|---|
| – | – | – | `Error: First Name is required` | CHK-001 |
| R | – | – | `Error: Last Name is required` | CHK-002 |
| R | R | – | `Error: Postal Code is required` | CHK-003 |
| – | R | – · – | – | R | `Error: First Name is required` | merged with – – – (same outcome) |
| R | – | R | `Error: Last Name is required` | **missing** (Last Name is reported even when Postal Code is filled) |
| – | R | R | `Error: First Name is required` | **missing** (the order rule says First Name is reported even when the later fields are filled) |
| R | R | R | continue to the overview | CHK-004, CHK-005, CHK-007 |

**Partitions for each field:** filled (valid) · empty (invalid) · whitespace only (the oracle does not define it; CHK-008 treats acceptance as a known demo weakness, so propose a rule rather than assume one) · very long (500 chars, **missing**) · unicode (`Zoë`, `محمد`, **missing**).

**Resulting proposal** (one of the missing rows):

```csv
"CHK-009","First name is reported first even when later fields are filled","Checkout > Validation","Medium","BL-CHK-001","","Signed in as {{STANDARD_USER}}; 1 item in cart","last={{CHECKOUT_LAST_NAME}};zip={{CHECKOUT_POSTAL_CODE}}","[NAV] Navigate to {{FRONT_URL}}/
[ACT] Type {{STANDARD_USER}} into 'Username'
[ACT] Type {{USER_PASSWORD}} into 'Password'
[ACT] Click 'Login'
[ACT] Click 'Add to cart' on 'Sauce Labs Backpack'
[ACT] Click the cart icon
[ACT] Click 'Checkout'
[ACT] Fill 'Last Name' with {{CHECKOUT_LAST_NAME}}
[ACT] Fill 'Zip/Postal Code' with {{CHECKOUT_POSTAL_CODE}}
[ACT] Click 'Continue'","[TEXT] 'Error: First Name is required'
[URL] Still on /checkout-step-one.html","[CONSOLE] No uncaught errors","Error names a later field; or checkout continues without a first name","Menu -> Reset App State; Logout","","Agent"
```

The case catches an implementation that infers earlier fields from later ones (for example, it checks
First Name only when the other fields are also empty): with Last Name and Postal Code filled, such a
form continues or names a later field. None of CHK-001, CHK-002 or CHK-003 fills the later fields while
leaving First Name empty, so none of them can detect it.
