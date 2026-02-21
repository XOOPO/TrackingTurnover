# PostgreSQL Migration Guide

Proyek ini telah dimigrasikan dari **MySQL** ke **PostgreSQL**. Berikut adalah perubahan utama dan langkah-langkah yang perlu Anda ketahui.

---

## 🛠️ Perubahan Teknis

1.  **Driver Database**: Menggunakan `postgres` (postgres-js) alih-alih `mysql2`.
2.  **ORM Dialect**: Drizzle ORM sekarang menggunakan `pg-core` dan `postgresql` dialect.
3.  **Schema**:
    - Menggunakan `pgTable`, `serial`, `timestamp`, dll.
    - Menambahkan `pgEnum` untuk `role` dan `status`.
    - Menambahkan `unique` constraint pada `provider_credentials` untuk mendukung `onConflictDoUpdate`.
4.  **Query Logic**: Mengganti `onDuplicateKeyUpdate` (MySQL) menjadi `onConflictDoUpdate` (PostgreSQL).

---

## ⚙️ Konfigurasi Environment

Pastikan `DATABASE_URL` di file `.env` menggunakan format PostgreSQL:

```env
# Format: postgresql://user:password@host:port/database
DATABASE_URL=postgresql://postgres:password@host:port/railway
```

---

## 🚀 Langkah-langkah Menjalankan

1.  **Install Dependencies**:
    ```bash
    pnpm install
    ```
2.  **Push Schema ke Database Baru**:
    Karena ini adalah database baru di Railway, Anda perlu mem-push schema tabel:
    ```bash
    pnpm db:push
    ```
3.  **Jalankan Aplikasi**:
    ```bash
    pnpm dev
    ```

---

## 🔍 Troubleshooting

### Error: "relation 'users' does not exist"
- Ini berarti tabel belum dibuat di PostgreSQL. Jalankan `pnpm db:push`.

### Error: "on conflict constraint not found"
- Pastikan schema sudah di-push dengan benar. PostgreSQL membutuhkan constraint unik (seperti `openId` atau gabungan `provider` & `brand`) untuk melakukan upsert.

### Koneksi Lambat/Timeout
- Jika menggunakan Railway, pastikan Anda menggunakan **Public URL** jika mengakses dari luar network Railway, atau **Internal URL** jika dideploy di dalam Railway.

---

**Happy Coding with PostgreSQL! 🐘**
