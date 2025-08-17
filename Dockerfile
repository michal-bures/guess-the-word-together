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

# Build shared package first
RUN cd packages/shared && bun run build

# Build frontend
RUN cd packages/frontend && bun run build

# Build backend
RUN cd packages/backend && bun run build

# Production stage - install only production dependencies
FROM base AS release
COPY package.json bun.lockb* ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/shared/package.json ./packages/shared/

# Install only production dependencies
RUN bun install --frozen-lockfile --production

# Copy built artifacts
COPY --from=build /usr/src/app/packages/backend/dist packages/backend/dist
COPY --from=build /usr/src/app/packages/frontend/dist packages/frontend/dist
COPY --from=build /usr/src/app/packages/shared/dist packages/shared/dist

# Copy runtime data files
COPY --from=build /usr/src/app/packages/backend/data packages/backend/data

# Create non-root user for security
USER bun

# Expose ports for API server and WebSocket server
EXPOSE 3001 1234

# Start the application from backend
WORKDIR /usr/src/app/packages/backend
ENTRYPOINT ["bun", "run", "dist/index.js"]