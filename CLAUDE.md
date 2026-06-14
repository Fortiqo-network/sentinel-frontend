# sentinel-frontend — Developer Guide for Claude Code

> **Operating rules — highest priority, read first.** These override convenience and apply to every change in this repo:
> - **Data is sacred.** Never delete or edit existing records or tables. Corrections are new rows or status changes, never destructive. **Ask permission before deleting any table or data.**
> - **The database is always Postgres.** Never substitute SQLite or another engine, including in tests.
> - **Comments:** at most one line and only when genuinely needed — never comment uselessly. Prefer docstrings / JSDoc and keep them thorough and up to date.
> - **Commits:** a single concise line. **Never push without explicit permission.**
> - **Code:** clean, reusable, and good-smelling in every manner. Don't overengineer, don't invent requirements, make the smallest change that works, and recommend better approaches over the existing one.
> - **Always work from a plan and keep in mind what we are building** (this repo's `docs/` and the platform docs).


## Project overview

Next.js 15 App Router frontend for the Sentinel AI agent marketplace. Talks exclusively to `sentinel-gateway`
(never directly to internal services). Serves buyers, developers, and admins.

## Commands

```bash
bun install          # install dependencies
bun run dev          # dev server with Turbopack on http://localhost:3000
bun run build        # production build (standalone output)
bun run type-check   # tsc --noEmit — must be clean before merging
bun run lint         # eslint
bun run test         # vitest
bun run test:e2e     # playwright
bun run codegen      # generate types/ from sentinel-shared schemas
```

## App Router conventions

- **Server components by default.** Add `"use client"` only when you need:
  event handlers, browser APIs, React hooks (useState/useEffect), TanStack Query hooks, or Zustand.
- Page files export a single default function. Named exports are for `generateMetadata` and `generateStaticParams` only.
- Layout files wrap child pages — never put page-specific logic in a layout.
- Route groups `(auth)`, `(marketplace)` affect layout grouping, not URL paths.
- Dynamic params arrive as `Promise<{param: string}>` in Next.js 15 — always `await params`.

## TypeScript

- Strict mode + `noUncheckedIndexedAccess` — no `!` non-null assertions.
- Explicit return types on all exported functions: `React.JSX.Element`, `Promise<void>`, etc.
- No `any`. Use `unknown` + type guards or zod `.parse()`.
- Use `type` imports for type-only symbols: `import type { Foo } from "..."`.
- Zod schemas live alongside their API functions in `src/lib/api/`; TypeScript types in `src/types/`.

## Component conventions

- Named exports only for components (no default exports).
- JSDoc on every exported component with `@example`.
- Return type: `React.JSX.Element`.
- Props interface defined inline above the component.
- Use `cn()` from `@/lib/utils/cn` for all className merges — never string concatenation.
- `forwardRef` for form primitives (Input, Button) so react-hook-form works.

## API integration

- All gateway calls go through `src/lib/api/client.ts` (Axios, withCredentials).
- Never call the gateway directly from page/component files — use typed wrappers in `src/lib/api/`.
- Validate all responses with zod `.parse()` — never trust the gateway shape blindly.
- No tokens in localStorage. Auth is httpOnly cookie managed by the BFF.

## State management

- TanStack Query for server-fetched data (listings, billing, usage).
- Zustand for ephemeral UI state only (filters, sidebar, tabs).
- Never put sensitive data (tokens, PII beyond display name) in Zustand.

## Tailwind conventions

- Use Sentinel design tokens where available: `text-indigo-500`, `bg-slate-50`, etc.
- Extract recurring patterns to `@layer components` in `globals.css` only if used 5+ times.
- Do not write arbitrary CSS unless Tailwind cannot express it.
- Dark mode is not yet implemented — use light-mode tokens only.

## Security rules (non-negotiable)

- No `dangerouslySetInnerHTML` without DOMPurify sanitization — agent content is untrusted.
- No secrets in `NEXT_PUBLIC_*` env vars.
- No `localStorage`/`sessionStorage` for tokens.
- Card input must go through Stripe Elements — never handle card data ourselves.

## Adding a new page

1. Create the file in the appropriate route group.
2. Export `metadata` (Metadata object) for SEO.
3. The page function is `async` if it fetches data; sync otherwise.
4. Fetch data with typed API functions; pass to client components as props.
5. Add a link in the appropriate layout sidebar/nav.

## Adding a new API call

1. Add a zod schema in `src/lib/api/<domain>.ts`.
2. Add the typed function using `apiClient`.
3. Export the inferred TypeScript type if consumers need it.
4. Update `src/types/<domain>.ts` if the shape is new.

## Cinematic marketing layer

- The marketing experience (root `/`) lives in `src/components/marketing/` and is a **scoped dark surface** — it owns its own `void`/`aurora` tokens and white text. It does **not** flip the global theme; the light-mode app (dashboard, marketplace, auth) is unaffected. The "dark mode not yet implemented" note applies to the app shell, not this layer.
- Animation stack: Lenis (smooth scroll) ↔ GSAP/ScrollTrigger, Framer Motion (reveals, parallax, micro-interactions), React Three Fiber + drei + postprocessing (WebGL). All timing comes from `src/lib/design/motion.ts`.
- 3D mounts only via `marketing/three/SceneStage.tsx` (`next/dynamic`, `ssr:false`, in-view pausing, device quality tiers). Reduced motion is honoured at every layer.
- See `docs/frontend/implementation.md` for the full architecture and the skills/dependency reference.

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

### The system speaks in credits — never currency
- All user- and API-facing values are **credits** (short form **Cr**). Never display or return paise, rupees, dollars, or a currency symbol anywhere in the system.
- Conversion: **1 Cr = ₹1 = 100 paise** (current). 1 USD ≈ 95 Cr (whatever the live INR→USD rate is). The ledger may store the smallest unit internally, but every response, label, and copy string uses credits only.
- API contract fields use the `*Credits` suffix (`priceCredits`, `balanceCredits`, `costCredits`, `payableCredits`, `originalCredits`, `currentCredits`); ledger/invoice/top-up amounts use the `credits` key.


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
