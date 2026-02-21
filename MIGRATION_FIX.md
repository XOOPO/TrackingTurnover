# Fix Migration Error di Railway

## ❌ Masalah

Error `ECONNREFUSED` saat migration dijalankan saat build time:
```
DrizzleQueryError: Failed query: CREATE SCHEMA IF NOT EXISTS "drizzle"
cause: AggregateError [ECONNREFUSED]
```

## 🔍 Penyebab

1. Railway menjalankan `pnpm db:push` sebagai bagian dari build process
2. Database belum accessible saat build time (hanya accessible saat runtime)
3. Migration seharusnya dijalankan saat **startup**, bukan saat **build**

## ✅ Solusi yang Sudah Diterapkan

### 1. Auto-Migration saat Startup
Migration sekarang otomatis dijalankan saat server start (production mode):
- File: `server/_core/migrate.ts` - Migration runner
- File: `server/_core/index.ts` - Auto-run migration sebelum start server

### 2. Railway Configuration
**PENTING**: Pastikan Railway build settings:

- ✅ **Build Command**: `pnpm build` (BUKAN `pnpm db:push`)
- ✅ **Start Command**: `pnpm start`
- ❌ **JANGAN** set build command ke: `pnpm install && pnpm db:push`

### 3. Dockerfile Updated
Dockerfile sudah di-update untuk copy `drizzle` folder ke production image.

## 🚀 Langkah Perbaikan di Railway

### Step 1: Update Build Settings
1. Buka Railway dashboard → Project → Settings
2. Tab **"Build & Deploy"**
3. Pastikan:
   - **Build Command**: `pnpm build`
   - **Start Command**: `pnpm start`
   - **Root Directory**: (kosongkan)

### Step 2: Redeploy
1. Klik **"Redeploy"** atau push commit baru
2. Tunggu build selesai
3. Cek logs saat startup - harus ada:
   ```
   [Migration] Starting database migrations...
   [Migration] Found migrations folder at: /app/drizzle
   [Migration] ✅ Migrations completed successfully
   ```

### Step 3: Verify
1. Cek logs tidak ada error `ECONNREFUSED`
2. Cek database - tabel harus sudah dibuat
3. Test aplikasi - login harus berfungsi

## 🔍 Troubleshooting

### Migration masih error
**Cek**:
1. Apakah `DATABASE_URL` sudah benar di Railway variables?
2. Apakah database service sudah running?
3. Apakah menggunakan internal URL untuk Railway database?

**Solusi**:
- Pastikan `DATABASE_URL` menggunakan format: `postgresql://user:pass@host:port/db`
- Untuk Railway, gunakan internal URL jika deploy di same network

### Migration tidak jalan
**Cek logs** untuk:
- `[Migration] Starting database migrations...`
- Jika tidak muncul, pastikan `NODE_ENV=production`

**Manual migration**:
1. Connect ke Railway shell
2. Run: `pnpm db:push`

### "Could not find migrations folder"
**Solusi**:
- Pastikan `drizzle` folder ter-copy ke production
- Cek Dockerfile sudah include `COPY --from=builder /app/drizzle ./drizzle`
- Atau pastikan Railway build include `drizzle` folder

## 📝 Notes

- Migration sekarang **otomatis** dijalankan saat startup
- Tidak perlu manual run `pnpm db:push` di Railway
- Migration hanya run di production mode (`NODE_ENV=production`)
- Jika migration gagal, server tetap start (check logs untuk error)

## ✅ Checklist

- [ ] Build command: `pnpm build` (BUKAN `pnpm db:push`)
- [ ] Start command: `pnpm start`
- [ ] `DATABASE_URL` sudah dikonfigurasi
- [ ] Redeploy aplikasi
- [ ] Cek logs - migration harus run otomatis
- [ ] Verify database tables sudah dibuat
- [ ] Test aplikasi berfungsi

