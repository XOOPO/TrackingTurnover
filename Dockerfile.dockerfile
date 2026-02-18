FROM node:18-slim

# Install Chromium & dependencies (WAJIB untuk Puppeteer)
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-liberation \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libnss3 \
  libxss1 \
  libasound2 \
  libxshmfence1 \
  libgbm1 \
  libgtk-3-0 \
  libx11-xcb1 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV CHROME_PATH=/usr/bin/chromium
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy all files
COPY . .

# Build frontend + backend
RUN pnpm build

# Start app
CMD ["pnpm", "start"]
