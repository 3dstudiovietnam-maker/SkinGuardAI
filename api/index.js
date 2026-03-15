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
var planEnum, roleEnum, statusEnum, users, userSubscriptions, emailNotifications, userPreferences, passwordResetTokens, emailVerificationTokens, socialLogins;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    planEnum = pgEnum("plan", ["essential", "pro", "pro_plus"]);
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
      const sql = neon(process.env.DATABASE_URL);
      _db = drizzle(sql);
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
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
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
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
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
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
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

// server/_core/chat.ts
init_env();
import { streamText, stepCountIs } from "ai";
import { tool } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod/v4";

// server/_core/patchedFetch.ts
function createPatchedFetch(originalFetch) {
  return async (input, init) => {
    const response = await originalFetch(input, init);
    if (!response.body) return response;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = "";
    const stream = new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await reader.read();
          if (done) {
            if (buffer.length > 0) {
              const fixed = buffer.replace(/"type":""/g, '"type":"function"');
              controller.enqueue(encoder.encode(fixed));
            }
            controller.close();
            return;
          }
          buffer += decoder.decode(value, { stream: true });
          const eventSeparator = "\n\n";
          let separatorIndex;
          while ((separatorIndex = buffer.indexOf(eventSeparator)) !== -1) {
            const completeEvent = buffer.slice(
              0,
              separatorIndex + eventSeparator.length
            );
            buffer = buffer.slice(separatorIndex + eventSeparator.length);
            const fixedEvent = completeEvent.replace(
              /"type":""/g,
              '"type":"function"'
            );
            controller.enqueue(encoder.encode(fixedEvent));
          }
        } catch (error) {
          controller.error(error);
        }
      }
    });
    return new Response(stream, {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText
    });
  };
}

