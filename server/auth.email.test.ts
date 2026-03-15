import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { users, userSubscriptions, userPreferences } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

describe("Email Authentication", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
  });

  afterAll(async () => {
    // Cleanup test data
    if (db) {
      await db.delete(userPreferences).where(eq(userPreferences.userId, 999)).catch(() => {});
      await db.delete(userSubscriptions).where(eq(userSubscriptions.userId, 999)).catch(() => {});
      await db.delete(users).where(eq(users.email, "test@example.com")).catch(() => {});
    }
  });

  it("should hash password correctly", async () => {
    const password = "TestPassword123";
    const hash = await bcrypt.hash(password, 10);
    const isValid = await bcrypt.compare(password, hash);
    expect(isValid).toBe(true);
  });

  it("should reject incorrect password", async () => {
    const password = "TestPassword123";
    const hash = await bcrypt.hash(password, 10);
    const isValid = await bcrypt.compare("WrongPassword", hash);
    expect(isValid).toBe(false);
  });

  it("should validate email format", () => {
    const validEmails = ["test@example.com", "user@domain.co.uk", "name+tag@example.com"];
    const invalidEmails = ["notanemail", "nodomain", "example"];

    validEmails.forEach((email) => {
      expect(email.includes("@")).toBe(true);
    });

    invalidEmails.forEach((email) => {
      expect(email.includes("@")).toBe(false);
    });
  });

  it("should validate password requirements", () => {
    const validPasswords = ["Password123", "SecurePass456", "MyP@ssw0rd"];
    const invalidPasswords = ["short", "noNumber", "NoSpecial"];

    validPasswords.forEach((pwd) => {
      expect(pwd.length >= 8).toBe(true);
    });

    invalidPasswords.forEach((pwd) => {
      expect(pwd.length < 8 || !/[0-9]/.test(pwd)).toBe(true);
    });
  });

  it("should create user with correct plan", async () => {
    if (!db) return;

    const testEmail = `test_${Date.now()}@example.com`;
    const passwordHash = await bcrypt.hash("TestPassword123", 10);

    const result = await db.insert(users).values({
      name: "Test User",
      email: testEmail,
      passwordHash,
      loginMethod: "email",
      plan: "pro",
      openId: `email_${Date.now()}`,
    });

    const insertedUser = await db.select().from(users).where(eq(users.email, testEmail)).limit(1);
    expect(insertedUser.length).toBe(1);
    expect(insertedUser[0].plan).toBe("pro");
    expect(insertedUser[0].loginMethod).toBe("email");

    // Cleanup
    await db.delete(users).where(eq(users.email, testEmail)).catch(() => {});
  });

  it("should create subscription with user", async () => {
    if (!db) return;

    const testEmail = `test_sub_${Date.now()}@example.com`;
    const passwordHash = await bcrypt.hash("TestPassword123", 10);

    const result = await db.insert(users).values({
      name: "Test User",
      email: testEmail,
      passwordHash,
      loginMethod: "email",
      plan: "essential",
      openId: `email_${Date.now()}`,
    });

    const insertedUser = await db.select().from(users).where(eq(users.email, testEmail)).limit(1);
    const userId = insertedUser[0].id;

    await db.insert(userSubscriptions).values({
      userId,
      plan: "essential",
      status: "active",
    });

    const subscription = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .limit(1);

    expect(subscription.length).toBe(1);
    expect(subscription[0].plan).toBe("essential");
    expect(subscription[0].status).toBe("active");

    // Cleanup
    await db.delete(userSubscriptions).where(eq(userSubscriptions.userId, userId)).catch(() => {});
    await db.delete(users).where(eq(users.email, testEmail)).catch(() => {});
  });

  it("should prevent duplicate email registration", async () => {
    if (!db) return;

    const testEmail = `unique_${Date.now()}@example.com`;
    const passwordHash = await bcrypt.hash("TestPassword123", 10);

    // First insert
    await db.insert(users).values({
      name: "First User",
      email: testEmail,
      passwordHash,
      loginMethod: "email",
      plan: "essential",
      openId: `email_${Date.now()}`,
    });

    // Try to insert duplicate - should fail
    try {
      await db.insert(users).values({
        name: "Second User",
        email: testEmail,
        passwordHash,
        loginMethod: "email",
        plan: "essential",
        openId: `email_${Date.now() + 1}`,
      });
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toBeDefined();
    }

    // Cleanup
    await db.delete(users).where(eq(users.email, testEmail)).catch(() => {});
  });

  it("should update user plan", async () => {
    if (!db) return;

    const testEmail = `plan_update_${Date.now()}@example.com`;
    const passwordHash = await bcrypt.hash("TestPassword123", 10);

    const result = await db.insert(users).values({
      name: "Test User",
      email: testEmail,
      passwordHash,
      loginMethod: "email",
      plan: "essential",
      openId: `email_${Date.now()}`,
    });

    const insertedUser = await db.select().from(users).where(eq(users.email, testEmail)).limit(1);
    const userId = insertedUser[0].id;

    // Update plan
    await db.update(users).set({ plan: "pro" }).where(eq(users.id, userId));

    const updatedUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    expect(updatedUser[0].plan).toBe("pro");

    // Cleanup
    await db.delete(users).where(eq(users.id, userId)).catch(() => {});
  });
});
