# ✅ Credentials Checklist untuk Railway

## 📋 Environment Variables yang Diperlukan

### ✅ Required (Wajib)

| Variable | Status di Railway | Keterangan |
|----------|------------------|------------|
| **DATABASE_URL** | ✅ Ada | PostgreSQL connection string (otomatis dari Railway PostgreSQL service) |
| **GOOGLE_CLIENT_ID** | ✅ Ada | Dari Google Cloud Console |
| **GOOGLE_CLIENT_SECRET** | ✅ Ada | Dari Google Cloud Console |
| **JWT_SECRET** | ❌ **TIDAK ADA** | **PENTING!** Generate dengan: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| **NODE_ENV** | ✅ Ada | Set ke `production` |

### ⚠️ Optional (Opsional tapi Recommended)

| Variable | Status di Railway | Keterangan |
|----------|------------------|------------|
| **OWNER_OPEN_ID** | ❌ Tidak Ada | Google ID untuk admin access (tambahkan setelah login pertama) |
| **PORT** | ✅ Auto | Railway set otomatis (default: 3000) |
| **JWT_EXPIRES_IN** | ❌ Tidak Ada | Default: "7d" (7 hari) - tidak perlu set jika default OK |

### ❌ Yang Harus Dihapus

| Variable | Status | Alasan |
|----------|--------|--------|
| **COOKIE_SECRET** | ❌ **HAPUS** | Variable ini **SALAH NAMA** - aplikasi menggunakan `JWT_SECRET`, bukan `COOKIE_SECRET` |

---

## 🔧 Action Items untuk Railway

### 1. ❌ HAPUS Variable yang Salah
- [ ] Hapus `COOKIE_SECRET` dari Railway (karena tidak digunakan)

### 2. ✅ TAMBAH Variable yang Kurang
- [ ] Tambahkan `JWT_SECRET` dengan value yang di-generate
- [ ] (Opsional) Tambahkan `OWNER_OPEN_ID` setelah login pertama

### 3. ✅ VERIFY Variable yang Sudah Ada
- [ ] Pastikan `DATABASE_URL` format: `postgresql://user:pass@host:port/db`
- [ ] Pastikan `GOOGLE_CLIENT_ID` benar dari Google Cloud Console
- [ ] Pastikan `GOOGLE_CLIENT_SECRET` benar dari Google Cloud Console
- [ ] Pastikan `NODE_ENV=production`

---

## 🔑 Generate JWT_SECRET

Jalankan command ini untuk generate JWT_SECRET:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Contoh output:**
```
714690b9f36be7b7529a8493ad3b37c012f503d0093522725517f0485943edf8
```

Copy hasilnya dan paste sebagai value untuk `JWT_SECRET` di Railway.

---

## 📝 Format Environment Variables di Railway

Setelah fix, Railway harus punya:

```env
DATABASE_URL=postgresql://postgres:xxx@postgres.railway.internal:5432/railway
GOOGLE_CLIENT_ID=476961580112-b36nc78rqp55u0uj7dc2csss98mtr8rl.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
JWT_SECRET=714690b9f36be7b7529a8493ad3b37c012f503d0093522725517f0485943edf8
NODE_ENV=production
OWNER_OPEN_ID=your_google_id_here (opsional)
```

---

## ✅ Final Checklist

Sebelum deploy, pastikan:

- [ ] ❌ `COOKIE_SECRET` sudah dihapus
- [ ] ✅ `JWT_SECRET` sudah ditambahkan dengan value yang benar
- [ ] ✅ `DATABASE_URL` sudah ada dan benar
- [ ] ✅ `GOOGLE_CLIENT_ID` sudah ada dan benar
- [ ] ✅ `GOOGLE_CLIENT_SECRET` sudah ada dan benar
- [ ] ✅ `NODE_ENV=production` sudah ada
- [ ] ⚠️ `OWNER_OPEN_ID` (opsional - bisa ditambahkan nanti)

---

## 🔍 Cara Cek di Railway

1. Buka Railway Dashboard
2. Pilih project Anda
3. Klik tab **"Variables"**
4. Bandingkan dengan checklist di atas
5. Update/Delete/Add sesuai kebutuhan

---

## ⚠️ Catatan Penting

- **JWT_SECRET** harus **unik dan rahasia** - jangan share ke publik
- **JWT_SECRET** minimal **32 karakter**
- Setelah update JWT_SECRET, semua user yang sudah login akan perlu login ulang
- **OWNER_OPEN_ID** hanya diperlukan jika Anda ingin akses admin
- Pastikan **COOKIE_SECRET** sudah dihapus** (karena tidak digunakan)

