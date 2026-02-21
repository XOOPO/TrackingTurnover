import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, activityLogs, InsertActivityLog, providerCredentials, InsertProviderCredential } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const queryClient = postgres(process.env.DATABASE_URL);
      _db = drizzle(queryClient);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // PostgreSQL onConflictDoUpdate syntax
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet as any,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Activity Logs queries
export async function createActivityLog(log: InsertActivityLog) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create activity log: database not available");
    return;
  }
  await db.insert(activityLogs).values(log);
}

export async function getActivityLogsByUserId(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get activity logs: database not available");
    return [];
  }
  return db.select().from(activityLogs).where(eq(activityLogs.userId, userId)).orderBy(desc(activityLogs.createdAt)).limit(limit);
}

export async function getAllActivityLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get activity logs: database not available");
    return [];
  }
  return db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
}

// Provider Credentials queries
export async function upsertProviderCredential(credential: InsertProviderCredential) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert credential: database not available");
    return;
  }
  
  // PostgreSQL onConflictDoUpdate for provider credentials
  // Note: This assumes a unique constraint on (provider, brand) exists in schema
  // For now, we'll just insert since we don't have the unique constraint defined in schema yet
  // To be safe, we'll just use insert and let it fail if duplicate, or we can add the constraint
  await db.insert(providerCredentials).values(credential).onConflictDoUpdate({
    target: [providerCredentials.provider, providerCredentials.brand] as any,
    set: {
      username: credential.username,
      password: credential.password,
      loginUrl: credential.loginUrl,
      updatedAt: new Date(),
    },
  });
}

export async function getProviderCredential(provider: string, brand: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get credential: database not available");
    return undefined;
  }
  const result = await db.select().from(providerCredentials)
    .where(and(
      eq(providerCredentials.provider, provider),
      eq(providerCredentials.brand, brand)
    ))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}
