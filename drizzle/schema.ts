import { boolean, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const planEnum   = pgEnum("plan",   ["essential", "pro", "pro_plus"]);
export const roleEnum   = pgEnum("role",   ["user", "admin"]);
export const statusEnum = pgEnum("status", ["active", "cancelled", "expired"]);

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  id:           serial("id").primaryKey(),
  openId:       varchar("openId",      { length: 64  }).unique(),
  name:         text("name"),
  email:        varchar("email",       { length: 320 }).unique(),
  passwordHash: text("passwordHash"),
  loginMethod:  varchar("loginMethod", { length: 64  }).default("email"),
  plan:         planEnum("plan").default("essential").notNull(),
  role:         roleEnum("role").default("user").notNull(),
  createdAt:    timestamp("createdAt").defaultNow().notNull(),
  updatedAt:    timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// User subscription table
export const userSubscriptions = pgTable("userSubscriptions", {
  id:        serial("id").primaryKey(),
  userId:    integer("userId").notNull().unique(),
  plan:      planEnum("plan").default("essential").notNull(),
  status:    statusEnum("status").default("active").notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate:   timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;

// Email notifications table
export const emailNotifications = pgTable("emailNotifications", {
  id:        serial("id").primaryKey(),
  userId:    integer("userId").notNull(),
  type:      varchar("type",    { length: 50  }).notNull(),
  subject:   varchar("subject", { length: 255 }).notNull(),
  content:   text("content").notNull(),
  sentAt:    timestamp("sentAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailNotification       = typeof emailNotifications.$inferSelect;
export type InsertEmailNotification = typeof emailNotifications.$inferInsert;

// User preferences table
export const userPreferences = pgTable("userPreferences", {
  id:                    serial("id").primaryKey(),
  userId:                integer("userId").notNull().unique(),
  weeklyEmailEnabled:    boolean("weeklyEmailEnabled").default(true).notNull(),
  skinAlertEmailEnabled: boolean("skinAlertEmailEnabled").default(true).notNull(),
  lastWeeklySentAt:      timestamp("lastWeeklySentAt"),
  createdAt:             timestamp("createdAt").defaultNow().notNull(),
  updatedAt:             timestamp("updatedAt").defaultNow().notNull(),
});

export type UserPreference       = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

// Password reset tokens table
export const passwordResetTokens = pgTable("passwordResetTokens", {
  id:        serial("id").primaryKey(),
  userId:    integer("userId").notNull(),
  token:     varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken       = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

// Email verification tokens table
export const emailVerificationTokens = pgTable("emailVerificationTokens", {
  id:         serial("id").primaryKey(),
  userId:     integer("userId").notNull(),
  token:      varchar("token", { length: 255 }).notNull().unique(),
  expiresAt:  timestamp("expiresAt").notNull(),
  verified:   boolean("verified").default(false).notNull(),
  verifiedAt: timestamp("verifiedAt"),
  createdAt:  timestamp("createdAt").defaultNow().notNull(),
});

export type EmailVerificationToken       = typeof emailVerificationTokens.$inferSelect;
export type InsertEmailVerificationToken = typeof emailVerificationTokens.$inferInsert;

// Social login table for storing OAuth provider info
export const socialLogins = pgTable("socialLogins", {
  id:             serial("id").primaryKey(),
  userId:         integer("userId").notNull(),
  provider:       varchar("provider",       { length: 50  }).notNull(), // 'google', 'microsoft', 'twitter'
  providerUserId: varchar("providerUserId", { length: 255 }).notNull(),
  providerEmail:  varchar("providerEmail",  { length: 320 }),
  accessToken:    text("accessToken"),
  refreshToken:   text("refreshToken"),
  expiresAt:      timestamp("expiresAt"),
  createdAt:      timestamp("createdAt").defaultNow().notNull(),
  updatedAt:      timestamp("updatedAt").defaultNow().notNull(),
});

export type SocialLogin       = typeof socialLogins.$inferSelect;
export type InsertSocialLogin = typeof socialLogins.$inferInsert;
