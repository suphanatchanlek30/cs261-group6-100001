# Install deps
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# ค่านิเวศน์ฝั่ง build ถ้าจำเป็น Next จะอ่าน .env* ด้วย
RUN npm run build

# Run (production)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# ติดตั้งเฉพาะ prod deps
COPY package*.json ./
RUN npm ci --omit=dev
# นำไฟล์จำเป็นของ Next มา
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.mjs ./next.config.mjs
COPY --from=build /app/package*.json ./
EXPOSE 3000
CMD ["npm","run","start"]
