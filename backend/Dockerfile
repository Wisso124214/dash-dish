
# Node backend Dockerfile for `backend_deliveries`
# Builds a small production image for the Node.js TypeScript server located in ./backend

FROM node:22-alpine

WORKDIR /app

# Install dependencies (use package-lock if present)
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci --production

# Copy source
COPY . .

# Set environment
ENV NODE_ENV=production

# Backend listens on 8000 by convention
EXPOSE 8000

# Default command - use tsx to run TypeScript directly
CMD ["npx", "tsx", "server.ts"]

