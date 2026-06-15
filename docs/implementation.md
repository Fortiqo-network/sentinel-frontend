# sentinel-frontend — Implementation Specification

> **Status:** Canonical frontend architecture specification. Supersedes the Phase 3 build-order
> notes previously in this file (preserved in §14). All frontend work tracks this document.
> Business model and settlement rules align with `sentinal-billing/docs/settlement.md`.

---

## 1. Product Vision

Sentinel is the **trust and settlement layer for the AI agent economy**: a marketplace where
developers publish AI agents, buyers discover them through verifiable trust signals, invoke them
through any surface they already use (REST, MCP, chat, CLI, A2A), and money settles **only when a
call demonstrably succeeded and was delivered**.

What differentiates Sentinel from agent indexes and explorers (which catalog
agent registrations without verifying behaviour or settling payment):

1. **Verification, not just listing.** Every agent passes a published, versioned, multi-stage
   security and reliability pipeline before it can be sold.
2. **Outcome-safe settlement.** Developers are paid per successful, delivered call. Failed calls
   cost the buyer nothing and pay the developer nothing.
3. **One manifest, many doors.** A published agent is simultaneously a REST endpoint, an MCP
   server, an A2A card, an embeddable chat, and a CLI target.

The frontend is the single human-facing surface for three personas — **buyers**, **developers**,
and **admins** — and talks exclusively to `sentinel-gateway`. It never reaches internal services.

---

## 2. Stack and High-Level Architecture

| Concern | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 App Router, RSC + server actions | SEO for marketplace, streaming, BFF colocation |
| Language | TypeScript strict (`noUncheckedIndexedAccess`) | Contract safety against gateway |
| Styling | TailwindCSS 4 + shadcn/ui | Speed + accessible primitives |
| Server state | TanStack Query | Cache, retry, invalidation semantics |
| UI state | Zustand (ephemeral only, never tokens/PII) | Minimal global state |
| Forms | react-hook-form + zod (schemas mirror `sentinel-shared`) | Single validation source |
| Charts | Recharts | Analytics dashboards |
| Payments UI | Stripe Elements / Razorpay hosted checkout | PCI SAQ-A — card data never touches us |
| i18n | next-intl (en at launch, scaffolding day one) | India + international audience |
| Tests | Vitest + Testing Library, Playwright E2E | Golden-flow coverage |
| Package manager | bun (never npm) | Repo convention |

```
Browser
  │  httpOnly cookies (no tokens in JS)
  ▼
sentinel-frontend (Next.js)
  ├─ RSC pages (marketplace, agent detail — SEO, ISR)
  ├─ Client islands (dashboards, forms, streams)
  └─ BFF route handlers (app/api/*)
        │  OIDC code+PKCE token exchange, refresh, webhook proxy
        ▼
sentinel-gateway  ───►  core-api / billing / verify / registry (never called directly)
```

**Route groups:** `(marketing)`, `(marketplace)`, `(dashboard)/buyer`, `(dashboard)/developer`,
`(billing)`, `(admin)`, `api/` (BFF).

**Rendering strategy:** marketplace list + agent detail are RSC with ISR (`revalidate: 60`,
tag-based revalidation on `agent.published`/`agent.suspended` webhooks once gateway emits ETags);
dashboards are server shell + client data. Role gating in the UI is cosmetic; the gateway is the
enforcement point.

---

## 3. User Flows

Every flow below specifies: entry points, steps (optimized for click count), feedback, error
recovery, and mobile behaviour. Global rules: every mutation gives optimistic or progress
feedback within 100 ms; every error state names the cause and the next action; nothing dead-ends.

### 3.1 User (buyer) registration

