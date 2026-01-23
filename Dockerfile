# ========================================
# Espaço Terapêutico Online - Dockerfile
# Deploy com SSL automático (Certbot)
# ========================================

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for Firebase configuration (opcional - já tem valores padrão no código)
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_APP_ID

# Set environment variables for build
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID

# Copy package files
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ========================================
# Production stage with Nginx
# ========================================
FROM nginx:alpine AS production

# Install certbot for SSL
RUN apk add --no-cache certbot certbot-nginx bash openssl

# Create directories for SSL
RUN mkdir -p /etc/letsencrypt /var/www/certbot

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose ports
EXPOSE 80
EXPOSE 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start with entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]
