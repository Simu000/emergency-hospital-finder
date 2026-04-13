# Multi-stage build for MERN app

# Stage 1: Build React frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /frontend

# Copy frontend files
COPY Frontend/package*.json Frontend/
COPY Frontend/package-lock.json* Frontend/
WORKDIR /frontend
RUN npm install

# Copy all frontend source
COPY Frontend/ .
RUN npm run build

# Stage 2: Backend with static frontend
FROM node:22-alpine
WORKDIR /app

# Copy backend files
COPY Backend/package*.json ./
RUN npm install

COPY Backend/ ./

# Copy built frontend from stage 1
COPY --from=frontend-builder /frontend/dist ./public

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

CMD ["node", "server.js"]