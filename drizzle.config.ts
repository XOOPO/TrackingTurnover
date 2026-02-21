import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv"; // TAMBAHKAN INI

// Muat variabel dari file .env (untuk lokal) 
// dan pastikan variabel dari Railway terbaca
dotenv.config(); 

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Gunakan fallback string kosong agar tidak error saat build awal
    url: process.env.DATABASE_URL || "", 
  },
  migrationsSchema: "public",
  migrationsTable: "__drizzle_migrations",
});
