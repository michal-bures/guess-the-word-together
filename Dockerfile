# Unified Dockerfile - Build frontend and backend in single image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Install dependencies stage
FROM base AS install
# Copy all package.json files for workspace setup
COPY package.json bun.lockb* ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies for build stage
RUN bun install --frozen-lockfile

# Build stage - compile everything
FROM base AS build
COPY --from=install /usr/src/app/node_modules node_modules
COPY . .

# Build frontend (uses shared source files directly)
RUN cd packages/frontend && bun run build

# Build backend (uses shared source files directly via path mapping)
RUN cd packages/backend && bun run build

# Production stage - install only production dependencies
FROM base AS release
COPY package.json bun.lockb* ./
COPY packages/backend/package.json ./packages/backend/

# Install only production dependencies
RUN bun install --frozen-lockfile --production

# Copy built artifacts
COPY --from=build /usr/src/app/packages/backend/dist packages/backend/dist
COPY --from=build /usr/src/app/packages/frontend/dist packages/frontend/dist

# Copy runtime data files
COPY --from=build /usr/src/app/packages/backend/data packages/backend/data

# Create non-root user for security
USER bun

# Expose port for API server
EXPOSE 3001

# Start the application from backend
WORKDIR /usr/src/app/packages/backend
ENTRYPOINT ["bun", "run", "dist/index.js"]
