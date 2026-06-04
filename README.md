# NTD — Agentic QCSD Workshop

Welcome 👋 This is the official repo for the **Agentic Quality-Conscious Software Delivery (QCSD)** hands-on workshop at **Nordic Testing Days (NTD)**.

**Agentic QCSD** is about putting autonomous AI quality agents to work *across the whole delivery lifecycle* — not just generating tests, but reasoning about requirements, product risk, code quality, security, and accessibility the way a quality engineer would. In this session you'll drive a fleet of these agents (**[Agentic QE](https://github.com/proffesor-for-testing/agentic-qe)**) through four SDLC phases, watch what they surface *on their own*, and then judge their output with the **PACT** lens (Proactive, Autonomous, Collaborative, Targeted).

The catch: great agents need something real to chew on. So this repo also ships a small, deliberately-flawed e-commerce app as the **subject under test** — see [The demo app](#the-demo-app) below.

---

## What you'll do

A short warm-up plus four SDLC exercises and a self-learning close — all copy-paste, in **[LAB.md](./LAB.md)**. The four phases build on each other (Refinement's ideas feed Development's tests; CI/CD verifies the result), and every exercise **persists what it learns** so the fleet's memory grows as you go:

| Step | Agent(s) / tool | The question it answers |
|------|-----------------|--------------------------|
| **0 · Warm-up** | local code-index + on-device embeddings | Build a knowledge-graph map of the code and a clean memory baseline — *on your machine, no API*. |
| **1 · Ideation** | ideation gate (quality-criteria + risk + requirements) | Before any code — can a QE even do their job with these requirements? GO / CONDITIONAL / NO-GO. |
| **2 · Refinement** | `qe-product-factors-assessor` | What is this product really made of (SFDIPOT), and where's the risk? |
| **3 · Development** | `qe-test-architect` | Can it turn those ideas into strong, runnable tests for the riskiest module? |
| **4 · CI/CD** | `qe-queen-coordinator` (verify) | Is this releasable? Coverage + security + a 90% gate → GO / CONDITIONAL / NO-GO. |
| **5 · Self-Learning** | AQE memory | Put memory to work: have the fleet consolidate everything it learned into an instant onboarding / handoff brief. |

The four SDLC exercises have **two prompt versions** — one for **Claude Code users** (skills / orchestrator) and one for **non-Claude-Code users** (generic step list) — so they work on any tool; Steps 0 and 5 are MCP-tool calls identical everywhere. You then **Apply PACT** to score each agent's output, and finish with a **Personal Adoption Roadmap**. Everything is kept lean and token-cheap so a whole room can run it on personal keys.

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
aqe init --auto                    # set up AQE for YOUR coding agent — see the table below
npm install                        # the demo app's own dependencies
```

`aqe init --auto` configures **Claude Code** by default. Using a different coding agent? Add the matching flag — AQE works with **11 platforms** through a single MCP server:

| Coding agent | `aqe init` command |
|--------------|--------------------|
| **Claude Code** | `aqe init --auto` (built-in) |
| **GitHub Copilot** | `aqe init --auto --with-copilot` |
| **Cursor** | `aqe init --auto --with-cursor` |
| **Cline** | `aqe init --auto --with-cline` |
| **OpenCode** | `aqe init --auto --with-opencode` |
| **AWS Kiro** | `aqe init --auto --with-kiro` |
| **Kilo Code** | `aqe init --auto --with-kilocode` |
| **Roo Code** | `aqe init --auto --with-roocode` |
| **OpenAI Codex CLI** | `aqe init --auto --with-codex` |
| **Windsurf** | `aqe init --auto --with-windsurf` |
| **Continue.dev** | `aqe init --auto --with-continuedev` |

```bash
aqe init --auto --with-all-platforms   # or just set up everything at once
```

**3. Launch your coding agent in this folder** — Claude Code, Copilot, Cursor, Kiro, Codex, Windsurf… whichever you have. This folder is your workspace root; all paths in LAB.md are relative to it.

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
