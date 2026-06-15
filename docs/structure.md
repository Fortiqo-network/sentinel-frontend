# Sentinel — System Structure & Capability Map

> **What this file is.** A single, platform-wide snapshot of **what exists today** — every repo, its
> purpose, its live APIs/features, and what is real vs stubbed. It answers "is this already built, and
> where?" before you write new code. **This file is identical in every repo** at `docs/structure.md`.
>
> **How it differs from the other docs:**
> - `structure.md` (this file) — **what is built now** (capabilities + API surface).
> - `sentinel-core-api/master-doc/build-sequence.md` — **what to build next**, in order.
> - `sentinel-core-api/master-doc/platform-todo.md` + `<module>-todo.md` — the backlog/board.
> - `sentinel-core-api/master-doc/architecture-map.md` — who-calls-whom edges in depth.
>
> **Keep it in sync (mandatory).** When you add/remove an API, feature, service, or page, update this
> file **in the same commit** and copy the change to every repo's `docs/structure.md` (they must stay
> identical). Never let it describe behaviour the code no longer has.

---

## 1. Platform in one paragraph

Sentinel is a **trust, verification, and settlement layer for AI agents**. Developers publish agents;
Sentinel verifies them (multi-stage security pipeline → 0–100 trust score), lists them in a marketplace,
runs/proxies their calls, and settles money **pay-on-outcome** (developer keeps **98%**, platform fee
**2%**). The **gateway is the only public service**; everything else is internal. Credits are the only
user-facing unit (**1 USD = 100 credits**; never show paise/₹/$).

---

## 2. The 13 repos at a glance

| Repo | Role | Lang/Stack | Status |
|---|---|---|---|
| **sentinel-gateway** | The single public edge: auth, listings, agent invoke (REST/MCP/A2A/SSE), billing/keys proxy, rate-limit, metering | Python · FastAPI · Redis | **Live** (public) |
| **sentinel-core-api** | System of record: users, agents lifecycle, marketplace, API keys, verification events | Python · FastAPI · Postgres | **Live** |
| **sentinel-billing** | Double-entry ledger, credit wallet, metering split, escrow/settlement, bonds, disputes, payouts | Python · FastAPI · Postgres · Celery/Redis | **Live** (payouts partial) |
| **sentinel-verify** | Multi-stage verification + trust scoring (static, supply-chain, dynamic, red-team) | Python · FastAPI · Celery/Redis | **Live** (stages 2/4 partial) |
| **sentinel-registry** | Immutable agent artifact registry: versioning, content-addressed storage, SBOM, A2A cards | Python · FastAPI · Postgres · S3/MinIO | **Live** (Sigstore advisory) |
| **sentinel-runtime** | Sandboxed agent execution (Firecracker microVM) for Tier A hosting + dynamic detonation | Python · FastAPI | **Stub** (501s; M6+) |
| **sentinel-sdk** | Official dev SDK (Python + TypeScript) + `sentinel` CLI to build/serve/publish agents | Python (PyPI `sentinel-sdk`) + TS (npm `@sentinel/sdk`) | **Mostly built** |
| **sentinel-shared** | Cross-service contracts: Pydantic models, events, error codes (zero-I/O library) | Python (PyPI `sentinel-shared`) | **Complete** |
| **sentinel-frontend** | Marketplace + buyer dashboard + developer portal + playground + marketing (Tessera brand) | Next.js 16 · React 19 · Tailwind | **Live** |
| **sentinel-contracts** | On-chain identity (ERC-8004) + staked bonds | Solidity · Hardhat | **Scaffolded** (M9+) |
| **sentinel-agent-templates** | Starter agents (Py/TS) + golden-task fixtures for verification calibration | Python + TypeScript | **Built** |
| **sentinel-infra** | IaC: docker-compose (local), Terraform (AWS), Helm (k8s), CI/CD | Terraform · Helm · GH Actions | **Built** |
| **sentinel-docs** | Standalone docs **site** (markdown + thin Next renderer; `nav.json`) at `docs.fortiqo.xyz` | Next.js (Mintlify removed) | **Live** |

---

## 3. Runtime topology & data flow

