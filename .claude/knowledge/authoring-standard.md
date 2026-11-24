# Authoring standard — agents, commands and skills

Read this before you create or restructure a prompt under `.claude/`. `/prompt-review` reviews
against it.

## 1. Pick the right component

| You are building… | Component | Lives at |
|---|---|---|
| A workflow somebody starts by typing `/name` | command | `.claude/commands/<name>.md` |
| A method or reference that Claude pulls in when the task matches (and can be invoked as `/name`) | skill | `.claude/skills/<name>/SKILL.md` + supporting files |
| A specialist another component delegates multi-step work to | agent | `.claude/agents/<name>.md` |
| A fact, rule or table several components read | knowledge file | `.claude/knowledge/` |

Rule of thumb: **commands orchestrate, agents act, skills teach, knowledge informs.**

## 2. Frontmatter
- **All:** `description`: what it does, **when** to use it (in the user's words), and when **not** to (name the alternative).
- **Agent:** `name`, `description`, `model`, `color`.
- **Skill:** `name`, `description`, optional `argument-hint`.
- **Command:** `description`, optional `argument-hint`.

## 3. Structure
- **Agents** use four layers: business logic → domain knowledge → skill set → design decisions, then **Output**. Layers 1–2 point to knowledge files; they do not contain the facts.
- **Commands and skills** use numbered, imperative steps, a deterministic facts step before judgement (run the script, then read), explicit stop conditions, and an output template.
- Every prompt that executes, designs or reviews **test cases** starts with: *read `.claude/knowledge/shared-instructions.md`*. Prompts that review prompts (like `/prompt-review`) do not need it.

## 4. Single source of truth
- A rule shared by more than one prompt lives in one file and is **cited**.
- Counts are never written into prose. Name the script that prints them.
- Product behaviour lives in the oracle and the domain file, never in an agent prompt.

## 5. Cost
- Loaded-whole files (agents, commands, `SKILL.md`) stay focused. Supporting material goes into a supporting file read by the step that needs it.
- `CLAUDE.md` and `.claude/rules/` hold only what applies to every task.

## 6. Guarantees
- Anything that must never happen gets a **hook** (`.claude/hooks/`) and a unit test, not just a sentence in a prompt.

## 7. Before you commit
1. `npm run prompt:facts -- <name>`: no dangling paths, no unknown scripts. Then read for what it cannot see: bare file names, relative links, numbers in prose.
2. `/prompt-review <name>`: verdict SHIP, or SHIP WITH FIXES with the fixes applied.
3. If the prompt is invoked by another prompt, update that caller in the same change.
