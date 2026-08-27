// Entitlements — the one place that decides what a user has paid for.
//
// Until now a paid tier was written straight onto users.plan by whoever granted
// it, which left no record of WHERE it came from. That is fine while the only
// source is a hand-issued promo code, but it cannot survive real purchases: a
// subscription can renew, lapse, be refunded or be bought again on another
// channel, and each of those has to change the plan back or forward without
// guessing.
//
// So every entitlement is written to the `grants` table with its source and its
// validity window, and users.plan becomes a derived value: recomputePlan() takes
// the strongest grant that is still live and writes that. A refund revokes one
// grant and the user falls back to whatever else they still hold — a lifetime
// licence, another subscription, or the free tier.
//
// The module creates its own table on first use (the Vercel build runs no
// migrations) and backfills the existing users.plan values once, so nobody
// loses access the moment this ships and no app needs bootstrap wiring.

import { sql } from "drizzle-orm";
import { getDb } from "../db";

export type Plan = "essential" | "pro" | "pro_plus" | "lifetime";

/** Where an entitlement came from. Kept as text so a new channel needs no migration. */
export type GrantSource =
  | "promo_code"      // activation code redeemed in the app
  | "lemon_squeezy"   // web purchase (Merchant of Record)
  | "apple_iap"       // future: App Store in-app purchase
  | "google_play"     // future: Play Billing
  | "manual"          // granted by us (support, partner, press)
  | "legacy";         // backfilled from users.plan before grants existed

export type GrantStatus = "active" | "cancelled" | "refunded" | "expired";

/** Stronger plans win. Used to pick between several live grants. */
const RANK: Record<Plan, number> = { essential: 0, pro: 1, pro_plus: 2, lifetime: 3 };

const isPlan = (v: unknown): v is Plan =>
  typeof v === "string" && Object.prototype.hasOwnProperty.call(RANK, v);

function rows(result: unknown): any[] {
  const r = result as any;
  return r?.rows ?? (Array.isArray(r) ? r : []);
}


// ── schema ──────────────────────────────────────────────────────────────────
// Created on first use and cached per process, the same way the other runtime
// tables are handled. Every statement is idempotent.
let schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = createSchema().catch((e) => { schemaReady = null; throw e; });
  }
  return schemaReady;
}

