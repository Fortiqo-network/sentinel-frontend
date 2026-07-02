# sentinel-frontend

> The web console for **Sentinel** — the trust, verification, and settlement layer for the AI agent economy. This is the only repo that ships a UI. It renders the public marketplace, the buyer dashboard, the developer portal, the admin console, and the marketing site, and talks **only** to `sentinel-gateway` through its own same-origin BFF (Backend-For-Frontend) proxy — never to internal services directly.

Production: `https://sentinel.fortiqo.xyz` (Vercel) · Gateway API: `https://sentinel-api.fortiqo.xyz`

---

## Platform role

The browser never holds a long-lived token and never calls the gateway directly. It calls same-origin Next.js route handlers under `/api/*`, which hold the session JWT in a first-party **httpOnly** cookie and forward it upstream as a `Bearer` token. This keeps the JWT out of any browser-readable storage and keeps the session cookie first-party (immune to third-party-cookie blocking).

```
Browser ──▶ sentinel-frontend (Next.js + BFF /api/[...path]) ──▶ sentinel-gateway ──▶ internal services
```

Types and schemas are mirrored (zod) against the gateway contract in `src/lib/api/*`.

---

## Key features / structure

Source lives under `src/` (App Router):

- **Public / marketing** — `/` (cinematic Tessera home), `/how-it-works`, `/playground`, `/terms`, `/privacy`, `/security`, `/status`, `/docs/methodology`, `/docs/trust-scores`.
- **Marketplace** — `/agents` (grid + filters), `/agents/[agentId]` (detail + integration + Trust report modal). Public agent pages are SSR/SEO-indexed (`metadataBase`, canonical, OG/Twitter, JSON-LD, `robots.ts`, dynamic `sitemap.ts`).
- **Auth** — route group `(auth)`: `/login`, `/register`, `/forgot-password`, `/reset-password`. httpOnly-cookie session via the BFF; social/EVM sign-in buttons are scaffolded ("coming soon").
- **Buyer dashboard** — `/dashboard` + `/dashboard/{subscriptions,usage,billing,api-keys,profile,settings}` (subscriptions = "My Agents").
- **Developer portal** — `/developer` + `/developer/{agents,agents/[agentId],earnings,profile,bonds,settings}` (per-agent access control on the agent detail page).
- **Admin console** — `/admin` + `/admin/{agents,analytics,developers,users}` (role-gated; enforcement is server-side at the gateway).
- **BFF / API routes** — `src/app/api/v1/auth/{login,register,logout}` and `src/app/api/[...path]` (generic gateway proxy that attaches the Bearer token).

Supporting layers:

- `src/lib/api/*` — typed Axios wrappers + zod schemas per domain.
- `src/lib/bff/gateway.ts` — server-only BFF config (session cookie options, token extraction, upstream URL).
- `src/lib/{payments,hooks,design,utils}` · `src/store/{auth,ui}.ts` (Zustand, UI-only, no tokens) · `src/components/{ui,marketplace,dashboard,developer,admin,portal,marketing,brand,layout,auth,playground}` · `src/types/*`.
- `src/middleware.ts` — edge route guard for the authenticated portals.

Data layer: **TanStack Query** for server data, **Zustand** for ephemeral UI state.

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack dev) |
| UI runtime | **React 19** |
| Language | **TypeScript 5** (strict) |
| Styling | **Tailwind CSS 3.4** + Radix primitives (shadcn-style kit) |
| Server state | **TanStack Query** · tables via TanStack Table |
| Client state | **Zustand** |
| Forms | **react-hook-form** + **zod** |
| HTTP | **Axios** (typed wrappers) |
| Motion / 3D | **framer-motion**, **gsap**, **lenis**, **three** / react-three-fiber (marketing) |
| Charts | **Recharts** |
| Tests | **Vitest** (unit) + **Playwright** (E2E) |
| Package manager | **bun** (`bun@1.3.10`, `bun.lock` committed) |

> Convention: Sentinel frontends use **bun**. Do not add an npm lockfile.

---

## Configuration

