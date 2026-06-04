# Workshop Lab — Copy-Paste Exercises

Four lightweight, focused exercises that run **individual agents and one curated mini-fleet** across the SDLC on this checkout app. Designed to stay token-cheap so a whole room can run them on personal API keys without burning budget.

The prompts below are deliberately **lean** — they tell each agent *what to look at* and *where to save*, but **not how to think**. That's the point: the methodology (finding contradictions, applying SFDIPOT, designing property tests, running OWASP/WCAG checks) lives inside the agents. Watch what they do *on their own* — then judge it in **Part 4 — Apply PACT**.

**Before you start.** Run these once, in order:

```bash
git clone https://github.com/fndlalit/checkout-demo
cd checkout-demo
npm install -g agentic-qe@3.10.1   # installs the AQE CLI (global)
aqe init --auto                    # installs the @qe-… agents into ./.claude/agents/
npm install                        # the app's own dependencies
```

Then **open Claude Code in this `checkout-demo` folder** — it is your workspace root, so all the paths below are relative to it.

When the four runs are done, head to **Part 4 — Apply PACT** and interrogate the reports.

---

## Exercise 1 — Ideation: read the requirements as a QX partner

> *Swarm:* Ideation · *Agent:* `qe-qx-partner` · *Why:* before any code, can a quality engineer actually do their job with what's written?

```
@qe-qx-partner

Read requirements/epic-checkout.md,
user-stories.md, and acceptance-criteria.md as a QX partner.

Save your assessment to
reports/01-ideation-qx.md.
```

---

## Exercise 2 — Refinement: product factors on the checkout app

> *Swarm:* Refinement · *Agent:* `qe-product-factors-assessor` · *Why:* break the product down into its real elements before reasoning about coverage.

```
@qe-product-factors-assessor

Read README.md and walk through
src to understand the actual product.

Produce a product-factors assessment. Save it to
reports/02-refinement-product-factors.md.
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
tests/lib/payment-retry.architect.test.ts
and a short rationale to
reports/03-development-tests.md.
```

---

## Exercise 4 — CI/CD: curated static-analysis fleet

> *Swarm:* CI/CD · *Curated fleet (static analysis):* `qe-security-scanner` + `qe-quality-gate` + `qe-code-reviewer` + `qe-accessibility-auditor`
> *Why:* this is the "swarm" demo, but kept deterministic and cheap — parallel static checks, no big generative work.

```
@qe-security-scanner @qe-quality-gate @qe-code-reviewer @qe-accessibility-auditor

Run a curated static-analysis pass on src
in parallel — security, code review, and accessibility on the
checkout form — then have @qe-quality-gate synthesise the findings
into a quality-gate verdict at an 80% threshold:
GO / CONDITIONAL / NO-GO, with the top release blockers if any.

Save the consolidated report to
reports/04-cicd-static-fleet.md.
```

---

## After the four runs — Apply PACT

For each report, ask:

- **Proactive?** Did it flag risk *before* you asked, or only answer the prompt?
- **Autonomous?** Did it decide what to inspect, or wait for your steers?
- **Collaborative?** Did the agents reference each other's findings, or run as parallel silos?
- **Targeted?** Was the analysis fit to *this* checkout flow, or generic checklists?

In pairs, score each report 0–3 per property. Share the most surprising weakness.
