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

## Conventions

### Commits
- Use **Conventional Commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `perf:`, `build:`, `ci:` — optional scope, e.g. `fix(auth): reject expired tokens`.
- The message describes the change only. **Never** reference AI assistants, agents, or tooling, and never add `Co-Authored-By` or other attribution trailers.

### Code style
- **No inline comments.** Make intent obvious through precise names and small, single-purpose functions.
- Document with **docstrings** (Python) / **JSDoc** (TypeScript) on modules, classes, and public/exported functions only — explain *why*, not *what*.
- If a line feels like it needs a comment, rename or refactor until it doesn't.
