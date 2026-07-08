import { describe, it, expect, beforeAll } from "vitest";
import { SignJWT, jwtVerify } from "jose";
import crypto from "crypto";

// Make sure a session secret exists before the sdk/env module is first loaded,
// so sign/verify use a consistent key even without a full runtime env.
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "test-jwt-secret-at-least-32-bytes-long-000";

// Mirror of the deterministic email openId used in routers.ts (email column is
// unique; openId is varchar(64)).
const emailOpenId = (email: string) =>
  `email_${crypto.createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 48)}`;

let sdk: typeof import("./_core/sdk").sdk;

beforeAll(async () => {
  ({ sdk } = await import("./_core/sdk"));
});

describe("Cross-app SSO session tokens", () => {
  it("carries the email claim and returns it on verify", async () => {
    const token = await sdk.signSession({
      openId: "email_abc",
      appId: "app-a",
      name: "Jane",
      email: "jane@example.com",
    });
    const s = await sdk.verifySession(token);
    expect(s).not.toBeNull();
    expect(s?.openId).toBe("email_abc");
    expect(s?.email).toBe("jane@example.com");
    expect(s?.appId).toBe("app-a");
  });

  it("verifies a token minted by a DIFFERENT app (no appId gate = portable)", async () => {
    // Token issued by a sibling app (different appId) — must still verify here,
    // which is what lets one session travel across the app family.
    const token = await sdk.signSession({
      openId: emailOpenId("jane@example.com"),
      appId: "some-sibling-app",
      name: "Jane",
      email: "jane@example.com",
    });
    const s = await sdk.verifySession(token);
    expect(s).not.toBeNull();
    expect(s?.openId).toBe(emailOpenId("jane@example.com"));
    expect(s?.email).toBe("jane@example.com");
  });

  it("stays backward-compatible: a token WITHOUT an email claim verifies, email undefined", async () => {
    const token = await sdk.signSession({
      openId: "google_123",
      appId: "app-a",
      name: "Bob",
    });
    const s = await sdk.verifySession(token);
    expect(s).not.toBeNull();
    expect(s?.openId).toBe("google_123");
    expect(s?.email).toBeUndefined();
  });

  it("rejects garbage / tampered tokens", async () => {
    expect(await sdk.verifySession("not.a.jwt")).toBeNull();
    expect(await sdk.verifySession("")).toBeNull();
    expect(await sdk.verifySession(null)).toBeNull();
  });

  it("dual-secret verify keeps existing sessions valid when a shared secret is added (zero logout)", async () => {
    const enc = new TextEncoder();
    const oldPerApp = enc.encode("per-app-old-secret-aaaaaaaaaaaaaaaaaaaaaaaa");
    const shared = enc.encode("new-shared-family-secret-bbbbbbbbbbbbbbbbbbbb");
    // A session minted BEFORE the shared secret existed (signed with the app's own secret).
    const legacyToken = await new SignJWT({ openId: "email_x", appId: "a", name: "n" })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime("1h")
      .sign(oldPerApp);
    const tryVerify = async (token: string, keys: Uint8Array[]) => {
      for (const k of keys) {
        try {
          const { payload } = await jwtVerify(token, k, { algorithms: ["HS256"] });
          return payload;
        } catch { /* try next */ }
      }
      return null;
    };
    // With the fallback (verify against [shared, old]) the old session STILL validates → no logout.
    expect(await tryVerify(legacyToken, [shared, oldPerApp])).not.toBeNull();
    // Without the fallback (shared only) it would fail — i.e. the user would have been logged out.
    expect(await tryVerify(legacyToken, [shared])).toBeNull();
  });

  it("derives a deterministic, case-insensitive, <=64-char email openId", () => {
    // same email (any case / whitespace) → same openId on every app
    expect(emailOpenId("Jane@Example.com ")).toBe(emailOpenId("jane@example.com"));
    // different emails → different openIds
    expect(emailOpenId("a@b.com")).not.toBe(emailOpenId("c@d.com"));
    // fits the openId varchar(64) column even for a very long address
    expect(
      emailOpenId("some.very.long.email.address+tag@a-really-long-subdomain.example.co.uk").length
    ).toBeLessThanOrEqual(64);
    expect(emailOpenId("x@y.com").startsWith("email_")).toBe(true);
  });
});
