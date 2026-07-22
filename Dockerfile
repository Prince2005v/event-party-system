# Production Dockerfile for Eventify-Planner
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source files
COPY . .

# Build Vite client and esbuild server
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy package definitions and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built distribution assets from builder stage
COPY --from=builder /app/dist ./dist

# Expose server port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
