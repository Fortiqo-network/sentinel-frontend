# sentinel-frontend — Developer Guide for Codex

## Engineering Standards (read before writing any code)

These standards are binding. They exist so that AI-assisted changes are correct, minimal, and never break a running system.

### Non-negotiable: no breakage
- **No system breakage is ever acceptable.** Every change must leave the service buildable and its tests green. Before considering any task done, run the repo's checks (`tsc --noEmit` typecheck, lint, and the relevant tests) and confirm they pass.
- Prefer the smallest change that fully solves the problem. Do not refactor unrelated code, rename things, or "improve" style in files you were not asked to touch.
- When a change alters existing behavior that tests assert, update those tests to the new intended contract in the same change — never leave the suite red.
- If you are unsure, confused, or lack the context to make a safe change, STOP and ask the user rather than guessing. A blocked question is cheaper than a broken system. When you stop, record what is blocked and why in the relevant `*-todo.md` board.

### Code quality
- Write reusable, DRY code: factor shared logic into functions/modules; do not copy-paste. Reuse existing helpers before adding new ones.
- Match the surrounding code's style, naming, and idioms. New code should read like the code already there.
- Keep functions focused and small; validate inputs at boundaries; fail closed on security-relevant paths.

### Comments and documentation
- **Prefer JSDoc/TSDoc over inline comments.** Every public function/class/module gets a JSDoc/TSDoc block explaining what it does, its contract, and non-obvious behavior. Rationale for *why* code is written a certain way belongs in the JSDoc/TSDoc.
- **Inline comments are only permitted as genuine "come back later" markers** — e.g. a temporary workaround, a dependency to be removed once an upstream fix lands, or a known follow-up. Such a comment must state the condition for its own removal.
- **Once the reason is resolved, remove the comment.** Do not leave explanatory or narrating inline comments ("increment counter", "call the API") — the code and JSDoc/TSDoc must speak for themselves.

