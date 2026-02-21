# Google OAuth Setup Guide

Proyek ini sekarang menggunakan **Google OAuth** untuk autentikasi user. Berikut adalah langkah-langkah untuk mengonfigurasinya.

---

## 🛠️ Step 1: Dapatkan Google OAuth Credentials

1.  Buka [Google Cloud Console](https://console.cloud.google.com/).
2.  Buat project baru atau pilih project yang sudah ada.
3.  Buka **APIs & Services > Credentials**.
4.  Klik **Configure Consent Screen**:
    - Pilih **External**.
    - Isi informasi aplikasi (App name, User support email, Developer contact info).
    - Klik **Save and Continue** sampai selesai.
5.  Klik **Create Credentials > OAuth client ID**:
    - Application type: **Web application**.
    - Name: `Turnover Tracker`.
    - **Authorized JavaScript origins**:
        - `http://localhost:3000`
    - **Authorized redirect URIs**:
        - `http://localhost:3000/api/oauth/callback`
6.  Klik **Create** dan catat:
    - **Client ID**
    - **Client Secret**

---

## ⚙️ Step 2: Konfigurasi Environment Variables

1.  Buka file `.env` di root folder proyek.
2.  Tambahkan/Update variable berikut:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=masukkan_client_id_anda
GOOGLE_CLIENT_SECRET=masukkan_client_secret_anda

# Session Configuration
JWT_SECRET=buat_secret_minimal_32_karakter
```

---

## 🚀 Step 3: Jalankan Aplikasi

1.  Install dependencies:
    ```bash
    pnpm install
    ```
2.  Jalankan database migration (jika belum):
    ```bash
    pnpm db:push
    ```
3.  Start development server:
    ```bash
    pnpm dev
    ```
4.  Buka `http://localhost:3000` dan klik **Sign in**.

---

## 🔍 Troubleshooting

### Error: "redirect_uri_mismatch"
- Pastikan redirect URI di Google Cloud Console sama persis dengan yang ada di kode.
- Default: `http://localhost:3000/api/oauth/callback`.

### Error: "GOOGLE_CLIENT_ID is not configured"
- Pastikan variable `GOOGLE_CLIENT_ID` sudah ada di file `.env` dan server sudah di-restart.

### Bagaimana cara mendapatkan Google ID saya untuk `OWNER_OPEN_ID`?
1. Login pertama kali menggunakan Google.
2. Cek log di terminal server, Anda akan melihat log: `[OAuth] User authenticated: { openId: '12345...', ... }`.
3. Copy `openId` tersebut dan masukkan ke `OWNER_OPEN_ID` di file `.env` untuk mendapatkan akses admin.

---

**Happy Coding! 🚀**
