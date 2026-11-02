# --- Build stage ---

FROM node:24-slim AS build
RUN corepack enable
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/core/package.json packages/core/
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/

RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build:packages
RUN pnpm run build:frontend

# --- Production stage ---

FROM node:24-slim
RUN corepack enable
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/core/package.json packages/core/
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/

RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=build /app/packages/core/build/ packages/core/build/
COPY --chown=node:node --from=build /app/apps/frontend/build/ apps/frontend/build/
COPY apps/backend/ apps/backend/

USER node
ENV NODE_ENV=production
ENV PORT=80
EXPOSE 80
HEALTHCHECK CMD node -e "fetch('http://localhost:80/api/status/up').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"

ENTRYPOINT ["apps/backend/docker-entrypoint.sh"]
CMD ["node", "apps/backend/express.js"]
