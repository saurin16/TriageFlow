FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install ALL dependencies including next
RUN pnpm install

# Copy rest of source
COPY . .

# Build Next.js
RUN pnpm run build

EXPOSE 8080

ENV PORT=8080
ENV NODE_ENV=production

CMD ["./node_modules/.bin/next", "start", "-p", "8080"]