// Lemon Squeezy webhook — the only path by which a web purchase becomes access.
//
// Lemon Squeezy is our Merchant of Record: it sells the subscription, collects
// the tax and issues the invoice, then tells us here what happened. Everything
// this file does ends in one of two calls — grantEntitlement or
// revokeEntitlement — because the plan itself is derived (see entitlements.ts).
//
// Three rules this file exists to keep:
//
//   1. Nothing is trusted without the signature. The endpoint is public, so a
//      forged POST would otherwise hand out free subscriptions.
//   2. A repeated delivery must not double-grant. Lemon Squeezy retries on any
//      non-2xx, so the provider's own id is used as the idempotency key.
//   3. A purchase made before the buyer registered is not lost. It is parked by
//      e-mail address and claimed at their next sign-in.
//
// Configuration (Vercel env):
//   LEMON_SQUEEZY_WEBHOOK_SECRET — the signing secret from the webhook settings
//   LEMON_SQUEEZY_VARIANTS       — {"<variant_id>":"pro"|"pro_plus"|"lifetime"}

import crypto from "node:crypto";
import { sql } from "drizzle-orm";
import { getDb } from "../db";
import {
  grantEntitlement,
  revokeEntitlement,
  recordPendingPurchase,
  type Plan,
} from "./entitlements";

export type WebhookResult = {
  status: number;
  body: { ok: boolean; handled?: string; reason?: string; plan?: Plan | null };
};

/** Timing-safe HMAC-SHA256 check of the raw request body. */
export function verifySignature(rawBody: Buffer, signature: string | undefined, secret: string): boolean {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest();
  let received: Buffer;
  try {
    received = Buffer.from(signature, "hex");
  } catch {
    return false;
  }
  // timingSafeEqual throws on a length mismatch, which would itself leak a bit.
  if (received.length !== expected.length) return false;
  return crypto.timingSafeEqual(received, expected);
}

/** variant id → plan, from LEMON_SQUEEZY_VARIANTS. */
function variantMap(): Record<string, Plan> {
  const raw = process.env.LEMON_SQUEEZY_VARIANTS ?? "";
  if (!raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    const out: Record<string, Plan> = {};
    for (const [variant, plan] of Object.entries(parsed)) {
      if (plan === "pro" || plan === "pro_plus" || plan === "lifetime") out[String(variant)] = plan;
    }
    return out;
  } catch {
    console.error("[lemon-squeezy] LEMON_SQUEEZY_VARIANTS is not valid JSON — no purchase can be mapped to a plan");
    return {};
  }
}

async function findUserIdByEmail(email: string): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  const result: any = await db.execute(sql`SELECT id FROM users WHERE lower(email) = ${email.toLowerCase()} LIMIT 1`);
  const row = (result.rows ?? result)[0];
  return row ? Number(row.id) : null;
}

// Events that end access. `subscription_cancelled` deliberately is NOT one of
// them: cancelling in Lemon Squeezy means "do not renew", and the subscription
// stays valid until ends_at — cutting access on that event would take away time
// the user already paid for.
const ENDING_EVENTS = new Set(["subscription_expired", "order_refunded"]);
const GRANTING_EVENTS = new Set([
  "order_created",
  "subscription_created",
  "subscription_updated",
  "subscription_resumed",
  "subscription_unpaused",
  "subscription_payment_success",
]);

/**
 * Apply one verified webhook body. The caller has already checked the signature.
 */
