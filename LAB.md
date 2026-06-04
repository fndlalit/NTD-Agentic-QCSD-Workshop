# Workshop Lab — Copy-Paste Exercises

Four focused exercises across the SDLC on this checkout app — **Ideation → Refinement → Development → CI/CD**. They build on each other: Refinement's product-factors ideas feed Development's test generation; CI/CD then verifies the result. Scoped to stay token-cheap so a whole room can run them on personal API keys.

**Each exercise has two prompts — pick the one for your tool:**
- **Claude Code Users** — use AQE's skills / agents / orchestrator (`/qcsd-ideation-swarm`, `qe-test-architect`, `qe-queen-coordinator`) for the full multi-agent experience.
- **Non Claude Code Users** (Copilot, Codex, Gemini, any other tool) — run the *same work as a generic step list*, which goes through the AQE MCP tools your `aqe init --auto --with-<tool>` wired up.

Both versions of an exercise write to the **same report file**, so **Part 4 — Apply PACT** works no matter which you ran.

**Before you start.** Finish the **Setup** in the [README](./README.md) (clone → `npm install -g agentic-qe@3.10.1` → `aqe init --auto --with-<your-tool>` → `npm install`), then launch your coding agent in this folder. **Don't skip `aqe init`** — it installs AQE's agents, the MCP config, and a local memory DB; without it the prompts have nothing behind them. **Run the exercises in order** — 3 reads 2's output, and 4 verifies the code. All paths are relative to the repo root.

> **Why two versions?** The Claude Code prompts invoke AQE *skills* and the *queen-coordinator*, which orchestrate a fleet of sub-agents (and exercise AQE's learning + model-routing runtime). Those are Claude Code mechanics. On other tools the same QE work runs as an explicit step list through the AQE MCP tools — no skill engine required. Same outcome, different engine.

---

## Exercise 1 — Ideation: gate the epic before any code

> *Phase:* Ideation · *Why:* apply the QE ideation lenses to the epic and render a release gate *before a line of code is written*.

**▸ Claude Code Users** — the orchestrated ideation swarm:

```
/qcsd-ideation-swarm

Analyze the guest-checkout epic in requirements/epic-checkout.md,
using user-stories.md and acceptance-criteria.md for context.

Save all reports under reports/01-ideation-swarm/.
```

**▸ Non Claude Code Users** — the same assessment as explicit steps:

```
Assess the guest-checkout epic before any code is written. Read
requirements/epic-checkout.md (with user-stories.md and
acceptance-criteria.md for context), then:

1. Recommend the quality criteria that matter most (HTSM: capability,
   reliability, security, performance, usability, …)
2. Identify the top risks and score each by likelihood × impact
3. Validate requirements completeness and testability — flag gaps,
   contradictions, and unmeasurable acceptance criteria
4. Render a single GO / CONDITIONAL / NO-GO verdict with the top blockers

Save the assessment to reports/01-ideation-assessment.md.
```

---

## Exercise 2 — Refinement: product factors on the checkout app

> *Phase:* Refinement · *Why:* break the product into its real elements (SFDIPOT) and turn them into prioritised test ideas — which Exercise 3 will use.

**▸ Claude Code Users** — the product-factors agent:

```
Use qe-product-factors-assessor to analyse the guest-checkout product
from requirements/epic-checkout.md and requirements/user-stories.md.

Produce a product-factors (SFDIPOT) assessment and save it to
reports/02-refinement-product-factors.md.
```

**▸ Non Claude Code Users** — the same assessment as explicit steps:

```
Break the checkout product into its product factors before reasoning
about coverage. Read requirements/epic-checkout.md and
requirements/user-stories.md, then analyse the product across the
SFDIPOT dimensions:

  Structure, Function, Data, Interfaces, Platform, Operations, Time.

For each dimension, note what the requirements imply and produce
prioritised test ideas. Save the assessment to
reports/02-refinement-product-factors.md.
```

---

## Exercise 3 — Development: generate tests from the refinement ideas

> *Phase:* Development · *Why:* turn Exercise 2's product-factors ideas into real, runnable tests for the highest-risk module.

**▸ Claude Code Users** — the test architect:

```
Use qe-test-architect to generate a comprehensive test file for the
payment-retry logic in src/lib/payment-retry.ts. Use the test ideas in
reports/02-refinement-product-factors.md as input, and include
property-based tests for the module's invariants.

Save the test file as tests/lib/payment-retry.architect.test.ts and a
short rationale to reports/03-development-tests.md.
```

**▸ Non Claude Code Users** — the same as explicit steps:

```
Generate tests for the payment-retry logic in src/lib/payment-retry.ts:

1. Read reports/02-refinement-product-factors.md and src/lib/payment-retry.ts
2. Write a comprehensive vitest test file covering the happy path, edge
   cases, error paths, and the module's invariants (use property-style
   tests where useful — e.g. idempotency, backoff bounds, retry limits)
3. Make sure the file imports from src/lib/payment-retry.ts and runs

Save the test file as tests/lib/payment-retry.architect.test.ts and a
short rationale to reports/03-development-tests.md.
```

> *Tip:* after this runs, `npm test -- --run tests/lib/payment-retry.architect.test.ts` to see the generated tests actually execute.

---

## Exercise 4 — CI/CD: verify the module and decide on release

> *Phase:* CI/CD · *Why:* generate nothing new — *measure, scan, gate, and recommend*. The release decision on code that now has tests.

**▸ Claude Code Users** — the queen-coordinator orchestrates the verification fleet:

```
Use qe-queen-coordinator to run a verification-only quality assessment of
src/lib/payment-retry.ts (do NOT generate tests). Analyse coverage gaps
with risk scoring, security-scan the module, apply a 90% quality gate,
and give a GO / CONDITIONAL / NO-GO deployment recommendation with the
top blockers.

Save the consolidated report to reports/04-cicd-quality-assessment.md.
```

**▸ Non Claude Code Users** — the same as explicit steps:

```
Run a verification-only quality assessment of src/lib/payment-retry.ts
and decide on release. Do NOT generate tests — assess what exists:

1. Analyse coverage gaps with risk scoring
2. Review the module for security issues
3. Apply a quality gate at a 90% threshold
4. Give a deployment recommendation (GO / CONDITIONAL / NO-GO) with the
   top release blockers, if any

Save the consolidated report to reports/04-cicd-quality-assessment.md.
```

> *Note:* this app keeps its testable logic in `src/lib/` (payment, Luhn, validation, rate-limiting, email) — there is **no `src/services/`**. Scoped to one file so the run finishes fast; widen to `src/lib/` for a broader verification.

---

## After the four runs — Apply PACT

For each report, ask:

- **Proactive?** Did it flag risk *before* you asked, or only answer the prompt?
- **Autonomous?** Did it decide what to inspect, or wait for your steers?
- **Collaborative?** Did it connect findings across concerns (and across exercises), or treat each in a silo?
- **Targeted?** Was the analysis fit to *this* checkout flow, or generic checklists?

In pairs, score each report 0–3 per property. Share the most surprising weakness.

> **Compare engines.** If your pair has both a Claude Code user and a non-Claude-Code user, diff the two reports for the same exercise: did the orchestrated swarm surface anything the step-list version missed (or vice versa)? That gap *is* the value of the orchestration layer.
