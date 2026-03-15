import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { users, emailVerificationTokens, socialLogins } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import crypto from "crypto";

describe("Email Verification and Social Login", () => {
  let db: any;
  const testEmail = `test-verify-${Date.now()}@example.com`;
  const testPassword = "TestPassword123!";
  let userId: number;
  let verificationToken: string;

  beforeAll(async () => {
    db = await getDb();
  });

  afterAll(async () => {
    // Cleanup
    if (db) {
      await db.delete(socialLogins).where(eq(socialLogins.userId, userId)).catch(() => {});
      await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, userId)).catch(() => {});
      await db.delete(users).where(eq(users.email, testEmail)).catch(() => {});
    }
  });

  it("should create user with email verification token", async () => {
    if (!db) return;

    const hashedPassword = await bcrypt.hash(testPassword, 10);
    await db.insert(users).values({
      name: "Test User",
      email: testEmail,
      passwordHash: hashedPassword,
      loginMethod: "email",
      plan: "essential",
      openId: `email_${Date.now()}`,
    });

    const result = await db.select().from(users).where(eq(users.email, testEmail)).limit(1);
    expect(result.length).toBe(1);
    userId = result[0].id;
  });

  it("should create email verification token", async () => {
    if (!db) return;

    verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.insert(emailVerificationTokens).values({
      userId,
      token: verificationToken,
      expiresAt,
    });

    const result = await db.select().from(emailVerificationTokens).where(eq(emailVerificationTokens.token, verificationToken)).limit(1);
    expect(result.length).toBe(1);
    expect(result[0].verified).toBe(0);
  });

  it("should verify email token", async () => {
    if (!db) return;

    await db.update(emailVerificationTokens).set({
      verified: 1,
      verifiedAt: new Date(),
    }).where(eq(emailVerificationTokens.token, verificationToken));

    const result = await db.select().from(emailVerificationTokens).where(eq(emailVerificationTokens.token, verificationToken)).limit(1);
    expect(result.length).toBe(1);
    expect(result[0].verified).toBe(1);
    expect(result[0].verifiedAt).toBeDefined();
  });

  it("should create social login record for Google", async () => {
    if (!db) return;

    const googleUserId = `google_${nanoid()}`;
    await db.insert(socialLogins).values({
      userId,
      provider: "google",
      providerUserId: googleUserId,
      providerEmail: testEmail,
      accessToken: "mock_access_token",
      refreshToken: "mock_refresh_token",
      expiresAt: new Date(Date.now() + 3600000),
    });

    const result = await db.select().from(socialLogins).where(eq(socialLogins.providerUserId, googleUserId)).limit(1);
    expect(result.length).toBe(1);
    expect(result[0].provider).toBe("google");
    expect(result[0].userId).toBe(userId);
  });

  it("should create social login record for Microsoft", async () => {
    if (!db) return;

    const microsoftUserId = `microsoft_${nanoid()}`;
    await db.insert(socialLogins).values({
      userId,
      provider: "microsoft",
      providerUserId: microsoftUserId,
      providerEmail: testEmail,
      accessToken: "mock_access_token",
      refreshToken: "mock_refresh_token",
      expiresAt: new Date(Date.now() + 3600000),
    });

    const result = await db.select().from(socialLogins).where(eq(socialLogins.providerUserId, microsoftUserId)).limit(1);
    expect(result.length).toBe(1);
    expect(result[0].provider).toBe("microsoft");
  });

  it("should create social login record for Twitter", async () => {
    if (!db) return;

    const twitterUserId = `twitter_${nanoid()}`;
    await db.insert(socialLogins).values({
      userId,
      provider: "twitter",
      providerUserId: twitterUserId,
      providerEmail: `${twitterUserId}@twitter.local`,
      accessToken: "mock_access_token",
      refreshToken: "mock_refresh_token",
      expiresAt: new Date(Date.now() + 3600000),
    });

    const result = await db.select().from(socialLogins).where(eq(socialLogins.providerUserId, twitterUserId)).limit(1);
    expect(result.length).toBe(1);
    expect(result[0].provider).toBe("twitter");
  });

  it("should retrieve all social logins for a user", async () => {
    if (!db) return;

    const result = await db.select().from(socialLogins).where(eq(socialLogins.userId, userId));
    expect(result.length).toBeGreaterThanOrEqual(3);
    expect(result.map((r: any) => r.provider)).toContain("google");
    expect(result.map((r: any) => r.provider)).toContain("microsoft");
    expect(result.map((r: any) => r.provider)).toContain("twitter");
  });

  it("should check if verification token is expired", async () => {
    if (!db) return;

    const expiredToken = crypto.randomBytes(32).toString("hex");
    const expiredAt = new Date(Date.now() - 1000); // 1 second ago

    await db.insert(emailVerificationTokens).values({
      userId,
      token: expiredToken,
      expiresAt: expiredAt,
    });

    const result = await db.select().from(emailVerificationTokens).where(eq(emailVerificationTokens.token, expiredToken)).limit(1);
    expect(result.length).toBe(1);
    expect(result[0].expiresAt.getTime()).toBeLessThan(Date.now());
  });
});
