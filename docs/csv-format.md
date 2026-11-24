# CSV case format

Every suite is a UTF-8 CSV with **exactly** these 15 columns, in this order (enforced by
`npm run suites:lint`):

```
ID,Title,Section,Priority,Business_Rule,Edge_Case_Refs,Preconditions,Test_Data,Steps,Assertions,Cross_Layer_Checks,Failure_Signals,Cleanup,References,Automation_Status
```

Quote every field (`"…"`). Multi-line cells (Steps, Assertions, Cross_Layer_Checks) use real line
breaks inside the quotes, one tagged line per step. Edit in a spreadsheet, VS Code with a CSV extension,
or generate the files with a script. Do not hand-edit quoting in a plain text editor.

## Columns

| Column | Required | Rules | Example |
|---|---|---|---|
| `ID` | ✔ | `PREFIX-NNN` (optional lowercase suffix), unique across **all** suites | `CHK-004`, `AUTH-012b` |
| `Title` | ✔ | What is verified, in a few words | `Totals and tax are correct for several items` |
| `Section` | | `Area > Sub-area`, for grouping in reports | `Checkout > Totals` |
| `Priority` | ✔ | `Critical` · `High` · `Medium` · `Low` | `Critical` |
| `Business_Rule` | | `;`-separated BL ids that **must exist** in the oracle | `BL-CHK-002; BL-CHK-003` |
| `Edge_Case_Refs` | | Free ids into an edge-case library (Enterprise edition) | `ECL-CHK-rounding` |
| `Preconditions` | | State the case needs; if not met, the case is BLOCKED | `Signed in as {{STANDARD_USER}}; empty cart` |
| `Test_Data` | | `key=value;…`, documentation for humans and agents | `product=Sauce Labs Backpack` |
| `Steps` | ✔ | One line per step, each starting with a step tag | see below |
| `Assertions` | ✔ | One line per expected outcome, each with an assertion tag | see below |
| `Cross_Layer_Checks` | | Checks below the UI, each with a cross-layer tag | `[CONSOLE] No uncaught errors` |
| `Failure_Signals` | | Symptoms that mean "something is wrong" even if the assertions pass | `Spinner >5s; 5xx` |
| `Cleanup` | | What to undo, run even after a FAIL | `Menu -> Reset App State; Logout` |
| `References` | | Spec file, ticket, doc | `tests/smoke.spec.js` |
| `Automation_Status` | ✔ | `Agent` (run by agents) · `Candidate` (stable, ready to promote) · `Automated` (has a spec) · `Manual` | `Agent` |

## Tag vocabulary

**Steps**

| Tag | Meaning |
|---|---|
| `[NAV]` | Navigate to a URL |
| `[ACT]` | A user action: click, type, select, scroll, reload |
| `[WAIT]` | Wait for a described state (max 10 s, then FAIL or BLOCKED) |
| `[ASSERT]` | An intermediate check or a value to remember for later |
| `[NOTE]` | An instruction to the agent, not a user action |

**Assertions**

| Tag | Meaning |
|---|---|
| `[DOM]` | Element present, visible, enabled or count |
| `[TEXT]` | Visible text or value |
| `[URL]` | Address after the flow |
| `[STATE]` | Application state or logic (ordering, arithmetic, persistence) |
| `[VISUAL]` | Judged from a screenshot (layout, images) |
| `[A11Y]` | Accessibility: roles, names, focus, contrast |

**Cross-layer checks**

| Tag | Meaning |
|---|---|
| `[CONSOLE]` | Browser console |
| `[NETWORK]` | Requests and responses (status, payload) |
| `[API]` | A backend or API expectation |
| `[STORAGE]` | Cookies, local or session storage (read-only) |
| `[PERF]` | Timing |

## Placeholders

`{{NAME}}` is replaced at run time:

- any variable from the layered env (`npm run env:check` lists them), for example `{{FRONT_URL}}` or `{{STANDARD_USER}}`;
- `{{timestamp}}`: Unix time, for unique data;
- `{{RUN_ID}}` and `{{LANE_ID}}`: the current run and lane.

Unknown placeholders fail the linter. **Never put a password literal in a CSV.** Use its variable.

## Style guide

- **One behaviour per case.** If the title needs "and", consider splitting the case. Smoke cases are the exception, because they are end-to-end on purpose.
- **Write steps as a user would describe them.** Use visible labels in quotes (`Click 'Checkout'`), not selectors. Agents find elements through the accessibility tree.
- **Make assertions observable and exact.** Prefer `[TEXT] Tax: $4.32` over "tax looks right". For logic, also write the formula (`[STATE] total = item total + tax`) so the agent can check other data too.
- **Always link a rule.** A case without a `Business_Rule` cannot tell the agent how severe a failure is.
- **Every case cleans up after itself.** Lanes are isolated, but a run may be resumed in the same lane.
- **Use `Failure_Signals` for experience,** for example "Spinner >5s" or "redirect to /error". These are the clues senior testers look for.

## Registering a suite

1. File: `regression/suites/<domain>/<NNN>-<slug>.csv`.
2. Entry in `config/test-suites.json` → `suites`: `id`, `name`, `file`, `domain`, `layer`, `priority` (`P0`–`P3`), `testCount`, `estimatedMinutes` (about 1 min per case to start, then tune from real runs), `agent`, `tags`.
3. Add the suite to selections if needed (`include`, `where`, `exclude`).
4. `npm run suites:lint`.

---
*Agentic QA Framework (lean edition) · © 2026 Olga Manuilova · MIT License · [source](https://github.com/OlgaManuilova-coder/agentic-qa-lean)*