- **Entry:** "Get started" (nav, hero, any agent's "Try" button when unauthenticated).
- **Steps (2 screens):** ① email + password or OAuth (Google/GitHub) → ② verify email (6-digit
  code inline, not link-only — links break in corporate mail). Buyer role is the default; no
  role-selection screen.
- **First-run:** lands on marketplace with a dismissible "3 things you can do" coach panel and
  **$1 of trial credits** (config-flagged) so the first agent call requires zero payment setup.
- **Errors:** duplicate email → inline "Sign in instead?" link; weak password → live strength
  meter; code expiry → one-tap resend with cooldown timer.
- **Mobile:** single-column, autofocus progression, `inputmode=numeric` for the code.

### 3.2 Developer registration

- **Entry:** "Become a developer" in nav footer + buyer dashboard upsell card.
- **Steps:** existing account upgrades in place (no second account): ① display/team name +
  country → ② payout KYC handoff (Razorpay onboarding for India, Stripe Connect Express
  elsewhere — embedded, status polled) → ③ identity verification per
  `sentinel-verify/docs/identity-and-ownership.md` (email + payout KYC = Tier "Basic";
  optional org/domain proof = Tier "Verified Developer" badge).
- **Progressive:** publishing a **free self-hosted agent** requires only step ①. Steps ②–③ are
  required before the first paid call settles — the console shows a persistent "complete payout
  setup to start earning" banner with accrued-but-unsettleable earnings shown, which is a strong
  motivator.
- **Errors:** KYC rejection shows provider reason verbatim + retry; country unsupported → waitlist
  capture, never a silent dead end.

### 3.3 Agent publishing (developer)

- **Entry:** Developer console → "Publish agent" (primary CTA, always visible).
- **Two paths, chosen on screen one:**
  - **CLI-first (recommended):** screen shows `sentinel init && sentinel publish` snippet with
    copy button; the page live-subscribes (SSE) and flips to the verification progress view the
    moment the CLI upload lands. Web never re-asks what the manifest already declares.
  - **Web upload:** drag-drop artifact + manifest; client-side zod validation of `manifest.json`
    with line-level errors before any upload byte is sent.
- **Verification progress:** pipeline stage tracker (Static → Supply chain → Dynamic → Red-team →
  Reliability → Performance → Score) streamed via SSE; each stage shows findings as they land,
  not only at the end. Estimated time remaining from rolling pipeline p50.
- **On pass:** "Go live" review screen: pricing, category/tags, listing copy (markdown preview,
  sanitized), hosting tier. One click to publish; listing URL shown immediately.
- **On fail:** findings table with severity, file/line, remediation hint, and "what changes your
  score" rubric link. "Resubmit new version" keeps all listing metadata.
- **Errors:** upload resumable (tus or multipart retry); verification infrastructure failure is
  shown as "pipeline delayed — we'll email you", never as an agent failure.

### 3.4 Agent hosting (Tier A — hosted agents)

- **Entry:** publish flow step "Hosting" or agent settings → "Upgrade to hosted".
- **Pricing surface:** plainly states **$100 one-time onboarding + $10/month maintenance**
  before any commitment; self-hosted remains free and is the default selection.
- **Steps:** ① choose hosted → ② pay onboarding fee (wallet or card) → ③ resource profile
  (CPU/mem/timeouts from manifest, editable within limits) → ④ deploy; status stream shows
  provision → health-check → live.
- **Monthly maintenance:** auto-charged to developer wallet; failed charge → 7-day grace banner →
  agent paused (not delisted) with one-click resume on payment. All states visible in console.
- **Errors:** deploy failure shows runtime logs excerpt + retry; quota exhaustion offers waitlist.

### 3.5 Agent discovery (marketplace)

- **Entry:** `/agents` (SEO-indexed), home search bar, category pages.
- **Search:** instant-as-you-type (debounced 150 ms) across name, description, tags, developer;
  server-backed (Postgres FTS at launch, search index at scale — see review doc).
- **Filters (URL-encoded, shareable):** category/vertical, price model + range, trust-score range,
  certification tier, hosted vs self-hosted, verified-developer badge, rating.
- **Sorting:** popularity (default, by 30-day successful calls), rating, trust score, newest,
  price, name, developer.
- **Cards show (decision-complete without click-through):** name, developer + badge, one-line
  description, trust score gauge, cert tier, price per call, 30-day call volume, rating.
- **Grouping:** developer/team profile pages (`/developers/{slug}`) list all their agents with
  aggregate stats — supports the "browse by publisher" mental model.
- **Featured/editorial:** admin-curated featured rail on `/agents`, clearly labeled.
- **Empty states:** zero results always offers: clear filters, broaden category, request-an-agent
  form (demand signal captured for developers).
- **Mobile:** filter drawer, card list virtualized, sticky search.

### 3.6 Agent detail and trial

- Above the fold: name, developer, trust score + "what does this mean" rubric popover, price,
  **"Try it now"** (playground — works on trial credits, no setup), "Connect".
- Tabs: Overview · Trust report (public findings summary, score history sparkline) · Pricing ·
  Reviews · Changelog (versions from registry).
- **Connect panel** ("one agent, many doors"): Open (hosted chat/embed) · API (key + curl/SDK
  snippets) · MCP (one-click config for Claude/Cursor) · CLI (`npx @sentinel/connect`) · A2A
  (feature-flagged). Every snippet is copy-ready with the user's real key (fetched on demand,
  masked until reveal, never stored client-side).

### 3.7 API key management

- **Entry:** buyer dashboard → "API keys"; also inline in Connect panel ("create key for this").
- **Model:** keys belong to the account wallet; each key has: label, scopes (invoke-only by
  default), optional per-key **monthly spend cap**, optional agent allowlist, expiry.
- **UX:** create → full key shown **once** with copy button + "I've stored it" confirm; list shows
  prefix, label, last-used, 30-day spend; revoke is immediate (gateway cache flush — see security
  review) with confirm dialog naming integrations that used the key in the last 7 days.
