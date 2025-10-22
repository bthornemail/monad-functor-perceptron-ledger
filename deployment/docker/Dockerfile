# Multi-stage build for Geometric Consensus Protocol
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/
COPY SPECIFICATION/ ./SPECIFICATION/

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create app user
RUN addgroup -g 1000 -S appgroup && \
    adduser -u 1000 -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    tini

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copy configuration files
COPY deployment/docker/config/ ./config/

# Create necessary directories
RUN mkdir -p /app/logs /app/data /app/tmp && \
    chown -R appuser:appgroup /app

# Set environment variables
ENV NODE_ENV=production
ENV LOG_LEVEL=info
ENV BIND_ADDRESS=0.0.0.0
ENV HTTP_PORT=8080
ENV CONSENSUS_PORT=9090
ENV P2P_PORT=9091
ENV MAX_STEPS=14
ENV CONSENSUS_TYPE=TETRAHEDRON
ENV METRICS_ENABLED=true
ENV HEALTH_CHECK_ENABLED=true

# Expose ports
EXPOSE 8080 9090 9091

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/health/ready || exit 1

# Switch to non-root user
USER appuser

# Use tini as init system
ENTRYPOINT ["tini", "--"]

# Start the application
CMD ["node", "dist/index.js"]

# Labels for metadata
LABEL maintainer="Geometric Consensus Protocol Team"
LABEL version="1.0.0"
LABEL description="Geometric Consensus Protocol using Universal Quadratic Forms"
LABEL org.opencontainers.image.title="Geometric Consensus Protocol"
LABEL org.opencontainers.image.description="RFC XXXX Implementation"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.authors="consensus-team@example.com"
LABEL org.opencontainers.image.url="https://github.com/example/geometric-consensus"
LABEL org.opencontainers.image.source="https://github.com/example/geometric-consensus"
LABEL org.opencontainers.image.licenses="MIT"
