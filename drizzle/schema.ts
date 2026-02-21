import { pgTable, serial, text, timestamp, varchar, pgEnum, integer, unique } from "drizzle-orm/pg-core";

/**
 * Role enum for PostgreSQL
 */
export const roleEnum = pgEnum("role", ["user", "admin"]);

/**
 * Status enum for PostgreSQL
 */
export const statusEnum = pgEnum("status", ["success", "failed", "pending"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  /** Google ID identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Activity logs table untuk tracking user searches
 */
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  playerId: varchar("player_id", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 100 }).notNull(),
  brand: varchar("brand", { length: 100 }).notNull(),
  status: statusEnum("status").notNull(),
  errorMessage: text("error_message"),
  resultData: text("result_data"), // JSON string of game results
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

/**
 * Provider credentials cache table
 */
export const providerCredentials = pgTable("provider_credentials", {
  id: serial("id").primaryKey(),
  provider: varchar("provider", { length: 100 }).notNull(),
  brand: varchar("brand", { length: 100 }).notNull(),
  username: varchar("username", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  loginUrl: text("login_url").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  unq: unique().on(t.provider, t.brand),
}));

export type ProviderCredential = typeof providerCredentials.$inferSelect;
export type InsertProviderCredential = typeof providerCredentials.$inferInsert;
