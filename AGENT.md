# sentinel-frontend — Agent & Developer Guide

The canonical instruction file for this repo. `CLAUDE.md` and `AGENT.md` are kept **byte-identical** — edit both in the same commit.

Next.js 16 App Router frontend for the Sentinel AI agent marketplace and trust layer. Serves **buyers, sellers, and admins**. It talks **only** to `sentinel-gateway` (never directly to internal services) and never trusts client-supplied identity — the gateway is the security boundary.

---

## Engineering Standards (read before writing any code)

These standards are binding. They exist so that AI-assisted changes are correct, minimal, and never break a running system.

### Non-negotiable: no breakage
- **No system breakage is ever acceptable.** Every change must leave the app buildable and its tests green. Before considering any task done, run the repo's checks (`bun run type-check`, `bun run lint`, and the relevant `bun run test`) and confirm they pass.
- Prefer the smallest change that fully solves the problem. Do not refactor unrelated code, rename things, or "improve" style in files you were not asked to touch.
- When a change alters existing behavior that tests assert, update those tests to the new intended contract in the same change — never leave the suite red.
- If you are unsure, confused, or lack the context to make a safe change, STOP and ask the user rather than guessing. A blocked question is cheaper than a broken system. When you stop, record what is blocked and why in the relevant `*-todo.md` board.

### Code quality
- Write reusable, DRY code: factor shared logic into functions/modules; do not copy-paste. Reuse existing helpers before adding new ones.
- Match the surrounding code's style, naming, and idioms. New code should read like the code already there.
- Keep functions focused and small; validate inputs at boundaries; fail closed on security-relevant paths.

### Comments and documentation
- **Prefer JSDoc/TSDoc over inline comments.** Every public/exported function, class, or module gets a JSDoc/TSDoc block explaining what it does, its contract, and non-obvious behaviour — explain *why*, not *what*.
- **No narrating inline comments** ("increment counter", "call the API"). If a line feels like it needs one, rename or refactor until it doesn't — the code and its JSDoc/TSDoc must speak for themselves.
- **Inline comments are only permitted as genuine "come back later" markers** — a temporary workaround or a known follow-up — and must state the condition for their own removal. Once the reason is resolved, remove the comment.

