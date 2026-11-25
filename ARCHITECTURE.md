# IP architecture — Olga Manuilova

**Head of Agentic Quality Engineering & AI-Native SDLC**

| Level | What it is | Members |
|---|---|---|
| **Frameworks** (at most three) | answer a big system question and set the operating model | **Agentic QA** · **Agentic SDLC** · **Assured Autonomy Framework** (the assurance and governance layer), all "by Olga Manuilova" |
| **Agentic Core** (modules M1–M9) | shared controls both frameworks stand on; one specification, implemented inside each framework | below |
| **Plugins** | an operational workflow or entry point | e.g. qa-support, Support-to-SDLC, Security Finding Intake |
| **Overlays** | industry requirements on top of a framework | Regulated FinTech — UAE first |

**Placing a new idea:** a new "can we trust system X?" question → framework candidate (rarely). A control needed in two
or more places → a **module**. A new entry point or workflow → a **plugin**. One industry's requirements → an **overlay**.
Anything else → backlog, not brand.

**Assured Autonomy Framework** answers: *can this AI-enabled system be trusted to operate with sensitive data, delegated
authority and consequential actions?* — for any AI or agentic system in production, not only agents that build software.

## Agentic Core — modules and where THIS framework implements them
| Module | Controls | Implementation in Agentic QA |
|---|---|---|
| M1 Independent Verification | the author never verifies their own work; more than one verification path | business-logic oracle, independent `code-reviewer` in qa-fix, `/qa-review-tests` |
| M2 Agent Authority & Runtime Control | who the agent is, for whom, what it may do, budgets, revocation | real-user-only and credential-by-name hooks, `qa-secrets`, one browser lane per agent |
| M3 Human Decision Boundaries | decisions only a human takes, bound to content | merge always human, one approval checkpoint in `/qa-test`, qa-support autonomy by risk class |
| M4 Harness Assurance | integrity of the agent system itself: prompts, hooks, settings | `/prompt-review`, `npm run context:check`, `npm run suites:lint` |
| M5 Context Integrity | trusted sources, freshness, untrusted input | oracle and domain files, qa-support treats a ticket as untrusted input and flags injection |
| M6 Evidence & Auditability | evidence for every verdict, history kept | evidence in run results, `/qa-evidence`, one consolidated comment per issue |
| M7 Sensitive Data Boundary | personal and financial data masked and classified | qa-support masking before any agent reads a ticket; no secrets in reports |
| M8 Production Readiness | ready to release and to operate | `/qa-regression` GO/NO-GO, `/qa-monitoring` |
| M9 Recovery & Resilience | hotfix, rollback, incident, re-entry | `/qa-verify-fix`; release recovery lives in Agentic SDLC |

The lean edition implements the core of each module; the Enterprise edition adds the rest (e.g. risk tiers, Operate, decision buttons, plugins).

The shared module specification lives with the Assured Autonomy Framework; this file maps it to this repository.

---
*© 2026 Olga Manuilova*
