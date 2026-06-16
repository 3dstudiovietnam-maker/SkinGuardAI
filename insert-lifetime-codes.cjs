/**
 * insert-lifetime-codes.cjs
 * Creates the activation_codes table and inserts SKIN-LT-0500 to SKIN-LT-0600
 * Run: node insert-lifetime-codes.cjs
 */

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

// Load .env manually
const envPath = path.join(__dirname, ".env");
const envContent = fs.readFileSync(envPath, "utf8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim();
  if (!process.env[key]) process.env[key] = val;
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env");
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("✅ Connected to database");

  // 1. Create activation_codes table
  await client.query(`
    CREATE TABLE IF NOT EXISTS activation_codes (
      id          SERIAL PRIMARY KEY,
      code        VARCHAR(64) NOT NULL UNIQUE,
      plan        TEXT        NOT NULL DEFAULT 'lifetime',
      used        BOOLEAN     NOT NULL DEFAULT FALSE,
      user_id     INTEGER     REFERENCES users(id) ON DELETE SET NULL,
      expires_at  TIMESTAMP,
      created_at  TIMESTAMP   NOT NULL DEFAULT NOW()
    );
  `);
  console.log("✅ Table activation_codes created (or already exists)");

  // 2. Generate codes SKIN-LT-0500 to SKIN-LT-0600 (101 codes)
  const codes = [];
  for (let i = 500; i <= 600; i++) {
    codes.push(`SKIN-LT-0${i}`);
  }

  // 3. Insert codes (skip duplicates)
  let inserted = 0;
  let skipped = 0;
  for (const code of codes) {
    try {
      await client.query(
        `INSERT INTO activation_codes (code, plan, used) VALUES ($1, 'lifetime', false)
         ON CONFLICT (code) DO NOTHING`,
        [code]
      );
      inserted++;
    } catch (err) {
      console.warn(`⚠️  Skipped ${code}:`, err.message);
      skipped++;
    }
  }
  console.log(`✅ Inserted: ${inserted} codes, Skipped (already exist): ${skipped}`);

  // 4. Export to codes.txt
  const now = new Date().toISOString().slice(0, 10);
  const header = `SkinGuard AI – Lifetime Promo Codes\nGenerated: ${now}\nPlan: lifetime (pro_plus access)\nUsage: One-time use per code\n${"=".repeat(40)}\n`;
  const codeList = codes.join("\n");
  const outputPath = path.join(__dirname, "SKIN-LT-codes.txt");
  fs.writeFileSync(outputPath, header + codeList + "\n");
  console.log(`✅ Exported to: ${outputPath}`);

  // 5. Verify count in DB
  const result = await client.query(`SELECT COUNT(*) FROM activation_codes WHERE plan = 'lifetime' AND used = false`);
  console.log(`📊 Active lifetime codes in DB: ${result.rows[0].count}`);

  await client.end();
  console.log("\n🚀 All done! Give SKIN-LT-codes.txt to the team.");
}

main().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