### Recommend before implementing (always)
Do **not** assume a requested change is the correct or best approach, and do not treat the user's framing as ground truth. For every change request:
1. Evaluate the underlying goal and the request critically.
2. Find the most robust, well-architected way to achieve that goal — including a better alternative or a simpler/safer path if one exists.
3. **State your recommendation** concisely (what you'd do and why, and where it differs from the literal ask), then implement the best option. If it's a one-way door or materially changes scope, confirm first; otherwise proceed with the recommended approach and note the deviation.

Never blindly implement. Prefer the better-engineered solution over a literal transcription of the request.

---

## Commands (package manager: `bun`)

```bash
bun install          # install dependencies
bun run dev          # dev server with Turbopack on http://localhost:3000
bun run build        # production build
bun run start        # serve the production build
bun run type-check   # tsc --noEmit — must be clean before merging
bun run lint         # eslint . (flat config: eslint.config.mjs)
bun run test         # vitest
bun run test:e2e     # playwright
bun run codegen      # regenerate API types from shared schemas (scripts/codegen.mjs)
bun run format       # prettier --write .
```

Tech stack: **Next.js 16 · React 19 · TypeScript (strict) · Tailwind CSS 3 · TanStack Query · Zustand · Axios · Zod · Vitest + Playwright**. Cinematic layer: Framer Motion · GSAP + Lenis · React Three Fiber + drei + postprocessing.

---

## Architecture — BFF pattern (read before touching data flow)

The frontend never lets the browser call the gateway directly. Traffic is split by execution context:

- **Browser → same-origin BFF (`/api/*`).** The Axios client (`src/lib/api/client.ts`) uses `baseURL: "/api"` in the browser. The session JWT lives in a first-party **httpOnly** cookie; the BFF forwards it upstream as a `Bearer` token. This avoids third-party cookie blocking and keeps tokens out of JS.
  - Session routes (`src/app/api/v1/auth/{login,register,logout,google,x/*}/route.ts`) set/clear the httpOnly cookie.
  - Everything else is proxied to the gateway by the catch-all `src/app/api/[...path]/route.ts`.
- **Server components → gateway directly.** During SSR there is no browser cookie jar, so server components call `NEXT_PUBLIC_GATEWAY_URL` directly for **public, unauthenticated reads** (marketplace listings, agent detail).
- Gateway base URL: `NEXT_PUBLIC_GATEWAY_URL` (default/production `https://sentinel-api.fortiqo.xyz`). All gateway paths are prefixed `/v1/`.
- **CSRF (double-submit):** the BFF issues a readable `sentinel_csrf` cookie; the client echoes it in the `X-CSRF-Token` header on unsafe methods. Enforcement is gated by `CSRF_ENFORCED` (dark by default — mismatches are recorded via an `x-csrf-dark` header but allowed). Edge middleware (`src/middleware.ts`) runs both the CSRF check and a coarse session-cookie presence guard on `/dashboard`, `/seller`, `/admin`.
- On a `401`, the Axios interceptor redirects to `/login` **only** for protected paths (`/dashboard`, `/seller`).

---

## App Router conventions

- **Server components by default.** Add `"use client"` only when you need event handlers, browser APIs, React hooks (useState/useEffect), TanStack Query hooks, or Zustand.
- Page files export a single default function. Named exports are for `metadata`, `generateMetadata`, and `generateStaticParams` only.
- Layout files wrap child pages — never put page-specific logic in a layout.
- Route groups `(auth)`, `(marketplace)` affect layout grouping, **not** URL paths.
- Dynamic params arrive as `Promise<{param: string}>` — always `await params`.
- **Unknown routes redirect home.** `src/app/not-found.tsx` `redirect("/")` — there are no dead-end 404 screens (product decision). Don't add bespoke 404 pages.

## TypeScript

- Strict mode + `noUncheckedIndexedAccess` + `noImplicitOverride` — avoid `!` non-null assertions.
- Explicit return types on exported functions: `React.JSX.Element`, `Promise<void>`, etc.
- No `any`. Use `unknown` + type guards or zod `.parse()`.
- Use `type` imports for type-only symbols: `import type { Foo } from "..."`.
- Import via the `@/*` alias (`@/lib/...`, `@/components/...`, `@/types/...`).
- Zod schemas live alongside their API functions in `src/lib/api/`; shared TypeScript types in `src/types/`.

## Component conventions

- **Named exports only** for components (no default exports, except Next.js page/layout files which must default-export).
- JSDoc on every exported component; return type `React.JSX.Element`.
- Props interface defined inline above the component.
- Use `cn()` from `@/lib/utils` for all className merges — never string concatenation.
- `forwardRef` for form primitives (Input, Button) so react-hook-form works.

## API integration

- All gateway calls go through the typed wrappers in `src/lib/api/` (built on the shared Axios instance in `client.ts`, `withCredentials: true`).
- **Never call the gateway directly from page/component files** — use the typed wrapper for the domain.
- Validate every response with zod `.parse()` — never trust the gateway shape blindly.
- No tokens in `localStorage`/`sessionStorage`. Auth is the httpOnly cookie managed by the BFF.
- Catch errors as `SentinelApiError` (`isSentinelApiError(err)`); surface `displayMessage`.

## State management

- **TanStack Query** for server-fetched data (listings, billing, usage). The root layout wraps the tree in `QueryProvider` (`src/components/providers/QueryProvider.tsx`), alongside `AuthProvider` and `ToastProvider`.
- **Zustand** for ephemeral UI state only (filters, sidebar, tabs) — `src/store/`.
- Never put sensitive data (tokens, PII beyond display name) in Zustand.

## Design system — dark ink/gold theme

- The design tokens are the single source of truth in `src/lib/design/colors.ts`, wired into Tailwind via `tailwind.config.ts`. Use the token classes, not raw hex or ad-hoc palettes:
  - `ink-950…ink-500` — the dark cinematic canvas (marketing + marketplace surfaces).
  - `porcelain` — primary light text on ink. `gold` (`gold` / `gold-deep`) — the brand accent. `graphite` — muted chrome.
  - `sentinel-50…950` (indigo) — the interactive accent in the light app shell (dashboard, auth).
  - `trust-{low,medium,high,elite}` — semantic trust-score bands (TrustBadge, cert chips).
- **Dark mode is implemented** (`darkMode: "class"`; a pre-paint script toggles `.dark` from the `sentinel-theme` localStorage key, else OS preference). Style for both themes.
- Prefer Tailwind utilities; extract a recurring pattern to `@layer components` in `globals.css` only when it's used many times. Don't write arbitrary CSS unless Tailwind can't express it.

## Security rules (non-negotiable)

- No `dangerouslySetInnerHTML` on untrusted content without DOMPurify — agent-supplied content is untrusted. (Static, trusted JSON-LD/theme scripts in the root layout are the only exception.)
- No secrets in `NEXT_PUBLIC_*` env vars — those are baked into the client bundle.
- No `localStorage`/`sessionStorage` for tokens.
- **Never handle card/payment data ourselves.** Credit top-ups go through provider-hosted checkout — Razorpay Checkout (`orderId` + public `keyId`) or a Stripe-hosted `checkoutUrl` — or the pre-launch mock flow. Credits are posted to the wallet only when the provider webhook confirms payment.
- Role gating in the UI is **cosmetic** — show/hide nav from `user.role`, but the gateway enforces authorization. Never rely on the client for security.

## The system speaks in credits — never currency

- All user- and API-facing values are **credits** (short form **Cr**). Never display or return paise, rupees, dollars, or a currency symbol anywhere in the UI or API copy.
- Conversion is a **fixed peg: 1 USD = 100 credits**. There is no INR and no dynamic FX. The ledger may store a smallest unit internally, but every response, label, and copy string uses credits only.
- API contract fields use the `*Credits` suffix (`priceCredits`, `balanceCredits`, `costCredits`, `payableCredits`, `amountCredits`, …); ledger/invoice/top-up amounts use the `credits` key.

---

## Route map

Route groups `(auth)`/`(marketplace)` affect layout only; they are not in the URL.

| Route | Description | Auth |
|---|---|---|
| `/` | Cinematic marketing home + featured agents | No |
| `/agents` | Marketplace discovery grid + filter panel | No |
| `/agents/[agentId]` | Agent detail: trust report, reviews, use / subscribe, integration | No |
| `/sellers/[handle]` | Public seller profile | No |
| `/playground` | No-code agent playground (AI-interaction labelled) | No |
| `/how-it-works`, `/docs`, `/docs/trust-scores`, `/docs/methodology`, `/status`, `/security`, `/privacy`, `/terms` | Informational pages | No |
| `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email` | `(auth)` group | No |
| `/onboarding` | First-run role choice + questions | Yes |
| `/dashboard` | Buyer overview: credits, usage, active agents | Yes (buyer) |
| `/dashboard/{usage,billing,api-keys,subscriptions,profile,settings}` | Buyer sub-pages | Yes (buyer) |
| `/seller` | Seller portal home | Yes (seller) |
| `/seller/{agents,agents/new,agents/[agentId],earnings,wallet,bonds,profile,settings}` | Seller sub-pages | Yes (seller) |
| `/admin` and `/admin/{agents,users,sellers,moderation,flags,promo,analytics,sybil}` | Admin console | Yes (admin) |

## Gateway API surface consumed

All paths are prefixed `/v1/`. The **typed wrappers in `src/lib/api/*.ts` are the source of truth** — the list below is a map, not a contract. Domains: `auth`, `agents`, `billing`, `seller`, `sellers-public`, `admin`, `subscriptions`, `reviews`, `notifications`, `links`, `categories`, `keys`.

- **Auth** (`auth.ts`): `login`, `register`, `logout`, `me` (GET profile / PATCH update), `google`, `onboarding`, `change-password`, `become-seller`, `pay-registration`, `forgot-password`, `reset-password`, `verify-email`, `send-verification`. X (Twitter) OAuth is handled by the BFF at `/api/v1/auth/x/{start,callback}`.
- **Listings / agents** (`agents.ts`): `GET /v1/listings`, `GET /v1/listings/{id}`, `GET /v1/listings/slug/{slug}`, `GET /v1/listings/slug/{slug}/report`, `GET /v1/listings/featured`, `POST /v1/agents/{seller}/{slug}/use` (pay-and-use, `402` on insufficient credits), `POST /v1/agents/{id}/report`.
- **Billing** (`billing.ts`): `GET /v1/billing/{balance,ledger,invoices}`, `POST /v1/billing/checkout` (`provider: razorpay | stripe | mock`), `POST /v1/billing/mock/capture`, `POST /v1/promo/redeem`.

## Auth flow

1. User submits credentials (or Google GSI / X OAuth) on an `(auth)` page.
2. The client POSTs to the BFF (`/api/v1/auth/login`, `/register`, `/google`, or the X start/callback routes).
3. The BFF exchanges credentials upstream and sets an **httpOnly, Secure, SameSite=Lax** session cookie (plus the readable `sentinel_csrf` cookie). No token reaches browser JS.
4. Subsequent browser calls hit the same-origin BFF, which forwards the session as a Bearer token upstream.
5. A `401` on a protected path (`/dashboard`, `/seller`) triggers a client redirect to `/login`. Refresh is handled server-side in the BFF — the client never holds a refresh token.

Role gating is cosmetic (see Security rules). Edge middleware does a coarse session-presence check on `/dashboard`, `/seller`, `/admin`; real JWT verification and role enforcement live in the BFF and gateway.

## Playground integration

The playground at `/playground` is a no-code interface for trying agents:
1. The user picks an agent (populated from marketplace listings) and types a task.
2. The client invokes the agent via the gateway proxy (`POST /v1/agents/{seller}/{slug}/use`); the gateway meters usage and returns the result.
3. Every interaction carries an **AI-interaction notice** (EU AI Act Art. 50 compliance).

The playground never executes agent code directly — all execution is gated through the gateway, which enforces rate limits, metering, and trust-score gating.

## Environment variables

`NEXT_PUBLIC_*` values are baked into the client bundle at build time; everything else is server-only. Full documentation lives in `.env.example`.

| Variable | Exposed to | Description |
|---|---|---|
| `NEXT_PUBLIC_GATEWAY_URL` | Client + server | Gateway base URL (prod `https://sentinel-api.fortiqo.xyz`) |
| `NEXT_PUBLIC_APP_URL` | Client | This app's public URL (OIDC redirects) |
| `NEXT_PUBLIC_OIDC_CLIENT_ID` | Client | Public PKCE client ID |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client | Stripe.js publishable key |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client | Google Identity Services client ID (empty hides the button) |
| `NEXT_PUBLIC_MCP_BASE` | Client | MCP base URL shown in the connect panel |
| `NEXT_PUBLIC_MOCK_PAYMENTS` | Client | Show the pre-launch "Test payment (mock)" option |
| `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_FEATURE_FLAGS_URL` | Client | Optional observability / flags |
| `TWITTER_CLIENT_ID`, `TWITTER_REDIRECT_URI` | Server only | X OAuth (BFF builds the authorize URL + callback) |
| `OIDC_ISSUER`, `OIDC_CLIENT_SECRET` | Server only | OIDC token exchange in the BFF |
| `SESSION_SECRET` | Server only | Session-cookie signing key (≥32 random bytes) |
| `CSRF_ENFORCED` | Server only | `true` enforces the CSRF double-submit check; unset = dark (record only) |

---

## Adding a new page

1. Create the file in the appropriate route group / portal directory.
2. Export `metadata` (Metadata object) for SEO.
3. The page function is `async` if it fetches data; sync otherwise.
4. Fetch via typed API functions; pass results to client components as props.
5. Add a link in the appropriate layout sidebar/nav.

## Adding a new API call

1. Add a zod schema in `src/lib/api/<domain>.ts`.
2. Add the typed function using `apiClient` and validate the response with `.parse()`.
3. Export the inferred TypeScript type if consumers need it; update `src/types/<domain>.ts` if the shape is new.

## Cinematic marketing layer

- The marketing experience (root `/`) lives in `src/components/marketing/`. It is a **scoped dark surface** — it owns its ink/gold tokens and white text and does not change how the rest of the app renders.
- Animation stack: **Lenis** (smooth scroll) ↔ **GSAP/ScrollTrigger**, **Framer Motion** (reveals, parallax, micro-interactions), **React Three Fiber + drei + postprocessing** (WebGL). All timing comes from `src/lib/design/motion.ts`.
- 3D mounts only via `marketing/three/SceneStage.tsx` (`next/dynamic`, `ssr:false`, in-view pausing, device quality tiers). Reduced motion is honoured at every layer.
- See `docs/frontend/implementation.md` for the full architecture and the skills/dependency reference.

## Commits

- Use **Conventional Commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `perf:`, `build:`, `ci:` — optional scope, e.g. `fix(auth): reject expired tokens`.
- The message describes the change only. **Never** reference AI assistants, agents, or tooling, and never add `Co-Authored-By` or other attribution trailers.
- Commit logically-scoped units of work; do not push unless explicitly asked.

## CI / deployment: Vercel — docs-only changes should not redeploy

This app deploys on **Vercel** (git-push based build), **not** a GitHub Actions image build. Keep pure documentation/markdown/TODO changes from triggering an unnecessary production rebuild:
- Use the `docs:` (or `docs(scope):`) conventional-commit type for any pure documentation, TODO, or markdown update.
- Configure Vercel's **Ignored Build Step** (path/commit filter) so a commit that touches only `**.md` / `docs/**` skips the build.
- Use a functional type (`feat:`, `fix:`, `refactor:`, `ci:`, …) only when a redeploy is actually intended.

---

## Docs stay in sync (mandatory)

- Every change updates its docs **in the same commit**: this `CLAUDE.md`/`AGENT.md` (keep the two byte-identical), the relevant `README`/`docs/`, and the **central TODO board** at `sentinel-core-api/master-doc/` (this repo's `frontend-todo.md` plus `platform-todo.md`). Tick completed items (`[ ]`→`[x]`, `[~]` for partial) — **never delete a line**; add TODOs for follow-ups discovered.
- Never leave docs describing behaviour the code no longer has. Each module follows its own `docs/implementation.md` / `docs/architecture.md` / roadmap — keep plans and docs in lockstep with the code in the same commit.

## structure.md — read first, keep current (non-negotiable)

Before changing **any** code, **read `docs/structure.md` first.** It is the platform-wide map of what already exists — every repo's purpose, live vs stubbed status, and a file-based map of where things live — so you change the right file and don't rebuild something that already exists.
- Start there to locate work: §4–6 (API surface), §9 (real vs stubbed), §12 (file map).
- When you add or edit an API, feature, page, or move a file: **update `structure.md` in the same commit**. It is identical across all Sentinel repos — propagate the edit so copies never diverge.

## Cross-repo reference — where to look

This repo is one of the Sentinel platform's repositories. The **single source of truth** for cross-repo planning lives in `sentinel-core-api/master-doc/`. Start there:
- **`build-sequence.md` — START HERE.** The dependency-ordered build plan (phases 0–9): decide *order* before picking work.
- **`platform-todo.md`** — master backlog across all repos, grouped by theme.
- **`frontend-todo.md`** — this repo's own board (detail + status).
- **`architecture-map.md`** — who calls whom (cross-repo edges, money/trust data-flow, trust boundaries).
- **`security-todo.md`** — severity-ranked security flags (file:line + fixes). Check it before touching auth, money, or proxy paths; tick items when fixed, never remove.
- Swagger `/docs` + `/redoc` on the backend are intentionally **kept exposed for now** — do not disable without owner sign-off.

## TODO board — update after every task (master-doc only)

All TODOs live **only** in `sentinel-core-api/master-doc/` — one file per repo (`frontend-todo.md`, `gateway-todo.md`, …) plus `platform-todo.md` and `security-todo.md`. **Never create a new TODO/status file anywhere** (no per-repo `docs/TODO.md`, no `status-report.md`).

After **every** task, in the same commit, update the relevant board to mirror reality — treat it as a **dated timeline of activity**: append a dated entry for what was done, tick completed items, add any newly-discovered task, mark in-progress work. **Never delete a line** — tick or append only. Frontend work → `frontend-todo.md`; security → `security-todo.md`; cross-repo → `platform-todo.md`.

## DB schema / contract changes

This is a **no-database** repo, so there are no Alembic migrations here. But if a change depends on a **cross-repo schema or API contract change**, land the owning service's migration/contract change **first** (deployed code that runs ahead of the backend schema 500s every affected query). Update `docs/structure.md` and the relevant `master-doc/*-todo.md` in the same commit.

## Docs framework — standalone site at docs.fortiqo.xyz

Platform documentation is **markdown-first** and lives in the separate **sentinel-docs** app, published standalone at **https://docs.fortiqo.xyz** — NOT inside sentinel-frontend. Mintlify is removed; do not reintroduce `docs.json`. To add/edit a doc page, add the `.md`/`.mdx` under sentinel-docs and list its slug in `nav.json`. When you ship a feature, update the matching sentinel-docs pages in the same change — docs must reflect the **real** current state (never claim unbuilt or stubbed features as live; anything unbuilt goes under Progress & roadmap). Track docs work in `master-doc/docs-todo.md`.

---

## Workflow discipline — todo-first

**Every task goes on the todo list before any work starts, then gets marked done after.** Whether it is a feature, a fix, a refactor, or a one-line chore: (1) add it to the working todo list first, (2) do the work, (3) mark the item complete. Nothing is worked on that is not on the list. As you discover follow-up work mid-task, add it as new todo items immediately so the list always reflects reality and progress stays visible. This applies to every task, however small.
