# Quick Start Guide - Google OAuth Setup

## 🚀 5 Menit Setup Google OAuth

### Step 1: Environment Variables (2 menit)

```bash
# Copy template
cp .env.example .env

# Edit .env file dan isi dengan credentials Google Anda
nano .env
```

**Minimal yang harus diisi:**
```env
GOOGLE_CLIENT_ID=your_google_client_id_from_cloud_console
GOOGLE_CLIENT_SECRET=your_google_client_secret_from_cloud_console
JWT_SECRET=run_this_command_to_generate_secret
OWNER_OPEN_ID=your_google_id_here
DATABASE_URL=mysql://user:pass@host:3306/dbname
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Verify Configuration (30 detik)

```bash
bash test-oauth.sh
```

Jika semua ✓ (check mark), lanjut ke step berikutnya.

### Step 3: Install & Setup Database (1 menit)

```bash
pnpm install
pnpm db:push
```

### Step 4: Start Development Server (30 detik)

```bash
pnpm dev
```

### Step 5: Test Google Login (1 menit)

1. Buka browser: `http://localhost:3000`
2. Klik tombol "Sign in"
3. Login dengan akun Google Anda
4. Seharusnya redirect kembali ke dashboard

**Done! 🎉**

---

## 📋 Checklist

- [ ] File `.env` sudah dibuat dari `.env.example`
- [ ] `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` sudah diisi
- [ ] `bash test-oauth.sh` menunjukkan semua ✓
- [ ] `pnpm install` berhasil
- [ ] `pnpm db:push` berhasil
- [ ] `pnpm dev` running tanpa error
- [ ] Browser bisa buka `http://localhost:3000`
- [ ] Tombol "Sign in" redirect ke Google login
- [ ] Setelah login, redirect kembali ke dashboard
- [ ] User info muncul di sidebar

---

## 🔍 Troubleshooting Cepat

### Problem: "redirect_uri_mismatch"
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pastikan Authorized redirect URI: `http://localhost:3000/api/oauth/callback`
3. Untuk production: `https://yourdomain.com/api/oauth/callback`

### Problem: "GOOGLE_CLIENT_ID is not configured"
- Pastikan variable `GOOGLE_CLIENT_ID` ada di file `.env`
- Restart server setelah mengedit `.env`

### Problem: Database connection error
- Verify `DATABASE_URL` di environment variables
- Check database server status
- Run `pnpm db:push` untuk sync schema

---

## 📚 Dokumentasi Lengkap

- **Google OAuth Setup**: Lihat `GOOGLE_OAUTH_SETUP.md`
- **Project Info**: Lihat `PROJECT_README.md`

---

## 🆘 Need Help?

1. Check server logs di terminal
2. Check browser console (F12)
3. Run `bash test-oauth.sh` untuk verify config
4. Baca `GOOGLE_OAUTH_SETUP.md` untuk troubleshooting lengkap

---

**Happy Coding! 🚀**
