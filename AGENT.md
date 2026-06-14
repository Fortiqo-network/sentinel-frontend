# sentinel-frontend — Agent Integration Guide

> **Operating rules — highest priority, read first.** These override convenience and apply to every change in this repo:
> - **Data is sacred.** Never delete or edit existing records or tables. Corrections are new rows or status changes, never destructive. **Ask permission before deleting any table or data.**
> - **The database is always Postgres.** Never substitute SQLite or another engine, including in tests.
> - **Comments:** at most one line and only when genuinely needed — never comment uselessly. Prefer docstrings / JSDoc and keep them thorough and up to date.
> - **Commits:** a single concise line. **Never push without explicit permission.**
> - **Code:** clean, reusable, and good-smelling in every manner. Don't overengineer, don't invent requirements, make the smallest change that works, and recommend better approaches over the existing one.
> - **Always work from a plan and keep in mind what we are building** (this repo's `docs/` and the platform docs).


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
- Every change updates its docs **in the same commit**: this `CLAUDE.md`/`AGENT.md`, the relevant README/`docs/`, and the **central TODO board** at `sentinal-core-api/master-doc/` (this module's `*-todo.md` plus `platform-todo.md`). Tick completed items (`[ ]`→`[x]`) — **never delete a line**; add TODOs for follow-ups discovered. Never leave docs describing behaviour the code no longer has.
- **Each module follows its own implementation doc.** As planning moves, update that module's `docs/implementation.md` / `docs/architecture.md` / roadmap and the central TODO in the **same commit**, so plans and docs stay in lockstep with the code — every module owns and follows its own implementation.

### The system speaks in points — never currency
- All user- and API-facing values are **points**. Never display or return paise, rupees, dollars, or a currency symbol anywhere in the system.
- Conversion: **1 point = ₹1 = 100 paise** (current). 1 USD ≈ 95 points (whatever the live INR→USD rate is). The ledger may store the smallest unit internally, but every response, label, and copy string uses points only.


## Security & architecture references

- **Security & critical flags:** `sentinel-core-api/master-doc/security-todo.md` (severity-ranked, with file:line). Check it before touching auth, money, or proxy paths; tick items when fixed, never remove.
- **Repo relationship map:** `sentinel-core-api/master-doc/architecture-map.md` (who calls whom, money/trust data-flow, the billing trust-boundary note).
- Swagger `/docs` + `/redoc` are intentionally **kept exposed for now** — do not disable without owner sign-off.
---

## 📍 Cross-repo reference — where to look (all repos are linked)

This repo is one of the Sentinel platform's repositories. The **single source of truth** for cross-repo
planning lives in `sentinel-core-api/master-doc/`. Any assistant working in *any* repo should start there:

- **`build-sequence.md` — START HERE.** The canonical, dependency-ordered build plan (phases 0–9): what to
  build first so the next thing is unblocked. Decide *order* here before picking work.
- **`platform-todo.md`** — the master backlog across all repos, grouped by theme (completed, pending-from-specs,
  🔒 security, 🧩 must-have, 🏆 discovery, 🌐 reach). Tick items here when done.
- **`<module>-todo.md`** — this repo's own board (detail + status), mirrored from the master board.
- **`architecture-map.md`** — who calls whom (cross-repo edges, money/trust data-flow, trust boundaries).
- **`security-todo.md`** — severity-ranked security flags (file:line + fixes).

Each repo also owns its `docs/` (scope, implementation, architecture). **When changing anything — code or
markdown — update the matching `docs/` and the relevant `master-doc/*-todo.md` in the SAME commit** (never
delete a TODO line; tick `[ ]`→`[x]`). To find what to change: read `build-sequence.md` top-to-bottom, pick the
lowest unfinished phase whose ⛔ gates aren't all ticked, then follow `architecture-map.md` to the owning repo
and file.

---

## 📂 structure.md — read first, keep current (non-negotiable)

Before changing **any** code in this (or any) repo, **read `docs/structure.md` first.** It is the
platform-wide map of what already exists — every repo's purpose, live APIs/features, real-vs-stubbed
status, and a **file-based map of where things live** — so you change the right file and don't rebuild
something that already exists.

- **Start there to locate work:** `structure.md` §4–6 (API surface), §9 (real vs stubbed), §12 (file map).
- **When you add or edit** an API, feature, page, service, or move a file: **update `structure.md` in the
  same commit** for the parts you touched. `structure.md` is **identical in all 13 repos** — propagate the
  edit to every repo's copy so they never diverge.
- This complements (does not replace) `sentinel-core-api/master-doc/` (`build-sequence.md` = what to build
  next; `*-todo.md` = the board). `structure.md` = what exists now + where it lives.

---

## ✅ TODO board — update after every task (master-doc only)

All TODOs live **only** in `sentinel-core-api/master-doc/`. There is already **one file per repo**
(`core-api-todo.md`, `frontend-todo.md`, `gateway-todo.md`, `billing-todo.md`, `verify-todo.md`, …)
plus `platform-todo.md` and `security-todo.md`. **Never create a new TODO/status file anywhere** (no
per-repo `docs/TODO.md`, no `status-report.md`) — use the existing file for the matching repo.

After **every** task, in the same commit, update the relevant board to mirror reality:
- **What we did** → tick `[ ]`→`[x]` (or `[~]` for partial).
- **What's pending** → add/keep `[ ]` items.
- **What's listed/deferred** → keep the roadmap items.

**Never delete a line** — tick or append only. Frontend work → `frontend-todo.md`; security → `security-todo.md`; cross-repo → `platform-todo.md`.