export async function handleEvent(payload: any): Promise<WebhookResult> {
  const event: string = payload?.meta?.event_name ?? "";
  const attributes = payload?.data?.attributes ?? {};
  const objectId = payload?.data?.id ? String(payload.data.id) : null;

  if (!event) return { status: 400, body: { ok: false, reason: "missing event name" } };

  // ── which plan? ────────────────────────────────────────────────────────────
  const variantId = attributes.variant_id ?? attributes.first_order_item?.variant_id;
  const plan = variantMap()[String(variantId)];

  // ── which user? ────────────────────────────────────────────────────────────
  // custom_data.user_id is set on the checkout link when the buyer is signed in;
  // otherwise all we have is the address they paid with.
  const customUserId = payload?.meta?.custom_data?.user_id;
  const email: string | null = attributes.user_email ?? attributes.email ?? null;

  // ── ending events ──────────────────────────────────────────────────────────
  if (ENDING_EVENTS.has(event)) {
    if (!objectId) return { status: 400, body: { ok: false, reason: "missing object id" } };
    const left = await revokeEntitlement({
      source: "lemon_squeezy",
      externalId: objectId,
      status: event === "order_refunded" ? "refunded" : "expired",
      note: `lemon squeezy: ${event}`,
    });
    return { status: 200, body: { ok: true, handled: event, plan: left } };
  }

  if (!GRANTING_EVENTS.has(event)) {
    // Acknowledge anything else (invoice notifications, licence key events) so
    // Lemon Squeezy stops retrying a delivery we have no work for.
    return { status: 200, body: { ok: true, handled: `ignored: ${event}` } };
  }

  if (!plan) {
    console.error(`[lemon-squeezy] no plan mapped for variant ${variantId} (event ${event})`);
    return { status: 200, body: { ok: false, reason: `unmapped variant ${variantId}` } };
  }
  if (!objectId) return { status: 400, body: { ok: false, reason: "missing object id" } };

  // A subscription that is not currently in good standing must not grant access.
  const status: string | undefined = attributes.status;
  if (status && !["active", "on_trial", "cancelled", "paused"].includes(status)) {
    // cancelled/paused still run to ends_at, which the window below enforces.
    if (["expired", "unpaid", "past_due"].includes(status)) {
      const left = await revokeEntitlement({
        source: "lemon_squeezy",
        externalId: objectId,
        status: "expired",
        note: `lemon squeezy status: ${status}`,
      });
      return { status: 200, body: { ok: true, handled: `${event} (${status})`, plan: left } };
    }
  }

  // Lifetime products carry no renewal date; subscriptions run to renews_at
  // (or ends_at once cancelled).
  const endsRaw: string | null = attributes.ends_at ?? attributes.renews_at ?? null;
  const endsAt = plan === "lifetime" ? null : endsRaw ? new Date(endsRaw) : null;

  const note = `lemon squeezy: ${event}${status ? ` (${status})` : ""}`;

  let userId: number | null = customUserId ? Number(customUserId) : null;
  if (userId && !Number.isFinite(userId)) userId = null;
  if (!userId && email) userId = await findUserIdByEmail(email);

  if (!userId) {
    if (!email) return { status: 200, body: { ok: false, reason: "no user and no e-mail on the order" } };
    // Paid before registering — park it, claimed at their next sign-in.
    await recordPendingPurchase({
      email, plan, source: "lemon_squeezy", externalId: objectId, endsAt, note, payload,
    });
    return { status: 200, body: { ok: true, handled: `${event} → pending (${email})` } };
  }

  const resulting = await grantEntitlement({
    userId, plan, source: "lemon_squeezy", externalId: objectId, endsAt, note, payload,
  });
  return { status: 200, body: { ok: true, handled: event, plan: resulting } };
}

/**
 * Full request handling: verify, parse, apply. Returns what to send back.
 * The body MUST be the raw bytes — a parsed-and-restringified body will not
 * reproduce the signature.
 */
export async function handleWebhookRequest(rawBody: Buffer, signature: string | undefined): Promise<WebhookResult> {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET ?? "";
  if (!secret) {
    console.error("[lemon-squeezy] LEMON_SQUEEZY_WEBHOOK_SECRET is not set — rejecting the delivery");
    return { status: 500, body: { ok: false, reason: "webhook secret not configured" } };
  }
  if (!verifySignature(rawBody, signature, secret)) {
    return { status: 401, body: { ok: false, reason: "invalid signature" } };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return { status: 400, body: { ok: false, reason: "body is not JSON" } };
  }

  try {
    return await handleEvent(payload);
  } catch (e: any) {
    // A 500 makes Lemon Squeezy retry, which is what we want for a transient
    // database failure — the idempotency key stops the retry double-granting.
    console.error("[lemon-squeezy] handler failed:", e?.message ?? e);
    return { status: 500, body: { ok: false, reason: "handler failed" } };
  }
}