### Commits
- Use Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`). Scope where useful, e.g. `fix(security): ...`.
- Never include AI/assistant attribution or co-author trailers in commit messages.
- Commit logically-scoped units of work; do not push unless explicitly asked.

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
- Every change updates its docs **in the same commit**: this `AGENTS.md`/`AGENT.md`, the relevant README/`docs/`, and the **central TODO board** at `sentinal-core-api/master-doc/` (this module's `*-todo.md` plus `platform-todo.md`). Tick completed items (`[ ]`→`[x]`) — **never delete a line**; add TODOs for follow-ups discovered. Never leave docs describing behaviour the code no longer has.
- **Each module follows its own implementation doc.** As planning moves, update that module's `docs/implementation.md` / `docs/architecture.md` / roadmap and the central TODO in the **same commit**, so plans and docs stay in lockstep with the code — every module owns and follows its own implementation.

### The system speaks in credits — never currency
- All user- and API-facing values are **credits** (short form **Cr**). Never display or return paise, rupees, dollars, or a currency symbol anywhere in the system.
- Conversion: **1 USD = 100 credits** (current). 1 USD = 100 credits (fixed peg). The ledger may store the smallest unit internally, but every response, label, and copy string uses credits only.
- API contract fields use the `*Credits` suffix (`priceCredits`, `balanceCredits`, `costCredits`, `payableCredits`, `originalCredits`, `currentCredits`); ledger/invoice/top-up amounts use the `credits` key.

## Security & architecture references

- **Security & critical flags:** `sentinel-core-api/master-doc/security-todo.md` (severity-ranked, with file:line). Check it before touching auth, money, or proxy paths; tick items when fixed, never remove.
- **Repo relationship map:** `sentinel-core-api/master-doc/architecture-map.md` (who calls whom, money/trust data-flow, the billing trust-boundary note).
- Swagger `/docs` + `/redoc` are intentionally **kept exposed for now** — do not disable without owner sign-off.
---

## Cross-repo reference — where to look (all repos are linked)

This repo is one of the Sentinel platform's repositories. The **single source of truth** for cross-repo
planning lives in `sentinel-core-api/master-doc/`. Any assistant working in *any* repo should start there:

- **`build-sequence.md` — START HERE.** The canonical, dependency-ordered build plan (phases 0–9): what to
  build first so the next thing is unblocked. Decide *order* here before picking work.
- **`platform-todo.md`** — the master backlog across all repos, grouped by theme (completed, pending-from-specs,
  security, must-have, discovery, reach). Tick items here when done.
- **`<module>-todo.md`** — this repo's own board (detail + status), mirrored from the master board.
- **`architecture-map.md`** — who calls whom (cross-repo edges, money/trust data-flow, trust boundaries).
- **`security-todo.md`** — severity-ranked security flags (file:line + fixes).

Each repo also owns its `docs/` (scope, implementation, architecture). **When changing anything — code or
markdown — update the matching `docs/` and the relevant `master-doc/*-todo.md` in the SAME commit** (never
delete a TODO line; tick `[ ]`→`[x]`). To find what to change: read `build-sequence.md` top-to-bottom, pick the
lowest unfinished phase whose gates aren't all ticked, then follow `architecture-map.md` to the owning repo
and file.

---

## structure.md — read first, keep current (non-negotiable)

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

## TODO board — update after every task (master-doc only)

All TODOs live **only** in `sentinel-core-api/master-doc/`. There is already **one file per repo**
(`core-api-todo.md`, `frontend-todo.md`, `gateway-todo.md`, `billing-todo.md`, `verify-todo.md`, …)
plus `platform-todo.md` and `security-todo.md`. **Never create a new TODO/status file anywhere** (no
per-repo `docs/TODO.md`, no `status-report.md`) — use the existing file for the matching repo.

After **every** task, in the same commit, update the relevant board to mirror reality:
- **What we did** → tick `[ ]`→`[x]` (or `[~]` for partial).
- **What's pending** → add/keep `[ ]` items.
- **What's listed/deferred** → keep the roadmap items.

**Never delete a line** — tick or append only. Frontend work → `frontend-todo.md`; security → `security-todo.md`; cross-repo → `platform-todo.md`.

---

## DB schema change → migration BEFORE push (non-negotiable)

If a change touches the database schema — any new/changed/removed table, column,
index, or constraint, or any new ORM model/field — you MUST ship a matching
**Alembic migration in the same commit, and it must be applied before/at deploy.
Never push a model change without its migration.** Deployed code that runs ahead
of the DB schema 500s every query that hits the changed table (this has bitten us).

- Write an **idempotent** migration (`ADD COLUMN IF NOT EXISTS`, `CREATE TABLE IF
  NOT EXISTS`, …) chained to the current head (`down_revision`).
- Update the ORM model, `docs/structure.md`, and the `master-doc/*-todo.md` in the
  same commit.
- Verify it applies cleanly: `make migrate` / `alembic upgrade head` (or `alembic
  current` to check the revision).
- Backend services run `alembic upgrade head` on container start and the deploy
  runs an API smoke test — that is a safety net, **not** a substitute for shipping
  the migration.
- No-database repos (frontend, docs, infra, contracts, sdk, shared,
  agent-templates): still applies to any cross-repo schema/contract change — land
  the owning service's migration first.

---

## Docs framework — standalone markdown site at docs.fortiqo.xyz (2026-06-15)

Platform documentation is **markdown-first** and lives in **sentinel-docs**, which is a
self-contained Next.js app that renders its own markdown. It is published as a **standalone
site at https://docs.fortiqo.xyz** (its own Vercel project + Cloudflare DNS) — NOT inside
sentinel-frontend.

- **Mintlify is removed.** Do NOT reintroduce `docs.json`/Mintlify. sentinel-docs ships
  markdown (`.md`/`.mdx`) + a `nav.json` manifest, rendered by its own `app/` renderer.
- **Adding/editing a doc page:** add the `.md`/`.mdx` under sentinel-docs and list its slug in
  `nav.json`; the site renders it automatically on the next build.
- `sentinel.fortiqo.xyz/docs` redirects to `docs.fortiqo.xyz`.
- Track docs work in `master-doc/docs-todo.md` (tick/append only — never delete a line).
- **Keep docs honest & current (mandatory):** when you ship or push a feature, update the matching pages in **sentinel-docs** in the same change. Docs must reflect the **real** current state — never claim unbuilt or stubbed features as live (no bluff, no faking). Anything not yet built goes under **Progress & roadmap** as in-scope/planned. Periodically reconcile docs against `docs/structure.md` §9 (real-vs-stubbed) and keep the roadmap's Live / Rolling out / Planned sections accurate.

---

## Recommend before implementing (always)

Do **not** assume a requested change is the correct or best approach, and do not treat the
user's framing as ground truth. For every change request:

1. Evaluate the underlying goal and the request critically.
2. Find the most relevant, robust, well-architected way to achieve that goal — including a
   better alternative or a simpler/safer path if one exists.
3. **State your recommendation** concisely (what you'd do and why, and where it differs from the
   literal ask), then implement the best option. If it's a one-way door or materially changes
   scope, confirm first; otherwise proceed with the recommended approach and note the deviation.

Never blindly implement. Prefer the better-engineered solution over a literal transcription of
the request.

> **And: whatever changes — always update the TODO board** in `sentinel-core-api/master-doc/`
> in the same change. Treat it as a **dated timeline of activity**: append a dated entry for what
> was done, tick completed items, add any new task discovered, and mark in-progress work. Never
> delete a line. No change ships without its TODO update — the board must always reflect reality
> and the history of what happened.
