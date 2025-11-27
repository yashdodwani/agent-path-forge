# Multi-stage Dockerfile for building and serving the Vite + React app
# Build stage
FROM node:20-alpine AS builder

# Allow passing VITE_API_BASE_URL at build time. Default to the deployed backend URL so
# both local builds and Docker builds target the correct backend unless overridden.
ARG VITE_API_BASE_URL=https://edupath-jmx6.onrender.com/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

WORKDIR /app

# Install dependencies (copy package files first for better caching)
COPY package.json package-lock.json ./
RUN npm ci --only=production=false --silent && npm cache clean --force

# Copy rest of the project and build
COPY . .
RUN npm run build

# Production stage: nginx to serve static files
FROM nginx:stable-alpine

# Remove default nginx content and copy built files
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 (matches your Vite server port used in development)
EXPOSE 8080

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
