
FROM node:18-alpine AS deps


WORKDIR /app


COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install


FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .


RUN npm run build


FROM node:18-alpine AS runner


ENV NODE_ENV production

WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json


EXPOSE 3000


CMD ["npm", "start"]
