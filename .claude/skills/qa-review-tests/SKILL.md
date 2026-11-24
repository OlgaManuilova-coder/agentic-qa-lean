---
name: qa-review-tests
description: Review CSV test cases for quality before they are trusted — determinism, testability, bug-catching intent, grounding in business rules, and duplication. Use when asked to "review the cases", "check suite 003", "are these test cases any good", after writing or generating new cases, or before promoting a case to a Playwright spec. Read-only unless the user asks to apply the fixes. Not for writing new cases (use /qa-test-design) or for reviewing prompts (use /prompt-review).
argument-hint: "[suite-id ... | changed] [--fix]"
---

# /qa-review-tests — is this case able to catch a bug?

A test case is a prompt an agent executes. A vague case gives a different result on every run, and a
case without an exact oracle passes even when the product is broken.

Read first: `.claude/knowledge/shared-instructions.md` (placeholders, verdicts, when a case that
contradicts the oracle is AMBIGUOUS) and `.claude/knowledge/cases-that-catch-bugs.md` (the standard
this skill reviews against).

> Reference implementation: five dimensions. Structure (columns, tags, placeholders, rule ids) is
> already a hard gate in `npm run suites:lint`, and this skill does not repeat it.

## The five dimensions

| # | Dimension | Question | Typical finding | Severity |
|---|---|---|---|---|
| 1 | **Determinism** | Would two agents execute this step the same way? | "Add any two products" → which ones? | High |
| 2 | **Testability** | Can the assertion be checked objectively? | "totals are correct" → which numbers? | High |
| 3 | **Bug-catching intent** | What broken behaviour makes this case fail? | Empty `Failure_Signals` | Medium |
| 4 | **Grounding** | Which rule says this is the expected behaviour? | No `Business_Rule`; expected text that exists nowhere in the oracle or domain file | Medium |
| 5 | **Duplication** | Does another case already prove this? | Same steps and assertions as another case | Low |

## Steps

1. **Scope.** The 3-digit suite ids from `config/test-suites.json` (`npm run suites:list`), or `changed`. `changed` covers suite CSVs changed against `HEAD` plus untracked ones; the script maps them to ids. No argument means all suites; `changed` with no changed suite CSV reviews nothing and says so.
2. **Collect facts first (deterministic).**
   - `npm run suites:lint`. If it fails, report the lint errors and **stop**: structure is fixed before quality is reviewed.
   - `npm run review:tests -- <ids | changed>`: the candidate list for dimensions 1–5. An unknown id exits with an error. Report it and stop; never treat it as "no candidates".
   - Proposed rows not yet in a suite: save them to a scratch CSV under `results/`, then `npm run suites:lint -- --file <csv>` and `npm run review:tests -- --file <csv>`.
3. **Confirm each candidate.** Read the case row. A candidate becomes a finding only with evidence: quote the line, and say how two agents could diverge, or which broken build would still pass. Some candidates are fine in context (DUP-3 "info": cases that share steps but each has its own failure signal). Say so and drop them. A candidate dropped for good is recorded with its reason in `config/review-accepted.json` (a human decides); the script then hides it, and `npm run review:tests -- --all` shows hidden ones.
4. **Read beyond the script.** For each case, ask the questions the script cannot:
   - Is the oracle exact enough to catch the bug named in `Failure_Signals`?
   - Does the expected text exist in `.claude/knowledge/oracles/business-logic.md` or `.claude/knowledge/domain/saucedemo.md`? Expected messages that exist nowhere are **invented**, and that is a grounding finding.
   - Which breaking dimensions from `cases-that-catch-bugs.md` §6 does this feature's suite miss?
5. **Report** in chat:

```
| Case | Dim | Severity | Evidence (quote) | Fix (the rewritten line; for a Grounding finding: a proposed BL rule or a question for a human, never the observed value) |
Verdict: READY | READY WITH FIXES | NOT READY
Missing breaking dimensions (cases-that-catch-bugs.md §6): …
```

Finding severity (not the case's CSV `Priority`). Verdict rule: any **High** finding ⇒ NOT READY; any **Medium** ⇒ READY WITH FIXES; only **Low**, or none ⇒ READY.

6. **`--fix` only:** apply the rewritten lines to the CSV, then run `npm run suites:lint` (must be OK) and `npm run review:tests -- <ids>`. No candidate may remain except the ones you dropped in step 3, each with its stated reason. Never change an expected value to match the current build (`cases-that-catch-bugs.md` §4). A changed expectation needs a rule or a human.

## Example finding (real: CART-006 before it was fixed; see the git history of `regression/suites/cart/003-cart.csv`)

| Case | Dim | Severity | Evidence | Fix |
|---|---|---|---|---|
| CART-006 | Determinism | High | `[ACT] Add any two products to the cart` | `[ACT] Click 'Add to cart' on 'Sauce Labs Backpack' and on 'Sauce Labs Bike Light'` (and Test_Data with the same names) |
