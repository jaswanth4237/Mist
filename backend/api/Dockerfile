# ──────────────────────────────────────────────
# Stage 1 – build (install deps + generate Prisma client)
# ──────────────────────────────────────────────
FROM node:20-slim AS builder

# Prisma needs OpenSSL at both build and runtime on Debian-based images
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy ALL package manifests so npm knows about every workspace
COPY package.json ./package.json
COPY backend/api/package.json ./backend/api/package.json
COPY backend/shared/package.json ./backend/shared/package.json

# Fresh install – resolves Linux-native optional binaries (Prisma engines, etc.)
RUN npm install --workspaces --include-workspace-root

# Copy the full source tree
COPY . .

# Generate Prisma client for the linux-x64-openssl-3.0.x binary target
RUN npx --prefix backend/api prisma generate --schema=backend/api/prisma/schema.prisma

# ──────────────────────────────────────────────
# Stage 2 – runtime (lean image)
# ──────────────────────────────────────────────
FROM node:20-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Only copy what the server needs at runtime
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/api ./backend/api
COPY --from=builder /app/backend/shared ./backend/shared
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Use `migrate deploy` (non-interactive, safe for containers) then start the API
CMD ["sh", "-c", "npx --prefix backend/api prisma db push --schema=backend/api/prisma/schema.prisma --accept-data-loss && npm run dev --workspace=backend/api"]
