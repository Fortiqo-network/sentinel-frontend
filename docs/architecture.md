# sentinel-frontend — Architecture

## App Router structure

```
src/app/
├── layout.tsx                    # Root layout: fonts, metadata, QueryProvider
├── page.tsx                      # Marketplace home (hero + featured agents)
├── globals.css                   # Tailwind + CSS design tokens
│
├── (auth)/                       # Auth route group — centred card layout
│   ├── layout.tsx
│   ├── login/page.tsx
│   └── register/page.tsx
│
├── (marketplace)/                # Public pages — header + footer layout
│   ├── layout.tsx
│   ├── agents/page.tsx           # Agent discovery grid
│   └── agents/[agentId]/page.tsx # Agent detail + verification report
│
├── dashboard/                    # Buyer dashboard — header + sidebar layout
│   ├── layout.tsx
│   ├── page.tsx
│   ├── usage/page.tsx
│   ├── billing/page.tsx
│   └── api-keys/page.tsx
│
├── developer/                    # Developer portal — header + sidebar layout
│   ├── layout.tsx
│   ├── page.tsx
│   ├── agents/page.tsx
│   ├── agents/new/page.tsx
│   └── earnings/page.tsx
│
└── playground/page.tsx           # No-code agent playground
```

## Rendering strategy

- **Marketplace pages** (`/agents`, `/agents/[id]`): server-rendered (RSC) for SEO.
  Cache strategy: `force-dynamic` for now; switch to ISR with `revalidate = 60` once
  gateway /v1/listings supports ETag.
- **Dashboard/developer pages**: server shell + client data fetching via TanStack Query.
  Auth gating via BFF cookie check in layout (redirect to /login if no session).
- **Auth pages**: server shell + client form components.
- **Playground**: server metadata + client component for conversation state.

## State management

| Concern | Tool | Notes |
|---|---|---|
| Server data (listings, usage, billing) | TanStack Query | Keyed by route params; cached 60s |
| Ephemeral UI (filters, sidebar, tabs) | Zustand (useUIStore) | Not persisted |
| Auth identity | Zustand (useAuthStore) | Populated on mount from /v1/auth/me |
| Forms | react-hook-form + zod | Schemas mirror sentinel-shared |

## API integration

All gateway calls go through `src/lib/api/client.ts` (Axios instance):
- Injects `X-Trace-Id` header for distributed tracing
- Credentials sent via httpOnly cookies (`withCredentials: true`)
- 401 → redirect to /login (session expired)
- 429 → surface Retry-After in error boundary

Typed API wrappers in `src/lib/api/`:
- `agents.ts` — listings CRUD
- `billing.ts` — credits, ledger, invoices
- `auth.ts` — login, register, logout, me

Response shapes validated with zod schemas that mirror `sentinel-shared`.

## Security model

- No tokens in localStorage or React state — only httpOnly cookies (BFF-managed).
- Role checks (buyer/developer/admin) are cosmetic UI gating; gateway enforces.
- Agent-authored content (descriptions, READMEs) treated as untrusted — sanitize
  with DOMPurify before setting innerHTML (never use dangerouslySetInnerHTML raw).
- CSP set in next.config.ts headers; tighten in middleware for sensitive routes.
- Card data goes to Stripe Elements — Sentinel servers never receive card numbers.

## Component conventions

- Server components by default. Add `"use client"` only for:
  - Event handlers (onClick, onChange, form submit)
  - Browser APIs (window, localStorage — avoid localStorage for tokens)
  - Hooks (useState, useEffect, useContext)
  - TanStack Query hooks
  - Zustand store reads
- No barrel `index.ts` files — import from the exact file.
- Co-locate component styles with Tailwind; extract to `globals.css` @layer components
  only for patterns used 5+ times.
