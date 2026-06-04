# Workshop Lab — Copy-Paste Exercises

Four lightweight, focused exercises that run **individual agents and one curated mini-fleet** across the SDLC on this checkout app. Designed to stay token-cheap so a whole room can run them on personal API keys without burning budget.

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
user-stories.md, and acceptance-criteria.md.

Read them as a QX partner would: what's missing for a tester to
plan, design, execute, and observe quality work on this product?
Surface contradictions, ambiguities, untestable acceptance
criteria, and silently-assumed context. Rank the top 5 things
that would block quality work on day one.

Save the report to projects/checkout-demo/reports/01-ideation-qx.md.
```

---

## Exercise 2 — Refinement: product factors on the checkout app

> *Swarm:* Refinement · *Agent:* `qe-product-factors-assessor` · *Why:* break the product down into its real elements before reasoning about coverage.

```
@qe-product-factors-assessor

Read projects/checkout-demo/README.md and walk through
projects/checkout-demo/src to understand the actual product.

Produce a product-factors assessment covering:
  - Structure (modules, layers, public surface)
  - Function (what the product DOES for the user)
  - Data (where it lives, what flows through, sensitivity)
  - Platform (Next.js 14, React 18, TypeScript, Stripe, etc.)
  - Operations (how it's deployed, observability, dependencies)
  - Time (timeouts, retries, async flows, race conditions)

For each factor, name the highest-risk elements and the testing
implications. Save the report to
projects/checkout-demo/reports/02-refinement-product-factors.md.
```

---

## Exercise 3 — Development: design tests for the highest-risk module

> *Swarm:* Development · *Agent:* `qe-test-architect` · *Why:* tight scope, visible output (real tests that run), shows AI test design at its strongest.

```
@qe-test-architect

The highest-risk module in this app is the payment-retry logic
(src/lib/payment-retry.ts) — it handles transient gateway failures
with exponential backoff and is easy to get subtly wrong.

Generate a comprehensive test file for src/lib/payment-retry.ts:
  - Unit tests for every code path including retry caps and
    permanent-failure short-circuits
  - At least 3 property-based tests covering invariants
    (idempotency, monotonic backoff, total wait ≤ 5 min)
  - Edge cases: zero retries, network jitter, retryable vs.
    permanent error classification

Save the new test file as
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
in parallel:

  - @qe-security-scanner — OWASP Top 10, hardcoded secrets,
    auth/authz gaps, missing input validation, missing rate
    limiting on API routes
  - @qe-code-reviewer — code smells, dead code, complexity
    hotspots, maintainability issues
  - @qe-accessibility-auditor — WCAG 2.2 AA on the checkout form
    (CheckoutForm.tsx) — labels, aria-describedby, focus order,
    contrast
  - @qe-quality-gate — synthesise the above into a quality-gate
    verdict at 80% threshold: GO / CONDITIONAL / NO-GO, with the
    top 3 release blockers if any

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
