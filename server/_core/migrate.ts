import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.warn("[Migration] DATABASE_URL not found, skipping migrations");
    return;
  }

  try {
    console.log("[Migration] Starting database migrations...");
    
    const queryClient = postgres(databaseUrl, { max: 1 });
    const db = drizzle(queryClient);

    // Try multiple paths to find migrations folder
    const possiblePaths = [
      // When running from dist/index.js (production)
      path.resolve(process.cwd(), "drizzle"),
      // When running from source (development)
      path.resolve(__dirname, "../../drizzle"),
      // Alternative path
      path.resolve(process.cwd(), "..", "drizzle"),
    ];

    let migrationsFolder: string | null = null;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        migrationsFolder = possiblePath;
        console.log(`[Migration] Found migrations folder at: ${migrationsFolder}`);
        break;
      }
    }

    if (!migrationsFolder) {
      throw new Error(
        `Could not find migrations folder. Tried: ${possiblePaths.join(", ")}`
      );
    }

    await migrate(db, { migrationsFolder });
    
    console.log("[Migration] ✅ Migrations completed successfully");
    
    await queryClient.end();
  } catch (error) {
    console.error("[Migration] ❌ Migration failed:", error);
    // Don't throw - let server start even if migration fails
    // Admin can manually run migration later
  }
}