- **Rotation:** "Rotate" creates the replacement first, shows both active for a grace window the
  user picks (0/24/72 h), then auto-revokes the old — zero-downtime rotation as a first-class flow.

### 3.8 Wallet management

- **Entry:** persistent balance chip in dashboard header (click → wallet page).
- **Wallet page:** current balance, **reserved** amount (in-flight call holds — see settlement),
  available = balance − reserved; ledger table (every entry links to the call or top-up that
  caused it); export CSV.
- **Payment modes:**
  - **Option B — top-up (primary):** preset amounts + custom; Stripe Elements / Razorpay checkout;
    balance updates via subscription, not refresh.
  - **Option A — pay-per-call:** implemented as **auto-reload**: "when balance < X, charge my
    card Y" (provider-tokenized mandate). Per-call card charges are economically infeasible
    (fixed provider fees exceed a 2% platform fee on small calls); auto-reload delivers the same
    UX — user never thinks about balance — with sane unit economics. Enterprise postpaid invoicing
    with credit limit is the M3 extension.
- **Low balance:** non-blocking banner at <20% of 30-day average spend; hard 402 path in
  playground shows one-click top-up modal preserving the in-progress request.

### 3.9 Credit top-up

Covered in 3.8; additional rules: 3-D Secure handled by provider redirect/iframe; pending
provider webhook shows "processing" state with the order id; failures show provider reason +
retry; all amounts displayed in account currency with the ledger storing minor units + currency.

### 3.10 Pay-per-call usage (invocation from the buyer's view)

1. Buyer calls agent (any surface). Gateway places a **hold** of the call price on the wallet.
2. Success + delivery confirmed → hold converts: 98% developer, 2% platform (see settlement doc).
3. Failure → hold released in full; the call appears in usage history as "failed — not charged".
4. Dashboard "Usage" shows per-call rows: agent, timestamp, latency, outcome, cost, trace id;
   failed calls are visually free (₹0/$0 struck through).

The **trust loop is explicit in the UI**: "You are only charged for successful calls" appears at
first top-up and on every failed-call row.

### 3.11 Analytics dashboard

See §5 for full specification of both dashboards.

### 3.12 Agent verification (status surfaces)

- Developer console: per-agent verification card — current score, cert tier, last verified, next
  scheduled re-verification, score history; live pipeline stream during runs (3.3).
- Buyer surfaces: trust report tab (3.6) renders the public subset; "report a problem" on every
  agent feeds the dispute/incident flow and can trigger re-verification.
- **Honesty rule:** while dynamic detonation is stubbed (runtime M0), the public report labels
  which stages ran. The badge must never overclaim — this is a product-integrity requirement.

### 3.13 Agent execution (playground)

- No-code panel on agent detail: form generated from the manifest's input JSON Schema
  (RJSF-style), or raw JSON tab for power users; streaming output (SSE) with cancel; shows
  elapsed time, cost preview before run, actual cost + trace id after.
- Errors map to action: 402 → top-up modal; 429 → countdown from `Retry-After`; agent error →
  "this call was not charged" + report-a-problem.

### 3.14 Payment settlement (developer's view)

- Earnings page: **settled** vs **pending confirmation** vs **held (disputed)** balances, with
  per-call drill-down (each row: call, gross, 2% fee, net, settlement state, confirmation time).
- Settlement timeline component visualizes: call → delivered → confirmation window → settled,
  so developers understand *why* a payout figure is what it is.
- Payouts: schedule (daily/threshold) configurable; payout history with provider reference ids;
  failed payout → reason + re-trigger after fixing bank/KYC details.

---

## 4. UX System

- **Click budget:** every core task in ≤3 clicks from its dashboard: try an agent (2: open
  detail → run), create key (2), top-up (3), publish (CLI path: 0 web clicks until "Go live").
- **Latency budget:** route transitions < 200 ms perceived (RSC streaming + skeletons matched to
  final layout — no spinner-only screens); mutations optimistic where reversible.
- **Feedback:** toasts only for background completions; inline state for everything attached to
  a control; long operations (verification, deploy) always get progress + ETA + email fallback.
- **Error recovery:** every error component carries `{cause, action}`; network errors auto-retry
  with backoff and an offline banner; forms never lose input (persisted to sessionStorage,
  excluding secrets).
- **Discoverability:** command palette (K) for nav + agent search; empty states teach.
- **Accessibility:** WCAG 2.1 AA; full keyboard paths for all golden flows; charts ship data
  tables for screen readers.
- **Mobile:** all buyer flows fully functional on mobile; developer console read-optimized on
  mobile (publishing is desktop/CLI-centric but status, earnings, alerts are mobile-first).
- **Trust-forward visual language:** trust score, verification stages, and "charged only on
  success" are the three messages the design system amplifies everywhere.

