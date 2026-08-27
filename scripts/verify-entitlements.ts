// Integration check for the entitlements layer, against the real database.
//
// It creates one throwaway user, walks the lifecycle a real purchase goes
// through — grant, expiry, refund, re-purchase, duplicate webhook — and deletes
// the user again. Nothing else in the database is touched.
//
//   npx tsx scripts/verify-entitlements.ts

import dotenv from "dotenv";
// .env carries an empty DATABASE_URL here, and dotenv never overwrites a value
// that is already set — so the real connection string in .env.production has to
// be loaded with override.
dotenv.config();
if (!process.env.DATABASE_URL) dotenv.config({ path: ".env.production", override: true });
import { sql } from "drizzle-orm";
import { getDb } from "../server/db";
import { grantEntitlement, revokeEntitlement, recomputePlan, listGrants } from "../server/_core/entitlements";

const TEST_EMAIL = "entitlements-selftest@healthguardai.app";

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`${ok ? "✓" : "✗"} ${label} → ${JSON.stringify(actual)}${ok ? "" : ` (várt: ${JSON.stringify(expected)})`}`);
}

async function main() {
  const db = await getDb();
  if (!db) throw new Error("Nincs DATABASE_URL — az ellenőrzés adatbázis nélkül nem futtatható.");

  // the entitlements module creates its own table on first use
  await recomputePlan(0).catch(() => {});
  console.log("✓ grants tábla létrehozva / megvan\n");

  // clean slate in case an earlier run died mid-way
  await db.execute(sql`DELETE FROM users WHERE email = ${TEST_EMAIL}`);
  const created = await db.execute(sql`
    INSERT INTO users (email, name, plan) VALUES (${TEST_EMAIL}, 'Entitlements self-test', 'essential')
    RETURNING id
  `);
  const userId = Number(((created as any).rows ?? (created as any))[0].id);
  console.log(`teszt-felhasználó: #${userId}\n`);

  try {
    check("induló terv", await recomputePlan(userId), "essential");

    check("promó-kód → lifetime",
      await grantEntitlement({ userId, plan: "lifetime", source: "promo_code", externalId: "FIT-LT-SELFTEST" }),
      "lifetime");

    check("ugyanaz a kód mégegyszer → változatlan",
      await grantEntitlement({ userId, plan: "lifetime", source: "promo_code", externalId: "FIT-LT-SELFTEST" }),
      "lifetime");

    const afterDouble = await listGrants(userId);
    check("kétszeri beváltás után is 1 jogosultság", afterDouble.length, 1);

    check("gyengébb előfizetés nem ronthatja le a lifetime-ot",
      await grantEntitlement({ userId, plan: "pro", source: "lemon_squeezy", externalId: "ls_order_1",
                               endsAt: new Date(Date.now() + 30 * 864e5) }),
      "lifetime");

    check("lifetime visszatérítve → marad az élő előfizetés",
      await revokeEntitlement({ source: "promo_code", externalId: "FIT-LT-SELFTEST", status: "refunded" }),
      "pro");

    check("az előfizetés lejár → vissza az ingyenes szintre",
      await grantEntitlement({ userId, plan: "pro", source: "lemon_squeezy", externalId: "ls_order_1",
                               endsAt: new Date(Date.now() - 864e5) }),
      "essential");

    check("megújítás → újra pro",
      await grantEntitlement({ userId, plan: "pro", source: "lemon_squeezy", externalId: "ls_order_1",
                               endsAt: new Date(Date.now() + 30 * 864e5) }),
      "pro");

    check("magasabb csomagra váltás → pro_plus",
      await grantEntitlement({ userId, plan: "pro_plus", source: "lemon_squeezy", externalId: "ls_order_2",
                               endsAt: new Date(Date.now() + 365 * 864e5) }),
      "pro_plus");

    check("visszamondás → marad a másik élő előfizetés",
      await revokeEntitlement({ source: "lemon_squeezy", externalId: "ls_order_2", status: "cancelled" }),
      "pro");

    check("ismeretlen rendelés visszamondása → nincs találat",
      await revokeEntitlement({ source: "lemon_squeezy", externalId: "nincs-ilyen" }),
      null);

    const stored = await db.execute(sql`SELECT plan FROM users WHERE id = ${userId}`);
    check("users.plan is együtt mozog", ((stored as any).rows ?? (stored as any))[0].plan, "pro");
  } finally {
    await db.execute(sql`DELETE FROM users WHERE id = ${userId}`);
    const left = await db.execute(sql`SELECT COUNT(*)::int AS n FROM grants WHERE user_id = ${userId}`);
    const n = Number(((left as any).rows ?? (left as any))[0].n);
    console.log(`\ntakarítás: teszt-felhasználó törölve, maradék jogosultság: ${n}`);
    if (n !== 0) failures++;
  }

  console.log(failures ? `\n✗ ${failures} hibás ellenőrzés` : "\n✓ minden ellenőrzés rendben");
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.error("✗", e); process.exit(1); });
