# Game Turnover Tracker Dashboard - Google OAuth Implementation

Dashboard web untuk tracking turnover pemain game dari berbagai provider dengan otomatis login dan scraping data. Aplikasi ini telah dikonfigurasi untuk menggunakan **Google OAuth** sebagai sistem autentikasi utama.

## Fitur Utama

### 1. Multi-User Authentication
- Login menggunakan **Google OAuth**
- Role-based access control (Admin & User)
- Session management dengan JWT (jose)
- Secure HTTP-only cookies

### 2. Search Turnover
- Input Player ID untuk mencari data turnover
- Pilih Provider (MEGA888, PRAGMATIC SLOT, PUSSY888, 918KISS, 918KAYA, LIVE22 WEB, BETWOS)
- Pilih Brand (WBSG, ABSG)
- Otomatis mengambil credentials dari Google Spreadsheet
- Web automation untuk login ke provider website dan scraping data

### 3. Results Display
- Daftar game yang dimainkan
- Total betting per game
- Total keseluruhan turnover
- Jumlah bet per game

### 4. Activity Logs
- Tracking semua pencarian yang dilakukan user
- Status (Success, Failed, Pending)
- Error messages untuk debugging
- Timestamp setiap aktivitas

## Teknologi Stack

### Backend
- **Express.js** - Web server
- **tRPC** - Type-safe API
- **Drizzle ORM** - Database ORM
- **MySQL/TiDB** - Database
- **Puppeteer** - Web automation & scraping
- **Google Sheets API** - Membaca credentials
- **Jose** - JWT signing & verification

### Frontend
- **React 19** - UI framework
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - UI components
- **Wouter** - Routing
- **TanStack Query** - Data fetching

## Struktur Database

### users
- User authentication dan profile
- Role management (admin/user)
- Google ID disimpan sebagai `openId`

### activity_logs
- Tracking semua pencarian turnover
- Status dan error messages
- Result data (JSON)

### provider_credentials
- Cache credentials dari Google Spreadsheet
- Provider, brand, username, password, login URL

## Setup & Development

### 1. Setup Environment Variables
Copy `.env.example` menjadi `.env` dan isi dengan kredensial Google Anda:
```bash
cp .env.example .env
```

**Variable yang diperlukan:**
- `GOOGLE_CLIENT_ID`: Dari Google Cloud Console
- `GOOGLE_CLIENT_SECRET`: Dari Google Cloud Console
- `JWT_SECRET`: Secret key untuk session (minimal 32 karakter)
- `DATABASE_URL`: Connection string MySQL/TiDB

### 2. Install & Setup
```bash
pnpm install
pnpm db:push
```

### 3. Start Development
```bash
pnpm dev
```

---

## 📚 Dokumentasi Tambahan

- **Google OAuth Setup**: Lihat `GOOGLE_OAUTH_SETUP.md` untuk panduan lengkap mendapatkan Client ID dan Secret.
- **Quick Start**: Lihat `QUICK_START.md` untuk langkah cepat 5 menit.

---

## 🔒 Keamanan

- **JWT Session**: Menggunakan `jose` untuk signing dan verifikasi session token.
- **HTTP-Only Cookies**: Session disimpan di cookie yang tidak bisa diakses oleh JavaScript client-side.
- **CSRF Protection**: Cookie dikonfigurasi dengan `sameSite: 'lax'`.

---

**Happy Coding! 🚀**
