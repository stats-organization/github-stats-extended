# syntax=docker/dockerfile:1

# ------------------------------------------------------------------------------
# github-stats-extended -- container image for self-hosting the backend.
#
# This image runs the backend as an HTTP server (apps/backend/express.js),
# so the cards can be served anywhere, not only on Vercel. The design keeps
# room for a future static-SVG generation mode (see the issue for context):
# additional entrypoints can be added as separate CMD targets without changing
# the build stages below.
# ------------------------------------------------------------------------------

ARG NODE_VERSION=24
ARG PNPM_VERSION=10.34.1

# ------------------------------------------------------------------------------
# Stage 1: base -- pin Node and enable pnpm via corepack.
# ------------------------------------------------------------------------------
FROM node:${NODE_VERSION}-slim AS base
ARG PNPM_VERSION
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /app

# ------------------------------------------------------------------------------
# Stage 2: build -- install the whole workspace and build the core package.
# The backend itself runs from source (.js), so only packages/core needs a
# compile step (tsc -> build/). A pnpm store cache mount speeds up rebuilds.
# ------------------------------------------------------------------------------
FROM base AS build

# Copy the manifests first so the dependency layer can be cached independently
# of source changes.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY turbo.json tsconfig.base.json tsconfig.json ./
COPY packages/core/package.json packages/core/
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/

# Full install (dev deps included) so turbo/tsc are available for the build.
# --frozen-lockfile keeps the image reproducible against the committed lockfile.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Bring in the sources and build the core package.
COPY . .
RUN pnpm run build:packages

# Produce a self-contained, production-only bundle for the backend. `pnpm deploy`
# resolves the `workspace:^` link to packages/core and copies everything the
# backend needs into /app/deploy, with no dev dependencies.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm --filter=@stats-organization/github-readme-stats-backend deploy \
    --prod --legacy /app/deploy

# ------------------------------------------------------------------------------
# Stage 3: runtime -- minimal image running the backend as a non-root user.
# ------------------------------------------------------------------------------
FROM node:${NODE_VERSION}-slim AS runtime
ENV NODE_ENV=production
# The server reads PORT (falling back to 9000). We default it to 9000 and expose
# that port; override at run time with -e PORT=... if needed.
ENV PORT=9000
WORKDIR /app

# node:*-slim already ships an unprivileged `node` user. Use it.
COPY --from=build --chown=node:node /app/deploy ./
USER node

EXPOSE 9000

# Lightweight liveness probe against the built-in status endpoint.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||9000)+'/api/status/up').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# HTTP-server mode. A future static-generation mode can be added as an
# alternative command (e.g. CMD ["node", "generate-svg.js"]).
CMD ["node", "express.js"]
