# NTD — Agentic QCSD Workshop

Welcome 👋 This is the official repo for the **Agentic Quality-Conscious Software Delivery (QCSD)** hands-on workshop at **Nordic Testing Days (NTD)**.

**Agentic QCSD** is about putting autonomous AI quality agents to work *across the whole delivery lifecycle* — not just generating tests, but reasoning about requirements, product risk, code quality, security, and accessibility the way a quality engineer would. In this session you'll drive a fleet of these agents (**[Agentic QE](https://github.com/proffesor-for-testing/agentic-qe)**) through four SDLC phases, watch what they surface *on their own*, and then judge their output with the **PACT** lens (Proactive, Autonomous, Collaborative, Targeted).

The catch: great agents need something real to chew on. So this repo also ships a small, deliberately-flawed e-commerce app as the **subject under test** — see [The demo app](#the-demo-app) below.

---

## What you'll do

Four lightweight, copy-paste exercises (in **[LAB.md](./LAB.md)**), one per delivery phase:

| Phase | Agent(s) | The question it answers |
|-------|----------|--------------------------|
| **Ideation** | `qe-qx-partner` | Before any code — can a QE even do their job with these requirements? |
| **Refinement** | `qe-product-factors-assessor` | What is this product really made of, and where's the risk? |
| **Development** | `qe-test-architect` | Can it design strong tests for the riskiest module? |
| **CI/CD** | security + code-review + a11y + quality-gate | Is this releasable? GO / CONDITIONAL / NO-GO. |

Then, in **Part 4 — Apply PACT**, you score each agent's output. The exercises are kept lean and token-cheap so a whole room can run them on personal keys.

---

## Setup

**1. Get this repo.** Clone it (or download the ZIP from the green **Code** button and unzip), then move into the folder:

```bash
git clone https://github.com/fndlalit/NTD-Agentic-QCSD-Workshop
cd NTD-Agentic-QCSD-Workshop
```

**2. Install AQE and the demo app's dependencies.** Run these once, from inside the folder:

```bash
npm install -g agentic-qe@3.10.1   # the AQE CLI (global, one-time)
aqe init --auto                    # installs the @qe-… agents into ./.claude/agents/
npm install                        # the demo app's own dependencies
```

**3. Open Claude Code in this folder** — it is your workspace root, and all paths in LAB.md are relative to it.

> The AI agents come from **[Agentic QE](https://github.com/proffesor-for-testing/agentic-qe)**, installed from npm — they are **not** bundled in this repo. `aqe init` copies the agents, skills, and a fresh local memory DB into this folder (all gitignored, so nothing is committed back).

➡️ **Next:** open **[LAB.md](./LAB.md)** and start with Exercise 1.

---

## The demo app

A six-product electronics storefront with a complete purchase flow — the *subject under test*, not the point of the workshop. It deliberately contains realistic quality issues (validation gaps, accessibility misses, fragile payment-retry logic, weak input handling) for the agents to find.

- **Catalog** (`src/app/page.tsx`, `src/lib/products.ts`) — product grid with add-to-cart.
- **Cart** (`src/app/cart`, `src/context/CartContext.tsx`) — client-side state via React context + reducer.
- **Checkout** (`src/app/checkout`, `src/components/CheckoutForm.tsx`) — address + payment form (Stripe Elements), validation, guest checkout.
- **Confirmation** (`src/app/confirmation`) — post-purchase summary.
- **API routes** (`src/app/api`) — `create-payment-intent` and `orders`.
- **Libraries** (`src/lib`) — card/Luhn validation, form/email validation, guest sessions, rate limiting, payment-retry with backoff, order-event publishing.

**Tech stack:** Next.js 14 (App Router) · React 18 · TypeScript · Stripe · Tailwind CSS · Vitest + Testing Library.

Test coverage is **intentionally uneven** — some modules and UI states are left untested on purpose, so there's real work for the agents.

**Run the existing tests (optional):**

```bash
npm run test:run        # single run
npm run test:coverage   # with coverage
```

---

## License

MIT — see [LICENSE](./LICENSE).
