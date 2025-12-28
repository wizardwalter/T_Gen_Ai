# Build and serve the Next.js UI
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_BASE
ARG NEXTAUTH_URL
ARG NEXT_PUBLIC_ICON_BASE
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXT_PUBLIC_ICON_BASE=$NEXT_PUBLIC_ICON_BASE
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ARG NEXT_PUBLIC_API_BASE
ARG NEXTAUTH_URL
ARG NEXT_PUBLIC_ICON_BASE
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXT_PUBLIC_ICON_BASE=$NEXT_PUBLIC_ICON_BASE
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "run", "start"]
