# Checkout Demo

A small but realistic **Next.js 14 e-commerce checkout application**, built to serve as a sample *subject app* for quality-engineering exercises. It looks and behaves like a real store — product listing, cart, a Stripe-powered checkout, and an order confirmation — and it deliberately contains a spread of realistic quality issues (validation gaps, accessibility misses, fragile payment-retry logic, weak input handling) for you to find and reason about.

## What's inside

A six-product electronics/accessories storefront with a complete purchase flow:

- **Product catalog** (`src/app/page.tsx`, `src/lib/products.ts`) — grid of products with add-to-cart.
- **Cart** (`src/app/cart`, `src/context/CartContext.tsx`) — client-side cart state via React context + reducer.
- **Checkout** (`src/app/checkout`, `src/components/CheckoutForm.tsx`) — address + payment form using Stripe Elements, client-side validation, guest checkout.
- **Confirmation** (`src/app/confirmation`) — post-purchase summary.
- **API routes** (`src/app/api`) — `create-payment-intent` (Stripe) and `orders`.
- **Supporting libraries** (`src/lib`) — card validation (`luhn`), form/email validation, guest sessions, rate limiting, payment-retry with backoff, and order-event publishing.

## Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Stripe** (`stripe`, `@stripe/react-stripe-js`, `@stripe/stripe-js`)
- **Tailwind CSS**
- **Vitest** + **Testing Library** for unit/component tests

## Running the tests

```bash
npm install          # one-time, installs dev dependencies
npm run test:run     # single run
npm run test:coverage
```

The test suite covers the cart reducer, product catalog, validation, the card/Luhn logic, payment retry, rate limiting, email validation, guest sessions, order publishing, and the checkout/product components. Coverage is intentionally uneven — some modules and UI states are left untested on purpose.

## Running the app (optional — not needed for the workshop)

The AQE exercises below are all static analysis, so you do **not** need to run the app or set up Stripe to complete them. If you *want* to click through the live store:

```bash
cp .env.example .env.local   # then add Stripe TEST keys from
                             # https://dashboard.stripe.com/test/apikeys
npm run dev                  # http://localhost:3000
```

## Quality-engineering practice

This codebase is intended to be analyzed. It contains realistic, intentionally planted quality issues across several dimensions — input validation, security hardening, accessibility (WCAG), resilience, and test coverage — so you can practice finding them by hand and with AI-assisted tooling, then compare what each approach surfaces.

### Workshop setup (Agentic QE)

This app is the *subject under test*; the AI agents come from **[Agentic QE](https://github.com/proffesor-for-testing/agentic-qe)**, installed from npm — they are **not** bundled in this repo. Run these once, from inside the cloned folder:

```bash
git clone https://github.com/fndlalit/checkout-demo
cd checkout-demo

npm install -g agentic-qe@3.10.1   # 1. install the AQE CLI (global)
aqe init --auto                    # 2. copy the @qe-… agents into ./.claude/agents/
npm install                        # 3. install this app's own dependencies
```

Then **open Claude Code in this folder** — it is your workspace root. `aqe init` drops AQE's agents, skills, and a fresh local memory DB into this folder (all gitignored, so nothing is committed back).

**Exercises:** see **[LAB.md](./LAB.md)** — four copy-paste exercises that run AQE agents across the SDLC (Ideation → Refinement → Development → CI/CD), followed by a PACT assessment of the results. All paths in LAB.md are relative to this folder.

> Use **Stripe test keys only**. Never commit real keys or a real `.env.local`.

## License

MIT — see [LICENSE](./LICENSE).
