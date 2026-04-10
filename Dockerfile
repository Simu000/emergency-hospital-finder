# Multi-stage build for MERN app (frontend + backend together)

# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /frontend

# Copy frontend package files from the Frontend folder
COPY Frontend/package*.json ./
COPY Frontend/package-lock.json* ./

# Install dependencies
RUN npm ci --omit=dev || npm install

# Copy all frontend source code
COPY Frontend/ ./

# Build the React app (Vite outputs to 'dist' folder)
RUN npm run build

# Stage 2: Backend with static frontend
FROM node:18-alpine
WORKDIR /app

# Copy backend files from Backend folder
COPY Backend/server.js Backend/package*.json ./

# Install backend dependencies
RUN npm ci --omit=dev || npm install

# Copy built frontend from stage 1 (Vite outputs to 'dist')
COPY --from=frontend-builder /frontend/dist ./public

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

CMD ["node", "server.js"]