// server/_core/chat.ts
function createLLMProvider() {
  const baseURL = ENV.forgeApiUrl.endsWith("/v1") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/v1`;
  return createOpenAI({
    baseURL,
    apiKey: ENV.forgeApiKey,
    fetch: createPatchedFetch(fetch)
  });
}
var tools = {
  getWeather: tool({
    description: "Get the current weather for a location",
    inputSchema: z.object({
      location: z.string().describe("The city and country, e.g. 'Tokyo, Japan'"),
      unit: z.enum(["celsius", "fahrenheit"]).optional().default("celsius")
    }),
    execute: async ({ location, unit }) => {
      const temp = Math.floor(Math.random() * 30) + 5;
      const conditions = ["sunny", "cloudy", "rainy", "partly cloudy"][Math.floor(Math.random() * 4)];
      return {
        location,
        temperature: unit === "fahrenheit" ? Math.round(temp * 1.8 + 32) : temp,
        unit,
        conditions,
        humidity: Math.floor(Math.random() * 50) + 30
      };
    }
  }),
  calculate: tool({
    description: "Perform a mathematical calculation",
    inputSchema: z.object({
      expression: z.string().describe("The math expression to evaluate, e.g. '2 + 2'")
    }),
    execute: async ({ expression }) => {
      try {
        const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, "");
        const result = Function(
          `"use strict"; return (${sanitized})`
        )();
        return { expression, result };
      } catch {
        return { expression, error: "Invalid expression" };
      }
    }
  })
};
function registerChatRoutes(app2) {
  const openai = createLLMProvider();
  app2.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "messages array is required" });
        return;
      }
      const result = streamText({
        model: openai.chat("gpt-4o"),
        system: "You are a helpful assistant. You have access to tools for getting weather and doing calculations. Use them when appropriate.",
        messages,
        tools,
        stopWhen: stepCountIs(5)
      });
      result.pipeUIMessageStreamToResponse(res);
    } catch (error) {
      console.error("[/api/chat] Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });
}

// server/_core/systemRouter.ts
import { z as z2 } from "zod";

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
    z2.object({
      timestamp: z2.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z2.object({
      title: z2.string().min(1, "title is required"),
      content: z2.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/ai.ts
import { z as z3 } from "zod";
import { TRPCError as TRPCError4 } from "@trpc/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
var ABCDE_PROMPT = `You are a dermatology screening AI assistant. Analyze this skin mole/lesion image using the ABCDE dermoscopy criteria.

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
  "disclaimer": "This AI screening is for informational purposes only and is not a medical diagnosis. Always consult a qualified dermatologist for professional evaluation."
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

Scoring guide (0 = no concern, 100 = high concern):
- A (Asymmetry): One half unlike the other half in shape
- B (Border): Irregular, ragged, notched, or blurred edges
- C (Color): Variation in color \u2014 multiple shades of brown, black, red, white, or blue
- D (Diameter): Estimated size relative to a 6mm pencil eraser

overallRisk determination:
- "low": all scores below 30
- "medium": any score 30-60 or average 25-50
- "high": any score above 60 or average above 50

IMPORTANT: Choose the most appropriate code from the lists above. Do not write free text descriptions.`;
function getGeminiClient() {
  const apiKey = process.env.GOOGLE_AI_STUDIO_KEY;
  if (!apiKey) {
    throw new TRPCError4({
      code: "INTERNAL_SERVER_ERROR",
      message: "GOOGLE_AI_STUDIO_KEY environment variable is not set."
    });
  }
  return new GoogleGenerativeAI(apiKey);
}
async function callGeminiWithRetry(model, prompt, base64Data, mimeType, maxRetries = 3) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType,
            data: base64Data
          }
        }
      ]);
      const rawText = result.response?.text();
      if (!rawText) {
        throw new Error("Empty response received from Gemini.");
      }
      const cleaned = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      try {
        return JSON.parse(cleaned);
      } catch (parseError) {
        lastError = new Error(`Invalid JSON (attempt ${attempt}/${maxRetries})`);
        console.warn(`Gemini JSON parse failed on attempt ${attempt}, retrying...`);
        if (attempt === maxRetries) {
          throw new TRPCError4({
            code: "INTERNAL_SERVER_ERROR",
            message: "Gemini returned an invalid JSON response after multiple attempts. Please try again later."
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
  throw lastError || new Error("Unknown error in Gemini call");
}
var aiRouter = router({
  analyzeImage: protectedProcedure.input(
    z3.object({
      imageBase64: z3.string().min(100, "Image data is too short \u2014 please provide a valid image"),
      mimeType: z3.string().default("image/jpeg")
    })
  ).mutation(async ({ input }) => {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 1024,
        temperature: 0.1
      }
    });
    const base64Data = input.imageBase64.replace(
      /^data:image\/[a-z+]+;base64,/i,
      ""
    );
    const parsedAnalysis = await callGeminiWithRetry(
      model,
      ABCDE_PROMPT,
      base64Data,
      input.mimeType,
      3
      // max 3 attempts
    );
    if (!["low", "medium", "high"].includes(parsedAnalysis.overallRisk)) {
      parsedAnalysis.overallRisk = "medium";
    }
    return parsedAnalysis;
  })
});

// server/routers.ts
init_db();
init_schema();
import { eq as eq3 } from "drizzle-orm";
import { z as z4 } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError as TRPCError5 } from "@trpc/server";
import crypto from "crypto";

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
            Your email has been verified! You're all set to start monitoring your skin health with AI precision.
          </p>
          <p style="color: #334155; font-size: 16px; margin-bottom: 30px;">
            Get started by taking your first scan or exploring your dashboard.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://skinguardai.manus.space/dashboard" style="background: #06b6d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
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
  const resetLink = `https://skinguardai.manus.space/reset-password?token=${resetToken}`;
  const template = emailTemplates.passwordReset(resetLink, userName);
  try {
    await transporter.sendMail({
      from: ENV.emailUser || "noreply@skinguardai.com",
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
  const verificationLink = `https://skinguardai.manus.space/verify-email?token=${verificationToken}`;
  const template = emailTemplates.emailVerification(verificationLink, userName);
  try {
    await transporter.sendMail({
      from: ENV.emailUser || "noreply@skinguardai.com",
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
      from: ENV.emailUser || "noreply@skinguardai.com",
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

// server/routers.ts
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
      return {
        success: true
      };
    }),
    // Email signup
    signupEmail: publicProcedure.input(z4.object({
      name: z4.string().min(2, "Name must be at least 2 characters"),
      email: z4.string().email("Invalid email address"),
      password: z4.string().min(8, "Password must be at least 8 characters"),
      plan: z4.enum(["essential", "pro", "pro_plus"]).default("essential")
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const existingUser = await db.select().from(users).where(eq3(users.email, input.email)).limit(1);
      if (existingUser.length > 0) {
        throw new TRPCError5({ code: "CONFLICT", message: "Email already registered" });
      }
      const passwordHash = await bcrypt.hash(input.password, 10);
      const result = await db.insert(users).values({
        name: input.name,
        email: input.email,
        passwordHash,
        loginMethod: "email",
        plan: input.plan,
        openId: `email_${Date.now()}`
      });
      const insertedUser = await db.select().from(users).where(eq3(users.email, input.email)).limit(1);
      if (insertedUser.length === 0) {
        throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user" });
      }
      const userId = insertedUser[0].id;
      await db.insert(userSubscriptions).values({
        userId,
        plan: input.plan,
        status: "active"
      });
      await db.insert(userPreferences).values({
        userId,
        weeklyEmailEnabled: true,
        skinAlertEmailEnabled: true
      });
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3);
      await db.insert(emailVerificationTokens).values({
        userId,
        token: verificationToken,
        expiresAt: verificationExpiresAt
      });
      await sendEmailVerificationEmail(input.email, input.name, verificationToken);
      return { success: true, userId, plan: input.plan, message: "Verification email sent" };
    }),
    // Email login
    loginEmail: publicProcedure.input(z4.object({
      email: z4.string().email("Invalid email address"),
      password: z4.string().min(8, "Invalid password")
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const userList = await db.select().from(users).where(eq3(users.email, input.email)).limit(1);
      if (userList.length === 0) {
        throw new TRPCError5({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }
      const user = userList[0];
      if (!user.passwordHash) {
        throw new TRPCError5({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }
      const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new TRPCError5({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }
      await db.update(users).set({
        lastSignedIn: /* @__PURE__ */ new Date()
      }).where(eq3(users.id, user.id));
      const openId = user.openId || `email_${user.id}`;
      const sessionToken = await sdk.createSessionToken(openId, {
        name: user.name || user.email || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      return { success: true, userId: user.id, plan: user.plan };
    }),
    // Redeem promo code → upgrade to Pro
    // Supports two systems:
    //   1. PERSONAL_PROMO_CODES: "CODE:email" pairs — email-tied, one user per code (lifetime)
    //   2. PROMO_CODES: generic codes anyone can use
    redeemPromoCode: protectedProcedure.input(z4.object({
      code: z4.string().min(1, "Please enter a promo code")
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const inputCode = input.code.trim().toUpperCase();
      const userEmail = (ctx.user.email ?? "").toLowerCase();
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
          throw new TRPCError5({
            code: "UNAUTHORIZED",
            message: "This code is not registered to your email address."
          });
        }
      } else {
        const genericCodes = (process.env.PROMO_CODES ?? "").split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);
        if (!genericCodes.includes(inputCode)) {
          throw new TRPCError5({
            code: "BAD_REQUEST",
            message: "Invalid promo code. Please check and try again."
          });
        }
      }
      await db.update(users).set({ plan: "pro" }).where(eq3(users.id, ctx.user.id));
      const subscription = await db.select().from(userSubscriptions).where(eq3(userSubscriptions.userId, ctx.user.id)).limit(1);
      if (subscription.length > 0) {
        await db.update(userSubscriptions).set({ plan: "pro", status: "active" }).where(eq3(userSubscriptions.userId, ctx.user.id));
      } else {
        await db.insert(userSubscriptions).values({ userId: ctx.user.id, plan: "pro", status: "active" });
      }
      return { success: true };
    }),
    // Update plan
    updatePlan: protectedProcedure.input(z4.object({
      plan: z4.enum(["essential", "pro", "pro_plus"])
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      await db.update(users).set({
        plan: input.plan
      }).where(eq3(users.id, ctx.user.id));
      const subscription = await db.select().from(userSubscriptions).where(eq3(userSubscriptions.userId, ctx.user.id)).limit(1);
      if (subscription.length > 0) {
        await db.update(userSubscriptions).set({
          plan: input.plan
        }).where(eq3(userSubscriptions.userId, ctx.user.id));
      } else {
        await db.insert(userSubscriptions).values({
          userId: ctx.user.id,
          plan: input.plan,
          status: "active"
        });
      }
      return { success: true, plan: input.plan };
    }),
    // Verify email
    verifyEmail: publicProcedure.input(z4.object({
      token: z4.string()
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const tokenRecord = await db.select().from(emailVerificationTokens).where(eq3(emailVerificationTokens.token, input.token)).limit(1);
      if (tokenRecord.length === 0) {
        throw new TRPCError5({ code: "NOT_FOUND", message: "Invalid verification token" });
      }
      const token = tokenRecord[0];
      if (token.expiresAt < /* @__PURE__ */ new Date()) {
        throw new TRPCError5({ code: "BAD_REQUEST", message: "Verification token has expired" });
      }
      if (token.verified) {
        throw new TRPCError5({ code: "BAD_REQUEST", message: "Email already verified" });
      }
      await db.update(emailVerificationTokens).set({
        verified: true,
        verifiedAt: /* @__PURE__ */ new Date()
      }).where(eq3(emailVerificationTokens.id, token.id));
      const user = await db.select().from(users).where(eq3(users.id, token.userId)).limit(1);
      if (user.length > 0 && user[0].email) {
        await sendWelcomeEmail(user[0].email, user[0].name || "User");
      }
      return { success: true, message: "Email verified successfully" };
    }),
    // Request password reset
    requestPasswordReset: publicProcedure.input(z4.object({
      email: z4.string().email("Invalid email address")
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const userList = await db.select().from(users).where(eq3(users.email, input.email)).limit(1);
      if (userList.length === 0) {
        return { success: true, message: "If an account exists, a reset link will be sent" };
      }
      const user = userList[0];
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt
      });
      if (user.email) {
        await sendPasswordResetEmail(user.email, user.name || "User", token);
      }
      return { success: true, message: "If an account exists, a reset link will be sent" };
    }),
    // Verify password reset token
    verifyResetToken: publicProcedure.input(z4.object({
      token: z4.string()
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const tokenList = await db.select().from(passwordResetTokens).where(eq3(passwordResetTokens.token, input.token)).limit(1);
      if (tokenList.length === 0) {
        throw new TRPCError5({ code: "NOT_FOUND", message: "Invalid reset token" });
      }
      const resetToken = tokenList[0];
      if (/* @__PURE__ */ new Date() > resetToken.expiresAt) {
        throw new TRPCError5({ code: "UNAUTHORIZED", message: "Reset token has expired" });
      }
      return { success: true, userId: resetToken.userId };
    }),
    // Reset password with token
    resetPassword: publicProcedure.input(z4.object({
      token: z4.string(),
      password: z4.string().min(8, "Password must be at least 8 characters")
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      const tokenList = await db.select().from(passwordResetTokens).where(eq3(passwordResetTokens.token, input.token)).limit(1);
      if (tokenList.length === 0) {
        throw new TRPCError5({ code: "NOT_FOUND", message: "Invalid reset token" });
      }
      const resetToken = tokenList[0];
      if (/* @__PURE__ */ new Date() > resetToken.expiresAt) {
        throw new TRPCError5({ code: "UNAUTHORIZED", message: "Reset token has expired" });
      }
      const passwordHash = await bcrypt.hash(input.password, 10);
      await db.update(users).set({
        passwordHash
      }).where(eq3(users.id, resetToken.userId));
      await db.delete(passwordResetTokens).where(eq3(passwordResetTokens.token, input.token));
      return { success: true, message: "Password reset successfully" };
    })
  }),
  // Email notification router
  notifications: router({
    // Get user preferences
    getPreferences: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const prefs = await db.select().from(userPreferences).where(eq3(userPreferences.userId, ctx.user.id)).limit(1);
      return prefs[0] || null;
    }),
    // Update user preferences
    updatePreferences: protectedProcedure.input(z4.object({
      weeklyEmailEnabled: z4.boolean().optional(),
      skinAlertEmailEnabled: z4.boolean().optional()
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
    // Google OAuth
    googleCallback: publicProcedure.input(z4.object({
      code: z4.string(),
      plan: z4.enum(["essential", "pro", "pro_plus"]).default("essential")
    })).mutation(async ({ input, ctx }) => {
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
          if (db) {
            await db.update(users).set({ plan: input.plan }).where(eq3(users.id, userId));
          }
        }
        return { success: true, userId, isNewUser };
      } catch (error) {
        throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Google authentication failed" });
      }
    }),
    // Microsoft OAuth
    microsoftCallback: publicProcedure.input(z4.object({
      code: z4.string(),
      plan: z4.enum(["essential", "pro", "pro_plus"]).default("essential")
    })).mutation(async ({ input, ctx }) => {
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
          if (db) {
            await db.update(users).set({ plan: input.plan }).where(eq3(users.id, userId));
          }
        }
        return { success: true, userId, isNewUser };
      } catch (error) {
        throw new TRPCError5({ code: "INTERNAL_SERVER_ERROR", message: "Microsoft authentication failed" });
      }
    }),
    // Twitter OAuth
    twitterCallback: publicProcedure.input(z4.object({
      code: z4.string(),
      plan: z4.enum(["essential", "pro", "pro_plus"]).default("essential")
    })).mutation(async ({ input, ctx }) => {
      try {
        const tokenData = await getTwitterAccessToken(input.code);
        const userInfo = await getTwitterUserInfo(tokenData.access_token);
        const { userId, isNewUser } = await handleSocialLogin(
          "twitter",
          userInfo.id,
          `${userInfo.username}@twitter.local`,
          // Twitter doesn't provide email
          userInfo.name,
          tokenData.access_token,
          tokenData.refresh_token,
          tokenData.expires_in
        );
        if (isNewUser) {
          const db = await getDb();
          if (db) {
            await db.update(users).set({ plan: input.plan }).where(eq3(users.id, userId));
          }
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
        return { totalUsers: 0, essentialUsers: 0, proUsers: 0, proPlusUsers: 0, activeUsers: 0 };
      }
      const allUsers = await db.select({
        plan: users.plan,
        lastSignedIn: users.lastSignedIn
      }).from(users);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
      return {
        totalUsers: allUsers.length,
        essentialUsers: allUsers.filter((u) => u.plan === "essential").length,
        proUsers: allUsers.filter((u) => u.plan === "pro").length,
        proPlusUsers: allUsers.filter((u) => u.plan === "pro_plus").length,
        activeUsers: allUsers.filter((u) => u.lastSignedIn && u.lastSignedIn > thirtyDaysAgo).length
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
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.get("/api/config", (_req, res) => {
  res.json({ googleClientId: ENV.googleClientId });
});
registerOAuthRoutes(app);
registerChatRoutes(app);
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
