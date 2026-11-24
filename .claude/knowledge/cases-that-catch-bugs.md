# Cases that catch bugs

The principles every test case in this repository is written and reviewed against. They apply to
humans and agents alike. `/qa-review-tests` checks them; `qa-frontend-expert` uses them when proposing
new cases.

## 1. A case is measured by the bug it would catch, never by its pass rate
A suite that is always green tells you nothing until you know what it would have caught. Before
adding a case, finish this sentence: *"This case fails if …"*. If you cannot, the case is decoration.

## 2. Every case names the failure it guards against
That sentence goes into `Failure_Signals`: the concrete symptom a broken build would show ("Tax not 8%",
"badge shows 0 instead of disappearing", "redirect to /error"). An empty `Failure_Signals` is a review finding.

## 3. Oracles are exact
`[TEXT] Tax: $2.40` catches a rounding bug; "totals are shown" never will. Use exact values,
exact messages and exact URLs. For logic, add the formula (`[STATE] total = item total + tax`) so the
agent can check data the author did not foresee.

## 4. Never rewrite an expectation to match the build
When a case fails, the first question is *"is the product wrong, or the case?"*, and the answer comes from
the business rules, the requirement or a human, **not** from what the build currently does. Updating an
assertion to the observed value without that answer turns a bug into a baseline.

## 5. Prove a case can fail
Run it once against something that should fail: a demo account with a known defect, a wrong value,
a skipped step. A case that passes no matter what is not testing anything. In this repo, the `bug-hunt`
suite exists to keep that honest.

## 6. Walk the breaking dimensions
Happy paths rarely break. For each feature, consider at least these dimensions and write down which
ones you deliberately skip:

| Dimension | Examples |
|---|---|
| Values and boundaries | empty, whitespace only, minimum, maximum, one over, unicode, negative, many decimals |
| State | reload, back and forward, two tabs, session expiry, reset in the middle of a flow |
| Roles and accounts | every account or role that can reach the screen |
| Interruptions | cancel at each step, double submit, network error |
| Consistency | the same data on list, detail, cart, summary and API |
| Arithmetic | totals, tax, rounding at x.xx5, many items |
| Order and time | case independence, dates, time zones, slow responses |

## 7. Learn from escapes
Every bug found outside the suites (in production, exploration or a user report) becomes either a
new case or a written reason why it should not. The oracle gets a rule if one was missing.

## 8. One behaviour per case, independent of order
A case that needs another case to have run first fails for the wrong reason. State what it needs in
`Preconditions`, and clean up in `Cleanup`.

---
*Agentic QA Framework (lean edition) · © 2026 Olga Manuilova · Apache License 2.0 · [source](https://github.com/OlgaManuilova-coder/agentic-qa-lean)*
