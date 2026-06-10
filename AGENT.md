# sentinel-frontend — Agent Integration Guide

This document describes all page routes, the public API surface consumed (gateway URLs),
the auth flow, and playground integration for any agent or automated tool interacting
with the Sentinel frontend.

---

## Page route map

| Route | Description | Auth required |
|---|---|---|
| `/` | Marketplace home — hero + featured agents | No |
| `/agents` | Agent discovery grid with filter panel | No |
| `/agents/[agentId]` | Agent detail: trust report, pricing, connect options | No |
| `/login` | Sign in form | No (redirects to dashboard if authenticated) |
| `/register` | Create account (buyer or developer role) | No |
| `/dashboard` | Buyer overview: credits, usage chart, active agents | Yes (buyer) |
| `/dashboard/usage` | Detailed invocation history and per-agent breakdown | Yes (buyer) |
| `/dashboard/billing` | Credit balance, top-up, payment methods, invoices | Yes (buyer) |
| `/dashboard/api-keys` | Manage scoped API keys for connected agents | Yes (buyer) |
| `/developer` | Developer portal home: stats, getting started | Yes (developer) |
| `/developer/agents` | List of developer's published/submitted agents | Yes (developer) |
| `/developer/agents/new` | Submit a new agent for verification | Yes (developer) |
| `/developer/earnings` | Earnings, payout setup, transaction history | Yes (developer) |
| `/playground` | No-code agent playground (AI-interaction labelled) | No |

---

## Gateway API surface consumed

The frontend talks exclusively to `NEXT_PUBLIC_GATEWAY_URL` (default: `http://localhost:8000`).
All routes are prefixed `/v1/`.

### Auth

| Method | Path | Description |
|---|---|---|
| POST | `/v1/auth/login` | Email/password login (BFF proxies, returns session cookie) |
| POST | `/v1/auth/register` | Create account |
| POST | `/v1/auth/logout` | Clears session cookie |
| GET | `/v1/auth/me` | Returns authenticated user profile |

### Listings

| Method | Path | Description |
|---|---|---|
| GET | `/v1/listings` | Paginated agent list with filter/sort params |
| GET | `/v1/listings/{id}` | Single agent by ID |
| GET | `/v1/listings/slug/{slug}` | Single agent by URL slug |
| POST | `/v1/agents` | Submit new agent (developer only) |
| GET | `/v1/agents/{id}/verify/stream` | SSE stream of verification pipeline status |

### Billing

| Method | Path | Description |
|---|---|---|
| GET | `/v1/billing/balance` | Current credit balance |
| GET | `/v1/billing/ledger` | Paginated ledger entries |
| GET | `/v1/billing/invoices` | Invoice list |
| POST | `/v1/billing/topup` | Create Stripe PaymentIntent for credit top-up |

### Playground

| Method | Path | Description |
|---|---|---|
| POST | `/v1/playground/{agentId}/invoke` | Send a task to an agent via the gateway proxy |

---

## Auth flow

1. User visits `/login` and submits credentials.
2. The form POSTs to the BFF route handler at `/api/auth/login`.
3. The BFF calls the gateway `/v1/auth/login`, receives tokens, and sets an
   **httpOnly, Secure, SameSite=Lax** cookie. No tokens reach the browser JS context.
4. Subsequent requests include the cookie automatically (`withCredentials: true` on Axios).
5. If a gateway request returns `401`, the Axios interceptor redirects to `/login`.
6. Token refresh is handled server-side in the BFF — the client never holds a refresh token.

**Role gating is cosmetic** — the gateway enforces authorization. UI shows/hides
navigation based on `user.role` in the Zustand auth store, but never relies on this
for security.

---

## Playground integration

The playground at `/playground` is a no-code interface for trying agents:

1. The user selects an agent from a dropdown (populated from the marketplace listings).
2. The user types a task/message and submits.
3. The frontend POSTs to `/v1/playground/{agentId}/invoke` on the gateway.
4. The gateway proxies the invocation to the agent's endpoint, meters usage, and streams
   the response back.
5. All interactions are labelled with an AI-interaction notice (EU AI Act Art.50 compliance).

The playground does **not** execute agent code directly — all execution is gated through
the gateway which enforces rate limits, metering, and trust-score gating.

---

## Connect panel tab surface

On the agent detail page (`/agents/[agentId]`), the connect panel offers:

| Tab | Surface | Notes |
|---|---|---|
| Open | Hosted chat URL + embeddable widget snippet | Default for non-technical buyers |
| API | Scoped API key + REST curl/JS/Python examples | Key fetched on demand |
| MCP | Streamable HTTP MCP endpoint + client config JSON | For Claude/Cursor integration |
| CLI | `npx @sentinel/connect <slug>` one-liner | |
| A2A | Agent card URL (feature-flagged) | For agent-to-agent use cases |

---

## Environment variables consumed at runtime

| Variable | Exposed to | Description |
|---|---|---|
| `NEXT_PUBLIC_GATEWAY_URL` | Client | Gateway base URL |
| `NEXT_PUBLIC_APP_URL` | Client | Self URL |
| `NEXT_PUBLIC_OIDC_CLIENT_ID` | Client | PKCE client ID |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client | Stripe.js |
| `NEXT_PUBLIC_MCP_BASE` | Client | MCP base URL shown in connect panel |
| `OIDC_ISSUER` | Server only | OIDC issuer for BFF |
| `OIDC_CLIENT_SECRET` | Server only | Confidential client secret |
| `SESSION_SECRET` | Server only | Cookie signing key |

## Conventions

### Commits
- Use **Conventional Commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `perf:`, `build:`, `ci:` — optional scope, e.g. `fix(auth): reject expired tokens`.
- The message describes the change only. **Never** reference AI assistants, agents, or tooling, and never add `Co-Authored-By` or other attribution trailers.

### Code style
- **No inline comments.** Make intent obvious through precise names and small, single-purpose functions.
- Document with **docstrings** (Python) / **JSDoc** (TypeScript) on modules, classes, and public/exported functions only — explain *why*, not *what*.
- If a line feels like it needs a comment, rename or refactor until it doesn't.

### Docs stay in sync (mandatory)
- Every change updates its docs **in the same commit**: this `CLAUDE.md`/`AGENT.md`, the relevant README/`docs/`, and the master TODO (`sentinel-infra/TODO.md`). Tick completed items, add TODOs for follow-ups discovered. Never leave docs describing behaviour the code no longer has.

### The system speaks in points — never currency
- All user- and API-facing values are **points**. Never display or return paise, rupees, dollars, or a currency symbol anywhere in the system.
- Conversion: **1 point = ₹1 = 100 paise** (current). 1 USD ≈ 95 points (whatever the live INR→USD rate is). The ledger may store the smallest unit internally, but every response, label, and copy string uses points only.
