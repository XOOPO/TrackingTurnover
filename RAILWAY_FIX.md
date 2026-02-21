# Fix Environment Variables di Railway

## ❌ Masalah yang Ditemukan

1. **COOKIE_SECRET** - Variable ini **SALAH NAMA** dan menggunakan placeholder
2. **JWT_SECRET** - Variable ini **TIDAK ADA** padahal sangat penting
3. **OWNER_OPEN_ID** - Variable ini **TIDAK ADA** (opsional tapi recommended)

## ✅ Solusi

### Step 1: Hapus COOKIE_SECRET
- Hapus variable `COOKIE_SECRET` dari Railway (karena tidak digunakan)

### Step 2: Tambah JWT_SECRET
1. Klik **"+ New Variable"** di Railway
2. Name: `JWT_SECRET`
3. Value: Generate secret dengan command berikut:

**Generate JWT_SECRET (pilih salah satu):**

**Option 1: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2: Online Generator**
- Buka: https://randomkeygen.com/
- Pilih "CodeIgniter Encryption Keys"
- Copy salah satu key (minimal 32 karakter)

**Option 3: PowerShell (Windows)**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Contoh JWT_SECRET yang valid:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### Step 3: Tambah OWNER_OPEN_ID (Opsional)
1. Klik **"+ New Variable"** di Railway
2. Name: `OWNER_OPEN_ID`
3. Value: Google ID Anda (akan muncul di log setelah login pertama)

**Cara mendapatkan OWNER_OPEN_ID:**
1. Deploy aplikasi dengan JWT_SECRET yang sudah benar
2. Login pertama kali dengan Google
3. Cek logs di Railway, cari: `[OAuth] User authenticated: { openId: '12345...' }`
4. Copy `openId` tersebut
5. Tambahkan sebagai `OWNER_OPEN_ID` di Railway
6. Redeploy aplikasi

## 📋 Checklist Environment Variables di Railway

Setelah fix, pastikan Anda punya:

- ✅ **DATABASE_URL** - PostgreSQL connection string
- ✅ **GOOGLE_CLIENT_ID** - Google OAuth Client ID
- ✅ **GOOGLE_CLIENT_SECRET** - Google OAuth Client Secret
- ✅ **JWT_SECRET** - Random secret minimal 32 karakter (BARU!)
- ✅ **NODE_ENV** - `production`
- ⚠️ **OWNER_OPEN_ID** - Google ID untuk admin (opsional)

## 🔄 Setelah Update Variables

1. **Redeploy** aplikasi di Railway (variables baru akan ter-load)
2. **Test login** dengan Google OAuth
3. **Cek logs** untuk memastikan tidak ada error

## ⚠️ Catatan Penting

- **JWT_SECRET** harus **unik dan rahasia** - jangan share ke publik
- **JWT_SECRET** minimal **32 karakter**
- Setelah update JWT_SECRET, semua user yang sudah login akan perlu login ulang
- **OWNER_OPEN_ID** hanya diperlukan jika Anda ingin akses admin

