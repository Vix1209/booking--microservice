# Multi-stage build for Node.js application
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Build the applications
RUN npm run build

# Production image, copy all the files and run the application
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built applications
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Copy configuration files
COPY --from=builder --chown=nestjs:nodejs /app/config ./config
COPY --from=builder --chown=nestjs:nodejs /app/decorators ./decorators
COPY --from=builder --chown=nestjs:nodejs /app/types ./types
COPY --from=builder --chown=nestjs:nodejs /app/utils ./utils

USER nestjs

EXPOSE 5000 5001 3001

# Default command runs both applications
CMD ["npm", "run", "start:prod"]