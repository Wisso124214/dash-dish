# Build stage
FROM node:22-alpine AS builder

WORKDIR /build

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY source ./source

# Build TypeScript
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy only the built CLI from builder stage
COPY --from=builder /build/dist/cli.js ./dist/cli.js

# Copy any other necessary files (if needed)
COPY --from=builder /build/dist ./dist

# Keep container running for interactive terminal access
CMD ["tail", "-f", "/dev/null"]