```
                          ┌──────────────────────────────────────────────┐
  Browser / Buyers /      │              sentinel-gateway (PUBLIC)         │
  Developers / Agents ───▶│  auth · listings · agent invoke (REST/MCP/A2A │
  (sentinel-frontend BFF) │  /SSE) · billing+keys proxy · rate-limit ·    │
                          │  metering emit                                 │
                          └───────┬───────────────┬───────────────┬───────┘
                                  │               │               │
                       ┌──────────▼───┐   ┌───────▼──────┐  ┌─────▼───────┐
                       │ core-api     │   │ billing      │  │ runtime     │
                       │ (records)    │   │ (money)      │  │ (exec, stub)│
                       └───┬───────┬──┘   └──────────────┘  └─────────────┘
                           │       │
              ┌────────────▼┐   ┌──▼───────────┐
              │ verify       │   │ registry     │
              │ (trust score)│◀─▶│ (artifacts)  │
              └──────────────┘   └──────────────┘

Shared infra: Postgres (per-service schemas) · Redis (cache/queues/streams) · S3/MinIO (artifacts).
Contracts (on-chain) and Firecracker runtime are deferred (see status).
```

- **Frontend never calls internal services** — only the gateway, via its BFF proxy (`/api/[...path]`).
- **Metering:** gateway emits signed events → Redis stream `sentinel:metering:events` → billing `/v1/meter`.
- **Verification:** core-api enqueues verify → verify scores → emits HMAC-signed `verification.completed` to core-api.
- **Publishing:** SDK/CLI → registry (artifact + SBOM + card) → emits `version.created` to core-api.

---

## 4. Public API surface — **sentinel-gateway** (the only ingress)

