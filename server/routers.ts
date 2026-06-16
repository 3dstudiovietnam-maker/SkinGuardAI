import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { aiRouter } from "./ai";
import { getDb } from "./db";
import {
  userPreferences, emailNotifications, users, userSubscriptions,
  passwordResetTokens, emailVerificationTokens,
  moles, photos, analyses  // 🔥 Új importok
} from "../drizzle/schema";
import { sql } from "drizzle-orm";
import { eq, and, count } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import { sendPasswordResetEmail, sendEmailVerificationEmail, sendWelcomeEmail } from "./email";
import { handleSocialLogin, getGoogleAccessToken, getGoogleUserInfo, getMicrosoftAccessToken, getMicrosoftUserInfo, getTwitterAccessToken, getTwitterUserInfo } from "./oauth";

export const appRouter = router({
  system: systemRouter,
  ai: aiRouter,
  config: router({
    getGoogleClientId: publicProcedure.query(async () => {
      const { ENV } = await import("./_core/env");
      return { googleClientId: ENV.googleClientId };
    }),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, cookieOptions);
      return { success: true } as const;
    }),

    // Email signup
    signupEmail: publicProcedure.input(z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      plan: z.enum(["essential", "pro", "pro_plus"]).default("essential"),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const existingUser = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (existingUser.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
      }

      const passwordHash = await bcrypt.hash(input.password, 10);
      await db.insert(users).values({
        name: input.name,
        email: input.email,
        passwordHash,
        loginMethod: "email",
        plan: input.plan,
        openId: `email_${Date.now()}`,
      });

      const insertedUser = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (insertedUser.length === 0) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user" });
      }
      const userId = insertedUser[0].id;

      await db.insert(userSubscriptions).values({ userId, plan: input.plan, status: "active" });
      await db.insert(userPreferences).values({ userId, weeklyEmailEnabled: true, skinAlertEmailEnabled: true });

      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await db.insert(emailVerificationTokens).values({ userId, token: verificationToken, expiresAt: verificationExpiresAt });
      await sendEmailVerificationEmail(input.email, input.name, verificationToken);

      return { success: true, userId, plan: input.plan, message: "Verification email sent" };
    }),

    // Email login
    loginEmail: publicProcedure.input(z.object({
      email: z.string().email("Invalid email address"),
      password: z.string().min(8, "Invalid password"),
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const userList = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (userList.length === 0) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      const user = userList[0];
      if (!user.passwordHash) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });

      const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
      if (!isPasswordValid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });

      await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

      const openId = user.openId || `email_${user.id}`;
      const sessionToken = await sdk.createSessionToken(openId, {
        name: user.name || user.email || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return { success: true, userId: user.id, plan: user.plan };
    }),

    // Redeem promo code → upgrade plan
    redeemPromoCode: protectedProcedure.input(z.object({ code: z.string().min(1, "Please enter a promo code") })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const inputCode = input.code.trim().toUpperCase();
      const userEmail = (ctx.user.email ?? "").toLowerCase();

      // ── 1. Check activation_codes table (lifetime DB codes) ──────────────
      let dbCodePlan: string | null = null;
      try {
        const dbResult = await db.execute(
          sql`SELECT id, plan, used, user_id FROM activation_codes WHERE code = ${inputCode} LIMIT 1`
        );
        const row = (dbResult as any).rows?.[0] ?? dbResult[0];
        if (row) {
          if (row.used) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "This code has already been used." });
          }
          // Mark as used
          await db.execute(
            sql`UPDATE activation_codes SET used = true, user_id = ${ctx.user.id} WHERE code = ${inputCode}`
          );
          dbCodePlan = row.plan as string; // e.g. "lifetime" → maps to "pro_plus"
        }
      } catch (err: any) {
        // Re-throw TRPCErrors, ignore table-not-found
        if (err instanceof TRPCError) throw err;
      }

      // ── 2. If not a DB code, check legacy ENV codes ───────────────────────
      if (!dbCodePlan) {
        const personalEntries = (process.env.PERSONAL_PROMO_CODES ?? "")
          .split(",")
          .map(entry => {
            const colonIdx = entry.indexOf(":");
            if (colonIdx === -1) return null;
            return {
              code: entry.slice(0, colonIdx).trim().toUpperCase(),
              email: entry.slice(colonIdx + 1).trim().toLowerCase(),
            };
          })
          .filter((e): e is { code: string; email: string } => !!e && !!e.code && !!e.email);

        const personalMatch = personalEntries.find(e => e.code === inputCode);

        if (personalMatch) {
          if (personalMatch.email !== userEmail) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "This code is not registered to your email address." });
          }
        } else {
          const genericCodes = (process.env.PROMO_CODES ?? "").split(",").map(c => c.trim().toUpperCase()).filter(Boolean);
          if (!genericCodes.includes(inputCode)) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid promo code. Please check and try again." });
          }
        }
      }

      // ── 3. Determine target plan ──────────────────────────────────────────
      // DB codes carry their own plan; generic ENV codes → "pro"
      const targetPlan: "pro" | "pro_plus" | "lifetime" =
        dbCodePlan === "lifetime"  ? "lifetime"  :
        dbCodePlan === "pro_plus"  ? "pro_plus"  :
        dbCodePlan === "pro"       ? "pro"        :
        "pro";

      // ── 4. Upgrade user ───────────────────────────────────────────────────
      await db.update(users).set({ plan: targetPlan }).where(eq(users.id, ctx.user.id));

      const subscription = await db.select().from(userSubscriptions).where(eq(userSubscriptions.userId, ctx.user.id)).limit(1);
      if (subscription.length > 0) {
        await db.update(userSubscriptions).set({ plan: targetPlan, status: "active" }).where(eq(userSubscriptions.userId, ctx.user.id));
      } else {
        await db.insert(userSubscriptions).values({ userId: ctx.user.id, plan: targetPlan, status: "active" });
      }

      return { success: true, plan: targetPlan };
    }),

    // Update plan
    updatePlan: protectedProcedure.input(z.object({ plan: z.enum(["essential", "pro", "pro_plus"]) })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      await db.update(users).set({ plan: input.plan }).where(eq(users.id, ctx.user.id));

      const subscription = await db.select().from(userSubscriptions).where(eq(userSubscriptions.userId, ctx.user.id)).limit(1);
      if (subscription.length > 0) {
        await db.update(userSubscriptions).set({ plan: input.plan }).where(eq(userSubscriptions.userId, ctx.user.id));
      } else {
        await db.insert(userSubscriptions).values({ userId: ctx.user.id, plan: input.plan, status: "active" });
      }

      return { success: true, plan: input.plan };
    }),

    // Verify email
    verifyEmail: publicProcedure.input(z.object({ token: z.string() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const tokenRecord = await db.select().from(emailVerificationTokens).where(eq(emailVerificationTokens.token, input.token)).limit(1);
      if (tokenRecord.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Invalid verification token" });

      const token = tokenRecord[0];
      if (token.expiresAt < new Date()) throw new TRPCError({ code: "BAD_REQUEST", message: "Verification token has expired" });
      if (token.verified) throw new TRPCError({ code: "BAD_REQUEST", message: "Email already verified" });

      await db.update(emailVerificationTokens).set({ verified: true, verifiedAt: new Date() }).where(eq(emailVerificationTokens.id, token.id));

      const user = await db.select().from(users).where(eq(users.id, token.userId)).limit(1);
      if (user.length > 0 && user[0].email) await sendWelcomeEmail(user[0].email, user[0].name || "User");

      return { success: true, message: "Email verified successfully" };
    }),

    // Request password reset
    requestPasswordReset: publicProcedure.input(z.object({ email: z.string().email("Invalid email address") })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const userList = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (userList.length === 0) {
        return { success: true, message: "If an account exists, a reset link will be sent" };
      }

      const user = userList[0];
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await db.insert(passwordResetTokens).values({ userId: user.id, token, expiresAt });

      if (user.email) await sendPasswordResetEmail(user.email, user.name || "User", token);

      return { success: true, message: "If an account exists, a reset link will be sent" };
    }),

    // Verify password reset token
    verifyResetToken: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const tokenList = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, input.token)).limit(1);
      if (tokenList.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Invalid reset token" });

      const resetToken = tokenList[0];
      if (new Date() > resetToken.expiresAt) throw new TRPCError({ code: "UNAUTHORIZED", message: "Reset token has expired" });

      return { success: true, userId: resetToken.userId };
    }),

    // Reset password with token
    resetPassword: publicProcedure.input(z.object({ token: z.string(), password: z.string().min(8, "Password must be at least 8 characters") })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const tokenList = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, input.token)).limit(1);
      if (tokenList.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Invalid reset token" });

      const resetToken = tokenList[0];
      if (new Date() > resetToken.expiresAt) throw new TRPCError({ code: "UNAUTHORIZED", message: "Reset token has expired" });

      const passwordHash = await bcrypt.hash(input.password, 10);
      await db.update(users).set({ passwordHash }).where(eq(users.id, resetToken.userId));
      await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, input.token));

      return { success: true, message: "Password reset successfully" };
    }),
  }),

  // ============================================================================
  // MOLE ROUTER (anyajegyek kezelése)
  // ============================================================================
  mole: router({
    // Összes anyajegy lekérése a bejelentkezett userhez (photoCount-tal)
    getAll: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      return await db
        .select({
          id: moles.id,
          userId: moles.userId,
          name: moles.name,
          region: moles.region,
          createdAt: moles.createdAt,
          lastChecked: moles.lastChecked,
          reminderDays: moles.reminderDays,
          riskLevel: moles.riskLevel,
          photoCount: count(photos.id),
        })
        .from(moles)
        .leftJoin(photos, eq(photos.moleId, moles.id))
        .where(eq(moles.userId, ctx.user.id))
        .groupBy(moles.id);
    }),

    // Egy anyajegy lekérése ID alapján (csak ha a useré)
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      
      const moleList = await db.select().from(moles).where(and(
        eq(moles.id, input.id),
        eq(moles.userId, ctx.user.id)
      )).limit(1);
      
      if (moleList.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Mole not found" });
      }
      
      return moleList[0];
    }),

    // Új anyajegy létrehozása
    create: protectedProcedure.input(z.object({
      name: z.string().min(1, "Name is required"),
      region: z.string().min(1, "Region is required"),
      reminderDays: z.number().default(90),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      
      const result = await db.insert(moles).values({
        userId: ctx.user.id,
        name: input.name,
        region: input.region,
        reminderDays: input.reminderDays,
        lastChecked: new Date(),
      }).returning();
      
      return result[0];
    }),

    // Anyajegy módosítása
    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      region: z.string().optional(),
      reminderDays: z.number().optional(),
      riskLevel: z.enum(["low", "medium", "high", "unknown"]).optional(),
      lastChecked: z.date().optional(),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      
      // Ellenőrizzük, hogy a mole a useré-e
      const existing = await db.select().from(moles).where(and(
        eq(moles.id, input.id),
        eq(moles.userId, ctx.user.id)
      )).limit(1);
      
      if (existing.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Mole not found" });
      }
      
      const updateData: Partial<typeof moles.$inferInsert> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.region !== undefined) updateData.region = input.region;
      if (input.reminderDays !== undefined) updateData.reminderDays = input.reminderDays;
      if (input.riskLevel !== undefined) updateData.riskLevel = input.riskLevel;
      if (input.lastChecked !== undefined) updateData.lastChecked = input.lastChecked;
      
      const result = await db.update(moles)
        .set(updateData)
        .where(eq(moles.id, input.id))
        .returning();
      
      return result[0];
    }),

    // Anyajegy törlése
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      
      // Ellenőrizzük, hogy a mole a useré-e
      const existing = await db.select().from(moles).where(and(
        eq(moles.id, input.id),
        eq(moles.userId, ctx.user.id)
      )).limit(1);
      
      if (existing.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Mole not found" });
      }
      
      await db.delete(moles).where(eq(moles.id, input.id));
      return { success: true };
    }),
  }),

  // ============================================================================
  // PHOTO ROUTER (képek kezelése)
  // ============================================================================
  photo: router({
    // Kép feltöltése (mole-hoz rendelve)
    upload: protectedProcedure.input(z.object({
      moleId: z.number(),
      dataUrl: z.string().min(10, "Invalid image data"),
      notes: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      
      // Ellenőrizzük, hogy a mole a useré-e
      const mole = await db.select().from(moles).where(and(
        eq(moles.id, input.moleId),
        eq(moles.userId, ctx.user.id)
      )).limit(1);
      
      if (mole.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Mole not found" });
      }
      
      // Kép mentése
      const result = await db.insert(photos).values({
        moleId: input.moleId,
        dataUrl: input.dataUrl,
        notes: input.notes || "",
        timestamp: new Date(),
      }).returning();
      
      // Frissítjük a lastChecked mezőt
      await db.update(moles).set({ lastChecked: new Date() }).where(eq(moles.id, input.moleId));
      
      return result[0];
    }),

    // Egy anyajegy összes képének lekérése
    getByMoleId: protectedProcedure.input(z.object({ moleId: z.number() })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      
      // Ellenőrizzük, hogy a mole a useré-e
      const mole = await db.select().from(moles).where(and(
        eq(moles.id, input.moleId),
        eq(moles.userId, ctx.user.id)
      )).limit(1);
      
      if (mole.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Mole not found" });
      }
      
      // Return photos with their analysis data (LEFT JOIN — null fields if no analysis)
      return await db
        .select({
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
          recommendationCode: analyses.recommendationCode,
        })
        .from(photos)
        .leftJoin(analyses, eq(analyses.photoId, photos.id))
        .where(eq(photos.moleId, input.moleId))
        .orderBy(photos.timestamp);
    }),

    // Kép törlése
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      
      // Ellenőrizzük, hogy a kép a user mole-jához tartozik-e
      const photo = await db.select({
        id: photos.id,
        moleId: photos.moleId,
      }).from(photos)
        .innerJoin(moles, eq(photos.moleId, moles.id))
        .where(and(
          eq(photos.id, input.id),
          eq(moles.userId, ctx.user.id)
        )).limit(1);
      
      if (photo.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Photo not found" });
      }
      
      await db.delete(photos).where(eq(photos.id, input.id));
      return { success: true };
    }),
  }),

  // ============================================================================
  // ANALYSIS ROUTER (AI elemzések kezelése)
  // ============================================================================
  analysis: router({
    // Elemzés lekérése kép alapján
    getByPhotoId: protectedProcedure.input(z.object({ photoId: z.number() })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      
      // Ellenőrizzük, hogy a kép a user mole-jához tartozik-e
      const photo = await db.select({
        photoId: photos.id,
      }).from(photos)
        .innerJoin(moles, eq(photos.moleId, moles.id))
        .where(and(
          eq(photos.id, input.photoId),
          eq(moles.userId, ctx.user.id)
        )).limit(1);
      
      if (photo.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Photo not found" });
      }
      
      const analysisList = await db.select().from(analyses).where(eq(analyses.photoId, input.photoId)).limit(1);
      return analysisList[0] || null;
    }),

    // AI elemzés mentése (a Vertex AI válasza alapján)
    save: protectedProcedure.input(z.object({
      photoId: z.number(),
      asymmetryScore: z.number().min(0).max(100),
      asymmetryCode: z.string(),
      borderScore: z.number().min(0).max(100),
      borderCode: z.string(),
      colorScore: z.number().min(0).max(100),
      colorCode: z.string(),
      diameterScore: z.number().min(0).max(100),
      diameterCode: z.string(),
      overallRisk: z.enum(["low", "medium", "high"]),
      recommendationCode: z.string(),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });
      
      // Ellenőrizzük, hogy a kép a user mole-jához tartozik-e
      const photo = await db.select({
        photoId: photos.id,
        moleId: photos.moleId,
      }).from(photos)
        .innerJoin(moles, eq(photos.moleId, moles.id))
        .where(and(
          eq(photos.id, input.photoId),
          eq(moles.userId, ctx.user.id)
        )).limit(1);
      
      if (photo.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Photo not found" });
      }
      
      // Megnézzük, van-e már elemzés ehhez a képhez
      const existing = await db.select().from(analyses).where(eq(analyses.photoId, input.photoId)).limit(1);
      
      let result;
      if (existing.length > 0) {
        // Frissítés
        result = await db.update(analyses)
          .set({
            asymmetryScore: input.asymmetryScore,
            asymmetryCode: input.asymmetryCode,
            borderScore: input.borderScore,
            borderCode: input.borderCode,
            colorScore: input.colorScore,
            colorCode: input.colorCode,
            diameterScore: input.diameterScore,
            diameterCode: input.diameterCode,
            overallRisk: input.overallRisk,
            recommendationCode: input.recommendationCode,
          })
          .where(eq(analyses.id, existing[0].id))
          .returning();
      } else {
        // Beszúrás
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
          recommendationCode: input.recommendationCode,
        }).returning();
      }
      
      // Frissítjük a mole riskLevel mezőjét az overallRisk alapján
      await db.update(moles)
        .set({ riskLevel: input.overallRisk })
        .where(eq(moles.id, photo[0].moleId));
      
      return result[0];
    }),
  }),

  // Email notification router
  notifications: router({
    getPreferences: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const prefs = await db.select().from(userPreferences).where(eq(userPreferences.userId, ctx.user.id)).limit(1);
      return prefs[0] || null;
    }),

    updatePreferences: protectedProcedure.input(z.object({
      weeklyEmailEnabled: z.boolean().optional(),
      skinAlertEmailEnabled: z.boolean().optional(),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      const existing = await db.select().from(userPreferences).where(eq(userPreferences.userId, ctx.user.id)).limit(1);

      if (existing.length > 0) {
        await db.update(userPreferences).set({
          weeklyEmailEnabled: input.weeklyEmailEnabled !== undefined ? input.weeklyEmailEnabled : existing[0].weeklyEmailEnabled,
          skinAlertEmailEnabled: input.skinAlertEmailEnabled !== undefined ? input.skinAlertEmailEnabled : existing[0].skinAlertEmailEnabled,
        }).where(eq(userPreferences.userId, ctx.user.id));
      } else {
        await db.insert(userPreferences).values({
          userId: ctx.user.id,
          weeklyEmailEnabled: input.weeklyEmailEnabled ?? true,
          skinAlertEmailEnabled: input.skinAlertEmailEnabled ?? true,
        });
      }
      return { success: true };
    }),

    googleCallback: publicProcedure.input(z.object({
      code: z.string(),
      plan: z.enum(["essential", "pro", "pro_plus"]).default("essential"),
    })).mutation(async ({ input }) => {
      try {
        const tokenData = await getGoogleAccessToken(input.code);
        const userInfo = await getGoogleUserInfo(tokenData.access_token);
        const { userId, isNewUser } = await handleSocialLogin(
          "google", userInfo.id, userInfo.email, userInfo.name,
          tokenData.access_token, tokenData.refresh_token, tokenData.expires_in
        );

        if (isNewUser) {
          const db = await getDb();
          if (db) await db.update(users).set({ plan: input.plan }).where(eq(users.id, userId));
        }
        return { success: true, userId, isNewUser };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Google authentication failed" });
      }
    }),

    microsoftCallback: publicProcedure.input(z.object({
      code: z.string(),
      plan: z.enum(["essential", "pro", "pro_plus"]).default("essential"),
    })).mutation(async ({ input }) => {
      try {
        const tokenData = await getMicrosoftAccessToken(input.code);
        const userInfo = await getMicrosoftUserInfo(tokenData.access_token);
        const { userId, isNewUser } = await handleSocialLogin(
          "microsoft", userInfo.id, userInfo.mail, userInfo.displayName,
          tokenData.access_token, tokenData.refresh_token, tokenData.expires_in
        );

        if (isNewUser) {
          const db = await getDb();
          if (db) await db.update(users).set({ plan: input.plan }).where(eq(users.id, userId));
        }
        return { success: true, userId, isNewUser };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Microsoft authentication failed" });
      }
    }),

    twitterCallback: publicProcedure.input(z.object({
      code: z.string(),
      plan: z.enum(["essential", "pro", "pro_plus"]).default("essential"),
    })).mutation(async ({ input }) => {
      try {
        const tokenData = await getTwitterAccessToken(input.code);
        const userInfo = await getTwitterUserInfo(tokenData.access_token);
        const { userId, isNewUser } = await handleSocialLogin(
          "twitter", userInfo.id, `${userInfo.username}@twitter.local`, userInfo.name,
          tokenData.access_token, tokenData.refresh_token, tokenData.expires_in
        );

        if (isNewUser) {
          const db = await getDb();
          if (db) await db.update(users).set({ plan: input.plan }).where(eq(users.id, userId));
        }
        return { success: true, userId, isNewUser };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Twitter authentication failed" });
      }
    }),
  }),

  // System statistics router
  stats: router({
    getSystemStats: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) {
        return { totalUsers: 0, essentialUsers: 0, proUsers: 0, proPlusUsers: 0, lifetimeUsers: 0, activeUsers: 0 };
      }
      const allUsers = await db.select({ plan: users.plan, lastSignedIn: users.lastSignedIn }).from(users);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      // Fixed baseline offset + real users (so each new real user increments the displayed count)
      const realTotal     = allUsers.length;
      const realEssential = allUsers.filter(u => u.plan === "essential").length;
      const realPro       = allUsers.filter(u => u.plan === "pro").length;
      const realProPlus   = allUsers.filter(u => u.plan === "pro_plus").length;
      const realLifetime  = allUsers.filter(u => u.plan === "lifetime").length;
      const realActive    = allUsers.filter(u => u.lastSignedIn && u.lastSignedIn > thirtyDaysAgo).length;
      return {
        totalUsers:     2101 + realTotal,
        essentialUsers: 1620 + realEssential,
        proUsers:        220 + realPro,
        proPlusUsers:     90 + realProPlus,
        lifetimeUsers:   171 + realLifetime,
        activeUsers:     583 + realActive,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;