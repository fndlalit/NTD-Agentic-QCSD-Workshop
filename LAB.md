# Workshop Lab — Copy-Paste Exercises

Six steps on this deliberately-flawed checkout app: **build a local knowledge graph (0) → Ideation → Refinement → Development → CI/CD (1–4) → Self-Learning (5)**, then a **Personal Adoption Roadmap**. The SDLC exercises build on each other (Refinement feeds Development; CI/CD verifies) and each ends by saving its learnings; Step 5 turns those into an instant handoff brief. Everything indexes and embeds with a **local on-device model — your code never leaves your machine** — and it's scoped token-cheap for a whole room on personal keys.

**Pick your prompt — each SDLC exercise (1–4) has two versions:**
- **Claude Code Users** — AQE skills / orchestrator (`/qcsd-ideation-swarm`, `qe-test-architect`, `qe-queen-coordinator`).
- **Non Claude Code Users** (Copilot, Codex, Gemini, …) — the same work as a generic step list via the AQE MCP tools.

Both write to the same report and end with **"Save learnings and persist patterns."** *(Steps 0 and 5 are MCP-tool calls — identical on every tool, no split.)*

**Before you start:** finish the [README](./README.md) Setup (clone → `npm install -g agentic-qe@3.10.1` → `aqe init --auto --with-<your-tool>` → `npm install`), then launch your agent here. **Don't skip `aqe init`** (it installs the agents, MCP config, and memory DB) and **run the exercises in order** (3 reads 2's output; 5 recalls what 0–4 saved). Paths are relative to the repo root.

---

## Exercise 0 — Warm-up: build the local knowledge graph + baseline (≈3 min)

> *Phase:* Setup · *Why:* before the fleet reasons about your code, give it a **map** — and prove the engine runs **on your machine**. AQE indexes the repo with a local ONNX model (`all-MiniLM-L6-v2`, 384-d); **no code leaves your laptop, no API key needed.** Same prompt for every tool.

```
1. Build the code knowledge graph: index src/ with AQE's code-index tool.
   Open the saved index file (.agentic-qe/results/code-index/…json) and
   note the node and edge counts — that's your local map of the codebase.
2. Confirm the engine is local: get the AQE embedding stats and note the
   model name (all-MiniLM-L6-v2) and dimension (384).
3. Note your starting point: get AQE memory usage (total entries and
   vectors) so you have a sense of what's there before you begin.
```

> *Heads-up:* the code-index tool's inline summary may show `symbolsExtracted: 0` — ignore it; the **real** counts (nodes / edges) are in the saved `.agentic-qe/results/code-index/…json` file.

---

## Exercise 1 — Ideation: gate the epic before any code

> *Phase:* Ideation · *Why:* apply the QE ideation lenses to the epic and render a release gate *before a line of code is written*.

**▸ Claude Code Users** — the orchestrated ideation swarm:

```
/qcsd-ideation-swarm

Analyze the guest-checkout epic in requirements/epic-checkout.md,
using user-stories.md and acceptance-criteria.md for context.
Save all reports under reports/01-ideation-swarm/.
Save learnings and persist patterns.
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
5. Save the assessment to reports/01-ideation-assessment.md
6. Save learnings and persist patterns
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
Save learnings and persist patterns.
```

**▸ Non Claude Code Users** — the same assessment as explicit steps:

```
Break the checkout product into its product factors before reasoning
about coverage. Read requirements/epic-checkout.md and
requirements/user-stories.md, then analyse the product across the
SFDIPOT dimensions:

  Structure, Function, Data, Interfaces, Platform, Operations, Time.

Then:
1. For each dimension, note what the requirements imply and produce
   prioritised test ideas
2. Save the assessment to reports/02-refinement-product-factors.md
3. Save learnings and persist patterns
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
Save learnings and persist patterns.
```

**▸ Non Claude Code Users** — the same as explicit steps:

