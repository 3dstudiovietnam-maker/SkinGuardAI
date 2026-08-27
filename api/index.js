var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// drizzle/schema.ts
import { boolean, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
var planEnum, roleEnum, statusEnum, users, userSubscriptions, emailNotifications, userPreferences, passwordResetTokens, emailVerificationTokens, socialLogins, moles, photos, analyses;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    planEnum = pgEnum("plan", ["essential", "pro", "pro_plus", "lifetime"]);
    roleEnum = pgEnum("role", ["user", "admin"]);
    statusEnum = pgEnum("status", ["active", "cancelled", "expired"]);
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      openId: varchar("openId", { length: 64 }).unique(),
      name: text("name"),
      email: varchar("email", { length: 320 }).unique(),
      passwordHash: text("passwordHash"),
      loginMethod: varchar("loginMethod", { length: 64 }).default("email"),
      plan: planEnum("plan").default("essential").notNull(),
      role: roleEnum("role").default("user").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    });
    userSubscriptions = pgTable("userSubscriptions", {
      id: serial("id").primaryKey(),
      userId: integer("userId").notNull().unique(),
      plan: planEnum("plan").default("essential").notNull(),
      status: statusEnum("status").default("active").notNull(),
      startDate: timestamp("startDate").defaultNow().notNull(),
      endDate: timestamp("endDate"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    emailNotifications = pgTable("emailNotifications", {
      id: serial("id").primaryKey(),
      userId: integer("userId").notNull(),
      type: varchar("type", { length: 50 }).notNull(),
      subject: varchar("subject", { length: 255 }).notNull(),
      content: text("content").notNull(),
      sentAt: timestamp("sentAt").defaultNow().notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    userPreferences = pgTable("userPreferences", {
      id: serial("id").primaryKey(),
      userId: integer("userId").notNull().unique(),
      weeklyEmailEnabled: boolean("weeklyEmailEnabled").default(true).notNull(),
      skinAlertEmailEnabled: boolean("skinAlertEmailEnabled").default(true).notNull(),
      lastWeeklySentAt: timestamp("lastWeeklySentAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    passwordResetTokens = pgTable("passwordResetTokens", {
      id: serial("id").primaryKey(),
      userId: integer("userId").notNull(),
      token: varchar("token", { length: 255 }).notNull().unique(),
      expiresAt: timestamp("expiresAt").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    emailVerificationTokens = pgTable("emailVerificationTokens", {
      id: serial("id").primaryKey(),
      userId: integer("userId").notNull(),
      token: varchar("token", { length: 255 }).notNull().unique(),
      expiresAt: timestamp("expiresAt").notNull(),
      verified: boolean("verified").default(false).notNull(),
      verifiedAt: timestamp("verifiedAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    socialLogins = pgTable("socialLogins", {
      id: serial("id").primaryKey(),
      userId: integer("userId").notNull(),
      provider: varchar("provider", { length: 50 }).notNull(),
      // 'google', 'microsoft', 'twitter'
      providerUserId: varchar("providerUserId", { length: 255 }).notNull(),
      providerEmail: varchar("providerEmail", { length: 320 }),
      accessToken: text("accessToken"),
      refreshToken: text("refreshToken"),
      expiresAt: timestamp("expiresAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    moles = pgTable("moles", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      name: text("name").notNull(),
      region: text("region").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      lastChecked: timestamp("last_checked").defaultNow().notNull(),
      reminderDays: integer("reminder_days").default(90).notNull(),
      riskLevel: text("risk_level").default("unknown").notNull()
      // low, medium, high, unknown
    });
    photos = pgTable("photos", {
      id: serial("id").primaryKey(),
      moleId: integer("mole_id").notNull().references(() => moles.id, { onDelete: "cascade" }),
      dataUrl: text("data_url").notNull(),
      // base64 kép (vagy külső storage URL)
      timestamp: timestamp("timestamp").defaultNow().notNull(),
      notes: text("notes").default(""),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    analyses = pgTable("analyses", {
      id: serial("id").primaryKey(),
      photoId: integer("photo_id").notNull().references(() => photos.id, { onDelete: "cascade" }).unique(),
      asymmetryScore: integer("asymmetry_score").notNull(),
      asymmetryCode: text("asymmetry_code").notNull(),
      borderScore: integer("border_score").notNull(),
      borderCode: text("border_code").notNull(),
      colorScore: integer("color_score").notNull(),
      colorCode: text("color_code").notNull(),
      diameterScore: integer("diameter_score").notNull(),
      diameterCode: text("diameter_code").notNull(),
      overallRisk: text("overall_risk").notNull(),
      // low, medium, high
      recommendationCode: text("recommendation_code").notNull(),
      disclaimer: text("disclaimer").default("This AI analysis is for informational purposes only and is not a medical diagnosis. Always consult a qualified dermatologist for professional evaluation."),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
  }
});

// server/_core/env.ts
var env_exports = {};
__export(env_exports, {
  ENV: () => ENV
});
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      // Shared across every HealthGuard app so one session verifies everywhere
      // (cross-app SSO). New tokens are signed with this; the per-app cookieSecret
      // above stays a verify-only fallback so existing sessions are never logged out.
      sharedCookieSecret: process.env.JWT_SECRET_SHARED ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
      emailUser: process.env.EMAIL_USER ?? "",
      emailPassword: process.env.EMAIL_PASSWORD ?? "",
      googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      microsoftClientId: process.env.MICROSOFT_CLIENT_ID ?? "",
      microsoftClientSecret: process.env.MICROSOFT_CLIENT_SECRET ?? "",
      twitterClientId: process.env.TWITTER_CLIENT_ID ?? "",
      twitterClientSecret: process.env.TWITTER_CLIENT_SECRET ?? "",
      // Vertex AI / Gemini configuration
      googleCredentialsJson: process.env.GOOGLE_CREDENTIALS_JSON ?? "",
      googleCloudProject: process.env.GOOGLE_CLOUD_PROJECT ?? "prismatic-fact-480115-g5",
      googleCloudLocation: process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1"
    };
  }
});

// server/db.ts
import { eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const sql4 = neon(process.env.DATABASE_URL);
      _db = drizzle(sql4);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserByEmail(email) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
var _db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    init_env();
    _db = null;
  }
});

// server/oauth.ts
var oauth_exports = {};
__export(oauth_exports, {
  getGoogleAccessToken: () => getGoogleAccessToken,
  getGoogleUserInfo: () => getGoogleUserInfo,
  getMicrosoftAccessToken: () => getMicrosoftAccessToken,
  getMicrosoftUserInfo: () => getMicrosoftUserInfo,
  getTwitterAccessToken: () => getTwitterAccessToken,
  getTwitterUserInfo: () => getTwitterUserInfo,
  handleSocialLogin: () => handleSocialLogin
});
import axios2 from "axios";
import { eq as eq2 } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
async function getGoogleAccessToken(code) {
  try {
    const response = await axios2.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: ENV.googleClientId,
      client_secret: ENV.googleClientSecret,
      redirect_uri: `${process.env.APP_URL || (process.env.NODE_ENV === "production" ? "https://www.skinguardai.app" : "http://localhost:3000")}/auth/google/callback`,
      grant_type: "authorization_code"
    });
    return response.data;
  } catch (error) {
    console.error("Google token exchange failed:", error);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to exchange Google token" });
  }
}
async function getGoogleUserInfo(accessToken) {
  try {
    const response = await axios2.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to get Google user info:", error);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get Google user info" });
  }
}
async function getMicrosoftAccessToken(code) {
  try {
    const response = await axios2.post("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      code,
      client_id: ENV.microsoftClientId,
      client_secret: ENV.microsoftClientSecret,
      redirect_uri: `${process.env.NODE_ENV === "production" ? "https://skinguardai.manus.space" : "http://localhost:3000"}/auth/microsoft/callback`,
      grant_type: "authorization_code",
      scope: "user.read"
    });
    return response.data;
  } catch (error) {
    console.error("Microsoft token exchange failed:", error);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to exchange Microsoft token" });
  }
}
async function getMicrosoftUserInfo(accessToken) {
  try {
    const response = await axios2.get("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to get Microsoft user info:", error);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get Microsoft user info" });
  }
}
async function getTwitterAccessToken(code) {
  try {
    const response = await axios2.post("https://api.twitter.com/2/oauth2/token", {
      code,
      client_id: ENV.twitterClientId,
      client_secret: ENV.twitterClientSecret,
      redirect_uri: `${process.env.NODE_ENV === "production" ? "https://skinguardai.manus.space" : "http://localhost:3000"}/auth/twitter/callback`,
      grant_type: "authorization_code",
      code_challenge_method: "plain"
    });
    return response.data;
  } catch (error) {
    console.error("Twitter token exchange failed:", error);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to exchange Twitter token" });
  }
}
async function getTwitterUserInfo(accessToken) {
  try {
    const response = await axios2.get("https://api.twitter.com/2/users/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { "user.fields": "id,username,name" }
    });
    return response.data.data;
  } catch (error) {
    console.error("Failed to get Twitter user info:", error);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get Twitter user info" });
  }
}
async function handleSocialLogin(provider, providerUserId, providerEmail, userName, accessToken, refreshToken, expiresIn) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
  const existingSocialLogin = await db.select().from(socialLogins).where(eq2(socialLogins.providerUserId, providerUserId)).limit(1);
  if (existingSocialLogin.length > 0) {
    await db.update(socialLogins).set({
      accessToken,
      refreshToken: refreshToken || null,
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1e3) : null
    }).where(eq2(socialLogins.id, existingSocialLogin[0].id));
    const user = await db.select().from(users).where(eq2(users.id, existingSocialLogin[0].userId)).limit(1);
    if (user.length === 0) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }
    return { userId: user[0].id, isNewUser: false };
  }
  const existingUser = await db.select().from(users).where(eq2(users.email, providerEmail)).limit(1);
  let userId;
  if (existingUser.length > 0) {
    userId = existingUser[0].id;
  } else {
    const result = await db.insert(users).values({
      name: userName,
      email: providerEmail,
      loginMethod: provider,
      plan: "essential",
      openId: `${provider}_${providerUserId}`
    });
    const insertedUser = await db.select().from(users).where(eq2(users.email, providerEmail)).limit(1);
    if (insertedUser.length === 0) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user" });
    }
    userId = insertedUser[0].id;
  }
  await db.insert(socialLogins).values({
    userId,
    provider,
    providerUserId,
    providerEmail,
    accessToken,
    refreshToken: refreshToken || null,
    expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1e3) : null
  });
  return { userId, isNewUser: existingUser.length === 0 };
}
var init_oauth = __esm({
  "server/oauth.ts"() {
    "use strict";
    init_env();
    init_db();
    init_schema();
  }
});

