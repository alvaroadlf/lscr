# Dockerfile para Next.js 16 app
# Optimizado para despliegue en plataformas containerizadas (incluyendo Dokploy)

FROM node:20.9-alpine AS deps
WORKDIR /app

# git se usa para obtener el SHA en next.config si no viene por variable
RUN apk add --no-cache git

# Copiar el package lock primero permite cachear la instalación
COPY package.json package-lock.json ./
RUN npm ci --silent

FROM node:20.9-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20.9-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]