async function createSchema(): Promise<void> {
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
  // The provider's own id is the idempotency key: a webhook that fires twice for
  // one order must update a single row, never stack duplicates.
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS grants_source_external_idx
      ON grants (source, external_id) WHERE external_id IS NOT NULL
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS grants_user_idx ON grants (user_id)`);

  // Purchases that arrived before the buyer had an account. People routinely pay
  // first and register afterwards, and the webhook cannot invent a user row for
  // them, so the purchase waits here by e-mail address and is claimed at their
  // next sign-in (claimPendingPurchases). Without this the money is taken and
  // nothing is unlocked — the single worst failure mode of the whole flow.
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

  // One-time backfill: users who already hold a paid tier predate this table, and
  // recomputePlan() would otherwise drop them to the free plan. Afterwards every
  // such user has a grant, so the statement finds nothing to do.
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

/**
 * Recalculate users.plan from the grants that are still live, and persist it.
 * Safe to call as often as you like — it only reads and writes derived state.
 */
export async function recomputePlan(userId: number): Promise<Plan> {
  await ensureSchema();
  const db = await getDb();
  if (!db) throw new Error("[entitlements] database not available");

  const live = await db.execute(sql`
    SELECT plan FROM grants
    WHERE user_id = ${userId}
      AND status = 'active'
      AND (ends_at IS NULL OR ends_at > NOW())
  `);

  let plan: Plan = "essential";
  for (const row of rows(live)) {
    const candidate = row.plan;
    if (isPlan(candidate) && RANK[candidate] > RANK[plan]) plan = candidate;
  }

  // users.plan is the value the whole app already reads; userSubscriptions is
  // kept in step so the existing dashboard queries stay correct.
  await db.execute(sql`UPDATE users SET plan = ${plan}::plan WHERE id = ${userId}`);
  await db.execute(sql`
    INSERT INTO "userSubscriptions" ("userId", plan, status)
    VALUES (${userId}, ${plan}::plan, 'active')
    ON CONFLICT ("userId") DO UPDATE SET plan = ${plan}::plan, status = 'active', "updatedAt" = NOW()
  `);

  return plan;
}

/**
 * Record an entitlement and return the plan the user ends up with.
 *
 * Idempotent per (source, externalId): a webhook that fires twice for the same
 * order updates that one row instead of stacking duplicates, which is why the
 * caller should always pass the provider's own id.
 */
export async function grantEntitlement(opts: {
  userId: number;
  plan: Plan;
  source: GrantSource;
  /** Provider order/subscription id, or the promo code — the idempotency key. */
  externalId?: string | null;
  /** null / omitted = no expiry (lifetime, or a subscription we renew on renewal events). */
  endsAt?: Date | null;
  note?: string | null;
  /** Raw provider payload, kept for audit and for debugging a disputed charge. */
  payload?: unknown;
}): Promise<Plan> {
  await ensureSchema();
  const db = await getDb();
  if (!db) throw new Error("[entitlements] database not available");

  const externalId = opts.externalId ?? null;
  const endsAt = opts.endsAt ?? null;
  const note = opts.note ?? null;
  const payload = opts.payload === undefined ? null : JSON.stringify(opts.payload);

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

/**
 * End an entitlement — a refund, a cancellation, or a subscription that lapsed.
 * Returns the plan the user is left with, or null if no such grant existed.
 */
export async function revokeEntitlement(opts: {
  source: GrantSource;
  externalId: string;
  status?: Exclude<GrantStatus, "active">;
  note?: string | null;
}): Promise<Plan | null> {
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

/** Everything we hold for a user, newest first — for support and the account page. */
export async function listGrants(userId: number) {
  await ensureSchema();
  const db = await getDb();
  if (!db) throw new Error("[entitlements] database not available");
  const result = await db.execute(sql`
    SELECT id, plan, source, external_id, status, starts_at, ends_at, note, created_at
    FROM grants WHERE user_id = ${userId} ORDER BY created_at DESC
  `);
  return rows(result);
}

/**
 * A purchase whose buyer has no account yet. Parked by e-mail address until they
 * sign in, so paying before registering cannot swallow the payment.
 */
export async function recordPendingPurchase(opts: {
  email: string;
  plan: Plan;
  source: GrantSource;
  externalId?: string | null;
  endsAt?: Date | null;
  note?: string | null;
  payload?: unknown;
}): Promise<void> {
  await ensureSchema();
  const db = await getDb();
  if (!db) throw new Error("[entitlements] database not available");

  const payload = opts.payload === undefined ? null : JSON.stringify(opts.payload);
  await db.execute(sql`
    INSERT INTO pending_purchases (email, plan, source, external_id, ends_at, note, payload)
    VALUES (${opts.email.toLowerCase()}, ${opts.plan}, ${opts.source}, ${opts.externalId ?? null},
            ${opts.endsAt ?? null}, ${opts.note ?? null}, ${payload}::jsonb)
    ON CONFLICT (source, external_id) WHERE external_id IS NOT NULL DO UPDATE
      SET email = EXCLUDED.email, plan = EXCLUDED.plan, ends_at = EXCLUDED.ends_at,
          note = EXCLUDED.note, payload = COALESCE(EXCLUDED.payload, pending_purchases.payload)
  `);
}

/**
 * Turn every purchase parked for this e-mail address into a real entitlement.
 * Call it whenever a user proves ownership of the address — sign-up and sign-in.
 * Returns the plan they hold afterwards.
 */
export async function claimPendingPurchases(userId: number, email: string | null | undefined): Promise<Plan | null> {
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
      source: row.source as GrantSource,
      externalId: row.external_id,
      endsAt: row.ends_at ? new Date(row.ends_at) : null,
      note: row.note ?? "claimed after sign-in",
      payload: row.payload ?? undefined,
    });
    await db.execute(sql`UPDATE pending_purchases SET claimed_at = NOW() WHERE id = ${row.id}`);
  }

  return recomputePlan(userId);
}
