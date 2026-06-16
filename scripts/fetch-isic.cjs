/**
 * fetch-isic.cjs
 * Downloads 60 ISIC images (30 melanoma + 30 nevus) for the test page.
 * Usage: node scripts/fetch-isic.cjs
 */
const https = require("https");
const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = path.join(__dirname, "../client/public/test-images");
const META_FILE = path.join(__dirname, "../client/public/isic-metadata.json");

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "Accept": "application/json" } }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) { resolve(); return; }
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        // Follow redirect
        file.close();
        fs.unlinkSync(dest);
        downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function fetchImages(diagnosis, benignMalignant, limit) {
  const url = `https://api.isic-archive.com/api/v2/images/?limit=${limit}&diagnosis=${encodeURIComponent(diagnosis)}&offset=0`;
  console.log(`Fetching ${limit} ${diagnosis} images...`);
  const data = await fetchJson(url);
  return (data.results || []).map(img => ({
    id: img.isic_id,
    filename: `${img.isic_id}.jpg`,
    diagnosis,
    risk: benignMalignant === "malignant" ? "high" : "low",
    benign_malignant: benignMalignant,
    thumbnailUrl: img.files?.thumbnail_256?.url || null,
  }));
}

async function main() {
  console.log("🔬 Fetching ISIC image metadata...");

  let metadata = [];

  try {
    // Fetch melanoma (high risk)
    const melanoma = await fetchImages("melanoma", "malignant", 30);
    metadata.push(...melanoma);
    console.log(`  ✅ ${melanoma.length} melanoma images found`);

    // Fetch nevus (low risk - benign mole)
    const nevus = await fetchImages("nevus", "benign", 30);
    metadata.push(...nevus);
    console.log(`  ✅ ${nevus.length} nevus images found`);
  } catch (err) {
    console.error("API fetch failed, trying alternative endpoint...", err.message);
    // Fallback: use known ISIC IDs
    const fallbackIds = [
      { id: "ISIC_0024306", diagnosis: "melanoma", risk: "high", benign_malignant: "malignant" },
      { id: "ISIC_0024307", diagnosis: "melanoma", risk: "high", benign_malignant: "malignant" },
      { id: "ISIC_0024308", diagnosis: "melanoma", risk: "high", benign_malignant: "malignant" },
      { id: "ISIC_0015670", diagnosis: "nevus", risk: "low", benign_malignant: "benign" },
      { id: "ISIC_0015671", diagnosis: "nevus", risk: "low", benign_malignant: "benign" },
      { id: "ISIC_0015672", diagnosis: "nevus", risk: "low", benign_malignant: "benign" },
    ];
    metadata = fallbackIds.map(f => ({ ...f, filename: `${f.id}.jpg`, thumbnailUrl: null }));
  }

  console.log(`\n📥 Downloading ${metadata.length} images...`);
  let downloaded = 0;
  let failed = 0;

  for (const img of metadata) {
    const dest = path.join(OUTPUT_DIR, img.filename);
    if (img.thumbnailUrl) {
      try {
        await downloadFile(img.thumbnailUrl, dest);
        downloaded++;
        if (downloaded % 10 === 0) console.log(`  ${downloaded}/${metadata.length} downloaded...`);
      } catch (err) {
        console.warn(`  ⚠️ Failed: ${img.id} – ${err.message}`);
        failed++;
        // Remove failed entry from metadata
        img.thumbnailUrl = null;
      }
    } else {
      console.warn(`  ⚠️ No URL for ${img.id}`);
      failed++;
    }
  }

  // Filter out images that failed to download
  const validMetadata = metadata.filter(img => {
    const dest = path.join(OUTPUT_DIR, img.filename);
    return fs.existsSync(dest);
  }).map(({ thumbnailUrl, ...rest }) => rest); // remove URL from final metadata

  fs.writeFileSync(META_FILE, JSON.stringify(validMetadata, null, 2));

  console.log(`\n✅ Done!`);
  console.log(`  Downloaded: ${downloaded} images`);
  console.log(`  Failed: ${failed} images`);
  console.log(`  Metadata: ${META_FILE} (${validMetadata.length} entries)`);
}

main().catch(console.error);
