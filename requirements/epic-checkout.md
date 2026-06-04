# Epic: Frictionless Guest Checkout

**Owner:** Product
**Status:** Ready for sprint planning
**Target release:** Q3
**Stakeholders:** Engineering, QA, Finance, Customer Success

---

## Business goal

Reduce checkout abandonment by offering a frictionless, single-page checkout flow that does not require account creation. Conversion is the headline metric: we want to move from a current checkout completion rate of **62%** to **80%+** by end of quarter, while keeping fraud chargebacks under 0.5% of GMV.

## Scope

In-scope:

- Anonymous (guest) checkout — no signup, no password.
- Card-only payments via Stripe Elements (Visa, Mastercard, Amex, Discover).
- Address entry with autocomplete (Google Places).
- Cart, with quantity adjustment and item removal.
- Order confirmation page with order number.
- Order confirmation email via SendGrid.
- Server-side validation of card number (Luhn) and basic input sanitization.
- Idempotent payment retry with exponential backoff for transient gateway failures.
- Per-IP rate limiting on payment endpoints.
- Asynchronous order-event publishing to Kafka for downstream systems (fulfilment, analytics, fraud).

Out of scope (this release):

- Saved cards / wallet support.
- Multiple currencies (USD only).
- Promo codes / discount engine.
- Subscriptions and recurring billing.
- Apple Pay / Google Pay.

## Success criteria

- Checkout completion rate ≥ 80% (currently 62%).
- p95 end-to-end checkout latency ≤ 1.5s.
- Payment success rate ≥ 98% (excluding declined cards).
- Zero PCI data persisted server-side outside Stripe.
- WCAG 2.2 AA conformance on the checkout form.

## Non-functional requirements

- **Availability:** 99.95% monthly uptime.
- **Performance:** API responses ≤ 200ms p95 (excluding upstream Stripe latency). All payments complete within 30 seconds end-to-end.
- **Security:** No raw card data ever touches our servers; Stripe tokenisation only. CSRF protection on all state-changing endpoints. Rate limit: 10 requests/minute per IP on `/api/create-payment-intent`.
- **Privacy / GDPR:** All customer PII (name, address, email) deleted within 30 days of order completion. Order records retained for 7 years for tax and accounting.
- **Resilience:** Payment gateway calls retry up to 3 times with exponential backoff, capped at 5 minutes total wait.
- **Observability:** Each order publishes a `payment.completed` event to Kafka within 1s of payment confirmation.

## Risks

- Stripe is a single point of failure for payments. No fallback provider.
- `CartContext` is referenced by 7 downstream components — a regression here breaks the whole flow.
- Address autocomplete depends on Google Places quota; exhaustion silently degrades to plain text entry.
- Guest sessions are Redis-backed; Redis outage interrupts checkout in progress.
