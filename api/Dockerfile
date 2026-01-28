# Build and run the Express API (TypeScript)
FROM node:20-alpine AS deps
WORKDIR /app
ARG DATABASE_URL="postgresql://local:local@localhost:5432/localdb"
ENV DATABASE_URL=$DATABASE_URL
COPY package*.json ./
COPY prisma ./prisma
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
ARG DATABASE_URL="postgresql://local:local@localhost:5432/localdb"
ENV DATABASE_URL=$DATABASE_URL
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi
EXPOSE 4000
CMD ["node", "dist/index.js"]
