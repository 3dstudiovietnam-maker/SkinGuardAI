// End-to-end check of the Lemon Squeezy webhook, against the real database.
//
// It signs payloads exactly as Lemon Squeezy does and pushes them through the
// real handler: a forged signature, a purchase by an existing user, a repeated
// delivery, a renewal, a refund, and a purchase made before the buyer had an
// account (which must be claimed at sign-in). The two test users it creates are
// deleted afterwards.
//
//   npx tsx scripts/verify-lemon-webhook.ts

import dotenv from "dotenv";
dotenv.config();
if (!process.env.DATABASE_URL) dotenv.config({ path: ".env.production", override: true });

import crypto from "node:crypto";
import { sql } from "drizzle-orm";
import { getDb } from "../server/db";
import { handleWebhookRequest } from "../server/_core/lemonSqueezy";
import { claimPendingPurchases, listGrants } from "../server/_core/entitlements";

const SECRET = "selftest-webhook-secret";
const BUYER = "lemon-selftest-buyer@healthguardai.app";
const LATE = "lemon-selftest-late@healthguardai.app";

process.env.LEMON_SQUEEZY_WEBHOOK_SECRET = SECRET;
process.env.LEMON_SQUEEZY_VARIANTS = JSON.stringify({ "111": "pro", "222": "pro_plus", "333": "lifetime" });

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? "✓" : "✗"} ${label} → ${JSON.stringify(actual)}${ok ? "" : ` (várt: ${JSON.stringify(expected)})`}`);
}

function post(payload: unknown, opts: { badSignature?: boolean } = {}) {
  const raw = Buffer.from(JSON.stringify(payload), "utf8");
  const signature = opts.badSignature
    ? crypto.createHmac("sha256", "wrong-secret").update(raw).digest("hex")
    : crypto.createHmac("sha256", SECRET).update(raw).digest("hex");
  return handleWebhookRequest(raw, signature);
}

const order = (event: string, opts: {
  id: string; variant: string; email: string; userId?: number; status?: string; renewsAt?: string | null;
}) => ({
  meta: { event_name: event, custom_data: opts.userId ? { user_id: String(opts.userId) } : undefined },
  data: {
    id: opts.id,
    type: event.startsWith("subscription") ? "subscriptions" : "orders",
    attributes: {
      variant_id: Number(opts.variant),
      user_email: opts.email,
      status: opts.status,
      renews_at: opts.renewsAt ?? null,
    },
  },
});

const IN_30_DAYS = new Date(Date.now() + 30 * 864e5).toISOString();

async function planOf(db: any, userId: number) {
  const r: any = await db.execute(sql`SELECT plan FROM users WHERE id = ${userId}`);
  return (r.rows ?? r)[0]?.plan;
}

async function main() {
  const db = await getDb();
  if (!db) throw new Error("Nincs DATABASE_URL — az ellenőrzés adatbázis nélkül nem futtatható.");

  await listGrants(0); // touches the module so it creates its tables first
  await db.execute(sql`DELETE FROM users WHERE email IN (${BUYER}, ${LATE})`);
  await db.execute(sql`DELETE FROM pending_purchases WHERE lower(email) IN (${BUYER}, ${LATE})`);
  const created: any = await db.execute(sql`
    INSERT INTO users (email, name, plan) VALUES (${BUYER}, 'Lemon self-test', 'essential') RETURNING id
  `);
  const buyerId = Number((created.rows ?? created)[0].id);
  console.log(`teszt-vásárló: #${buyerId}\n`);

  try {
    // ── security ─────────────────────────────────────────────────────────────
    const forged = await post(order("subscription_created", { id: "sub_x", variant: "333", email: BUYER }), { badSignature: true });
    check("hamis aláírás elutasítva", forged.status, 401);

    const noSig = await handleWebhookRequest(Buffer.from("{}"), undefined);
    check("aláírás nélkül elutasítva", noSig.status, 401);

    // ── a signed-in buyer ────────────────────────────────────────────────────
    const bought = await post(order("subscription_created", {
      id: "sub_1", variant: "111", email: BUYER, userId: buyerId, status: "active", renewsAt: IN_30_DAYS }));
    check("előfizetés létrejött → pro", bought.body.plan, "pro");
    check("users.plan is átállt", await planOf(db, buyerId), "pro");

    // ── a repeated delivery ──────────────────────────────────────────────────
    await post(order("subscription_payment_success", {
      id: "sub_1", variant: "111", email: BUYER, userId: buyerId, status: "active", renewsAt: IN_30_DAYS }));
    const grants = await listGrants(buyerId);
    check("ismételt kézbesítés nem duplikál", grants.filter((g: any) => g.source === "lemon_squeezy").length, 1);

    // ── an upgrade, then a refund ────────────────────────────────────────────
    const upgraded = await post(order("subscription_updated", {
      id: "sub_2", variant: "222", email: BUYER, userId: buyerId, status: "active", renewsAt: IN_30_DAYS }));
    check("magasabb csomag → pro_plus", upgraded.body.plan, "pro_plus");

    const refunded = await post(order("order_refunded", { id: "sub_2", variant: "222", email: BUYER }));
    check("visszatérítés → marad a másik élő előfizetés", refunded.body.plan, "pro");

    const expired = await post(order("subscription_expired", { id: "sub_1", variant: "111", email: BUYER }));
    check("lejárt előfizetés → ingyenes szint", expired.body.plan, "essential");

    // ── unknown variant, unknown event ───────────────────────────────────────
    const unmapped = await post(order("subscription_created", {
      id: "sub_3", variant: "999", email: BUYER, userId: buyerId, status: "active", renewsAt: IN_30_DAYS }));
    check("ismeretlen termék nem ad hozzáférést", unmapped.body.ok, false);

    const other = await post({ meta: { event_name: "license_key_created" }, data: { id: "1", attributes: {} } });
    check("nem érdekes esemény nyugtázva", other.status, 200);

    // ── paid before registering ──────────────────────────────────────────────
    const early = await post(order("subscription_created", {
      id: "sub_late", variant: "333", email: LATE, status: "active", renewsAt: null }));
    check("fiók nélküli vásárlás félretéve", early.body.handled?.startsWith("subscription_created → pending"), true);

    const late: any = await db.execute(sql`
      INSERT INTO users (email, name, plan) VALUES (${LATE}, 'Lemon late signup', 'essential') RETURNING id
    `);
    const lateId = Number((late.rows ?? late)[0].id);
    check("regisztráció után megkapja", await claimPendingPurchases(lateId, LATE), "lifetime");
    check("másodszor már nincs mit beváltani", await claimPendingPurchases(lateId, LATE), null);
    await db.execute(sql`DELETE FROM users WHERE id = ${lateId}`);
  } finally {
    await db.execute(sql`DELETE FROM users WHERE email IN (${BUYER}, ${LATE})`);
    await db.execute(sql`DELETE FROM pending_purchases WHERE lower(email) IN (${BUYER}, ${LATE})`);
    console.log("\ntakarítás: teszt-felhasználók és félretett vásárlások törölve");
  }

  console.log(failures ? `\n✗ ${failures} hibás ellenőrzés` : "\n✓ minden ellenőrzés rendben");
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.error("✗", e); process.exit(1); });