// server/_core/entitlements.ts
import { sql } from "drizzle-orm";
function rows(result) {
  const r = result;
  return r?.rows ?? (Array.isArray(r) ? r : []);
}
function ensureSchema() {
  if (!schemaReady) {
    schemaReady = createSchema().catch((e) => {
      schemaReady = null;
      throw e;
    });
  }
  return schemaReady;
}
async function createSchema() {
  const db = await getDb();
  if (!db) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS grants (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan TEXT NOT NULL,
      source TEXT NOT NULL,
      external_id TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      starts_at TIMESTAMP NOT NULL DEFAULT NOW(),
      ends_at TIMESTAMP,
      note TEXT,
      payload JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS grants_source_external_idx
      ON grants (source, external_id) WHERE external_id IS NOT NULL
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS grants_user_idx ON grants (user_id)`);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS pending_purchases (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      plan TEXT NOT NULL,
      source TEXT NOT NULL,
      external_id TEXT,
      ends_at TIMESTAMP,
      note TEXT,
      payload JSONB,
      claimed_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS pending_purchases_source_external_idx
      ON pending_purchases (source, external_id) WHERE external_id IS NOT NULL
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS pending_purchases_email_idx ON pending_purchases (lower(email))`);
  await db.execute(sql`
    INSERT INTO grants (user_id, plan, source, external_id, note)
    SELECT u.id, u.plan::text, 'legacy', 'legacy:' || u.id,
           'Backfilled from users.plan when the grants table was introduced'
    FROM users u
    WHERE u.plan <> 'essential'
      AND NOT EXISTS (SELECT 1 FROM grants g WHERE g.user_id = u.id)
    ON CONFLICT DO NOTHING
  `);
}
async function recomputePlan(userId) {
  await ensureSchema();
  const db = await getDb();
  if (!db) throw new Error("[entitlements] database not available");
  const live = await db.execute(sql`
    SELECT plan FROM grants
    WHERE user_id = ${userId}
      AND status = 'active'
      AND (ends_at IS NULL OR ends_at > NOW())
  `);
  let plan = "essential";
  for (const row of rows(live)) {
    const candidate = row.plan;
    if (isPlan(candidate) && RANK[candidate] > RANK[plan]) plan = candidate;
  }
  await db.execute(sql`UPDATE users SET plan = ${plan}::plan WHERE id = ${userId}`);
  await db.execute(sql`
    INSERT INTO "userSubscriptions" ("userId", plan, status)
    VALUES (${userId}, ${plan}::plan, 'active')
    ON CONFLICT ("userId") DO UPDATE SET plan = ${plan}::plan, status = 'active', "updatedAt" = NOW()
  `);
  return plan;
}
async function grantEntitlement(opts) {
  await ensureSchema();
  const db = await getDb();
  if (!db) throw new Error("[entitlements] database not available");
  const externalId = opts.externalId ?? null;
  const endsAt = opts.endsAt ?? null;
  const note = opts.note ?? null;
  const payload = opts.payload === void 0 ? null : JSON.stringify(opts.payload);
  if (externalId) {
    await db.execute(sql`
      INSERT INTO grants (user_id, plan, source, external_id, status, ends_at, note, payload)
      VALUES (${opts.userId}, ${opts.plan}, ${opts.source}, ${externalId}, 'active', ${endsAt}, ${note}, ${payload}::jsonb)
      -- the unique index is partial, so the predicate has to be repeated here
      -- for Postgres to infer it
      ON CONFLICT (source, external_id) WHERE external_id IS NOT NULL DO UPDATE
        SET user_id = EXCLUDED.user_id, plan = EXCLUDED.plan, status = 'active',
            ends_at = EXCLUDED.ends_at, note = EXCLUDED.note,
            payload = COALESCE(EXCLUDED.payload, grants.payload), updated_at = NOW()
    `);
  } else {
    await db.execute(sql`
      INSERT INTO grants (user_id, plan, source, status, ends_at, note, payload)
      VALUES (${opts.userId}, ${opts.plan}, ${opts.source}, 'active', ${endsAt}, ${note}, ${payload}::jsonb)
    `);
  }
  return recomputePlan(opts.userId);
}
async function revokeEntitlement(opts) {
  await ensureSchema();
  const db = await getDb();
  if (!db) throw new Error("[entitlements] database not available");
  const result = await db.execute(sql`
    UPDATE grants
    SET status = ${opts.status ?? "cancelled"},
        note = COALESCE(${opts.note ?? null}, note),
        updated_at = NOW()
    WHERE source = ${opts.source} AND external_id = ${opts.externalId}
    RETURNING user_id
  `);
  const row = rows(result)[0];
  if (!row) return null;
  return recomputePlan(Number(row.user_id));
}
async function recordPendingPurchase(opts) {
  await ensureSchema();
  const db = await getDb();
  if (!db) throw new Error("[entitlements] database not available");
  const payload = opts.payload === void 0 ? null : JSON.stringify(opts.payload);
  await db.execute(sql`
    INSERT INTO pending_purchases (email, plan, source, external_id, ends_at, note, payload)
    VALUES (${opts.email.toLowerCase()}, ${opts.plan}, ${opts.source}, ${opts.externalId ?? null},
            ${opts.endsAt ?? null}, ${opts.note ?? null}, ${payload}::jsonb)
    ON CONFLICT (source, external_id) WHERE external_id IS NOT NULL DO UPDATE
      SET email = EXCLUDED.email, plan = EXCLUDED.plan, ends_at = EXCLUDED.ends_at,
          note = EXCLUDED.note, payload = COALESCE(EXCLUDED.payload, pending_purchases.payload)
  `);
}
async function claimPendingPurchases(userId, email) {
  if (!email) return null;
  await ensureSchema();
  const db = await getDb();
  if (!db) throw new Error("[entitlements] database not available");
  const pending = await db.execute(sql`
    SELECT id, plan, source, external_id, ends_at, note, payload
    FROM pending_purchases
    WHERE lower(email) = ${email.toLowerCase()} AND claimed_at IS NULL
  `);
  const list = rows(pending);
  if (list.length === 0) return null;
  for (const row of list) {
    if (!isPlan(row.plan)) continue;
    await grantEntitlement({
      userId,
      plan: row.plan,
      source: row.source,
      externalId: row.external_id,
      endsAt: row.ends_at ? new Date(row.ends_at) : null,
      note: row.note ?? "claimed after sign-in",
      payload: row.payload ?? void 0
    });
    await db.execute(sql`UPDATE pending_purchases SET claimed_at = NOW() WHERE id = ${row.id}`);
  }
  return recomputePlan(userId);
}
var RANK, isPlan, schemaReady;
var init_entitlements = __esm({
  "server/_core/entitlements.ts"() {
    "use strict";
    init_db();
    RANK = { essential: 0, pro: 1, pro_plus: 2, lifetime: 3 };
    isPlan = (v) => typeof v === "string" && Object.prototype.hasOwnProperty.call(RANK, v);
    schemaReady = null;
  }
});

// server/_core/lemonSqueezy.ts
var lemonSqueezy_exports = {};
__export(lemonSqueezy_exports, {
  handleEvent: () => handleEvent,
  handleWebhookRequest: () => handleWebhookRequest,
  verifySignature: () => verifySignature
});
import crypto2 from "node:crypto";
import { sql as sql3 } from "drizzle-orm";
function verifySignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  const expected = crypto2.createHmac("sha256", secret).update(rawBody).digest();
  let received;
  try {
    received = Buffer.from(signature, "hex");
  } catch {
    return false;
  }
  if (received.length !== expected.length) return false;
  return crypto2.timingSafeEqual(received, expected);
}
function variantMap() {
  const raw = process.env.LEMON_SQUEEZY_VARIANTS ?? "";
  if (!raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw);
    const out = {};
    for (const [variant, plan] of Object.entries(parsed)) {
      if (plan === "pro" || plan === "pro_plus" || plan === "lifetime") out[String(variant)] = plan;
    }
    return out;
  } catch {
    console.error("[lemon-squeezy] LEMON_SQUEEZY_VARIANTS is not valid JSON \u2014 no purchase can be mapped to a plan");
    return {};
  }
}
async function findUserIdByEmail(email) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.execute(sql3`SELECT id FROM users WHERE lower(email) = ${email.toLowerCase()} LIMIT 1`);
  const row = (result.rows ?? result)[0];
  return row ? Number(row.id) : null;
}
async function handleEvent(payload) {
  const event = payload?.meta?.event_name ?? "";
  const attributes = payload?.data?.attributes ?? {};
  const objectId = payload?.data?.id ? String(payload.data.id) : null;
  if (!event) return { status: 400, body: { ok: false, reason: "missing event name" } };
  const variantId = attributes.variant_id ?? attributes.first_order_item?.variant_id;
  const plan = variantMap()[String(variantId)];
  const customUserId = payload?.meta?.custom_data?.user_id;
  const email = attributes.user_email ?? attributes.email ?? null;
  if (ENDING_EVENTS.has(event)) {
    if (!objectId) return { status: 400, body: { ok: false, reason: "missing object id" } };
    const left = await revokeEntitlement({
      source: "lemon_squeezy",
      externalId: objectId,
      status: event === "order_refunded" ? "refunded" : "expired",
      note: `lemon squeezy: ${event}`
    });
    return { status: 200, body: { ok: true, handled: event, plan: left } };
  }
  if (!GRANTING_EVENTS.has(event)) {
    return { status: 200, body: { ok: true, handled: `ignored: ${event}` } };
  }
  if (!plan) {
    console.error(`[lemon-squeezy] no plan mapped for variant ${variantId} (event ${event})`);
    return { status: 200, body: { ok: false, reason: `unmapped variant ${variantId}` } };
  }
  if (!objectId) return { status: 400, body: { ok: false, reason: "missing object id" } };
  const status = attributes.status;
  if (status && !["active", "on_trial", "cancelled", "paused"].includes(status)) {
    if (["expired", "unpaid", "past_due"].includes(status)) {
      const left = await revokeEntitlement({
        source: "lemon_squeezy",
        externalId: objectId,
        status: "expired",
        note: `lemon squeezy status: ${status}`
      });
      return { status: 200, body: { ok: true, handled: `${event} (${status})`, plan: left } };
    }
  }
  const endsRaw = attributes.ends_at ?? attributes.renews_at ?? null;
  const endsAt = plan === "lifetime" ? null : endsRaw ? new Date(endsRaw) : null;
  const note = `lemon squeezy: ${event}${status ? ` (${status})` : ""}`;
  let userId = customUserId ? Number(customUserId) : null;
  if (userId && !Number.isFinite(userId)) userId = null;
  if (!userId && email) userId = await findUserIdByEmail(email);
  if (!userId) {
    if (!email) return { status: 200, body: { ok: false, reason: "no user and no e-mail on the order" } };
    await recordPendingPurchase({
      email,
      plan,
      source: "lemon_squeezy",
      externalId: objectId,
      endsAt,
      note,
      payload
    });
    return { status: 200, body: { ok: true, handled: `${event} \u2192 pending (${email})` } };
  }
  const resulting = await grantEntitlement({
    userId,
    plan,
    source: "lemon_squeezy",
    externalId: objectId,
    endsAt,
    note,
    payload
  });
  return { status: 200, body: { ok: true, handled: event, plan: resulting } };
}
async function handleWebhookRequest(rawBody, signature) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET ?? "";
  if (!secret) {
    console.error("[lemon-squeezy] LEMON_SQUEEZY_WEBHOOK_SECRET is not set \u2014 rejecting the delivery");
    return { status: 500, body: { ok: false, reason: "webhook secret not configured" } };
  }
  if (!verifySignature(rawBody, signature, secret)) {
    return { status: 401, body: { ok: false, reason: "invalid signature" } };
  }
  let payload;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return { status: 400, body: { ok: false, reason: "body is not JSON" } };
  }
  try {
    return await handleEvent(payload);
  } catch (e) {
    console.error("[lemon-squeezy] handler failed:", e?.message ?? e);
    return { status: 500, body: { ok: false, reason: "handler failed" } };
  }
}
var ENDING_EVENTS, GRANTING_EVENTS;
var init_lemonSqueezy = __esm({
  "server/_core/lemonSqueezy.ts"() {
    "use strict";
    init_db();
    init_entitlements();
    ENDING_EVENTS = /* @__PURE__ */ new Set(["subscription_expired", "order_refunded"]);
    GRANTING_EVENTS = /* @__PURE__ */ new Set([
      "order_created",
      "subscription_created",
      "subscription_updated",
      "subscription_resumed",
      "subscription_unpaused",
      "subscription_payment_success"
    ]);
  }
});

