# ──────────────────────────────────────────────
# Single-stage dev image for the React/Vite frontend
# node:20-slim (Debian/glibc) so @rollup/rollup-linux-x64-gnu is resolved correctly
# ──────────────────────────────────────────────
FROM node:20-slim

WORKDIR /app

# Copy ALL package manifests so npm knows about every workspace
COPY package.json ./package.json
COPY frontend/web/package.json ./frontend/web/package.json
COPY backend/shared/package.json ./backend/shared/package.json

# Fresh install inside the Linux container so platform-specific
# optional binaries (Rollup, esbuild, etc.) are picked for linux-x64-gnu
RUN npm install --workspaces --include-workspace-root

# Copy the full source tree
COPY . .

# Change into the web workspace directory
WORKDIR /app/frontend/web

EXPOSE 5173

# Start Vite dev server bound to all interfaces so Docker port-mapping works
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "5173"]