Copy `.env.example` → `.env.local` and fill in values. `NEXT_PUBLIC_*` values are baked into the client bundle at build time; everything else is server-only. **Never commit secrets** (`OIDC_CLIENT_SECRET`, `SESSION_SECRET`).

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_GATEWAY_URL` | public (also read server-side) | Base URL of the gateway; used by the BFF and by SSR reads |
| `NEXT_PUBLIC_APP_URL` | public | Self URL (OIDC redirects, server-action allowed origin) |
| `NEXT_PUBLIC_OIDC_CLIENT_ID` | public | Public OIDC client id (PKCE) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | public | Stripe.js publishable key |
| `NEXT_PUBLIC_SENTRY_DSN` | public | Error monitoring (optional in dev) |
| `NEXT_PUBLIC_POSTHOG_KEY` | public | Product analytics (optional in dev) |
| `NEXT_PUBLIC_FEATURE_FLAGS_URL` | public | Remote feature flags (optional) |
| `NEXT_PUBLIC_MCP_BASE` | public | MCP base URL shown in the connect panel |
| `OIDC_ISSUER` | **server** | OIDC issuer (BFF token exchange) |
| `OIDC_CLIENT_SECRET` | **server / secret** | Confidential client secret — never commit |
| `SESSION_SECRET` | **server / secret** | Cookie/session signing (≥32 random bytes) — never commit |
| `ALLOW_INSECURE_COOKIES` | server (dev only) | Set `true` to opt out of the `Secure` cookie flag on local http |
| `DOCKER_BUILD` | build | Set `true` only for Docker (enables `output: standalone`) |

> Note: payment/checkout flows support both Stripe and Razorpay at the platform level; the frontend currently reads a Stripe publishable key. The gateway/billing repos hold the provider secrets.

---

## Local development

```bash
bun install
cp .env.example .env.local   # then edit

bun run dev          # http://localhost:3000 (Turbopack)
bun run build        # production build
bun run start        # serve the build

bun run type-check   # tsc --noEmit
bun run lint         # next lint
bun run test         # vitest (node env; jsdom opt-in per file)
bun run test:e2e     # playwright
bun run format       # prettier
```

`scripts/codegen.mjs` (`bun run codegen`) generates types from shared schemas when wired.

---

## Deploy

- **Production is Vercel** (`sentinel.fortiqo.xyz`). Pushing to `main` builds and deploys; PRs get preview URLs. `next.config.ts` sets `output: standalone` **only** when `DOCKER_BUILD=true` because standalone breaks Vercel.
- A `Dockerfile` + `docker-compose.yml` exist for container deployment (image `ghcr.io/fortiqo-network/sentinel-frontend`, port 3000, joins the external `sentinel-net`). This is an alternative to Vercel, not the current live path.
- There is **no `.github/workflows/` in this repo** — CI/CD for the frontend is handled by Vercel, not GitHub Actions.

---

## Status (verified against code)

Live in production. Working today:

- **BFF auth over first-party httpOnly cookies** — the browser never touches the gateway directly (`src/lib/bff/gateway.ts`, `src/app/api/*`).
- **Fail-safe secure cookie** — `sessionCookieOptions()` sets `httpOnly`, `sameSite=lax`, and `secure` that **fails safe**: `Secure` is on for production and any unknown `NODE_ENV`, and only disabled when an explicit local-dev signal is present (`NODE_ENV=development` or `ALLOW_INSECURE_COOKIES=true`).
- **Server-side route guard** — `src/middleware.ts` is edge middleware that redirects (307) unauthenticated requests away from `/dashboard/*`, `/developer/*`, `/admin/*` before the app shell renders. It is a coarse cookie-presence check; real JWT/role enforcement still happens at the BFF and gateway.
- **Security headers** (`next.config.ts`) — **HSTS enforced** (`max-age=31536000; includeSubDomains`), **CSP shipped in Report-Only** (allowlisting the Razorpay/Stripe checkout scripts/frames; enforcing mode deferred until violation reports confirm nothing legitimate is blocked), plus `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, and `frame-ancestors 'none'`.
- Marketplace, agent detail + trust-report modal, buyer dashboard, developer portal, and admin console are all wired to live gateway routes; SEO/sitemap/JSON-LD are live.

---

## Upcoming / roadmap

Near-term items (source: `sentinel-core-api/master-doc/frontend-todo.md`):

- Move CSP from Report-Only to **enforced** (nonce-based `script-src`) once violation reports are clean.
- **DOMPurify** on all agent-authored content; CSRF protection on BFF mutations; EU AI Act Art. 50 AI-interaction labels in chat/console.
- A2A card tab in the connect panel (feature-flagged).
- Accessibility pass (WCAG AA), keyboard nav, contrast; i18n (en complete + locale scaffolding).
- Compare-agents tray and saved searches; read-only OpenTelemetry trace views for developers.

---

## License

Proprietary — © Fortiqo-network.
