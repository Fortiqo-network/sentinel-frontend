# sentinel-frontend — Developer Guide for Claude Code

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
