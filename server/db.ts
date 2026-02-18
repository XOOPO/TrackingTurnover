import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, activityLogs, InsertActivityLog, providerCredentials, InsertProviderCredential } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
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

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
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
  await db.insert(providerCredentials).values(credential).onDuplicateKeyUpdate({
    set: {
      username: credential.username,
      password: credential.password,
      loginUrl: credential.loginUrl,
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