Base (prod): `https://sentinel-api.fortiqo.xyz` · local `:8080`. Auth = JWT (`Authorization: Bearer`)
or API key (`X-API-Key`). Public routes need neither.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health`, `/readiness` | no | Probes |
| POST | `/v1/auth/register` · `/v1/auth/login` · `/v1/auth/logout` | no | Session (sets JWT cookie) |
| GET | `/v1/auth/me` | yes | Current user profile (incl. `avatarUrl`) |
| PATCH | `/v1/auth/me` | yes | Update own profile (`displayName`, `avatarUrl`) |
| GET | `/v1/listings` | no | List marketplace agents (paginated, filterable) |
| GET | `/v1/listings/{agent_id}` · `/v1/listings/slug/{slug}` | no | One listing |
| GET | `/v1/agents/{developer}/{slug}` | no | **Agent metadata card** (endpoints, pricing, I/O schema) |
| POST | `/v1/agents/{developer}/{slug}/use` | yes | Pay-and-use — proxies to the agent's private endpoint, returns **real output**, charges on success |
| POST | `/v1/agents/{agent_id}/invoke` | yes | Invoke agent (proxied to runtime/developer endpoint) |
| POST | `/v1/agents/{agent_id}/chat` | yes | **SSE** streaming chat |
| POST | `/chat/` | yes | JSON-RPC streaming chat (alt surface) |
| GET | `/v1/billing/balance` · `/v1/billing/ledger` · `/v1/billing/invoices` | yes | Wallet reads |
| POST | `/v1/billing/topup` | yes | Add credits (payment provider pending) |
| POST/GET/DELETE | `/v1/keys` · `/v1/keys/{id}` | yes | API key CRUD |
| GET | `/v1/developer/agents` · `/v1/developer/agents/{id}` | yes | Developer's agents |
| POST/PATCH/DELETE | `/v1/developer/agents` … | yes | Draft CRUD |
| POST | `/v1/developer/agents/{id}/submit` | yes | Submit for verification |
| GET | `/v1/developer/earnings` · `/v1/developer/bond` | yes | Payout-eligible earnings · active bond |
| GET/POST/DELETE | `/v1/developer/agents/{id}/access-blocks[/{userId}]` | yes | Developer blocks/unblocks a user from an owned agent |
| POST | `/v1/developer/agents/{id}/pay-listing` · `/retire` · `/restore` | yes | Settle $10 listing fee · disable (retire) · re-enable (restore) the agent |
| GET | `/v1/developer/agents/{id}/metrics` · `/audience` | yes | Per-agent metrics (unique users real; invocations/earnings pending) · paginated audience + block state |
| GET/POST | `/v1/buyer/subscriptions` | yes | List · subscribe ("star") an agent → buyer portal |
| DELETE | `/v1/buyer/subscriptions/{agentId}` | yes | Unsubscribe |
| GET | `/v1/notifications` · POST `/v1/notifications/read` | yes | List · mark-read user notifications |
| GET | `/v1/x402/agents` | no | x402 discovery catalog |
| POST/GET | `/mcp/a/{agent_id}` | mixed | MCP Streamable HTTP invoke / discovery |
| GET | `/.well-known/agents/{agent_id}/agent-card.json` | no | A2A agent card (proxied from registry) |
| POST | `/v1/a2a/{agent_id}/tasks` | yes | A2A task w/ signed spend mandate |

> **Metadata-card note:** the canonical route is `GET /v1/agents/{developer}/{slug}` (e.g.
> `/v1/agents/alex/codereview-pro`). It 404s unless the agent is `status=live` **and** the
> `developer_handle` matches. A `/metadata` suffix alias may be added for clarity — keep this row in sync.

---

## 5. Internal service APIs (not public — reached via gateway or service-to-service)

**core-api** (`:8000`): `/v1/users/*` (register/login/me, PATCH me incl. `avatar_url`), `/v1/marketplace` + `/{id}` + `/slug/{slug}`,
`/v1/agents` CRUD + `/{id}/submit-for-verification` + `/{id}/access-blocks` (GET/POST, DELETE `/{userId}`), `/v1/keys` CRUD,
`/v1/subscriptions` (GET/POST, DELETE `/{agentId}`), `/v1/notifications` (GET, POST `/read`),
`/internal/agents/{id}/access-check/{userId}` (gateway block check), `/internal/events/verification.completed`, `/internal/api-keys/validate`.

**billing** (`:8002`): `/v1/credits/{balance,topup,ledger,invoices}`, `/v1/meter` (signed charge → dev/platform split),
`/v1/payouts/{summary,initiate}`, `/v1/bonds/{deposit,{id}/release,{id}/slash}`, `/v1/disputes/{open,{id}}`,
`/v1/webhooks/{razorpay,stripe}`. Workers: settlement sweep (30m), payout batch (daily).

**verify** (`:8001`): `/api/v1/verify` (enqueue), `/api/v1/verify/{job_id}` (status), `/api/v1/reports/{agent_id}`,
`/api/v1/reports/{agent_id}/badge`, `/api/v1/verify/{agent_id}/rescore`, `/internal/verifications/{id}`.
Ownership proof (Phase A): `POST /internal/ownership/challenge` (issue token), `POST /internal/ownership/verify`
(SSRF-guarded `.well-known/sentinel-challenge` check), `GET /internal/ownership/{agent_id}` (latest status).

**registry** (`:8003`): `/v1/artifacts` (publish), `/v1/artifacts/{agent_id}[/{version}]`,
`/v1/artifacts/{agent_id}/{version}/download` (presigned), `/v1/cards/{agent_id}`, `/v1/cards` (publish).

**runtime** (stub, `:8003` per its config — not yet wired in compose; reconcile port): `/v1/execute`,
`/v1/execute/{task_id}` (GET/DELETE), `/v1/health`, `/v1/ready`. **All execute endpoints return 501.**

---

## 6. Frontend — **sentinel-frontend** (Next.js 16 App Router)

Prod: `https://sentinel.fortiqo.xyz`. Talks only to the gateway through its BFF.

- **Public/marketing:** `/` (cinematic Tessera home), `/how-it-works`, `/playground`, `/terms`, `/privacy`, `/security`, `/status`, `/docs/methodology`, `/docs/trust-scores` (`InfoPage` shell); `(auth)/forgot-password`.
- **Marketplace:** `/agents` (grid + filters), `/agents/[agentId]` (detail + Developer & integration + **Trust report** modal: average score + per-dimension status).
- **Auth:** `/login`, `/register` (route group `(auth)`; httpOnly-cookie session via BFF; social/EVM sign-in buttons scaffolded — "coming soon").
- **Buyer dashboard:** `/dashboard`, `/dashboard/{subscriptions,usage,billing,api-keys,profile,settings}` (subscriptions = "My Agents").
- **Developer portal:** `/developer`, `/developer/{agents,agents/[agentId],agents/new,earnings,profile,bonds,settings}` (agent detail hosts per-agent access control).
- **BFF / API routes:** `/api/v1/auth/{login,register,logout}`, `/api/[...path]` (gateway proxy w/ Bearer).
- **Data/UI layers:** typed Axios wrappers + zod in `src/lib/api/*`; TanStack Query (server data) +
  Zustand (UI only, no tokens); reusable kit in `src/components/ui/*`
  (`button,card,badge,input,select,dialog,skeleton,toaster,avatar,stat-card,page-header,trust-score,empty-state`).
- **Design system:** brand utilities in `globals.css` (`glass`, `ring-hairline`, `text-aurora`,
  `font-brand`, `font-brand-mono`, `text-display-*`); marketing components (`Reveal`, `SplitText`,
  `MagneticButton`, `Tessera`, `Mosaic`, `MosaicReveal`).
- **SEO (around `sentinel.fortiqo.xyz`):** `metadataBase` + per-route canonical + OG/Twitter; JSON-LD
  (Organization with investor `contactPoint`, WebSite `SearchAction` → `/agents?q=`, `CollectionPage`
  for the marketplace, SoftwareApplication); `robots.ts`; **dynamic `sitemap.ts`** (static routes + every
  live agent); marketplace-intent keywords ("AI agent marketplace", "market of agents") + trust framing
  (buyers & developers). Investor "coming soon" contact **+91 70006 95135** in footer + dev banner.

---

## 7. SDK & contracts libraries

- **sentinel-sdk** — `@agent.tool` decorator API (Py + TS), `AgentManifest` (Pydantic + Zod),
  `SentinelClient`, `serve` (FastAPI exposing `/invoke` REST + `/mcp` + `/health` + `/manifest` + `/a2a/card`),
  `publish` (zip + SHA-256 + registry upload; Sigstore signing is a stub), `sentinel` CLI
  (`login, publish, status, run, test, whoami`; `init` scaffolding partial).
- **sentinel-shared** — `AgentManifest/Agent`, `User/Developer/Buyer`, `TrustReport/Finding/Badge`,
  `Transaction/CreditBalance/Bond`, `ArtifactVersion/AgentCard`, `Envelope[T]` + event payloads,
  `SentinelErrorCode` + `SentinelError`. Consumed by all backends, SDK, and frontend codegen.
- **sentinel-contracts** — `SentinelAgentRegistry.sol` (ERC-8004 identity + ERC-721 card),
  `SentinelBond.sol` (staked, graduated slash). Full NatSpec + security guards; **tests are stubs,
  not deployed** — activation gated to M9+.

---

## 8. Templates · infra · docs

- **agent-templates** — `templates/python/{basic-agent,expense-review-agent,icd10-coding-agent}`,
  `templates/typescript/basic-agent`; golden fixtures `fixtures/golden-tasks/{expense-review,icd10-coding}`
  (input/expected). Manifests validate against shared schema; fixtures calibrate verify.
- **infra** — `docker/docker-compose.yml` wires postgres, redis, localstack + gateway:8080, core-api:8000,
  verify:8001, billing:8002, registry:8003; Terraform modules (vpc/rds/redis/ecs/s3) + dev/staging/prod;
  Helm charts (gateway/core-api/verify/billing); GH Actions CI + deploy-dev (self-hosted runner).
  Prod edge is a **Cloudflare tunnel** to the gateway (`sentinel-api.fortiqo.xyz`); frontend on Vercel.
- **docs** — standalone Next.js site (Mintlify removed) deployed to `https://docs.fortiqo.xyz`
  (own Vercel project + Cloudflare DNS). Markdown content + `nav.json`, rendered by an in-repo
  `app/[[...slug]]` renderer (cinematic theme). `sentinel.fortiqo.xyz/docs` → 302 → `docs.fortiqo.xyz`.

---

## 9. What's real vs stubbed (read before building)

| Capability | State |
|---|---|
| Auth (register/login/me/logout), API keys, profile update + avatar | **Real** |
| Marketplace listings + agent metadata card (+ `/metadata` alias) | **Real** (9 seed agents, all `live`) |
| Buyer subscriptions ("star" agents → portal) + user notifications | **Real** (core-api tables + gateway proxy; migration `0002`) |
| Developer per-agent user access restriction (block a misusing user) | **Real** (`agent_access_blocks` table + owner-scoped endpoints; gateway enforces 403 in pay-and-use, invoke, and chat; developer UI) |
| Buyer wallet: balance/ledger/invoices, ledger double-entry | **Real** |
| Buy credits (top-up) — grants credits + records payment JSON | **Real (mock)** — UI at `/dashboard/billing`; real Razorpay/Stripe capture swaps in later |
| Per-agent usage (calls + credits) from the ledger | **Real** (`/dashboard/usage`); **latency not tracked yet** (needs a metering-aggregation store) |
| Metering split (98/2), escrow state machine, bonds, disputes | **Real** |
| Agent invocation `/use` → **real output** | **Real** — gateway proxies the buyer input to the agent's private `access_config.endpoint_url` (SSRF-guarded), charges credits **only on success**; endpoint resolved via internal `GET /internal/agents/{id}/invoke-config`. Managed/Tier-A in-process execution still needs runtime (stub). |
| Promo codes (free listing / credit top-up) | **Registry** `services/promo.py` (key→perk). `SENTINEL1`=free listing (real, waives $10 at create). Wallet top-up via promo = TODO. |
| Razorpay/Stripe **payouts** | **Partial** (order/webhook/verify yes; Route/Connect payout = TODO) |
| Developer **listing fee — $10** with a **7-day free trial listing** | **Real** — 7-day trial set on agent create (`listing_trial_ends_at`); marketplace **gates out expired-unpaid** listings; developer settles via `pay-listing` (`listing_paid`). The $10 **payment capture is a mock/marker** (real Razorpay/Stripe later). |
| Developer **disable/retire agent** (typed-"DELETE" double confirm) | **Real** — `POST /v1/agents/{id}/retire` (live/verified/suspended → retired, non-destructive); draft/rejected soft-delete; UI confirm modal requires typing DELETE |
| **Soft-delete everywhere** (nothing hard-deleted) | **Real** — `is_deleted`/`deleted_at` on users, agents, subscriptions, notifications, access-blocks (migration `0005`); all reads filter deleted; unstar/unblock/agent-delete are soft. Keys soft-deactivate via `is_active`; agent versions are immutable; audit log is append-only. |
| Agent **restore / re-enable** | **Real** — `POST /v1/agents/{id}/restore`: clears delete, live instantly if listing paid, else fresh 7-day trial; UI "Re-enable" on archived agents. |
| Buyer **usage/payments/credits** metrics | **Real** — wallet hero + spent/invocations/top-ups (from ledger) on `/dashboard`; `/dashboard/usage` per-agent; top-ups **non-refundable** (stated in UI). |
| **Audit log** (append-only `audit_events`) | **Real** — records agent retire / listing-paid / access block & unblock (actor, action, entity, details, time); money movements audited via the billing ledger. Migration `0004`. |
| **2FA** for developer & user accounts | **Planned** (`users.mfa_enabled` column exists; TOTP/WebAuthn enrolment + challenge not built) |
| Verify stage 1 (Semgrep+Bandit), dynamic (via runtime), scoring, tiers | **Real** |
| Verify stage 2 (SBOM/Sigstore), stage 4 (red-team corpus) | **Partial/stub** |
| Registry artifacts/versioning/SBOM/A2A cards | **Real**; Sigstore verify **advisory** |
| Runtime execution (Firecracker, network sandbox, secrets) | **Stub (501)** — M6+ |
| SDK build/serve/publish/CLI | **Real**; Sigstore sign + `init` templates **partial** |
| On-chain contracts | **Scaffolded, undeployed** — M9+ |
| **Agents themselves** | **Static/listed for now** — real executable agent nodes come later (verification/test scenarios) |

---

## 10. Conventions every repo shares

- **Credits only** in any user/API-facing value (`*Credits` fields; `1 USD = 100 credits`). Platform fee **2%**.
- **Postgres always** (never SQLite, incl. tests). **Never hard-delete** — record tables carry
  `is_deleted`/`deleted_at`; deletes flag + hide, and all reads filter `is_deleted=False`. Deleted agents
  are restorable via the listing flow. Audit log + ledger are append-only.
- **Auditable by design:** every table carries timestamps; sensitive mutations also write an append-only
  `audit_events` row (core-api) and money via the billing ledger. Don't hard-delete records of record.
- **Schema can't run behind code:** backend services run `alembic upgrade head` **on container startup**
  (Dockerfile CMD) so every restart brings the DB to head before serving; the deploy workflow then runs an
  **API smoke test** that fails the deploy on any non-2xx. (core-api done; billing/verify/registry: apply
  the same self-migrate Dockerfile pattern — tracked.) Manual: `make migrate` per service.
- **Docs stay in sync in the same commit:** this `structure.md`, the module `docs/`, and
  `master-doc/*-todo.md` (tick `[ ]`→`[x]`, never delete a line).
- **Commits:** Conventional Commits, one concise line, **no AI/attribution**. Never push without permission.
- **Code:** clean, reusable, smallest change that works; **no inline comments** (docstrings/JSDoc only).
- **Cross-repo planning** lives in `sentinel-core-api/master-doc/` — start at `build-sequence.md`.

---

## 11. Live URLs & ports

| Thing | Value |
|---|---|
| Frontend (Vercel) | `https://sentinel.fortiqo.xyz` |
| Gateway (public API, Cloudflare tunnel) | `https://sentinel-api.fortiqo.xyz` |
| Local ports | gateway 8080 · core-api 8000 · verify 8001 · billing 8002 · registry 8003 · runtime 8003 (stub) |
| Brand | Tessera — ink `#0B0C0F` · porcelain `#ECEAE3` · gold `#E7A03C`; Sora + IBM Plex Mono |
| Contact | balraj.fortiqo@gmail.com |

---

## 12. File map — **where to change things** (per repo)

> Use this to locate the right file before editing. Backend services share one layout:
> `src/<pkg>/main.py` (app factory) · `api/v1/*.py` (routers) · `db/models/*.py` (ORM) ·
> `core/config.py` (settings) · `services/` or `workers/` (logic) · `clients/` (outbound HTTP) ·
> `db/migrations/` (Alembic). To **add an endpoint**: router in `api/v1/`, register in the v1 router,
> add/extend ORM in `db/models/` + a migration, put logic in `services/`, mirror the contract in
> `sentinel-shared` and the typed wrapper in `sentinel-frontend/src/lib/api/`.

**sentinel-gateway** (`src/sentinel_gateway/`)
- `main.py` — app factory, middleware + router registration · `routers/{health,auth,listings,agents,billing,keys,developer,x402,rest,chat,mcp,a2a}.py` — HTTP surface
- `auth/dependencies.py` — `get_authenticated_principal` · `middleware/{cors,ratelimit,metering}.py` · `clients/` — calls to core-api/billing/registry/runtime · `core/config.py`

**sentinel-core-api** (`src/sentinel_core_api/`)
- `main.py` · `api/v1/router.py` (aggregator) · `api/v1/{users,marketplace,agents,keys,health,events}.py`
- `db/models/agent.py` (lifecycle state machine), `db/models/{user,api_key}.py` · `db/migrations/` · `scripts/seed.py` (3 devs, 3 buyers, 9 live agents) · `core/config.py`
- **Master docs live here:** `master-doc/` (build-sequence, platform-todo, go-to-market, architecture-map, security-todo, `<module>-todo.md`).

**sentinel-billing** (`src/sentinel_billing/`)
- `api/v1/{credits,metering,payouts,bonds,disputes,webhooks}.py` · `ledger/double_entry.py` (engine) · `db/models/ledger.py` (LedgerEntry/CreditBalance/DeveloperBond/LedgerDispute)
- `payments/{razorpay,stripe,json_store}.py` · `workers/celery.py` + `workers/tasks/{payouts,settlements}.py` · **fee policy / 2% split lives in metering + `core/config.py`**

**sentinel-verify** (`src/sentinel_verify/`)
- `api/v1/verification.py` + `api/internal/verifications.py` · `workers/pipeline.py` (orchestrator) · `workers/tasks/{static_analysis,supply_chain,dynamic,redteam}.py`
- `analyzers/{semgrep,bandit,pip_audit,dynamic}.py` · `scoring/trust_score.py` (rubric + tiers) · `db/models/verification.py` · `clients/core_api.py` (emit event) · `storage/s3.py`
- Ownership proof: `core/ssrf.py` (SSRF guard) · `services/ownership.py` · `api/internal/ownership.py` · `db/models/ownership.py` (+ migration `0002`). Design: `docs/master-doc.md` §24 (v2 plan: 4 goals, isolation tiers, rubric v2, Gemini AI review).

**sentinel-registry** (`src/sentinel_registry/`)
- `api/v1/{artifacts,agent_cards}.py` · `domain/{versioning/semver,packaging/manifest,resolution/resolver,signing/verify}.py` · `signing/{sbom,checksum}.py`
- `storage/{s3,local}.py` · `db/models/artifact.py` (Package/Version/Artifact/Signature/AgentCard) · `clients/core_api.py`

**sentinel-runtime** (`src/sentinel_runtime/`) — *stub*
- `api/v1/{execution,health}.py` (501s) · `models/execution.py` (typed) · `sandbox/{firecracker,network,secrets}.py` (raise on non-Linux) · `core/config.py`

**sentinel-sdk**
- Python: `python/src/sentinel_sdk/{agent,client,manifest,publish,server}.py`, `mcp/server.py`, `cli/main.py`
- TypeScript: `typescript/src/{agent,client,manifest,types,index}.ts` · Docs: `docs/{quickstart,building-agents,cli,publishing,...}.md`

**sentinel-shared** (`src/sentinel_shared/`)
- `models/{agent,user,verification,billing,registry}.py` · `events/types.py` (Envelope + payloads) · `errors/codes.py` · `__init__.py` — **edit here first when a cross-service contract changes**

**sentinel-frontend** (`src/`)
- `app/` — routes (groups `(auth)`, `(marketplace)`; `dashboard/*`, `developer/*`, `playground`, `how-it-works`); `app/api/[...path]/route.ts` (BFF proxy) + `app/api/v1/auth/*`
- `lib/api/{client,agents,auth,billing,keys,developer,subscriptions,notifications,server-auth}.ts` (typed wrappers + zod) · `lib/bff/gateway.ts` · `lib/{site,avatars}.ts`
- `components/ui/*` (kit: button,card,badge,input,select,dialog,skeleton,toaster,avatar,stat-card,page-header,trust-score,empty-state) · `components/portal/{ProfileSettingsCard,ConnectedAccountsCard,AccessControlCard}.tsx` · `components/auth/SocialSignInButtons.tsx` · `components/marketplace/{SubscribeButton,TrustReportPanel}.tsx` (report = avg score + dimension states; `getAgentReport` in `lib/api/agents.ts`) · `components/layout/{Sidebar,DashboardHeader,Header,Footer}.tsx` · `components/marketing/*` · `components/brand/*` · `store/{auth,ui}.ts` · `types/{agent,user,billing,index}.ts` · `app/globals.css` + `tailwind.config.ts` (design tokens)

**sentinel-contracts** — `contracts/src/{SentinelAgentRegistry,SentinelBond}.sol` + `interfaces/` · `scripts/deploy.ts` · `test/`
**sentinel-agent-templates** — `templates/{python,typescript}/*` · `fixtures/golden-tasks/*`
**sentinel-infra** — `docker/docker-compose*.yml` · `terraform/{modules,environments}/` · `helm/sentinel-*/` · `.github/workflows/`
**sentinel-docs** (standalone Next site) — `nav.json` · `docs/**/*.{md,mdx}` + `index.mdx`/`quickstart.mdx` (content) · `app/[[...slug]]/page.tsx` + `app/layout.tsx` · `lib/docs.ts` · `components/{mdx-components,DocsSidebar,DocsToc}.tsx` · `tailwind.config.ts`

---

> Last verified against code: 2026-06-14. When this drifts, fix it in the same commit as the code change
> and propagate to all 13 `docs/structure.md` copies.
