# Production Dockerfile for AI Political Poster Backend
FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build TypeScript
COPY . .
RUN npm run build

# Production Runner
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install fonts for SVG / Sharp rendering (Bangla & Latin glyphs)
RUN apt-get update && apt-get install -y --no-install-recommends \
    fonts-freefont-ttf \
    fonts-noto-cjk \
    fontconfig \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled files from builder
COPY --from=builder /app/dist ./dist

# Create uploads directory for local static fallback
RUN mkdir -p /app/uploads/posters

EXPOSE 5000

CMD ["node", "dist/index.js"]
