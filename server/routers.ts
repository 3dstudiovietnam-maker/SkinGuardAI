import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { aiRouter } from "./ai";
import { getDb } from "./db";
import { userPreferences, emailNotifications, users, userSubscriptions, passwordResetTokens, emailVerificationTokens } from "../drizzle/schema";
import { eq } from "drizzle-orm";
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
      // maxAge nélkül: clearCookie maga állítja be expires=new Date(1)-t (1970.01.01.)
      // A maxAge:-1 → max-age=-0.001 a Set-Cookie fejlécben → böngészők eltérően kezelik
      ctx.res.clearCookie(COOKIE_NAME, cookieOptions);
      return {
        success: true,
      } as const;
    }),

    // Email signup
    signupEmail: publicProcedure.input(z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      plan: z.enum(["essential", "pro", "pro_plus"]).default("essential"),
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      // Check if email already exists
      const existingUser = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (existingUser.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(input.password, 10);

      // Create user
      const result = await db.insert(users).values({
        name: input.name,
        email: input.email,
        passwordHash,
        loginMethod: "email",
        plan: input.plan,
        openId: `email_${Date.now()}`,
      });

      // Get the inserted user to retrieve the ID
      const insertedUser = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (insertedUser.length === 0) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user" });
      }
      const userId = insertedUser[0].id;

      // Create subscription
      await db.insert(userSubscriptions).values({
        userId,
        plan: input.plan,
        status: "active",
      });

      // Create user preferences
      await db.insert(userPreferences).values({
        userId,
        weeklyEmailEnabled: true,
        skinAlertEmailEnabled: true,
      });

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Save verification token to database
      await db.insert(emailVerificationTokens).values({
        userId,
        token: verificationToken,
        expiresAt: verificationExpiresAt,
      });

      // Send email verification email
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

      // Find user
      const userList = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (userList.length === 0) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      const user = userList[0];

      // Verify password
      if (!user.passwordHash) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      // Update last signed in
      await db.update(users).set({
        lastSignedIn: new Date(),
      }).where(eq(users.id, user.id));

      // JWT session token létrehozása (az authenticateRequest JWT-t vár)
      const openId = user.openId || `email_${user.id}`;
      const sessionToken = await sdk.createSessionToken(openId, {
        name: user.name || user.email || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return { success: true, userId: user.id, plan: user.plan };
    }),

    // Redeem promo code → upgrade to Pro
    // Supports two systems:
    //   1. PERSONAL_PROMO_CODES: "CODE:email" pairs — email-tied, one user per code (lifetime)
    //   2. PROMO_CODES: generic codes anyone can use
    redeemPromoCode: protectedProcedure.input(z.object({
      code: z.string().min(1, "Please enter a promo code"),
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      const inputCode = input.code.trim().toUpperCase();
      const userEmail = (ctx.user.email ?? "").toLowerCase();

      // ── 1. Personal codes (PERSONAL_PROMO_CODES="CODE:email,CODE2:email2") ──
      const personalEntries = (process.env.PERSONAL_PROMO_CODES ?? "")
        .split(",")
        .map(entry => {
          const colonIdx = entry.indexOf(":");
          if (colonIdx === -1) return null;
          return {
            code:  entry.slice(0, colonIdx).trim().toUpperCase(),
            email: entry.slice(colonIdx + 1).trim().toLowerCase(),
          };
        })
        .filter((e): e is { code: string; email: string } => !!e && !!e.code && !!e.email);

      const personalMatch = personalEntries.find(e => e.code === inputCode);

      if (personalMatch) {
        // Code exists — verify it belongs to this user's email
        if (personalMatch.email !== userEmail) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "This code is not registered to your email address.",
          });
        }
        // ✅ Personal code matched — fall through to upgrade below
      } else {
        // ── 2. Generic codes (PROMO_CODES="CODE1,CODE2") ──
        const genericCodes = (process.env.PROMO_CODES ?? "")
          .split(",")
          .map(c => c.trim().toUpperCase())
          .filter(Boolean);

        if (!genericCodes.includes(inputCode)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid promo code. Please check and try again.",
          });
        }
        // ✅ Generic code matched — fall through to upgrade below
      }

      // Upgrade user plan to "pro"
      await db.update(users).set({ plan: "pro" }).where(eq(users.id, ctx.user.id));

      // Upsert subscription
      const subscription = await db.select().from(userSubscriptions)
        .where(eq(userSubscriptions.userId, ctx.user.id)).limit(1);
      if (subscription.length > 0) {
        await db.update(userSubscriptions)
          .set({ plan: "pro", status: "active" })
          .where(eq(userSubscriptions.userId, ctx.user.id));
      } else {
        await db.insert(userSubscriptions)
          .values({ userId: ctx.user.id, plan: "pro", status: "active" });
      }

      return { success: true };
    }),

    // Update plan
    updatePlan: protectedProcedure.input(z.object({
      plan: z.enum(["essential", "pro", "pro_plus"]),
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      // Update user plan
      await db.update(users).set({
        plan: input.plan,
      }).where(eq(users.id, ctx.user.id));

      // Update subscription
      const subscription = await db.select().from(userSubscriptions).where(eq(userSubscriptions.userId, ctx.user.id)).limit(1);
      if (subscription.length > 0) {
        await db.update(userSubscriptions).set({
          plan: input.plan,
        }).where(eq(userSubscriptions.userId, ctx.user.id));
      } else {
        await db.insert(userSubscriptions).values({
          userId: ctx.user.id,
          plan: input.plan,
          status: "active",
        });
      }

      return { success: true, plan: input.plan };
    }),

    // Verify email
    verifyEmail: publicProcedure.input(z.object({
      token: z.string(),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      // Find verification token
      const tokenRecord = await db.select().from(emailVerificationTokens).where(eq(emailVerificationTokens.token, input.token)).limit(1);
      if (tokenRecord.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invalid verification token" });
      }

      const token = tokenRecord[0];

      // Check if token is expired
      if (token.expiresAt < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Verification token has expired" });
      }

      // Check if already verified
      if (token.verified) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Email already verified" });
      }

      // Mark token as verified
      await db.update(emailVerificationTokens).set({
        verified: true,
        verifiedAt: new Date(),
      }).where(eq(emailVerificationTokens.id, token.id));

      // Get user and send welcome email
      const user = await db.select().from(users).where(eq(users.id, token.userId)).limit(1);
      if (user.length > 0 && user[0].email) {
        await sendWelcomeEmail(user[0].email, user[0].name || "User");
      }

      return { success: true, message: "Email verified successfully" };
    }),

    // Request password reset
    requestPasswordReset: publicProcedure.input(z.object({
      email: z.string().email("Invalid email address"),
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      // Find user
      const userList = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (userList.length === 0) {
        // Don't reveal if email exists
        return { success: true, message: "If an account exists, a reset link will be sent" };
      }

      const user = userList[0];

      // Generate reset token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Save token to database
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt,
      });

      // Send password reset email
      if (user.email) {
        await sendPasswordResetEmail(user.email, user.name || "User", token);
      }

      return { success: true, message: "If an account exists, a reset link will be sent" };
    }),

    // Verify password reset token
    verifyResetToken: publicProcedure.input(z.object({
      token: z.string(),
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      // Find token
      const tokenList = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, input.token)).limit(1);
      if (tokenList.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invalid reset token" });
      }

      const resetToken = tokenList[0];

      // Check if token is expired
      if (new Date() > resetToken.expiresAt) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Reset token has expired" });
      }

      return { success: true, userId: resetToken.userId };
    }),

    // Reset password with token
    resetPassword: publicProcedure.input(z.object({
      token: z.string(),
      password: z.string().min(8, "Password must be at least 8 characters"),
    })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

      // Find token
      const tokenList = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, input.token)).limit(1);
      if (tokenList.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invalid reset token" });
      }

      const resetToken = tokenList[0];

      // Check if token is expired
      if (new Date() > resetToken.expiresAt) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Reset token has expired" });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(input.password, 10);

      // Update user password
      await db.update(users).set({
        passwordHash,
      }).where(eq(users.id, resetToken.userId));

      // Delete used token
      await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, input.token));

      return { success: true, message: "Password reset successfully" };
    }),
  }),

  // Email notification router
  notifications: router({
    // Get user preferences
    getPreferences: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const prefs = await db.select().from(userPreferences).where(eq(userPreferences.userId, ctx.user.id)).limit(1);
      return prefs[0] || null;
    }),

    // Update user preferences
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

    // Google OAuth
    googleCallback: publicProcedure.input(z.object({
      code: z.string(),
      plan: z.enum(["essential", "pro", "pro_plus"]).default("essential"),
    })).mutation(async ({ input, ctx }) => {
      try {
        // Exchange code for token
        const tokenData = await getGoogleAccessToken(input.code);

        // Get user info
        const userInfo = await getGoogleUserInfo(tokenData.access_token);

        // Handle social login
        const { userId, isNewUser } = await handleSocialLogin(
          "google",
          userInfo.id,
          userInfo.email,
          userInfo.name,
          tokenData.access_token,
          tokenData.refresh_token,
          tokenData.expires_in
        );

        // Update plan if new user
        if (isNewUser) {
          const db = await getDb();
          if (db) {
            await db.update(users).set({ plan: input.plan }).where(eq(users.id, userId));
          }
        }

        return { success: true, userId, isNewUser };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Google authentication failed" });
      }
    }),

    // Microsoft OAuth
    microsoftCallback: publicProcedure.input(z.object({
      code: z.string(),
      plan: z.enum(["essential", "pro", "pro_plus"]).default("essential"),
    })).mutation(async ({ input, ctx }) => {
      try {
        // Exchange code for token
        const tokenData = await getMicrosoftAccessToken(input.code);

        // Get user info
        const userInfo = await getMicrosoftUserInfo(tokenData.access_token);

        // Handle social login
        const { userId, isNewUser } = await handleSocialLogin(
          "microsoft",
          userInfo.id,
          userInfo.mail,
          userInfo.displayName,
          tokenData.access_token,
          tokenData.refresh_token,
          tokenData.expires_in
        );

        // Update plan if new user
        if (isNewUser) {
          const db = await getDb();
          if (db) {
            await db.update(users).set({ plan: input.plan }).where(eq(users.id, userId));
          }
        }

        return { success: true, userId, isNewUser };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Microsoft authentication failed" });
      }
    }),

    // Twitter OAuth
    twitterCallback: publicProcedure.input(z.object({
      code: z.string(),
      plan: z.enum(["essential", "pro", "pro_plus"]).default("essential"),
    })).mutation(async ({ input, ctx }) => {
      try {
        // Exchange code for token
        const tokenData = await getTwitterAccessToken(input.code);

        // Get user info
        const userInfo = await getTwitterUserInfo(tokenData.access_token);

        // Handle social login
        const { userId, isNewUser } = await handleSocialLogin(
          "twitter",
          userInfo.id,
          `${userInfo.username}@twitter.local`, // Twitter doesn't provide email
          userInfo.name,
          tokenData.access_token,
          tokenData.refresh_token,
          tokenData.expires_in
        );

        // Update plan if new user
        if (isNewUser) {
          const db = await getDb();
          if (db) {
            await db.update(users).set({ plan: input.plan }).where(eq(users.id, userId));
          }
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
        return { totalUsers: 0, essentialUsers: 0, proUsers: 0, proPlusUsers: 0, activeUsers: 0 };
      }
      const allUsers = await db.select({
        plan: users.plan,
        lastSignedIn: users.lastSignedIn,
      }).from(users);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return {
        totalUsers: allUsers.length,
        essentialUsers: allUsers.filter(u => u.plan === "essential").length,
        proUsers: allUsers.filter(u => u.plan === "pro").length,
        proPlusUsers: allUsers.filter(u => u.plan === "pro_plus").length,
        activeUsers: allUsers.filter(u => u.lastSignedIn && u.lastSignedIn > thirtyDaysAgo).length,
      };
    }),
  }),
});
export type AppRouter = typeof appRouter;
