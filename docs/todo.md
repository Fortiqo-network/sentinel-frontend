# sentinel-frontend — todo.md

## M0 — Setup
- [ ] Init Next.js (App Router) + TS strict + Tailwind + shadcn/ui
- [ ] Configure bun, ESLint/Prettier (or Biome), Vitest, Playwright
- [ ] Design tokens in `globals.css`; base layout + theming
- [ ] `.env.example` + env validation; Sentry + PostHog wiring (no-op in dev)
- [ ] `codegen` script: `sentinel-shared` → `types/`

## M1 — MVP
- [ ] BFF auth: OIDC PKCE token exchange, httpOnly cookie session, refresh
- [ ] Role gating (buyer/developer/admin) — cosmetic only
- [ ] Typed gateway client (`lib/api`) with 401 refresh + 429 backoff + trace-id
- [ ] Marketplace list page (SSR/ISR) + filters + sort + search
- [ ] Agent detail page + public verification report (gauge, findings, cert)
- [ ] Connect panel: Open (URL + widget), API key, MCP (Streamable HTTP), CLI (`npx`)
- [ ] Buyer dashboard: purchases, credit balance, usage, access credentials
- [ ] Billing portal: Stripe Elements top-up, payment methods, ledger, invoices
- [ ] Developer console: create/edit listing, submit for verification, live status (SSE), earnings, Stripe Connect onboarding embed, bond management
- [ ] Playwright golden flows (buyer + developer)

## M2 — Hardening
- [ ] Strict CSP, frame-ancestors, Trusted Types where feasible
- [ ] DOMPurify on all agent-authored content
- [ ] CSRF protection on BFF mutations
- [ ] EU AI Act Art.50 AI-interaction labels in chat/console
- [ ] A2A card tab in connect panel (flagged)
- [ ] Admin console: moderation, disputes, kill-switch, feature flags
- [ ] i18n: en complete + locale scaffolding; RTL check
- [ ] Accessibility pass (WCAG AA), keyboard nav, color contrast

## M3 — Scale / polish
- [ ] Compare-agents tray; saved searches
- [ ] Per-agent observability (read-only OTel traces) for developers
- [ ] Visual regression suite; performance budgets in CI
- [ ] Web Vitals reporting to gateway analytics sink

## Definition of done
- [ ] All env vars documented in `.env.example` + README table
- [ ] Typecheck + lint + unit + E2E smoke green in CI
- [ ] No tokens/secrets client-side; CSP active
