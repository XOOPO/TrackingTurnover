# Railway Deployment Guide

Panduan lengkap untuk deploy aplikasi Turnover Tracker ke Railway.

## 🚀 Setup di Railway

### Step 1: Create New Project
1. Login ke [Railway](https://railway.app)
2. Klik **"New Project"**
3. Pilih **"Deploy from GitHub repo"** (atau Git provider lainnya)
4. Pilih repository `turnover-tracker-postgres-google`

### Step 2: Add PostgreSQL Database
1. Di project dashboard, klik **"+ New"**
2. Pilih **"Database"** → **"Add PostgreSQL"**
3. Railway akan otomatis membuat database dan set `DATABASE_URL` environment variable

### Step 3: Configure Environment Variables
Klik tab **"Variables"** dan tambahkan:

#### Required Variables:
- ✅ **DATABASE_URL** - Otomatis dibuat oleh Railway (jika sudah add PostgreSQL)
- ✅ **GOOGLE_CLIENT_ID** - Dari Google Cloud Console
- ✅ **GOOGLE_CLIENT_SECRET** - Dari Google Cloud Console  
- ✅ **JWT_SECRET** - Generate dengan: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- ✅ **NODE_ENV** - Set ke `production`

#### Optional Variables:
- ⚠️ **OWNER_OPEN_ID** - Google ID untuk admin access (tambahkan setelah login pertama)

### Step 4: Configure Build Settings
Di tab **"Settings"** → **"Build & Deploy"**:

- **Build Command**: `pnpm build`
- **Start Command**: `pnpm start`
- **Root Directory**: (kosongkan atau set ke root project)

**⚠️ PENTING**: Jangan set build command ke `pnpm db:push` atau `pnpm install && pnpm db:push` karena:
- Database belum accessible saat build time
- Migration akan otomatis dijalankan saat startup (runtime)

### Step 5: Deploy
1. Railway akan otomatis deploy setelah push ke GitHub
2. Atau klik **"Deploy"** manual di dashboard
3. Tunggu build selesai
4. Cek logs untuk memastikan migration berhasil

## 🔍 Troubleshooting

### Error: "ECONNREFUSED" saat build
**Penyebab**: Migration dijalankan saat build time  
**Solusi**: 
- Pastikan build command hanya `pnpm build`
- Migration akan otomatis run saat startup (lihat `server/_core/index.ts`)

### Error: "relation 'users' does not exist"
**Penyebab**: Migration belum dijalankan  
**Solusi**: 
- Cek logs saat startup, migration harus otomatis run
- Jika gagal, pastikan `DATABASE_URL` benar
- Manual run: Connect ke Railway shell dan jalankan `pnpm db:push`

### Error: "Could not find the build directory"
**Penyebab**: Build output tidak ditemukan  
**Solusi**: 
- Pastikan build command: `pnpm build`
- Cek apakah `dist` folder terbuat setelah build

### Migration tidak jalan otomatis
**Solusi**: 
- Pastikan `NODE_ENV=production`
- Cek logs saat startup untuk melihat error migration
- Migration code ada di `server/_core/migrate.ts`

## 📋 Checklist Deployment

- [ ] PostgreSQL database sudah di-add di Railway
- [ ] Environment variables sudah dikonfigurasi (lihat Step 3)
- [ ] Build command: `pnpm build` (BUKAN `pnpm db:push`)
- [ ] Start command: `pnpm start`
- [ ] Google OAuth redirect URI sudah di-update untuk production URL
- [ ] Deploy berhasil dan migration run otomatis
- [ ] Test login dengan Google OAuth

## 🔄 Update Google OAuth Redirect URI

Setelah deploy, tambahkan production URL ke Google Cloud Console:

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pilih project Anda
3. **APIs & Services** → **Credentials**
4. Edit OAuth 2.0 Client ID
5. Tambahkan:
   - **Authorized JavaScript origins**: `https://your-app.railway.app`
   - **Authorized redirect URIs**: `https://your-app.railway.app/api/oauth/callback`

## 📝 Notes

- Migration otomatis dijalankan saat startup di production
- Database harus accessible dari Railway network (gunakan internal URL jika ada)
- JWT_SECRET harus unique dan rahasia
- OWNER_OPEN_ID bisa ditambahkan setelah login pertama (cek logs untuk openId)

## 🆘 Need Help?

Jika masih ada masalah:
1. Cek logs di Railway dashboard
2. Pastikan semua environment variables sudah benar
3. Verify database connection dengan test query
4. Cek Google OAuth configuration

