# sentinel-frontend — scope.md

## Purpose
The single human-facing web application for Sentinel. Renders the marketplace, verification reports, buyer/developer/admin dashboards, billing portal, and the agent "connect" experience. Talks only to `sentinel-gateway`.

## In scope
- Public marketplace (SSR/SEO): browse, search, filter, compare agents by trust score, tier, price model, vertical, guarantee.
- Agent detail + public verification report (trust score, findings summary, certification, benchmarks).
- Connect panel: hosted chat URL, embeddable widget, API key, MCP (Streamable HTTP), `npx` CLI, A2A card.
- Buyer dashboard: purchases/rentals, credit balance, usage, invoices, outcome/dispute status, access credentials.
- Billing portal: credit top-up (Stripe Elements), payment methods, ledger view, invoices.
- Developer console: publish/manage listings, verification pipeline status (live), earnings/payouts (Stripe Connect onboarding embed), bond management, read-only observability.
- Admin console: moderation, dispute resolution, kill-switch, feature flags (role-gated).
- Auth via OIDC + PKCE through a thin BFF; i18n scaffolding; analytics + error monitoring.

## Out of scope
- Any direct calls to internal services (always via gateway).
- Business logic, money movement, verification computation (backend concerns).
- Storing tokens client-side, holding secrets, or enforcing authorization (gateway enforces; UI gating is cosmetic).
- Agent execution.

## Interfaces (consumes)
- `sentinel-gateway` REST + streaming (chat/console) + SSE/WebSocket for live verification status.
- `sentinel-shared` generated TypeScript types (via `codegen`).
- Stripe.js / Elements (card entry) and Stripe Connect onboarding embed.

## Non-goals
- Native mobile apps (responsive web only for MVP).
- Offline support.

## Success criteria
- Golden flows pass E2E: buyer (discover → top-up → connect → run → see usage) and developer (publish → verify → live → earnings).
- Lighthouse: marketplace pages SEO-indexable; LCP < 2.5s on listing pages.
- Zero secrets in `NEXT_PUBLIC_*`; CSP enforced; no `localStorage` tokens.
- 100% of API calls go through the typed gateway client using generated types.

## Dependencies / blockers
- Needs `sentinel-shared` schemas published for codegen.
- Needs gateway endpoints for auth, listings, connect, billing.