---

## 5. Analytics Dashboards

Backed by gateway analytics endpoints (`/v1/analytics/*` — see API catalog in
`ARCHITECTURE-REVIEW.md`). All charts: selectable range (24h/7d/30d/90d/custom), CSV export,
timezone-aware. Data source is the partitioned `usage_events` store (Postgres, monthly range
partitions, 13-month online retention, S3 archival — see review doc §Performance).

**Buyer dashboard**
- KPI row: calls (30d), spend (30d), success rate, active keys.
- Charts: calls + spend over time (stacked by agent), spend by agent (top-N donut), failure
  breakdown by error class.
- Tables: per-key activity (calls, spend, last used, cap utilization with progress bar), per-call
  usage log (filterable, links to trace).
- Alerts (configurable): spend threshold, failure-rate spike, key near cap.

**Developer dashboard**
- KPI row: net earnings (30d), pending settlement, successful calls, unique active buyers,
  p95 latency, failure rate.
- Charts: earnings over time (settled vs pending), calls per agent, active buyers trend,
  failure rate per agent with platform-p50 benchmark overlay.
- Tables: per-agent performance (calls, success %, p50/p95, rating, revenue), settlement history
  (3.14), recent failures with trace ids (the debugging entry point).
- Alerts: failure-rate spike (precursor to auto-suspension), maintenance charge due, payout events.

---

## 6. Security (frontend-owned surface)

- OIDC code + PKCE via BFF; tokens only in httpOnly/Secure cookies, `SameSite=Lax` (required for
  OAuth redirects) **plus double-submit CSRF token on every state-changing BFF route**.
- All agent-authored content (descriptions, READMEs, outputs) rendered through a single
  `SafeMarkdown` component (DOMPurify, strict allowlist). No other `dangerouslySetInnerHTML`.
- Strict CSP (nonce-based scripts, `frame-ancestors` allowlist for the embeddable widget only),
  Trusted Types where supported.
- Card data exclusively via Stripe Elements / Razorpay hosted — PCI SAQ-A.
- No secrets in `NEXT_PUBLIC_*`; API keys displayed once, fetched on demand, never cached.
- Webhooks accepted by BFF only with provider signature verification (Stripe HMAC, Razorpay
  signature) + replay-window check.

---

## 7. Performance

ISR + tag revalidation for marketplace; route-level code splitting; `next/image` + CDN; TanStack
Query staleTime tuned per resource (listings 60s, balance 5s/subscription, usage 30s);
virtualized tables; charts lazy-loaded; Web Vitals budget enforced in CI (LCP < 2.5s on Fast 3G
for marketplace).

## 8. Observability

Sentry (errors + session replay on opt-in), PostHog (product analytics), Web Vitals → OTel
collector; every gateway call carries `X-Trace-Id` surfaced in error UIs so support can correlate.

## 9. Testing

Vitest unit/component; contract tests pinning generated types ↔ zod schemas (CI fails on drift);
Playwright E2E for golden flows: register → trial call → top-up → keyed call → usage visible;
publish (mock CLI) → verify stream → go live → earning visible. Visual regression on marketplace
and trust report.

## 10. Deployment

Docker standalone build; Helm `frontend` chart in `sentinel-infra`; Cloudflare CDN in front;
per-PR preview environments; `bun run codegen && type-check && lint && test && build` gate in CI.

## 11. Open dependencies on other services

| Need | Owner | Status |
|---|---|---|
| ETag/tag revalidation on `/v1/listings` | gateway | blocks ISR (currently force-dynamic) |
| Analytics endpoints (`/v1/analytics/*`) | gateway+billing | new — see API catalog |
| Immediate key-revocation propagation | gateway | security gap, P0 in review doc |
| Settlement states in usage/earnings APIs | billing | per `settlement.md` |
| Verification SSE stream | core-api/verify | spec'd, confirm event shape |

## 12. Roadmap

M1: marketplace, auth, wallet, keys, playground, publish+verify stream, earnings (read-only).
M2: full analytics, auto-reload, settlement timeline, admin console, alerts, i18n locale #2.
M3: A2A surfaces, enterprise (SSO, postpaid), embeddable widget GA, dark mode.

## 13. Out of scope (frontend)

Authorization decisions, pricing computation, settlement math, trust scoring — all rendered,
never computed, client-side.

## 14. Superseded build-order notes (Phase 3)

Original module/build-order content retained for reference: scaffold → codegen → auth/BFF →
marketplace → connect panel → billing portal → buyer dashboard → developer console → admin →
i18n/analytics/CSP. Key decisions carried forward: BFF over SPA-with-tokens; RSC/SSR for SEO;
DOMPurify for all agent-authored content; bun; shadcn/ui; TanStack Query + Zustand split.
