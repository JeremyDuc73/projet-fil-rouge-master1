# apps/frontend/Dockerfile

# Stage 1: Dependencies
FROM node:23-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/frontend/package.json ./apps/frontend/
# On installe sans le frozen-lockfile comme vu précédemment
RUN pnpm install --no-frozen-lockfile --filter frontend...

# Stage 2: Builder
FROM node:23-alpine AS builder
WORKDIR /app

# ✅ AJOUTER CETTE LIGNE POUR RENDRE PNPM DISPONIBLE ICI AUSSI
RUN corepack enable && corepack prepare pnpm@latest --activate

# 1. On copie les node_modules
COPY --from=deps /app/node_modules ./node_modules

# 2. On copie le code source
COPY . .

# 3. Maintenant pnpm est connu, ceci va fonctionner
RUN pnpm --filter frontend build

# Stage 3: Production
FROM node:23-alpine AS runner
WORKDIR /app

# Copie des fichiers nécessaires pour le runtime
COPY --from=builder /app/apps/frontend/.output ./
# Optionnel : si vous avez besoin de fichiers statiques spécifiques ou de package.json
# COPY --from=builder /app/apps/frontend/package.json ./

ENV NUXT_HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

# Lancement du serveur Nuxt
CMD ["node", "server/index.mjs"]