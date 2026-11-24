# Review dimensions

Supporting file for `/prompt-review` step 4. For each dimension: what to check, how to find it, and
what a typical finding looks like.

## D1 — Interface: will it be found, called and understood?
- **Description** (frontmatter) says *what* it does and *when* to use it, in the words a user would type ("review the cases", "run smoke"). If it overlaps another prompt, it says which to use when.
- **Arguments** in `argument-hint` match what the body actually parses.
- **Callers** (from `prompt:facts`) call it by its current name, with arguments it supports, and expect the output it actually produces.
- *Typical finding:* "regression-orchestrator expects `results/<RUN_ID>/<SUITE>.json`, but test-runner writes `<SUITE_ID>-results.json`" (BLOCKER).

## D2 — Executability: can every step actually be done?
- Every path exists (`danglingPaths`). Every `npm run` script exists (`unknownNpmScripts`). Every tool or MCP server named is configured in `.mcp.json` or `.claude/settings.json`.
- Every step has an input it can get and an output it produces. Steps that need a human say so and stop.
- Conditions are explicit ("if G1 fails, …"), not implied.
- *Typical finding:* "Step 3 runs `npm run env:verify`, which does not exist; the script is `env:check`" (BLOCKER).

## D3 — Single source of truth: is anything copied that should be cited?
- Rules shared by several prompts live once (`shared-instructions.md`, `.claude/rules/`, the oracle) and are **cited**. A copied rule drifts.
- No hard-coded counts ("6 suites", "4 agents"): they are wrong after the next change. Point to the script that prints them (`hardCodedCounts`).
- *Typical finding:* "the verdict rules are restated here and differ from shared-instructions.md: AMBIGUOUS is missing" (MAJOR).

## D4 — Context economy: is it worth what it costs?
- Agent, command and skill files are loaded **whole** every time they are used. Keep them focused, and move reference material into a supporting file or `.claude/knowledge/`, read only by the step that needs it (`overSize` warns above the threshold in `scripts/prompt-facts.mjs`).
- `CLAUDE.md` and `.claude/rules/` are paid on **every** turn: only what applies to every task belongs there.
- *Typical finding:* "a 40-line table of locators is loaded on every dispatch but used by one step. Move it to the domain file and cite it" (MINOR).

## D5 — Instruction craft: will the model do the right thing?
- Numbered, imperative steps for procedures. Explicit stop conditions and an explicit **output contract** (template, file path or JSON shape) (`hasOutputSection`).
- No hedging that makes steps optional: "consider", "try to", "if possible", "as appropriate", "etc." (`vaguePhrases`). Say what to do, and when not to.
- Hard rules are stated where they apply, with the reason in one line, and enforced by a hook where possible. A prompt asks; a hook guarantees.
- Examples are concrete and correct. A wrong example is copied faithfully.
- *Typical finding:* "'consider capturing a screenshot' makes evidence optional, while shared-instructions requires one per FAIL. Rewrite as 'Capture a screenshot for every FAIL step'" (MAJOR).
