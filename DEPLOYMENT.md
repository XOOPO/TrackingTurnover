# Deployment Guide

Panduan lengkap untuk deploy aplikasi Turnover Tracker ke production.

## 🚀 Metode Deployment

### 1. Docker Deployment (Recommended)

#### Build Docker Image
```bash
docker build -t turnover-tracker .
```

#### Run dengan Docker
```bash
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name turnover-tracker \
  turnover-tracker
```

#### Atau menggunakan Docker Compose
```bash
docker-compose up -d
```

### 2. Manual Deployment

#### Step 1: Build Application
```bash
pnpm install
pnpm build
```

#### Step 2: Setup Environment Variables
Pastikan file `.env` sudah dikonfigurasi dengan benar:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:port/database
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
JWT_SECRET=your_jwt_secret_min_32_chars
OWNER_OPEN_ID=your_google_id
```

#### Step 3: Setup Database
```bash
pnpm db:push
```

#### Step 4: Start Server
```bash
pnpm start
```

### 3. Railway Deployment

1. **Connect Repository** ke Railway
2. **Add Environment Variables** di Railway dashboard:
   - `DATABASE_URL`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `JWT_SECRET`
   - `OWNER_OPEN_ID`
   - `NODE_ENV=production`
   - `PORT` (Railway akan set otomatis)

3. **Build Command**: `pnpm build`
4. **Start Command**: `pnpm start`

5. **Add PostgreSQL Service** di Railway dan gunakan connection string sebagai `DATABASE_URL`

### 4. Vercel/Render/Platform Lain

Untuk platform yang tidak support long-running processes (seperti Vercel), Anda perlu:
- Deploy backend ke platform yang support Node.js (Railway, Render, Heroku)
- Deploy frontend ke Vercel/Netlify (jika memisahkan)

## 🔧 Troubleshooting

### Error: "Could not find the build directory"
**Solusi**: Pastikan sudah menjalankan `pnpm build` sebelum `pnpm start`

### Error: "Chrome/Chromium not found"
**Solusi**: 
- Untuk Docker: Sudah di-handle di Dockerfile
- Untuk manual: Install Chromium di sistem:
  ```bash
  # Ubuntu/Debian
  sudo apt-get install chromium-browser
  
  # Set environment variable
  export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
  ```

### Error: Database connection failed
**Solusi**: 
- Verify `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- Check database server accessibility
- Run `pnpm db:push` untuk sync schema

### Error: Google OAuth redirect_uri_mismatch
**Solusi**: 
- Tambahkan production URL ke Google Cloud Console:
  - Authorized JavaScript origins: `https://yourdomain.com`
  - Authorized redirect URIs: `https://yourdomain.com/api/oauth/callback`

## 📋 Pre-Deployment Checklist

- [ ] Environment variables sudah dikonfigurasi
- [ ] Database schema sudah di-push (`pnpm db:push`)
- [ ] Build berhasil tanpa error (`pnpm build`)
- [ ] Google OAuth redirect URIs sudah di-update untuk production
- [ ] Database connection string sudah benar
- [ ] Port sudah dikonfigurasi (default: 3000)
- [ ] Chromium/Puppeteer sudah terinstall (untuk scraper)

## 🔒 Security Checklist

- [ ] JWT_SECRET menggunakan random string minimal 32 karakter
- [ ] Environment variables tidak di-commit ke git
- [ ] HTTPS enabled di production
- [ ] CORS dikonfigurasi dengan benar
- [ ] Database credentials aman

## 📝 Notes

- Aplikasi ini memerlukan Chromium untuk web scraping
- Pastikan platform deployment support long-running processes
- Database harus accessible dari server deployment
- Google OAuth harus dikonfigurasi dengan production URLs

