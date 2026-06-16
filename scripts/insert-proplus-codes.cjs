/**
 * insert-proplus-codes.cjs
 * Inserts Pro Plus annual promo codes SKIN-PP-0400 to SKIN-PP-0499 (100 codes)
 * Plan: pro_plus  |  Usage: one-time per code
 * Run: node scripts/insert-proplus-codes.cjs
 */

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

// Load .env manually
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("❌ DATABASE_URL not set in .env");
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  console.log("✅ Connected to database");

  // 1. Ensure activation_codes table exists
  await client.query(`
    CREATE TABLE IF NOT EXISTS activation_codes (
      id          SERIAL PRIMARY KEY,
      code        TEXT        NOT NULL UNIQUE,
      plan        TEXT        NOT NULL DEFAULT 'pro_plus',
      used        BOOLEAN     NOT NULL DEFAULT false,
      user_id     INTEGER     REFERENCES users(id),
      created_at  TIMESTAMP   DEFAULT NOW()
    )
  `);
  console.log("✅ Table activation_codes ready");

  // 2. Generate codes SKIN-PP-0400 to SKIN-PP-0499
  const codes = [];
  for (let i = 400; i <= 499; i++) {
    codes.push(`SKIN-PP-0${i}`);
  }
  console.log(`📋 Generated ${codes.length} codes (SKIN-PP-0400 … SKIN-PP-0499)`);

  // 3. Insert (skip duplicates)
  let inserted = 0;
  let skipped = 0;
  for (const code of codes) {
    try {
      await client.query(
        `INSERT INTO activation_codes (code, plan, used) VALUES ($1, 'pro_plus', false)
         ON CONFLICT (code) DO NOTHING`,
        [code]
      );
      inserted++;
    } catch {
      skipped++;
    }
  }
  console.log(`✅ Inserted: ${inserted} codes  |  Skipped (already exist): ${skipped}`);

  // 4. Write codes to text file
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const header = [
    "SkinGuard AI – Pro Plus Annual Promo Codes",
    `Generated: ${now}`,
    "Plan: pro_plus (annual subscription access)",
    "Usage: One-time use per code",
    "=".repeat(44),
    "",
  ].join("\n");

  const outputPath = path.join(__dirname, "..", "SKIN-PP-codes.txt");
  fs.writeFileSync(outputPath, header + codes.join("\n") + "\n");
  console.log(`📄 Codes saved to: ${outputPath}`);

  // 5. Verify
  const result = await client.query(
    `SELECT COUNT(*) FROM activation_codes WHERE plan = 'pro_plus' AND used = false`
  );
  console.log(`🔢 Total unused Pro Plus codes in DB: ${result.rows[0].count}`);

  await client.end();
  console.log("\n🚀 Done! Share SKIN-PP-codes.txt with the team.");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
