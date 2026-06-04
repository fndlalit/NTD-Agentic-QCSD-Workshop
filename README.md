# NTD — Agentic QCSD Workshop

A small, realistic **Next.js 14 e-commerce checkout app** used as the *subject under test* for an **Agentic QE (AQE)** workshop. It behaves like a real store — catalog, cart, Stripe checkout, confirmation — and **deliberately contains realistic quality issues** (validation gaps, accessibility misses, fragile payment-retry logic, weak input handling) for the AI agents — and you — to find.

---

## Setup

You're already in the `NTD-Agentic-QCSD-Workshop` folder (you cloned or downloaded it). Run these three commands once:

```bash
npm install -g agentic-qe@3.10.1   # 1. AQE CLI (global, one-time)
aqe init --auto                    # 2. installs the @qe-… agents into ./.claude/agents/
npm install                        # 3. this app's own dependencies
```

Then **open Claude Code in this folder** — it is your workspace root.

> The AI agents come from **[Agentic QE](https://github.com/proffesor-for-testing/agentic-qe)** and are installed from npm — they are **not** bundled in this repo. `aqe init` copies the agents, skills, and a fresh local memory DB into this folder (all gitignored, so nothing is committed back).

*(Don't have the repo yet? `git clone https://github.com/fndlalit/NTD-Agentic-QCSD-Workshop && cd NTD-Agentic-QCSD-Workshop`, then run the steps above.)*

---

## The exercises

Head to **[LAB.md](./LAB.md)** — four copy-paste exercises that run AQE agents across the SDLC (Ideation → Refinement → Development → CI/CD), followed by a PACT assessment of the results.

All paths in LAB.md are relative to this folder. The exercises are **static analysis** — you do **not** need to run the app or set up Stripe to complete them.

---

## What's inside

A six-product electronics/accessories storefront with a complete purchase flow:

- **Product catalog** (`src/app/page.tsx`, `src/lib/products.ts`) — product grid with add-to-cart.
- **Cart** (`src/app/cart`, `src/context/CartContext.tsx`) — client-side state via React context + reducer.
- **Checkout** (`src/app/checkout`, `src/components/CheckoutForm.tsx`) — address + payment form (Stripe Elements), client-side validation, guest checkout.
- **Confirmation** (`src/app/confirmation`) — post-purchase summary.
- **API routes** (`src/app/api`) — `create-payment-intent` (Stripe) and `orders`.
- **Supporting libraries** (`src/lib`) — card validation (`luhn`), form/email validation, guest sessions, rate limiting, payment-retry with backoff, order-event publishing.

**Tech stack:** Next.js 14 (App Router) · React 18 · TypeScript · Stripe · Tailwind CSS · Vitest + Testing Library.

Coverage is **intentionally uneven** — some modules and UI states are left untested on purpose, so there's real work for the agents to find.

---

## Running the tests (optional)

```bash
npm run test:run        # single run
npm run test:coverage   # with coverage
```

---

## License

MIT — see [LICENSE](./LICENSE).
