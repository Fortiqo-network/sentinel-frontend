# ── Stage 1: deps ────────────────────────────────────────────────────────────
FROM oven/bun:1.3.10-alpine AS deps
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ── Stage 2: build ───────────────────────────────────────────────────────────
FROM oven/bun:1.3.10-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public

# Build args are baked into the client bundle at build time
ARG NEXT_PUBLIC_GATEWAY_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_OIDC_CLIENT_ID
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_FEATURE_FLAGS_URL
ARG NEXT_PUBLIC_MCP_BASE
# A Google OAuth *client ID* is public by design (it is embedded in the browser
# bundle; security comes from the Authorized-JavaScript-Origins allowlist in the
# Google Cloud console, not from secrecy). Defaulting it here means the "Continue
# with Google" button ships enabled even when the build pipeline passes no
# --build-arg; a --build-arg still overrides this for any other environment.
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=1021757860601-u7jca7e7epgtjo1543nor9uabofoi24c.apps.googleusercontent.com

ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID \
    NEXT_PUBLIC_GATEWAY_URL=$NEXT_PUBLIC_GATEWAY_URL \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_OIDC_CLIENT_ID=$NEXT_PUBLIC_OIDC_CLIENT_ID \
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY \
    NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN \
    NEXT_PUBLIC_POSTHOG_KEY=$NEXT_PUBLIC_POSTHOG_KEY \
    NEXT_PUBLIC_FEATURE_FLAGS_URL=$NEXT_PUBLIC_FEATURE_FLAGS_URL \
    NEXT_PUBLIC_MCP_BASE=$NEXT_PUBLIC_MCP_BASE \
    DOCKER_BUILD=true

RUN bun run build

# ── Stage 3: runner ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
