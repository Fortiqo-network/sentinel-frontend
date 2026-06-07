# sentinel-frontend — Deployment

## Local development

```bash
bun install
cp .env.example .env.local   # fill in values
bun run dev                  # http://localhost:3000 (Turbopack)
```

## Production build

```bash
bun run build
bun run start
```

The build uses `output: "standalone"` in next.config.ts, producing a self-contained
`.next/standalone/` directory suitable for Docker.

## Docker

```dockerfile
FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json bun.lockb* ./
RUN npm install -g bun && bun install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* must be provided at build time
ARG NEXT_PUBLIC_GATEWAY_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_GATEWAY_URL=$NEXT_PUBLIC_GATEWAY_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
RUN bun run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
# Runtime-only secrets (never in NEXT_PUBLIC_*)
# These are injected by the platform at runtime, not baked into the image.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

## Environment variables

### Build-time (`NEXT_PUBLIC_*` — baked into client bundle)

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_GATEWAY_URL` | Yes | Gateway base URL |
| `NEXT_PUBLIC_APP_URL` | Yes | Self URL for OIDC redirects |
| `NEXT_PUBLIC_OIDC_CLIENT_ID` | Yes | PKCE client ID |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe.js |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Error monitoring |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | Product analytics |
| `NEXT_PUBLIC_MCP_BASE` | No | MCP base URL in connect panel |

### Runtime-only (server-only, never exposed to browser)

| Variable | Required | Purpose |
|---|---|---|
| `OIDC_ISSUER` | Yes | OIDC issuer for BFF token exchange |
| `OIDC_CLIENT_SECRET` | Yes | Confidential client secret |
| `SESSION_SECRET` | Yes | Cookie/session signing (32+ bytes) |

## Helm / Kubernetes

Deployed via the `frontend` Helm chart in `sentinel-infra`. Key values:

```yaml
image:
  repository: ghcr.io/fortiqo/sentinel-frontend
  tag: "0.1.0"
replicaCount: 2
resources:
  requests:
    cpu: 250m
    memory: 512Mi
  limits:
    cpu: 1000m
    memory: 1Gi
```

Runtime env vars are injected from the platform secret store (never baked into the image).

## CDN / edge

Place Cloudflare (or equivalent) in front of SSR pods:
- Cache static assets (`/_next/static/`) at edge with long TTLs.
- Pass-through all SSR and API routes.
- Enable HTTP/2 push for critical CSS/JS.

## CI checks (must all pass before merge)

1. `bun run type-check` — zero TypeScript errors
2. `bun run lint` — zero ESLint errors
3. `bun run test` — all Vitest tests pass
4. `bun run build` — production build succeeds
5. Playwright smoke (`bun run test:e2e`) — golden flows pass
