# ===========================================
# STS Frontend Dockerfile (Multi-stage)
# ===========================================

# ===========================================
# Base Stage
# ===========================================
FROM node:20-alpine AS base

WORKDIR /app

# ===========================================
# Dependencies Stage
# ===========================================
FROM base AS deps

# Copy package files
COPY frontend/package.json frontend/package-lock.json* ./

# Install dependencies
RUN npm ci

# ===========================================
# Development Stage
# ===========================================
FROM base AS development

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ .

ENV NODE_ENV=development \
    NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

# Development command with hot reload
CMD ["npm", "run", "dev"]

# ===========================================
# Builder Stage (for Production)
# ===========================================
FROM base AS builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ .

# Set environment for build
ENV NEXT_TELEMETRY_DISABLED=1

# Build arguments for environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Ensure public directory exists (even if empty)
RUN mkdir -p public

# Build the application
RUN npm run build

# ===========================================
# Production Stage
# ===========================================
FROM base AS production

WORKDIR /app

# Set production environment
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets (directory guaranteed to exist from builder)
COPY --from=builder /app/public ./public

# Copy built assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Production command
CMD ["node", "server.js"]
