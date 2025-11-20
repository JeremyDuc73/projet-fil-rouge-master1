# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:23-alpine AS deps

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc* ./
COPY apps/backend/package.json ./apps/backend/

# Install dependencies for backend workspace
RUN pnpm install --no-frozen-lockfile --filter backend...

# ============================================
# Stage 2: Production
# ============================================
FROM node:23-alpine AS runner

WORKDIR /app

# Install dumb-init (proper signal handling)
RUN apk add --no-cache dumb-init

# Create app user (security)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy node_modules from deps stage (pnpm workspace structure)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules

# Copy application code from backend folder
COPY --chown=nodejs:nodejs apps/backend/. ./apps/backend/

# Set working directory to backend app
WORKDIR /app/apps/backend

# Make entrypoint script executable (before switching to nodejs user)
RUN chown nodejs:nodejs scripts/docker-entrypoint.sh && chmod +x scripts/docker-entrypoint.sh

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application with entrypoint script
CMD ["sh", "scripts/docker-entrypoint.sh"]
