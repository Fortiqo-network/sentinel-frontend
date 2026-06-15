# sentinel-frontend

> The web application for **Sentinel** — the verification, settlement, and portable-reputation layer for the AI agent economy. This is the single human-facing surface for buyers, developers, and admins.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)]()
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8)]()
[![Package Manager](https://img.shields.io/badge/pkg-bun%20%7C%20yarn-orange)]()

---

## 1. Role in the Sentinel system

`sentinel-frontend` is the only repo that ships a UI. It talks to **`sentinel-gateway`** (never directly to internal services) for every authenticated/data operation, and renders:

- **Marketplace** — browse, search, filter, and compare agents by trust score, tier (Verified+Managed vs Registry/Proxy), price model, and vertical.
- **Agent detail + verification report** — the public trust score, security findings, certification status, benchmarks, and live "connect" surfaces.
- **Buyer dashboard** — purchased/rented agents, credit balance, usage, invoices, outcome/dispute status, access credentials (URL, API key, MCP endpoint).
- **Billing portal** — top up credits, manage payment methods, view ledger, download invoices (Stripe).
- **Developer console** — publish/manage agents, view earnings/payouts, manage bonds, see verification pipeline status, read logs/observability.
- **Admin console** — moderation, dispute resolution, kill-switch, feature flags (gated by role).

```
            ┌───────────────────────┐
   Browser →│   sentinel-frontend    │
            └───────────┬───────────┘
                        │ HTTPS (REST + SSE/WebSocket for live status)
                        ▼
            ┌───────────────────────┐
            │   sentinel-gateway     │  ← auth, rate-limit, routing, metering
            └───────────┬───────────┘
        ┌───────────────┼───────────────┬───────────────┐
        ▼               ▼               ▼               ▼
  core-api          verify          billing         registry/runtime
```

It consumes shared types from **`sentinel-shared`** (listing schema, agent card, trust-score schema, event types) via generated TypeScript types so the contract with backends never drifts.

---

## 2. Tech stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router)** | RSC + server actions; SSR for SEO of public marketplace pages |
| Language | **TypeScript** (strict) | `strict: true`, `noUncheckedIndexedAccess` |
| Styling | **TailwindCSS** + **shadcn/ui** | Design tokens in `globals.css`; Radix under the hood |
| State / data | **TanStack Query** + **Zustand** | Server cache vs ephemeral UI state |
| Forms | **react-hook-form** + **zod** | zod schemas mirror `sentinel-shared` |
| Auth | **OAuth2 / OIDC (PKCE)** via gateway | Tokens in httpOnly cookies; no tokens in localStorage |
| Charts | **Recharts** | Usage, earnings, trust-score history |
| Payments UI | **Stripe.js / Stripe Elements** | Card entry never touches our servers (PCI SAQ-A) |
| Tables | **TanStack Table** | Marketplace + ledger grids |
| i18n | **next-intl** | "Popular everywhere" → en + locale scaffolding day one |
| Tests | **Vitest** + **Testing Library** + **Playwright** | Unit/component + E2E |
| Lint/format | **ESLint** + **Prettier** + **Biome (optional)** | |
| Package manager | **bun** (preferred) or **yarn** | Lockfile committed; CI pins the manager |

> **Convention:** all frontends in Sentinel use **bun/yarn**. Do not introduce npm lockfiles.

---

## 3. Project structure

```
sentinel-frontend/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Public landing, pricing, about
│   ├── (marketplace)/
│   │   ├── agents/               # Listing grid + filters
│   │   └── agents/[slug]/        # Agent detail + verification report + connect
│   ├── (dashboard)/
│   │   ├── buyer/                # Purchases, credits, usage, disputes
│   │   └── developer/            # Publish, earnings, payouts, bonds, logs
│   ├── (billing)/                # Credits, invoices, payment methods
│   ├── (admin)/                  # Moderation, disputes, kill-switch (role-gated)
│   ├── api/                      # Route handlers (BFF: token exchange, webhooks proxy)
│   ├── layout.tsx
│   └── globals.css               # Tailwind layers + design tokens
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   ├── marketplace/              # AgentCard, TrustBadge, TierBadge, FilterBar
│   ├── verification/             # TrustScoreGauge, FindingsTable, CertBadge
│   ├── billing/                  # CreditMeter, LedgerTable, StripeForm
│   └── connect/                  # ConnectPanel (URL / API key / MCP / npx tabs)
├── lib/
│   ├── api/                      # Typed gateway client (fetch wrappers)
│   ├── auth/                     # OIDC PKCE helpers, session
│   ├── hooks/                    # useAgents, useCredits, useVerification...
│   └── format/                   # currency, dates, trust-score formatting
├── types/                        # Generated from sentinel-shared (do not edit)
├── public/
├── tests/                        # Vitest + Playwright
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── biome.json / .eslintrc
├── bunfig.toml                   # if using bun
└── package.json
```

---

## 4. Environment variables

Copy `.env.example` → `.env.local`. Never commit secrets.

| Variable | Required | Example | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_GATEWAY_URL` | | `https://api.sentinel.xyz` | Base URL for the API edge |
| `NEXT_PUBLIC_APP_URL` | | `https://sentinel.fortiqo.xyz` | Self URL for redirects |
| `NEXT_PUBLIC_OIDC_CLIENT_ID` | | `sentinel-web` | Public OIDC client id (PKCE) |
| `OIDC_ISSUER` | | `https://auth.sentinel.xyz` | OIDC issuer (server-side) |
| `OIDC_CLIENT_SECRET` | (server) | `***` | Confidential client secret (BFF token exchange) |
| `SESSION_SECRET` | | `***` | Cookie/session signing |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | | `pk_live_...` | Stripe.js |
| `NEXT_PUBLIC_SENTRY_DSN` | | `https://...` | Error monitoring |
| `NEXT_PUBLIC_POSTHOG_KEY` | | `phc_...` | Product analytics |
| `NEXT_PUBLIC_FEATURE_FLAGS_URL` | | `https://...` | Remote flags |
| `NEXT_PUBLIC_MCP_BASE` | | `https://mcp.sentinel.xyz` | Shown in connect panel |

---

## 5. Getting started

```bash
# 1. Install
bun install          # or: yarn install

# 2. Generate shared types (pulls schemas from sentinel-shared)
bun run codegen      # writes ./types from the shared OpenAPI/JSON schemas

# 3. Configure
cp .env.example .env.local && $EDITOR .env.local

# 4. Run
bun run dev          # http://localhost:3000

# 5. Build / start
bun run build
bun run start
```

### Scripts

| Script | Action |
|---|---|
| `dev` | Next dev server (Turbopack) |
| `build` / `start` | Production build / serve |
| `codegen` | Generate `types/` from `sentinel-shared` (OpenAPI → TS) |
| `lint` / `format` | ESLint/Biome + Prettier |
| `test` | Vitest unit/component |
| `test:e2e` | Playwright |
| `typecheck` | `tsc --noEmit` |

---

## 6. Key UI surfaces & behaviors

### Marketplace
- Server-rendered, SEO-indexed agent pages.
- Filters: vertical, tier (Verified+Managed / Registry-Proxy), trust-score range, price model (per-task / per-outcome / subscription / credits), guarantee/bond present.
- Sort by trust score, popularity, recency, price.

### Verification report (public)
- **TrustScoreGauge** with calibrated 0–100 score + history sparkline.
- **FindingsTable**: severity, category (static / deps / dynamic / prompt-injection), status, remediation.
- **CertBadge**: certification status + tier + last re-verified timestamp (verification is continuous).
- Methodology link → `sentinel-docs` (transparency is the moat).

### Connect panel ("one agent, many doors")
Tabs that render per buyer skill level:
1. **Open** — hosted chat/console URL + embeddable widget snippet (non-technical default).
2. **API** — scoped API key + REST examples (curl, JS, Python).
3. **MCP** — auto-generated **Streamable HTTP** MCP endpoint + client config (Claude/Cursor). *Not SSE.*
4. **CLI** — `npx @sentinel/connect <agent>` one-liner.
5. **A2A** *(when enabled)* — agent card URL for agent-to-agent use.

### Billing portal
- Prepaid **credit** balance + top-up (Stripe Elements).
- Ledger (double-entry view), invoices, payment methods.
- Usage meter per agent (from gateway/billing metering).

### Developer console
- Publish/manage listings (drafts → verification → live).
- Live verification pipeline status (SSE/WebSocket from gateway).
- Earnings, payout schedule (Stripe Connect Express onboarding embedded), bond management.
- Per-agent observability (OpenTelemetry traces surfaced read-only).

---

## 7. Auth model

- **OIDC Authorization Code + PKCE.** The browser never holds long-lived tokens.
- A thin **BFF layer** (`app/api/*` route handlers) performs the confidential token exchange and stores tokens in **httpOnly, Secure, SameSite=Lax** cookies.
- Access tokens are short-lived; refresh handled server-side.
- Role-based UI gating (`buyer`, `developer`, `admin`) is **cosmetic only** — the gateway enforces authorization server-side. Never trust the client for access control.

---

## 8. Security checklist (frontend-specific)

- [ ] No secrets in `NEXT_PUBLIC_*`; confidential values are server-only.
- [ ] Tokens in httpOnly cookies, never `localStorage`/`sessionStorage`.
- [ ] Strict **CSP**, `frame-ancestors`, and Trusted Types where feasible.
- [ ] All card data via Stripe Elements (PCI SAQ-A; card data never hits our origin).
- [ ] Output encoding / no `dangerouslySetInnerHTML` without sanitization (DOMPurify) — agent-authored content (descriptions, READMEs) is **untrusted**.
- [ ] CSRF protection on BFF mutations (double-submit or same-site + origin checks).
- [ ] EU AI Act Article 50: clearly **label AI interactions** in chat/console UI.
- [ ] Rate-limit-aware UX (handle 429 from gateway gracefully).
- [ ] SRI on any third-party scripts; pin Stripe.js from Stripe's domain only.

---

## 9. Observability

- **Sentry** for client errors + performance.
- **PostHog** (or equivalent) for funnels: discover → view verification → connect → first paid task.
- Web Vitals reported to the gateway analytics sink.
- Frontend emits a `trace-id` header so requests can be correlated with backend **OpenTelemetry** traces.

---

## 10. Testing strategy

- **Unit/component:** Vitest + Testing Library for components and `lib/` utilities.
- **Contract:** type-level tests that `types/` (generated) match the zod schemas used in forms.
- **E2E (Playwright):** golden flows — sign up → publish agent (dev) and discover → top up credits → connect → run task → see usage (buyer).
- **Visual:** optional Playwright screenshot diffs on marketplace + verification report.

---

## 11. Deployment

- Containerized (`Dockerfile`) and deployed via **`sentinel-infra`** (Helm chart `frontend`).
- Recommended: edge/CDN in front (Cloudflare) for static + image optimization; SSR pods autoscaled.
- Preview deployments per PR (Vercel-style or via infra).
- Env injected at runtime from the platform secret store (not baked into images, except `NEXT_PUBLIC_*` at build time).

---

## 12. Cross-repo dependencies

| Depends on | For |
|---|---|
| `sentinel-gateway` | All API calls, auth, SSE/WebSocket live status |
| `sentinel-shared` | Generated TS types / schemas (`codegen`) |
| `sentinel-docs` | Deep links to verification methodology, SDK docs |
| Stripe | Elements + Connect onboarding embed |

---

## 13. Contributing

- Conventional Commits; PRs require: typecheck, lint, unit tests, and a passing Playwright smoke.
- New API calls **must** go through the typed client in `lib/api` using generated types.
- New env vars must be added to `.env.example` and this README's table.

## 14. License

Proprietary — © Fortiqo-network. Internal use until a license is selected.
