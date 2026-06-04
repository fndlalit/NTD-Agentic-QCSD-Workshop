# Workshop Lab — Copy-Paste Exercises

Four lightweight, focused exercises that run **individual agents and one curated mini-fleet** across the SDLC on this checkout app. Designed to stay token-cheap so a whole room can run them on personal API keys without burning budget.

The prompts below are deliberately **lean** — they tell each agent *what to look at* and *where to save*, but **not how to think**. That's the point: the methodology (finding contradictions, applying SFDIPOT, designing property tests, running OWASP/WCAG checks) lives inside the agents. Watch what they do *on their own* — then judge it in **Part 4 — Apply PACT**.

**Before you start.** You should have:

- `agentic-qe` cloned and installed (`npm install -g agentic-qe`)
- This repo cloned into `agentic-qe/projects/checkout-demo/`
- A Claude Code session opened at the **root of your `agentic-qe/` workspace**
- `aqe init --auto` already run once (installs the `@qe-…` agents into `.claude/agents/`)

When the four runs are done, head to **Part 4 — Apply PACT** and interrogate the reports.

---

## Exercise 1 — Ideation: read the requirements as a QX partner

> *Swarm:* Ideation · *Agent:* `qe-qx-partner` · *Why:* before any code, can a quality engineer actually do their job with what's written?

```
@qe-qx-partner

Read projects/checkout-demo/requirements/epic-checkout.md,
user-stories.md, and acceptance-criteria.md as a QX partner.

Save your assessment to
projects/checkout-demo/reports/01-ideation-qx.md.
```

---

## Exercise 2 — Refinement: product factors on the checkout app

> *Swarm:* Refinement · *Agent:* `qe-product-factors-assessor` · *Why:* break the product down into its real elements before reasoning about coverage.

```
@qe-product-factors-assessor

Read projects/checkout-demo/README.md and walk through
projects/checkout-demo/src to understand the actual product.

Produce a product-factors assessment. Save it to
projects/checkout-demo/reports/02-refinement-product-factors.md.
```

---

## Exercise 3 — Development: design tests for the highest-risk module

> *Swarm:* Development · *Agent:* `qe-test-architect` · *Why:* tight scope, visible output (real tests that run), shows AI test design at its strongest.

```
@qe-test-architect

Generate a comprehensive test file for the payment-retry logic in
src/lib/payment-retry.ts, including property-based tests for its
invariants.

Save the test file as
projects/checkout-demo/tests/lib/payment-retry.architect.test.ts
and a short rationale to
projects/checkout-demo/reports/03-development-tests.md.
```

---

## Exercise 4 — CI/CD: curated static-analysis fleet

> *Swarm:* CI/CD · *Curated fleet (static analysis):* `qe-security-scanner` + `qe-quality-gate` + `qe-code-reviewer` + `qe-accessibility-auditor`
> *Why:* this is the "swarm" demo, but kept deterministic and cheap — parallel static checks, no big generative work.

```
@qe-security-scanner @qe-quality-gate @qe-code-reviewer @qe-accessibility-auditor

Run a curated static-analysis pass on projects/checkout-demo/src
in parallel — security, code review, and accessibility on the
checkout form — then have @qe-quality-gate synthesise the findings
into a quality-gate verdict at an 80% threshold:
GO / CONDITIONAL / NO-GO, with the top release blockers if any.

Save the consolidated report to
projects/checkout-demo/reports/04-cicd-static-fleet.md.
```

---

## After the four runs — Apply PACT

For each report, ask:

- **Proactive?** Did it flag risk *before* you asked, or only answer the prompt?
- **Autonomous?** Did it decide what to inspect, or wait for your steers?
- **Collaborative?** Did the agents reference each other's findings, or run as parallel silos?
- **Targeted?** Was the analysis fit to *this* checkout flow, or generic checklists?

In pairs, score each report 0–3 per property. Share the most surprising weakness.
