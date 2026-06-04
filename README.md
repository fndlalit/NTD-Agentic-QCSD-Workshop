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

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Add your Stripe TEST keys
cp .env.example .env.local
#   then edit .env.local with keys from https://dashboard.stripe.com/test/apikeys

# 3. Run the dev server
npm run dev          # http://localhost:3000
```

## Running the tests

```bash
npm test             # watch mode
npm run test:run     # single run
npm run test:coverage
```

The test suite covers the cart reducer, product catalog, validation, the card/Luhn logic, payment retry, rate limiting, email validation, guest sessions, order publishing, and the checkout/product components. Coverage is intentionally uneven — some modules and UI states are left untested on purpose.

## Quality-engineering practice

This codebase is intended to be analyzed. It contains realistic, intentionally planted quality issues across several dimensions — input validation, security hardening, accessibility (WCAG), resilience, and test coverage — so you can practice finding them by hand and with AI-assisted tooling, then compare what each approach surfaces.

> Use **Stripe test keys only**. Never commit real keys or a real `.env.local`.

## License

MIT — see [LICENSE](./LICENSE).