// api/_index.ts
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/oauth.ts
init_db();

// server/_core/cookies.ts
var LOCAL_HOSTS = /* @__PURE__ */ new Set(["localhost", "127.0.0.1", "::1"]);
function isIpAddress(host) {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
var FAMILY_DOMAIN = "healthguardai.app";
function getSharedCookieDomain(req) {
  const hostname = (req.hostname || "").toLowerCase();
  if (!hostname || LOCAL_HOSTS.has(hostname) || isIpAddress(hostname)) return void 0;
  if (hostname === FAMILY_DOMAIN || hostname.endsWith(`.${FAMILY_DOMAIN}`)) {
    return `.${FAMILY_DOMAIN}`;
  }
  return void 0;
}
function getSessionCookieOptions(req) {
  const secure = isSecureRequest(req);
  const domain = getSharedCookieDomain(req);
  return {
    httpOnly: true,
    path: "/",
    sameSite: secure ? "none" : "lax",
    secure,
    ...domain ? { domain } : {}
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
init_db();
init_env();
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  // Sign with the shared secret when configured so a token verifies on every
  // HealthGuard app (cross-app SSO); fall back to the per-app secret if the
  // shared one is not set yet — safe rollout, single-app behaviour until then.
  getSigningSecret() {
    const secret = ENV.sharedCookieSecret || ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  // Verify against BOTH the shared secret and this app's own secret, so tokens
  // minted before the shared secret existed (or by a sibling app) still validate.
  // This is what lets us roll out SSO without logging anyone out.
  getVerifySecrets() {
    const enc = new TextEncoder();
    const out = [];
    if (ENV.sharedCookieSecret) out.push(enc.encode(ENV.sharedCookieSecret));
    if (ENV.cookieSecret) out.push(enc.encode(ENV.cookieSecret));
    if (out.length === 0) out.push(enc.encode(""));
    return out;
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || "",
        email: options.email
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSigningSecret();
    const claims = {
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    };
    if (isNonEmptyString(payload.email)) {
      claims.email = payload.email;
    }
    return new SignJWT(claims).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      let payload = null;
      let lastError = null;
      for (const secretKey of this.getVerifySecrets()) {
        try {
          const res = await jwtVerify(cookieValue, secretKey, {
            algorithms: ["HS256"]
          });
          payload = res.payload;
          break;
        } catch (err) {
          lastError = err;
        }
      }
      if (!payload) {
        throw lastError ?? new Error("Session signature did not match any key");
      }
      const { openId, appId, name, email } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name,
        email: isNonEmptyString(email) ? email : void 0
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user && isNonEmptyString(session.email)) {
      const byEmail = await getUserByEmail(session.email);
      if (byEmail) {
        user = byEmail;
      } else {
        await upsertUser({
          openId: sessionUserId,
          name: session.name || null,
          email: session.email,
          loginMethod: "email",
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(sessionUserId);
      }
    }
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
init_oauth();
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app2) {
  app2.get("/auth/google/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    if (!code) {
      res.redirect(302, "/login?error=missing_code");
      return;
    }
    try {
      const { getGoogleAccessToken: getGoogleAccessToken2, getGoogleUserInfo: getGoogleUserInfo2, handleSocialLogin: handleSocialLogin2 } = await Promise.resolve().then(() => (init_oauth(), oauth_exports));
      const tokenResponse = await getGoogleAccessToken2(code);
      const userInfo = await getGoogleUserInfo2(tokenResponse.access_token);
      await handleSocialLogin2(
        "google",
        userInfo.id,
        userInfo.email,
        userInfo.name,
        tokenResponse.access_token,
        tokenResponse.refresh_token,
        tokenResponse.expires_in
      );
      const openId = `google_${userInfo.id}`;
      const sessionToken = await sdk.createSessionToken(openId, {
        name: userInfo.name || "",
        email: userInfo.email || void 0,
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/dashboard");
    } catch (error) {
      console.error("[Google OAuth] Callback failed", error);
      res.redirect(302, "/login?error=google_auth_failed");
    }
  });
  app2.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        email: userInfo.email ?? void 0,
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/routers.ts
init_entitlements();

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
init_env();
import { TRPCError as TRPCError2 } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError2({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError2({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError2({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError2({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError2({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError2({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError3 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError3({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError3({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/ai.ts
import { z as z2 } from "zod";
import { TRPCError as TRPCError4 } from "@trpc/server";

// server/email.ts
init_env();
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ENV.emailUser || "your-email@gmail.com",
    pass: ENV.emailPassword || "your-app-password"
  }
});
var APP_ORIGIN = process.env.APP_URL || "https://www.skinguardai.app";
var emailTemplates = {
  passwordReset: (resetLink, userName) => ({
    subject: "Reset Your SkinGuard AI Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">SkinGuard AI</h1>
        </div>
        <div style="background: #f8fafc; padding: 40px; border-radius: 0 0 8px 8px;">
          <p style="color: #334155; font-size: 16px; margin-bottom: 20px;">Hi ${userName},</p>
          <p style="color: #334155; font-size: 16px; margin-bottom: 30px;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #06b6d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 10px;">
            Or copy and paste this link in your browser:
          </p>
          <p style="color: #06b6d4; font-size: 12px; word-break: break-all; margin-bottom: 30px;">
            ${resetLink}
          </p>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 10px;">
            This link will expire in 1 hour.
          </p>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">
            If you didn't request this, you can ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            \xA9 2026 SkinGuard AI. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),
  emailVerification: (verificationLink, userName) => ({
    subject: "Verify Your SkinGuard AI Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">SkinGuard AI</h1>
        </div>
        <div style="background: #f8fafc; padding: 40px; border-radius: 0 0 8px 8px;">
          <p style="color: #334155; font-size: 16px; margin-bottom: 20px;">Hi ${userName},</p>
          <p style="color: #334155; font-size: 16px; margin-bottom: 30px;">
            Welcome to SkinGuard AI! Please verify your email address to get started.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background: #06b6d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 10px;">
            Or copy and paste this link in your browser:
          </p>
          <p style="color: #06b6d4; font-size: 12px; word-break: break-all; margin-bottom: 30px;">
            ${verificationLink}
          </p>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">
            This link will expire in 24 hours.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            \xA9 2026 SkinGuard AI. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),
  welcomeEmail: (userName) => ({
    subject: "Welcome to SkinGuard AI!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">SkinGuard AI</h1>
        </div>
        <div style="background: #f8fafc; padding: 40px; border-radius: 0 0 8px 8px;">
          <p style="color: #334155; font-size: 16px; margin-bottom: 20px;">Hi ${userName},</p>
          <p style="color: #334155; font-size: 16px; margin-bottom: 20px;">
            Your email has been verified! You're all set to start tracking your skin health with AI support.
          </p>
          <p style="color: #334155; font-size: 16px; margin-bottom: 30px;">
            Get started by taking your first scan or exploring your dashboard.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_ORIGIN}/dashboard" style="background: #06b6d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            \xA9 2026 SkinGuard AI. All rights reserved.
          </p>
        </div>
      </div>
    `
  })
};
async function sendPasswordResetEmail(email, userName, resetToken) {
  const resetLink = `${APP_ORIGIN}/reset-password?token=${resetToken}`;
  const template = emailTemplates.passwordReset(resetLink, userName);
  try {
    await transporter.sendMail({
      from: ENV.emailUser || "noreply@skinguardai.app",
      to: email,
      subject: template.subject,
      html: template.html
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return { success: false, error };
  }
}
async function sendEmailVerificationEmail(email, userName, verificationToken) {
  const verificationLink = `${APP_ORIGIN}/verify-email?token=${verificationToken}`;
  const template = emailTemplates.emailVerification(verificationLink, userName);
  try {
    await transporter.sendMail({
      from: ENV.emailUser || "noreply@skinguardai.app",
      to: email,
      subject: template.subject,
      html: template.html
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send email verification email:", error);
    return { success: false, error };
  }
}
async function sendWelcomeEmail(email, userName) {
  const template = emailTemplates.welcomeEmail(userName);
  try {
    await transporter.sendMail({
      from: ENV.emailUser || "noreply@skinguardai.app",
      to: email,
      subject: template.subject,
      html: template.html
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { success: false, error };
  }
}
var MODERATION_INBOX = process.env.MODERATION_EMAIL || "info@skinguardai.app";
async function sendAiContentReport(report) {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  try {
    await transporter.sendMail({
      from: ENV.emailUser || "noreply@skinguardai.app",
      to: MODERATION_INBOX,
      subject: `[SkinGuard AI] AI content report \u2014 ${report.reason} (${report.surface})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px;">
          <h2 style="color:#0891b2;margin-bottom:4px;">AI content report</h2>
          <p style="color:#64748b;font-size:13px;margin-top:0;">
            Filed from the in-app report control (Google Play AI-Generated Content policy).
          </p>
          <table style="border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Screen</td><td>${esc(report.surface)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Reason</td><td><strong>${esc(report.reason)}</strong></td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Language</td><td>${esc(report.language)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#64748b;">User</td><td>${esc(report.userEmail || report.userId || "not signed in")}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Received</td><td>${(/* @__PURE__ */ new Date()).toISOString()}</td></tr>
          </table>
          ${report.details ? `<h3 style="margin-bottom:4px;">What the user wrote</h3><p style="white-space:pre-wrap;background:#f8fafc;padding:12px;border-radius:6px;">${esc(report.details)}</p>` : ""}
          ${report.content ? `<h3 style="margin-bottom:4px;">Flagged AI output</h3><pre style="white-space:pre-wrap;background:#f8fafc;padding:12px;border-radius:6px;font-size:12px;">${esc(report.content)}</pre>` : ""}
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send AI content report:", error);
    return { success: false, error };
  }
}
async function sendAccountDeletionRequest(request) {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  try {
    await transporter.sendMail({
      from: ENV.emailUser || "noreply@skinguardai.app",
      to: MODERATION_INBOX,
      subject: `[SkinGuard AI] Account deletion request \u2014 ${request.email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px;">
          <h2 style="color:#0891b2;margin-bottom:4px;">Account deletion request</h2>
          <p style="color:#64748b;font-size:13px;margin-top:0;">
            Filed from https://www.skinguardai.app/delete-account
          </p>
          <table style="border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Account e-mail</td><td><strong>${esc(request.email)}</strong></td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#64748b;">Received</td><td>${(/* @__PURE__ */ new Date()).toISOString()}</td></tr>
          </table>
          ${request.note ? `<h3 style="margin-bottom:4px;">Note</h3><p style="white-space:pre-wrap;background:#f8fafc;padding:12px;border-radius:6px;">${esc(request.note)}</p>` : ""}
          <p style="color:#64748b;font-size:13px;">Verify ownership of the address before erasing, then delete the account and all associated data within 30 days.</p>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send account deletion request:", error);
    return { success: false, error };
  }
}

// server/ai.ts
var ipLimitMap = /* @__PURE__ */ new Map();
function checkIpLimit(ip, maxPerDay = 3) {
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const entry = ipLimitMap.get(ip);
  if (!entry || entry.date !== today) {
    ipLimitMap.set(ip, { count: 1, date: today });
    return maxPerDay - 1;
  }
  if (entry.count >= maxPerDay) {
    throw new TRPCError4({ code: "TOO_MANY_REQUESTS", message: "Daily limit reached" });
  }
  entry.count++;
  return maxPerDay - entry.count;
}
var GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
var GEMINI_MODEL = "gemini-2.5-flash";
var LAB_MODEL = "gemini-2.5-flash";
var LAB_LITE = false;
var ABCDE_PROMPT = `You are an AI assistant that describes photographs of skin moles/lesions against the ABCDE criteria that dermatologists teach for skin self-examination. You do not screen for, detect or diagnose disease \u2014 you describe what is visible in the image so the user can track it and discuss it with a dermatologist. Analyze this skin mole/lesion image using the ABCDE criteria.

Return ONLY a valid JSON object (no markdown, no code blocks, no extra text) with this EXACT structure:
{
  "asymmetry": {
    "score": <integer 0-100>,
    "descriptionCode": "<code from list below>"
  },
  "border": {
    "score": <integer 0-100>,
    "descriptionCode": "<code from list below>"
  },
  "color": {
    "score": <integer 0-100>,
    "descriptionCode": "<code from list below>"
  },
  "diameter": {
    "score": <integer 0-100>,
    "descriptionCode": "<code from list below>"
  },
  "overallRisk": "<low|medium|high>",
  "recommendationCode": "<code from list below>",
  "disclaimer": "This AI analysis is for informational purposes only and is not a medical diagnosis. Always consult a qualified dermatologist for professional evaluation."
}

AVAILABLE DESCRIPTION CODES (choose the most appropriate one):

ASYMMETRY_CODES:
- "ASYMMETRY_NONE": The lesion appears completely symmetrical.
- "ASYMMETRY_MINOR": The lesion shows minimal asymmetry in one axis.
- "ASYMMETRY_MODERATE": The lesion exhibits some asymmetry in its overall shape.
- "ASYMMETRY_SIGNIFICANT": The lesion is significantly asymmetrical in multiple axes.

BORDER_CODES:
- "BORDER_REGULAR": The borders are smooth and well-defined.
- "BORDER_SLIGHTLY_IRREGULAR": The borders show slight irregularity.
- "BORDER_IRREGULAR": The borders appear irregular and somewhat blurred.
- "BORDER_VERY_IRREGULAR": The borders are highly irregular, ragged, or notched.

COLOR_CODES:
- "COLOR_UNIFORM": The lesion shows uniform color throughout.
- "COLOR_SLIGHT_VARIATION": The lesion shows slight color variation.
- "COLOR_MODERATE_VARIATION": The lesion shows some variation in color.
- "COLOR_SIGNIFICANT_VARIATION": The lesion shows multiple colors or significant variation.

DIAMETER_CODES:
- "DIAMETER_SMALL": The lesion appears small, less than 6mm.
- "DIAMETER_MEDIUM": The lesion appears medium, around 6mm.
- "DIAMETER_LARGE": The lesion appears larger than 6mm.
- "DIAMETER_VERY_LARGE": The lesion appears significantly larger than 6mm.

RECOMMENDATION_CODES:
- "RECOMMENDATION_LOW": "Given the low risk assessment, continue regular self-monitoring and annual dermatologist visits as recommended for your age group. No immediate action required."
- "RECOMMENDATION_MEDIUM": "Given the medium risk assessment, it is advisable to have this lesion examined by a dermatologist for a definitive diagnosis. Regular self-skin checks are also recommended."
- "RECOMMENDATION_HIGH": "Given the high risk assessment, please schedule an appointment with a dermatologist as soon as possible for professional evaluation. Do not delay seeking medical advice."
- "RECOMMENDATION_URGENT": "This lesion shows concerning features. Please consult a dermatologist immediately for professional evaluation."

Scoring guide \u2014 each score is independent (0 = no concern at all, 100 = maximum concern):
- A (Asymmetry): 0 = perfectly symmetrical, 100 = highly asymmetrical in both axes
- B (Border): 0 = smooth well-defined edges, 100 = very irregular ragged notched edges
- C (Color): 0 = completely uniform single color, 100 = multiple colors significant variation
- D (Diameter): 0 = tiny lesion clearly under 6mm, 100 = very large lesion well over 6mm

IMPORTANT SCORING RULES:
- A normal healthy mole with no concerning features should score 0-20 on ALL criteria.
- Only score 60+ if that specific feature is clearly and significantly abnormal.
- Do NOT inflate scores. A slightly irregular border is 30-45, not 70.
- The scores MUST reflect only what you actually see in the image.
- Set overallRisk based ONLY on the scores you assign, using this exact table:
  * "low"   \u2192 weighted average below 30 (weights: A=30%, B=30%, C=25%, D=15%)
  * "medium" \u2192 weighted average 30\u201354
  * "high"  \u2192 weighted average 55 or above

IMPORTANT: Choose the most appropriate code from the lists above. Do not write free text descriptions.`;
function computeRisk(analysis) {
  const s = (key) => {
    const val = analysis[key]?.score;
    return typeof val === "number" ? Math.max(0, Math.min(100, val)) : 0;
  };
  const a = s("asymmetry");
  const b = s("border");
  const c = s("color");
  const d = s("diameter");
  const weighted = a * 0.3 + b * 0.3 + c * 0.25 + d * 0.15;
  if (weighted < 30) return "low";
  if (weighted < 55) return "medium";
  return "high";
}
function getApiKey() {
  const apiKey = process.env.GOOGLE_AI_STUDIO_KEY;
  if (!apiKey) {
    throw new TRPCError4({
      code: "INTERNAL_SERVER_ERROR",
      message: "GOOGLE_AI_STUDIO_KEY environment variable is not set."
    });
  }
  return apiKey;
}
function extractJson(raw) {
  let text2 = raw.replace(/^```(?:json)?\s*/im, "").replace(/\s*```\s*$/im, "").trim();
  try {
    return JSON.parse(text2);
  } catch {
  }
  const match = text2.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {
    }
  }
  throw new Error("Cannot extract valid JSON from Gemini response");
}
async function callGeminiWithRetry(base64Data, mimeType, maxRetries = 3) {
  const apiKey = getApiKey();
  const url = `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: ABCDE_PROMPT },
                {
                  inlineData: {
                    mimeType,
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            // Force JSON output — prevents markdown wrapping
            maxOutputTokens: 1024,
            temperature: 0.1,
            // Disable thinking tokens — gemini-2.5-flash puts them in parts[0]
            // with {thought:true} which breaks our JSON extraction.
            thinkingConfig: {
              thinkingBudget: 0
            }
          }
        })
      });
      if (!response.ok) {
        let errText = await response.text();
        if (response.status === 404) {
          try {
            const listResp = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=20`
            );
            const listData = await listResp.json();
            const names = (listData.models ?? []).map((m) => m.name).join(" | ");
            errText += ` || AVAILABLE_MODELS: [${names || "NONE \u2014 key may be invalid"}]`;
          } catch {
          }
        }
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }
      const data = await response.json();
      const parts = data.candidates?.[0]?.content?.parts ?? [];
      const outputPart = parts.find((p) => !p.thought && typeof p.text === "string");
      const rawText = outputPart?.text ?? parts[0]?.text;
      if (!rawText) {
        throw new Error("Empty response received from Gemini.");
      }
      try {
        return extractJson(rawText);
      } catch {
        lastError = new Error(`Invalid JSON from Gemini on attempt ${attempt}/${maxRetries}.`);
        console.warn(`Gemini JSON parse failed on attempt ${attempt}.`);
        if (attempt === maxRetries) {
          throw new TRPCError4({
            code: "INTERNAL_SERVER_ERROR",
            message: "Gemini returned an invalid JSON response after multiple attempts."
          });
        }
        continue;
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`Gemini request failed on attempt ${attempt}:`, lastError.message);
      if (attempt === maxRetries) {
        throw new TRPCError4({
          code: "INTERNAL_SERVER_ERROR",
          message: `Gemini request failed after ${maxRetries} attempts: ${lastError.message}`
        });
      }
    }
  }
  throw lastError ?? new Error("Unknown error in Gemini call");
}
async function callGemini(payload, maxRetries = 3, model = GEMINI_MODEL) {
  const apiKey = getApiKey();
  const url = `${GEMINI_API_BASE}/models/${model}:generateContent`;
  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errText = await response.text();
        console.error(`[GeminiError] model=${model} status=${response.status} body=${errText.slice(0, 700)}`);
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }
      const data = await response.json();
      const parts = data.candidates?.[0]?.content?.parts ?? [];
      const rawText = parts.filter((p) => !p.thought && typeof p.text === "string").map((p) => p.text).join("") || parts[0]?.text;
      if (!rawText) {
        const fr = data.candidates?.[0]?.finishReason;
        console.error(`[GeminiEmpty] model=${model} finishReason=${fr}`);
        throw new Error(`Empty response from Gemini (finishReason=${fr}).`);
      }
      try {
        return extractJson(rawText);
      } catch {
        const fr = data.candidates?.[0]?.finishReason;
        console.error(`[GeminiBadJSON] model=${model} len=${rawText.length} finishReason=${fr} partsCount=${parts.length}`);
        lastError = new Error(`Invalid JSON from Gemini on attempt ${attempt}.`);
        if (attempt === maxRetries) {
          throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Gemini returned invalid JSON after retries." });
        }
        await new Promise((r) => setTimeout(r, attempt * 1e3));
        continue;
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt === maxRetries) {
        console.error(`[GeminiFail] model=${model} attempts=${attempt} msg=${lastError.message.slice(0, 700)}`);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: `Gemini failed: ${lastError.message}` });
      }
      await new Promise((r) => setTimeout(r, attempt * 1200));
    }
  }
  throw lastError ?? new Error("Unknown error");
}
var LAB_SCHEMA = {
  type: "OBJECT",
  properties: {
    analyzable: { type: "BOOLEAN" },
    reportInfo: { type: "OBJECT", properties: {
      patient: { type: "STRING" },
      reason: { type: "STRING" },
      sampleDate: { type: "STRING" },
      doctor: { type: "STRING" },
      facility: { type: "STRING" },
      panels: { type: "STRING" }
    } },
    overview: { type: "STRING" },
    tests: { type: "ARRAY", items: { type: "OBJECT", properties: {
      category: { type: "STRING" },
      name: { type: "STRING" },
      value: { type: "STRING" },
      unit: { type: "STRING" },
      referenceRange: { type: "STRING" },
      status: { type: "STRING", enum: ["low", "normal", "high", "unknown"] }
    } } },
    referenceNotes: { type: "ARRAY", items: { type: "STRING" } },
    findings: { type: "ARRAY", items: { type: "OBJECT", properties: {
      title: { type: "STRING" },
      badge: { type: "STRING" },
      severity: { type: "STRING", enum: ["info", "mild", "moderate", "high"] },
      explanation: { type: "STRING" }
    } } },
    reassuring: { type: "ARRAY", items: { type: "STRING" } },
    urgency: { type: "OBJECT", properties: { level: { type: "STRING" }, text: { type: "STRING" } } },
    emergencyRedFlags: { type: "ARRAY", items: { type: "STRING" } },
    questionsForDoctor: { type: "ARRAY", items: { type: "STRING" } },
    furtherTests: { type: "ARRAY", items: { type: "STRING" } },
    homeActions: { type: "OBJECT", properties: {
      dos: { type: "ARRAY", items: { type: "STRING" } },
      donts: { type: "ARRAY", items: { type: "STRING" } }
    } },
    disclaimer: { type: "STRING" }
  }
};
function buildLabReportPrompt(lang, files) {
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const LAB_LANG_NAMES = { en: "English", hu: "Hungarian", de: "German", es: "Spanish", pt: "Portuguese", ru: "Russian", zh: "Chinese (Simplified)", vi: "Vietnamese", hi: "Hindi", th: "Thai", ro: "Romanian" };
  const langName = LAB_LANG_NAMES[lang] || lang;
  return {
    contents: [{
      parts: [
        { text: `You are a meticulous medical health-literacy expert writing a PROFESSIONAL, patient-friendly summary of a MEDICAL REPORT for a layperson and their family. The report may be a laboratory/blood test, a nerve-conduction study (EMG/ENG), an imaging or radiology report, a pathology report, or another diagnostic medical document. CRITICAL OUTPUT LANGUAGE: write your ENTIRE response - every field value, finding, explanation, question and note - in ${langName}. These instructions are in English, but your output must be written 100% in ${langName}, NOT in English. The attached file(s) are medical report(s) - lab/blood results, EMG/ENG nerve-conduction studies, imaging/radiology, pathology or similar (may be several pages or panels). Today's date is ${today} (for reference only \u2014 do NOT deliberate about ages or years). Read EVERYTHING: patient/header details, every test row on every page, units, reference ranges, and dates.

Write like a caring, careful doctor explaining results to a family: clear, reassuring, honest, and genuinely useful. CONNECT the findings into one coherent picture instead of listing them in isolation. Always account for the patient's AGE and SEX when interpreting reference ranges (e.g. ideal young-adult targets are not realistic for an elderly patient; note sex-specific ranges).

Fill the given JSON schema (it defines the exact structure \u2014 you do not need to restate it). Field guide:
- reportInfo: COPY the patient's name/sex/age/DOB, reason/diagnosis, sample date, doctor, facility and panel names EXACTLY as printed. Do not compute or deliberate.
- tests: EVERY row from every page; value, unit and referenceRange EXACTLY as printed; status = low|normal|high|unknown; "category" = the test's panel name.
- overview: 2-3 sentences on how the findings connect. findings: only the important abnormal results (short title, severity info|mild|moderate|high, a SHORT plain explanation, never a diagnosis). reassuring = normal/good news. urgency = {short level, 1-2 sentences}. emergencyRedFlags / questionsForDoctor / furtherTests = short lists. homeActions = {dos, donts}. disclaimer = one sentence.

CRITICAL RULES:
- NEVER state a diagnosis or name a disease as a conclusion. Describe what markers measure and what they MAY indicate, always deferring to the doctor. Use careful, hedged language.
- Be calm and non-alarming, but do not hide important findings. For out-of-range values, explain plainly and say they are worth discussing with a doctor.
- Read and include EVERY test row from EVERY page. Keep values, units and reference ranges EXACTLY as printed. Group each test by its panel in "category".
- Tailor interpretation to the patient's age and sex when shown; if a flagged value is expected/benign for that age, say so in referenceNotes or the finding.
- "findings" covers the abnormal or clinically meaningful results (not every normal one). "reassuring" covers the normal / good news.
- emergencyRedFlags must be genuinely urgent symptoms relevant to the abnormal findings.
- Some reports (e.g. EMG/ENG nerve-conduction, imaging/radiology, pathology) have NO numeric test table - that is fine: leave "tests" empty and summarize the study's key measurements and the doctor's own impression/conclusion in "overview" and "findings", in plain language (do NOT add a diagnosis of your own - restate what the report itself states).
- If the file is NOT a readable medical report, set "analyzable" false, leave arrays empty, and put a short note in "overview" (in ${langName}) asking for a clearer photo or the original PDF.
- Keep the overview and every explanation FOCUSED and CONCISE \u2014 a few clear sentences each. This is a fast, readable summary, not a long essay.
- Output ONLY the final JSON values. NEVER write your reasoning, calculations, working notes, or any repeated/looping text inside a field \u2014 each field holds exactly ONE concise final value. Do not deliberate; just state the result.
- ALL human-readable text MUST be in ${langName}.${LAB_LITE ? "\n- BRIEF MODE (this is CRITICAL \u2014 respond quickly and compactly): each finding explanation = 1 short sentence; overview = 2 sentences. Include only the most important items \u2014 at most 4 findings, 3 questions, 3 further tests, 3 reassuring points, 3 emergency red flags, 2 dos and 2 donts. STILL include EVERY test row in the table (these are compact)." : ""}` },
        ...files.map((f) => ({ inlineData: { mimeType: f.mimeType, data: f.base64Data } }))
      ]
    }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: LAB_SCHEMA,
      maxOutputTokens: LAB_LITE ? 5120 : 12288,
      temperature: 0.5,
      thinkingConfig: { thinkingBudget: LAB_LITE ? 0 : 1024 }
    },
    safetySettings: [
      // Health apps hear about symptoms, injuries and distress, so the filters
      // must not fire on the very conversations we exist to hold. Dangerous
      // content therefore blocks only at HIGH: the prompts above are written to
      // meet self-harm and crisis talk with compassion and a hotline rather than
      // a refusal, and that has to keep working. The other three carry no such
      // need and stay at Google's normal threshold.
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
    ]
  };
}
var aiRouter = router({
  // Authenticated lab analysis — logged-in users get the full reader, no IP cap.
  analyzeLabReport: protectedProcedure.input(z2.object({
    files: z2.array(z2.object({
      fileBase64: z2.string().min(1),
      mimeType: z2.string().default("image/jpeg")
    })).min(1).max(5),
    language: z2.string().default("en")
  })).mutation(async ({ input }) => {
    const files = input.files.map((f) => {
      const m = f.fileBase64.match(/^data:([^;]+);base64,/i);
      return { mimeType: m?.[1] || f.mimeType, base64Data: f.fileBase64.replace(/^data:[^;]+;base64,/i, "") };
    });
    const payload = buildLabReportPrompt(input.language, files);
    const result = await callGemini(payload, LAB_LITE ? 1 : 2, LAB_MODEL);
    return { ...result, remainingToday: 999 };
  }),
  // Public IP-rate-limited demo (works without login).
  publicAnalyzeLabReport: publicProcedure.input(z2.object({
    files: z2.array(z2.object({
      fileBase64: z2.string().min(1),
      mimeType: z2.string().default("image/jpeg")
    })).min(1).max(5),
    language: z2.string().default("en")
  })).mutation(async ({ input, ctx }) => {
    const isPremiumUser = ctx.user !== null && ["pro", "pro_plus", "lifetime"].includes(ctx.user.plan ?? "");
    let remaining = 999;
    if (!isPremiumUser) {
      const ip = ctx.req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || ctx.req.socket?.remoteAddress || "unknown";
      remaining = checkIpLimit(ip, 3);
    }
    const files = input.files.map((f) => {
      const m = f.fileBase64.match(/^data:([^;]+);base64,/i);
      return { mimeType: m?.[1] || f.mimeType, base64Data: f.fileBase64.replace(/^data:[^;]+;base64,/i, "") };
    });
    const payload = buildLabReportPrompt(input.language, files);
    const result = await callGemini(payload, LAB_LITE ? 1 : 2, LAB_MODEL);
    return { ...result, remainingToday: remaining };
  }),
  analyzeImage: protectedProcedure.input(
    z2.object({
      imageBase64: z2.string().min(100, "Image data is too short \u2014 please provide a valid image"),
      mimeType: z2.string().default("image/jpeg")
    })
  ).mutation(async ({ input }) => {
    const base64Data = input.imageBase64.replace(
      /^data:image\/[a-z+]+;base64,/i,
      ""
    );
    const parsedAnalysis = await callGeminiWithRetry(
      base64Data,
      input.mimeType,
      3
    );
    parsedAnalysis.overallRisk = computeRisk(parsedAnalysis);
    return parsedAnalysis;
  }),
  // ── Public endpoint: no auth required, IP-rate-limited (3/day) ─────────────
  // Premium/Lifetime logged-in users bypass the IP limit entirely.
  publicAnalyzeImage: publicProcedure.input(
    z2.object({
      imageBase64: z2.string().min(100, "Image data is too short"),
      mimeType: z2.string().default("image/jpeg")
    })
  ).mutation(async ({ input, ctx }) => {
    const isPremiumUser = ctx.user !== null && ["pro", "pro_plus", "lifetime"].includes(ctx.user.plan ?? "");
    let remaining;
    if (isPremiumUser) {
      remaining = 999;
    } else {
      const ip = ctx.req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || ctx.req.socket?.remoteAddress || "unknown";
      remaining = checkIpLimit(ip, 3);
    }
    const base64Data = input.imageBase64.replace(
      /^data:image\/[a-z+]+;base64,/i,
      ""
    );
    const parsedAnalysis = await callGeminiWithRetry(base64Data, input.mimeType, 3);
    parsedAnalysis.overallRisk = computeRisk(parsedAnalysis);
    return { ...parsedAnalysis, remainingToday: remaining };
  }),
  // ── Report an AI output ────────────────────────────────────────────────────
  // Google Play's AI-Generated Content policy makes this mandatory, not optional:
  // an app that generates content with AI "must contain in-app user reporting or
  // flagging features that allow users to report or flag offensive content to
  // developers without needing to exit the app", and the reports must feed back
  // into moderation. Public, because the demo analysis on /test/capture runs
  // without an account — the person who sees a bad answer there must be able to
  // flag it too.
  //
  // Deliberately NOT rate-limited by the IP counter above: that counter exists to
  // ration expensive Gemini calls, and rationing safety reports would defeat the
  // policy. The size caps below are the abuse control instead.
  reportContent: publicProcedure.input(
    z2.object({
      surface: z2.enum([
        "mole-analysis",
        "lab-report",
        "ai-chat",
        "health-report",
        "other"
      ]),
      reason: z2.enum([
        "offensive",
        "harmful",
        "inaccurate",
        "irrelevant",
        "other"
      ]),
      details: z2.string().max(2e3).default(""),
      // The generated text being flagged. Never an image: reporting must not
      // become a side channel that mails someone's skin photo to our inbox.
      content: z2.string().max(8e3).default(""),
      language: z2.string().max(8).default("en")
    })
  ).mutation(async ({ input, ctx }) => {
    const result = await sendAiContentReport({
      surface: input.surface,
      reason: input.reason,
      details: input.details,
      content: input.content,
      language: input.language,
      // User ids are numeric; the report only ever renders them as text.
      userId: ctx.user?.id != null ? String(ctx.user.id) : null,
      userEmail: ctx.user?.email ?? null
    });
    if (!result.success) {
      throw new TRPCError4({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not deliver the report. Please try again."
      });
    }
    return { success: true };
  })
});

// server/routers.ts
init_db();
init_schema();
import { sql as sql2 } from "drizzle-orm";
import { eq as eq3, and, count, inArray } from "drizzle-orm";
import { z as z3 } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError as TRPCError5 } from "@trpc/server";
import crypto from "crypto";
init_oauth();
var appRouter = router({
  system: systemRouter,
  ai: aiRouter,
  config: router({
    getGoogleClientId: publicProcedure.query(async () => {
      const { ENV: ENV2 } = await Promise.resolve().then(() => (init_env(), env_exports));
      return { googleClientId: ENV2.googleClientId };
    })
  }),
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, cookieOptions);
      ctx.res.clearCookie(COOKIE_NAME, { path: "/" });
      return { success: true };
    }),
    // Permanently delete the account and ALL associated data (GDPR/CCPA erasure,
    // Apple 5.1.1(v) account-deletion requirement). Irreversible.
    deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const uid = ctx.user.id;
      const userMoles = await db.select({ id: moles.id }).from(moles).where(eq3(moles.userId, uid));
      const moleIds = userMoles.map((m) => m.id);
      if (moleIds.length) {
        const userPhotos = await db.select({ id: photos.id }).from(photos).where(inArray(photos.moleId, moleIds));
        const photoIds = userPhotos.map((p) => p.id);
        if (photoIds.length) await db.delete(analyses).where(inArray(analyses.photoId, photoIds));
        await db.delete(photos).where(inArray(photos.moleId, moleIds));
      }
      await db.delete(moles).where(eq3(moles.userId, uid));
      await db.delete(userSubscriptions).where(eq3(userSubscriptions.userId, uid));
      await db.delete(emailNotifications).where(eq3(emailNotifications.userId, uid));
      await db.delete(userPreferences).where(eq3(userPreferences.userId, uid));
      await db.delete(passwordResetTokens).where(eq3(passwordResetTokens.userId, uid));
      await db.delete(emailVerificationTokens).where(eq3(emailVerificationTokens.userId, uid));
      await db.delete(socialLogins).where(eq3(socialLogins.userId, uid));
      await db.delete(users).where(eq3(users.id, uid));
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, cookieOptions);
      ctx.res.clearCookie(COOKIE_NAME, { path: "/" });
      return { success: true };
    }),
    // Deletion requested from the PUBLIC /delete-account web page, with no
    // session. Google Play requires that route to exist next to the in-app
    // button ("provide a web link resource where users can request app account
    // deletion") precisely for the person who has already uninstalled the app
    // or lost access to their login and therefore has no in-app path left.
    //
    // This deliberately does not delete anything on its own: an unauthenticated
    // endpoint that erased whatever address it was handed would be a way to
    // wipe a stranger's account. It files the request for a human to verify
    // ownership, which is what the page promises the user.
    requestAccountDeletion: publicProcedure.input(z3.object({
      email: z3.string().email("Invalid email address"),
      note: z3.string().max(1e3).default("")
    })).mutation(async ({ input }) => {
      const result = await sendAccountDeletionRequest({
        email: input.email,
        note: input.note
      });
      if (!result.success) {
        throw new TRPCError5({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not file the request. Please email privacy@skinguardai.app directly."
        });
      }
      return { success: true };
    }),
    // Email signup
    signupEmail: publicProcedure.input(z3.object({
      name: z3.string().min(2, "Name must be at least 2 characters"),
      email: z3.string().email("Invalid email address"),
      password: z3.string().min(8, "Password must be at least 8 characters"),
      plan: z3.enum(["essential", "pro", "pro_plus"]).default("essential")
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const plan = "essential";
      const existingUser = await db.select().from(users).where(eq3(users.email, input.email)).limit(1);
      if (existingUser.length > 0) {
        throw new TRPCError5({ code: "CONFLICT", message: "Email already registered" });
      }
      const passwordHash = await bcrypt.hash(input.password, 10);
      await db.insert(users).values({
        name: input.name,
        email: input.email,
        passwordHash,
        loginMethod: "email",
        plan,
        // Deterministic, cross-app openId derived from the email (email column is
        // unique). Same email -> same openId on every HealthGuard app, so one free
        // account works everywhere. Hashed + truncated to fit openId varchar(64).
        openId: `email_${crypto.createHash("sha256").update(input.email.trim().toLowerCase()).digest("hex").slice(0, 48)}`
      });
      const insertedUser = await db.select().from(users).where(eq3(users.email, input.email)).limit(1);
      if (insertedUser.length === 0) {
        throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user" });
      }
      const userId = insertedUser[0].id;
      await db.insert(userSubscriptions).values({ userId, plan, status: "active" });
      await db.insert(userPreferences).values({ userId, weeklyEmailEnabled: true, skinAlertEmailEnabled: true });
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3);
      await db.insert(emailVerificationTokens).values({ userId, token: verificationToken, expiresAt: verificationExpiresAt });
      await sendEmailVerificationEmail(input.email, input.name, verificationToken);
      const claimed = await claimPendingPurchases(userId, input.email).catch((e) => {
        console.error("[auth] claimPendingPurchases failed:", e?.message ?? e);
        return null;
      });
      return { success: true, userId, plan: claimed ?? plan, message: "Verification email sent" };
    }),
    // Email login
    loginEmail: publicProcedure.input(z3.object({
      email: z3.string().email("Invalid email address"),
      password: z3.string().min(8, "Invalid password")
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const userList = await db.select().from(users).where(eq3(users.email, input.email)).limit(1);
      if (userList.length === 0) {
        throw new TRPCError5({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }
      const user = userList[0];
      if (!user.passwordHash) throw new TRPCError5({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
      if (!isPasswordValid) throw new TRPCError5({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      await db.update(users).set({ lastSignedIn: /* @__PURE__ */ new Date() }).where(eq3(users.id, user.id));
      const openId = user.openId || `email_${user.id}`;
      const sessionToken = await sdk.createSessionToken(openId, {
        name: user.name || user.email || "",
        email: user.email ?? void 0,
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      const claimed = await claimPendingPurchases(user.id, user.email).catch((e) => {
        console.error("[auth] claimPendingPurchases failed:", e?.message ?? e);
        return null;
      });
      return { success: true, userId: user.id, plan: claimed ?? user.plan };
    }),
    // Redeem promo code → upgrade plan
    redeemPromoCode: protectedProcedure.input(z3.object({ code: z3.string().min(1, "Please enter a promo code") })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const inputCode = input.code.trim().toUpperCase();
      const userEmail = (ctx.user.email ?? "").toLowerCase();
      let dbCodePlan = null;
      try {
        const dbResult = await db.execute(
          sql2`SELECT id, plan, used, user_id FROM activation_codes WHERE code = ${inputCode} LIMIT 1`
        );
        const row = dbResult.rows?.[0] ?? dbResult[0];
        if (row) {
          if (row.used) {
            throw new TRPCError5({ code: "BAD_REQUEST", message: "This code has already been used." });
          }
          await db.execute(
            sql2`UPDATE activation_codes SET used = true, user_id = ${ctx.user.id} WHERE code = ${inputCode}`
          );
          dbCodePlan = row.plan;
        }
      } catch (err) {
        if (err instanceof TRPCError5) throw err;
      }
      if (!dbCodePlan) {
        const personalEntries = (process.env.PERSONAL_PROMO_CODES ?? "").split(",").map((entry) => {
          const colonIdx = entry.indexOf(":");
          if (colonIdx === -1) return null;
          return {
            code: entry.slice(0, colonIdx).trim().toUpperCase(),
            email: entry.slice(colonIdx + 1).trim().toLowerCase()
          };
        }).filter((e) => !!e && !!e.code && !!e.email);
        const personalMatch = personalEntries.find((e) => e.code === inputCode);
        if (personalMatch) {
          if (personalMatch.email !== userEmail) {
            throw new TRPCError5({ code: "UNAUTHORIZED", message: "This code is not registered to your email address." });
          }
        } else {
          const genericCodes = (process.env.PROMO_CODES ?? "").split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);
          if (!genericCodes.includes(inputCode)) {
            throw new TRPCError5({ code: "BAD_REQUEST", message: "Invalid promo code. Please check and try again." });
          }
        }
      }
      const targetPlan = dbCodePlan === "lifetime" ? "lifetime" : dbCodePlan === "pro_plus" ? "pro_plus" : dbCodePlan === "pro" ? "pro" : "pro";
      const plan = await grantEntitlement({
        userId: ctx.user.id,
        plan: targetPlan,
        source: "promo_code",
        externalId: inputCode,
        note: dbCodePlan ? "activation_codes" : "env promo code"
      });
      return { success: true, plan };
    }),
    // Select the free plan, or step back down to it.
    //
    // This is the only plan change a signed-in user may make on their own, and
    // it deliberately cannot reach a paid tier: the plan came straight from
    // client input, so anyone signed in could award themselves one by calling
    // this. Paid tiers are granted only by redeemPromoCode, which validates the
    // code against the activation_codes table.
    // Update plan
    updatePlan: protectedProcedure.input(z3.object({ plan: z3.enum(["essential", "pro", "pro_plus"]) })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      if (input.plan !== "essential") {
        throw new TRPCError5({
          code: "FORBIDDEN",
          message: "Paid plans are activated by purchase or promo code, not by selecting them here."
        });
      }
      const plan = await recomputePlan(ctx.user.id);
      return { success: true, plan };
    }),
    // Verify email
    verifyEmail: publicProcedure.input(z3.object({ token: z3.string() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const tokenRecord = await db.select().from(emailVerificationTokens).where(eq3(emailVerificationTokens.token, input.token)).limit(1);
      if (tokenRecord.length === 0) throw new TRPCError5({ code: "NOT_FOUND", message: "Invalid verification token" });
      const token = tokenRecord[0];
      if (token.expiresAt < /* @__PURE__ */ new Date()) throw new TRPCError5({ code: "BAD_REQUEST", message: "Verification token has expired" });
      if (token.verified) throw new TRPCError5({ code: "BAD_REQUEST", message: "Email already verified" });
      await db.update(emailVerificationTokens).set({ verified: true, verifiedAt: /* @__PURE__ */ new Date() }).where(eq3(emailVerificationTokens.id, token.id));
      const user = await db.select().from(users).where(eq3(users.id, token.userId)).limit(1);
      if (user.length > 0 && user[0].email) await sendWelcomeEmail(user[0].email, user[0].name || "User");
      return { success: true, message: "Email verified successfully" };
    }),
    // Request password reset
    requestPasswordReset: publicProcedure.input(z3.object({ email: z3.string().email("Invalid email address") })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const userList = await db.select().from(users).where(eq3(users.email, input.email)).limit(1);
      if (userList.length === 0) {
        return { success: true, message: "If an account exists, a reset link will be sent" };
      }
      const user = userList[0];
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
      await db.insert(passwordResetTokens).values({ userId: user.id, token, expiresAt });
      if (user.email) await sendPasswordResetEmail(user.email, user.name || "User", token);
      return { success: true, message: "If an account exists, a reset link will be sent" };
    }),
    // Verify password reset token
    verifyResetToken: publicProcedure.input(z3.object({ token: z3.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const tokenList = await db.select().from(passwordResetTokens).where(eq3(passwordResetTokens.token, input.token)).limit(1);
      if (tokenList.length === 0) throw new TRPCError5({ code: "NOT_FOUND", message: "Invalid reset token" });
      const resetToken = tokenList[0];
      if (/* @__PURE__ */ new Date() > resetToken.expiresAt) throw new TRPCError5({ code: "UNAUTHORIZED", message: "Reset token has expired" });
      return { success: true, userId: resetToken.userId };
    }),
    // Reset password with token
    resetPassword: publicProcedure.input(z3.object({ token: z3.string(), password: z3.string().min(8, "Password must be at least 8 characters") })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const tokenList = await db.select().from(passwordResetTokens).where(eq3(passwordResetTokens.token, input.token)).limit(1);
      if (tokenList.length === 0) throw new TRPCError5({ code: "NOT_FOUND", message: "Invalid reset token" });
      const resetToken = tokenList[0];
      if (/* @__PURE__ */ new Date() > resetToken.expiresAt) throw new TRPCError5({ code: "UNAUTHORIZED", message: "Reset token has expired" });
      const passwordHash = await bcrypt.hash(input.password, 10);
      await db.update(users).set({ passwordHash }).where(eq3(users.id, resetToken.userId));
      await db.delete(passwordResetTokens).where(eq3(passwordResetTokens.token, input.token));
      return { success: true, message: "Password reset successfully" };
    })
  }),
  // ============================================================================
  // MOLE ROUTER (anyajegyek kezelése)
  // ============================================================================
  mole: router({
    // Összes anyajegy lekérése a bejelentkezett userhez (photoCount-tal)
    getAll: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      return await db.select({
        id: moles.id,
        userId: moles.userId,
        name: moles.name,
        region: moles.region,
        createdAt: moles.createdAt,
        lastChecked: moles.lastChecked,
        reminderDays: moles.reminderDays,
        riskLevel: moles.riskLevel,
        photoCount: count(photos.id)
      }).from(moles).leftJoin(photos, eq3(photos.moleId, moles.id)).where(eq3(moles.userId, ctx.user.id)).groupBy(moles.id);
    }),
    // Egy anyajegy lekérése ID alapján (csak ha a useré)
    getById: protectedProcedure.input(z3.object({ id: z3.number() })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const moleList = await db.select().from(moles).where(and(
        eq3(moles.id, input.id),
        eq3(moles.userId, ctx.user.id)
      )).limit(1);
      if (moleList.length === 0) {
        throw new TRPCError5({ code: "NOT_FOUND", message: "Mole not found" });
      }
      return moleList[0];
    }),
    // Új anyajegy létrehozása
    create: protectedProcedure.input(z3.object({
      name: z3.string().min(1, "Name is required"),
      region: z3.string().min(1, "Region is required"),
      reminderDays: z3.number().default(90)
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const result = await db.insert(moles).values({
        userId: ctx.user.id,
        name: input.name,
        region: input.region,
        reminderDays: input.reminderDays,
        lastChecked: /* @__PURE__ */ new Date()
      }).returning();
      return result[0];
    }),
    // Anyajegy módosítása
    update: protectedProcedure.input(z3.object({
      id: z3.number(),
      name: z3.string().optional(),
      region: z3.string().optional(),
      reminderDays: z3.number().optional(),
      riskLevel: z3.enum(["low", "medium", "high", "unknown"]).optional(),
      lastChecked: z3.date().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const existing = await db.select().from(moles).where(and(
        eq3(moles.id, input.id),
        eq3(moles.userId, ctx.user.id)
      )).limit(1);
      if (existing.length === 0) {
        throw new TRPCError5({ code: "NOT_FOUND", message: "Mole not found" });
      }
      const updateData = {};
      if (input.name !== void 0) updateData.name = input.name;
      if (input.region !== void 0) updateData.region = input.region;
      if (input.reminderDays !== void 0) updateData.reminderDays = input.reminderDays;
      if (input.riskLevel !== void 0) updateData.riskLevel = input.riskLevel;
      if (input.lastChecked !== void 0) updateData.lastChecked = input.lastChecked;
      const result = await db.update(moles).set(updateData).where(eq3(moles.id, input.id)).returning();
      return result[0];
    }),
    // Anyajegy törlése
    delete: protectedProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const existing = await db.select().from(moles).where(and(
        eq3(moles.id, input.id),
        eq3(moles.userId, ctx.user.id)
      )).limit(1);
      if (existing.length === 0) {
        throw new TRPCError5({ code: "NOT_FOUND", message: "Mole not found" });
      }
      await db.delete(moles).where(eq3(moles.id, input.id));
      return { success: true };
    })
  }),
  // ============================================================================
  // PHOTO ROUTER (képek kezelése)
  // ============================================================================
  photo: router({
    // Kép feltöltése (mole-hoz rendelve)
    upload: protectedProcedure.input(z3.object({
      moleId: z3.number(),
      dataUrl: z3.string().min(10, "Invalid image data"),
      notes: z3.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const mole = await db.select().from(moles).where(and(
        eq3(moles.id, input.moleId),
        eq3(moles.userId, ctx.user.id)
      )).limit(1);
      if (mole.length === 0) {
        throw new TRPCError5({ code: "NOT_FOUND", message: "Mole not found" });
      }
      const result = await db.insert(photos).values({
        moleId: input.moleId,
        dataUrl: input.dataUrl,
        notes: input.notes || "",
        timestamp: /* @__PURE__ */ new Date()
      }).returning();
      await db.update(moles).set({ lastChecked: /* @__PURE__ */ new Date() }).where(eq3(moles.id, input.moleId));
      return result[0];
    }),
    // Egy anyajegy összes képének lekérése
    getByMoleId: protectedProcedure.input(z3.object({ moleId: z3.number() })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const mole = await db.select().from(moles).where(and(
        eq3(moles.id, input.moleId),
        eq3(moles.userId, ctx.user.id)
      )).limit(1);
      if (mole.length === 0) {
        throw new TRPCError5({ code: "NOT_FOUND", message: "Mole not found" });
      }
      return await db.select({
        id: photos.id,
        moleId: photos.moleId,
        dataUrl: photos.dataUrl,
        timestamp: photos.timestamp,
        notes: photos.notes,
        asymmetryScore: analyses.asymmetryScore,
        asymmetryCode: analyses.asymmetryCode,
        borderScore: analyses.borderScore,
        borderCode: analyses.borderCode,
        colorScore: analyses.colorScore,
        colorCode: analyses.colorCode,
        diameterScore: analyses.diameterScore,
        diameterCode: analyses.diameterCode,
        overallRisk: analyses.overallRisk,
        recommendationCode: analyses.recommendationCode
      }).from(photos).leftJoin(analyses, eq3(analyses.photoId, photos.id)).where(eq3(photos.moleId, input.moleId)).orderBy(photos.timestamp);
    }),
    // Kép törlése
    delete: protectedProcedure.input(z3.object({ id: z3.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const photo = await db.select({
        id: photos.id,
        moleId: photos.moleId
      }).from(photos).innerJoin(moles, eq3(photos.moleId, moles.id)).where(and(
        eq3(photos.id, input.id),
        eq3(moles.userId, ctx.user.id)
      )).limit(1);
      if (photo.length === 0) {
        throw new TRPCError5({ code: "NOT_FOUND", message: "Photo not found" });
      }
      await db.delete(photos).where(eq3(photos.id, input.id));
      return { success: true };
    })
  }),
  // ============================================================================
  // ANALYSIS ROUTER (AI elemzések kezelése)
  // ============================================================================
  analysis: router({
    // Elemzés lekérése kép alapján
    getByPhotoId: protectedProcedure.input(z3.object({ photoId: z3.number() })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const photo = await db.select({
        photoId: photos.id
      }).from(photos).innerJoin(moles, eq3(photos.moleId, moles.id)).where(and(
        eq3(photos.id, input.photoId),
        eq3(moles.userId, ctx.user.id)
      )).limit(1);
      if (photo.length === 0) {
        throw new TRPCError5({ code: "NOT_FOUND", message: "Photo not found" });
      }
      const analysisList = await db.select().from(analyses).where(eq3(analyses.photoId, input.photoId)).limit(1);
      return analysisList[0] || null;
    }),
    // AI elemzés mentése (a Vertex AI válasza alapján)
    save: protectedProcedure.input(z3.object({
      photoId: z3.number(),
      asymmetryScore: z3.number().min(0).max(100),
      asymmetryCode: z3.string(),
      borderScore: z3.number().min(0).max(100),
      borderCode: z3.string(),
      colorScore: z3.number().min(0).max(100),
      colorCode: z3.string(),
      diameterScore: z3.number().min(0).max(100),
      diameterCode: z3.string(),
      overallRisk: z3.enum(["low", "medium", "high"]),
      recommendationCode: z3.string()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const photo = await db.select({
        photoId: photos.id,
        moleId: photos.moleId
      }).from(photos).innerJoin(moles, eq3(photos.moleId, moles.id)).where(and(
        eq3(photos.id, input.photoId),
        eq3(moles.userId, ctx.user.id)
      )).limit(1);
      if (photo.length === 0) {
        throw new TRPCError5({ code: "NOT_FOUND", message: "Photo not found" });
      }
      const existing = await db.select().from(analyses).where(eq3(analyses.photoId, input.photoId)).limit(1);
      let result;
      if (existing.length > 0) {
        result = await db.update(analyses).set({
          asymmetryScore: input.asymmetryScore,
          asymmetryCode: input.asymmetryCode,
          borderScore: input.borderScore,
          borderCode: input.borderCode,
          colorScore: input.colorScore,
          colorCode: input.colorCode,
          diameterScore: input.diameterScore,
          diameterCode: input.diameterCode,
          overallRisk: input.overallRisk,
          recommendationCode: input.recommendationCode
        }).where(eq3(analyses.id, existing[0].id)).returning();
      } else {
        result = await db.insert(analyses).values({
          photoId: input.photoId,
          asymmetryScore: input.asymmetryScore,
          asymmetryCode: input.asymmetryCode,
          borderScore: input.borderScore,
          borderCode: input.borderCode,
          colorScore: input.colorScore,
          colorCode: input.colorCode,
          diameterScore: input.diameterScore,
          diameterCode: input.diameterCode,
          overallRisk: input.overallRisk,
          recommendationCode: input.recommendationCode
        }).returning();
      }
      await db.update(moles).set({ riskLevel: input.overallRisk }).where(eq3(moles.id, photo[0].moleId));
      return result[0];
    })
  }),
  // Email notification router
  notifications: router({
    getPreferences: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const prefs = await db.select().from(userPreferences).where(eq3(userPreferences.userId, ctx.user.id)).limit(1);
      return prefs[0] || null;
    }),
    updatePreferences: protectedProcedure.input(z3.object({
      weeklyEmailEnabled: z3.boolean().optional(),
      skinAlertEmailEnabled: z3.boolean().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      const existing = await db.select().from(userPreferences).where(eq3(userPreferences.userId, ctx.user.id)).limit(1);
      if (existing.length > 0) {
        await db.update(userPreferences).set({
          weeklyEmailEnabled: input.weeklyEmailEnabled !== void 0 ? input.weeklyEmailEnabled : existing[0].weeklyEmailEnabled,
          skinAlertEmailEnabled: input.skinAlertEmailEnabled !== void 0 ? input.skinAlertEmailEnabled : existing[0].skinAlertEmailEnabled
        }).where(eq3(userPreferences.userId, ctx.user.id));
      } else {
        await db.insert(userPreferences).values({
          userId: ctx.user.id,
          weeklyEmailEnabled: input.weeklyEmailEnabled ?? true,
          skinAlertEmailEnabled: input.skinAlertEmailEnabled ?? true
        });
      }
      return { success: true };
    }),
    googleCallback: publicProcedure.input(z3.object({
      code: z3.string(),
      plan: z3.enum(["essential", "pro", "pro_plus"]).default("essential")
    })).mutation(async ({ input }) => {
      try {
        const tokenData = await getGoogleAccessToken(input.code);
        const userInfo = await getGoogleUserInfo(tokenData.access_token);
        const { userId, isNewUser } = await handleSocialLogin(
          "google",
          userInfo.id,
          userInfo.email,
          userInfo.name,
          tokenData.access_token,
          tokenData.refresh_token,
          tokenData.expires_in
        );
        if (isNewUser) {
          const db = await getDb();
          if (db) await db.update(users).set({ plan: "essential" }).where(eq3(users.id, userId));
        }
        await claimPendingPurchases(userId, userInfo.email).catch((e) => {
          console.error("[auth] claimPendingPurchases failed:", e?.message ?? e);
        });
        return { success: true, userId, isNewUser };
      } catch (error) {
        throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Google authentication failed" });
      }
    }),
    microsoftCallback: publicProcedure.input(z3.object({
      code: z3.string(),
      plan: z3.enum(["essential", "pro", "pro_plus"]).default("essential")
    })).mutation(async ({ input }) => {
      try {
        const tokenData = await getMicrosoftAccessToken(input.code);
        const userInfo = await getMicrosoftUserInfo(tokenData.access_token);
        const { userId, isNewUser } = await handleSocialLogin(
          "microsoft",
          userInfo.id,
          userInfo.mail,
          userInfo.displayName,
          tokenData.access_token,
          tokenData.refresh_token,
          tokenData.expires_in
        );
        if (isNewUser) {
          const db = await getDb();
          if (db) await db.update(users).set({ plan: "essential" }).where(eq3(users.id, userId));
        }
        await claimPendingPurchases(userId, userInfo.mail).catch((e) => {
          console.error("[auth] claimPendingPurchases failed:", e?.message ?? e);
        });
        return { success: true, userId, isNewUser };
      } catch (error) {
        throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Microsoft authentication failed" });
      }
    }),
    twitterCallback: publicProcedure.input(z3.object({
      code: z3.string(),
      plan: z3.enum(["essential", "pro", "pro_plus"]).default("essential")
    })).mutation(async ({ input }) => {
      try {
        const tokenData = await getTwitterAccessToken(input.code);
        const userInfo = await getTwitterUserInfo(tokenData.access_token);
        const { userId, isNewUser } = await handleSocialLogin(
          "twitter",
          userInfo.id,
          `${userInfo.username}@twitter.local`,
          userInfo.name,
          tokenData.access_token,
          tokenData.refresh_token,
          tokenData.expires_in
        );
        if (isNewUser) {
          const db = await getDb();
          if (db) await db.update(users).set({ plan: "essential" }).where(eq3(users.id, userId));
        }
        return { success: true, userId, isNewUser };
      } catch (error) {
        throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Twitter authentication failed" });
      }
    })
  }),
  // System statistics router
  stats: router({
    getSystemStats: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) {
        return { totalUsers: 0, essentialUsers: 0, proUsers: 0, proPlusUsers: 0, lifetimeUsers: 0, activeUsers: 0 };
      }
      const allUsers = await db.select({ plan: users.plan, lastSignedIn: users.lastSignedIn }).from(users);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
      const realTotal = allUsers.length;
      const realEssential = allUsers.filter((u) => u.plan === "essential").length;
      const realPro = allUsers.filter((u) => u.plan === "pro").length;
      const realProPlus = allUsers.filter((u) => u.plan === "pro_plus").length;
      const realLifetime = allUsers.filter((u) => u.plan === "lifetime").length;
      const realActive = allUsers.filter((u) => u.lastSignedIn && u.lastSignedIn > thirtyDaysAgo).length;
      return {
        totalUsers: realTotal,
        essentialUsers: realEssential,
        proUsers: realPro,
        proPlusUsers: realProPlus,
        lifetimeUsers: realLifetime,
        activeUsers: realActive
      };
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// api/_index.ts
init_env();
var app = express();
var NATIVE_ORIGINS = /* @__PURE__ */ new Set([
  "capacitor://localhost",
  // iOS
  "https://localhost",
  // Android (Capacitor 4+ default androidScheme)
  "ionic://localhost",
  // legacy
  "http://localhost"
  // legacy
]);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && NATIVE_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-trpc-source"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
  }
  next();
});
app.post("/api/webhooks/lemon-squeezy", express.raw({ type: "*/*", limit: "1mb" }), async (req, res) => {
  const { handleWebhookRequest: handleWebhookRequest2 } = await Promise.resolve().then(() => (init_lemonSqueezy(), lemonSqueezy_exports));
  const signature = req.header("X-Signature") ?? req.header("x-signature");
  const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from(String(req.body ?? ""));
  const result = await handleWebhookRequest2(raw, signature);
  res.status(result.status).json(result.body);
});
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.get("/api/config", (_req, res) => {
  res.json({ googleClientId: ENV.googleClientId });
});
registerOAuthRoutes(app);
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);
var index_default = app;
export {
  index_default as default
};