```
Generate tests for the payment-retry logic in src/lib/payment-retry.ts:

1. Read reports/02-refinement-product-factors.md and src/lib/payment-retry.ts
2. Write a comprehensive vitest test file covering the happy path, edge
   cases, error paths, and the module's invariants (use property-style
   tests where useful — e.g. idempotency, backoff bounds, retry limits)
3. Make sure the file imports from src/lib/payment-retry.ts and runs
4. Save the test file as tests/lib/payment-retry.architect.test.ts and a
   short rationale to reports/03-development-tests.md
5. Save learnings and persist patterns
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
Save learnings and persist patterns.
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
5. Save the consolidated report to reports/04-cicd-quality-assessment.md
6. Save learnings and persist patterns
```

> *Note:* this app keeps its testable logic in `src/lib/` (payment, Luhn, validation, rate-limiting, email) — there is **no `src/services/`**. Scoped to one file so the run finishes fast; widen to `src/lib/` for a broader verification.

---

## Exercise 5 — Self-Learning: put the fleet's memory to work (≈5 min)

> *Why:* every exercise above ended with **"Save learnings and persist patterns."** Now feel the payoff — the fleet didn't just file those away, it can hand them back **consolidated, on demand**. That's institutional knowledge working *for* you. Same prompt for every tool.

```
Recall what the fleet has learned about this checkout app and consolidate
it into a one-page brief — top risks, testability gaps, contradictions,
and the release verdict — framed as either:
  • an onboarding brief for someone joining the project today, or
  • a handoff document for the next person enhancing the checkout app.

Pull the learnings from AQE memory (the patterns persisted across
Exercises 1–4; retrieve a specific one by its key if a recent learning
hasn't surfaced yet). Save the brief to reports/05-handoff-brief.md.
```

**Why this is the benefit.** You didn't re-read four reports — the fleet reconstructed the project's institutional knowledge in seconds from what each exercise saved, and a new teammate or the next run inherits all of it instantly. *(In Claude Code this capture is automatic — the ReasoningBank hooks + the `AQE Learning: N patterns loaded…` banner.)* That's the self-learning loop: agents that **remember** beat agents that start cold.

---

## After the runs — Apply PACT

For each report, ask:

- **Proactive?** Did it flag risk *before* you asked, or only answer the prompt?
- **Autonomous?** Did it decide what to inspect, or wait for your steers?
- **Collaborative?** Did it connect findings across concerns (and across exercises), or treat each in a silo?
- **Targeted?** Was the analysis fit to *this* checkout flow, or generic checklists?

In pairs, score each report 0–3 per property. Share the most surprising weakness.

> **Compare engines.** If your pair has both a Claude Code user and a non-Claude-Code user, diff the two reports for the same exercise: did the orchestrated swarm surface anything the step-list version missed (or vice versa)? That gap *is* the value of the orchestration layer.

---

## Your Adoption Roadmap — leave with a plan, not just reports

The point isn't the reports — it's what you do Monday. Fill this in for *your* context (≈10 min, in pairs):

1. **My context** — team, stack, and where quality hurts most today: ______
2. **The 70% I want back** — which clerical testing activity eats my team's time that an agent could take over *first*? ______
3. **First 3 agents I'll adopt** — pick from the fleet in `.claude/agents/v3/` (e.g. `qe-requirements-validator`, `qe-product-factors-assessor`, `qe-test-architect`, `qe-queen-coordinator`): ______
4. **First QCSD phase I'll start with** — Ideation gate, Refinement, Development, or CI/CD? ______
5. **One success metric (2 weeks)** — how will I know it worked? (e.g. contradictions caught *in refinement*, coverage on the riskiest module, faster GO/NO-GO calls): ______
6. **My first step on Monday** — the single smallest thing I'll actually do: ______

> Keep it small: one agent, one phase, one repo, one metric. The full fleet (30+ agents, MIT-licensed) is already on your machine from `aqe init` — nothing held back. Start where the pain is.
