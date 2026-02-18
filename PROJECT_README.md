# Game Turnover Tracker Dashboard

Dashboard web untuk tracking turnover pemain game dari berbagai provider dengan otomatis login dan scraping data.

## Fitur Utama

### 1. Multi-User Authentication
- Login menggunakan Manus OAuth
- Role-based access control (Admin & User)
- Session management dengan JWT

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

### activity_logs
- Tracking semua pencarian turnover
- Status dan error messages
- Result data (JSON)

### provider_credentials
- Cache credentials dari Google Spreadsheet
- Provider, brand, username, password, login URL

## Google Spreadsheet Integration

Dashboard membaca credentials dari Google Spreadsheet dengan struktur:
- Column A: Provider name
- Column B: Login URL
- Column C: Username (ABSG)
- Column D: Password
- Column E: Username (WBSG)

Spreadsheet ID: `13kiyqi8YZGQCyH6cLYcU6ZpUy2njqum02fSrIBGt8D8`

## Web Scraping

### Cara Kerja
1. User input Player ID, Provider, dan Brand
2. System mengambil credentials dari Google Spreadsheet
3. Puppeteer membuka browser headless
4. Login ke provider website dengan credentials
5. Search Player ID
6. Extract data turnover per game
7. Return hasil ke frontend

### Provider Support
Saat ini menggunakan generic scraper yang bisa disesuaikan untuk semua provider. Untuk hasil yang lebih akurat, setiap provider perlu custom scraper berdasarkan struktur website masing-masing.

## Setup & Development

### Prerequisites
- Node.js 22+
- MySQL/TiDB database
- Google Spreadsheet dengan credentials

### Installation
```bash
pnpm install
```

### Database Migration
```bash
pnpm db:push
```

### Development
```bash
pnpm dev
```

### Testing
```bash
pnpm test
```

## Important Notes

### Web Scraping Considerations
1. **Selectors Need Customization**: Generic scraper menggunakan selector umum. Untuk hasil optimal, perlu customize selector berdasarkan struktur HTML setiap provider.

2. **Login Flow**: Setiap provider mungkin punya flow login yang berbeda (captcha, 2FA, dll). Perlu handling khusus untuk setiap provider.

3. **Rate Limiting**: Provider website mungkin punya rate limiting. Perlu implement delay dan retry logic.

4. **Website Changes**: Jika provider mengubah struktur website, scraper perlu di-update.

### Security
- Credentials disimpan di Google Spreadsheet (bukan di code)
- Database credentials di-encrypt
- Session menggunakan JWT dengan expiry
- HTTPS only untuk production

### Performance
- Puppeteer browser instance di-close setelah setiap scraping
- Database query menggunakan index
- Activity logs dibatasi 50-100 records per query

## Future Improvements

1. **Custom Scraper per Provider**: Buat scraper khusus untuk setiap provider dengan selector yang tepat
2. **Caching**: Cache hasil scraping untuk mengurangi load ke provider website
3. **Queue System**: Implement job queue untuk handle multiple concurrent requests
4. **Retry Logic**: Auto-retry jika scraping gagal
5. **Notification**: Email/SMS notification untuk admin jika ada error
6. **Export Data**: Export activity logs ke CSV/Excel
7. **Dashboard Analytics**: Grafik dan statistik untuk activity logs

## Troubleshooting

### Scraping Gagal
- Check apakah credentials di Google Spreadsheet benar
- Check apakah provider website masih accessible
- Check error message di activity logs
- Verify selector di scraper.ts masih sesuai dengan struktur website

### Database Connection Error
- Verify DATABASE_URL di environment variables
- Check database server status
- Run `pnpm db:push` untuk sync schema

### Google Spreadsheet Error
- Verify spreadsheet ID benar
- Check spreadsheet permission (public atau shared)
- Verify struktur columns sesuai dengan yang diharapkan
