# Multi-stage build for MERN app (frontend + backend together)

# Stage 1: Build React frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /frontend

# Copy frontend package files from the Frontend folder
COPY Frontend/package*.json ./
COPY Frontend/package-lock.json* ./

# Install dependencies
RUN npm install

# Copy all frontend source code
COPY Frontend/ ./

# Build the React app (Vite outputs to 'dist' folder)
RUN npm run build

# Stage 2: Backend with static frontend
FROM node:22-alpine
WORKDIR /app

# Copy backend files from Backend folder
COPY Backend/package*.json ./
COPY Backend/ ./

# Install backend dependencies
RUN npm install

# Copy built frontend from stage 1
COPY --from=frontend-builder /frontend/dist ./public

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

CMD ["node", "server.js"]# Multi-stage build for MERN app (frontend + backend together)

# Stage 1: Build React frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /frontend

# Copy frontend package files from the Frontend folder
COPY Frontend/package*.json ./
COPY Frontend/package-lock.json* ./

# Install dependencies
RUN npm install

# Copy all frontend source code
COPY Frontend/ ./

# Build the React app (Vite outputs to 'dist' folder)
RUN npm run build

# Stage 2: Backend with static frontend
FROM node:22-alpine
WORKDIR /app

# Copy backend files from Backend folder
COPY Backend/package*.json ./
COPY Backend/ ./

# Install backend dependencies
RUN npm install

# Copy built frontend from stage 1
COPY --from=frontend-builder /frontend/dist ./public

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

CMD ["node", "server.js"]