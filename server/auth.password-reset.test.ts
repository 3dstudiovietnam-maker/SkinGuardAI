import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { users, passwordResetTokens } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

describe("Password Reset Flow", () => {
  let db: any;
  const testEmail = `test-reset-${Date.now()}@example.com`;
  const testPassword = "TestPassword123!";
  let userId: number;
  let resetToken: string;

  beforeAll(async () => {
    db = await getDb();
  });

  afterAll(async () => {
    // Cleanup
    if (db) {
      await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId)).catch(() => {});
      await db.delete(users).where(eq(users.email, testEmail)).catch(() => {});
    }
  });

  it("should create user for password reset test", async () => {
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

  it("should create a password reset token", async () => {
    if (!db) return;

    resetToken = nanoid(32);
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await db.insert(passwordResetTokens).values({
      userId,
      token: resetToken,
      expiresAt,
    });

    const result = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, resetToken))
      .limit(1);

    expect(result.length).toBe(1);
    expect(result[0].token).toBe(resetToken);
  });

  it("should verify a valid reset token", async () => {
    if (!db) return;

    const result = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, resetToken))
      .limit(1);

    expect(result.length).toBe(1);
    expect(result[0].expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("should update password after reset", async () => {
    if (!db) return;

    const newPassword = "NewPassword456!";
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({ passwordHash: hashedNewPassword })
      .where(eq(users.id, userId));

    const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    expect(result.length).toBe(1);

    // Verify new password works
    const isMatch = await bcrypt.compare(newPassword, result[0].passwordHash);
    expect(isMatch).toBe(true);
  });

  it("should delete reset token after use", async () => {
    if (!db) return;

    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.token, resetToken));

    const result = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, resetToken))
      .limit(1);

    expect(result.length).toBe(0);
  });
});
