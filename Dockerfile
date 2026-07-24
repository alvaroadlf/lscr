# Dockerfile para Next.js 16 app
# Optimizado para despliegue en plataformas containerizadas (incluyendo Dokploy)

FROM node:22-alpine AS base

# Instalar pnpm globalmente con npm para evitar problemas de corepack en Node 20.9
RUN npm install -g pnpm@11.9.0

FROM base AS deps
WORKDIR /app

# git se usa para obtener el SHA en next.config si no viene por variable
RUN apk add --no-cache git

# Copiar los archivos de dependencias primero permite cachear la instalación
COPY package.json pnpm-lock.yaml ./
ENV PNPM_ALLOW_BUILD=sharp
RUN pnpm install --frozen-lockfile --prod=false

FROM base AS builder
WORKDIR /app
RUN apk add --no-cache git
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["pnpm", "start"]
