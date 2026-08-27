#!/usr/bin/env node
// Gate for the native (Capacitor) web build — Apple 2.3.1 / 3.1.1.
//
// Asserts on the ACTUAL built output that the paywall is gone, not hidden:
//   1. no price text, no external checkout link, no route to the pricing page;
//   2. no code left behind that asks for a translation key the paywall strip
//      removed (that would render the bare key name, e.g. "terms.s4p1n").
//
// Run with: NATIVE_BUILD=1 npm run build:native  (invoked automatically there)
// Exit code 1 fails the build.

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "client", "dist-native");
const strippedKeysFile = path.join(root, "node_modules/.cache/paywall-stripped-keys.json");

// Checked against the raw file — these can never be legitimate here.
const FORBIDDEN = [
  { label: "external checkout (Gumroad)", re: /gumroad/gi },
  { label: "checkout vendor account", re: /noxuniverse/gi },
  { label: "pricing route", re: /["'`]\/pricing["'`]/g },
  { label: "Stripe / Lemon Squeezy checkout", re: /checkout\.stripe|lemonsqueezy/gi },
];

// Checked against STRING LITERALS only. Minified vendor code is full of raw
// numbers ("83,99" in a coordinate table) and "$1" regex replacements, so
// scanning the whole file for currency-ish patterns is nothing but noise.
// Every rule needs a currency marker next to the number: a bare "6,99" also
// occurs in vendor lookup tables, and "$0" is a minified identifier.
const FORBIDDEN_IN_TEXT = [
  { label: "price with decimals", re: /[$€£]\s?\d+[.,]\d{2}(?!\d)/g },
  { label: "whole-unit price", re: /[$€£]\s?\d{2,}(?!\d)/g },
  { label: "price with trailing currency", re: /\d+[.,]\d{2}\s?(?:USD|EUR|€|£|\$)/gi },
  { label: "USD amount", re: /(?:USD|US\$)\s?\d/g },
];

// String literals in the built (minified) JS: "…", '…' and `…`.
const STRING_LITERAL_RE = /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g;

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

if (!fs.existsSync(dist)) {
  console.error(`✗ ${path.relative(root, dist)} does not exist — run the native build first.`);
  process.exit(1);
}

const textFiles = walk(dist).filter((f) => /\.(js|css|html|json|map|txt|webmanifest)$/i.test(f));
const stripReport = fs.existsSync(strippedKeysFile)
  ? JSON.parse(fs.readFileSync(strippedKeysFile, "utf8"))
  : { stripped: [], sections: [], keys: [] };
const strippedKeys = stripReport.stripped;
const liveKeys = new Set(stripReport.keys);
// A string literal is a translation lookup if it is dotted and starts with one
// of the table's own section names — "terms.bill3", never "image/png".
const KEY_SHAPED = stripReport.sections.length
  ? new RegExp(`^(?:${stripReport.sections.join("|")})\\.[A-Za-z0-9_.]+$`)
  : null;

let failures = 0;
const report = (file, label, sample) => {
  failures++;
  console.error(`✗ ${label} in ${path.relative(root, file)} → ${sample}`);
};

for (const file of textFiles) {
  const src = fs.readFileSync(file, "utf8");
  for (const { label, re } of FORBIDDEN) {
    const hits = src.match(re);
    if (hits) report(file, label, [...new Set(hits)].slice(0, 5).join(", "));
  }
  const literals = /\.(js|map)$/i.test(file) ? (src.match(STRING_LITERAL_RE) ?? []).join("\n") : src;
  for (const { label, re } of FORBIDDEN_IN_TEXT) {
    const hits = literals.match(re);
    if (hits) report(file, label, [...new Set(hits)].slice(0, 5).join(", "));
  }
  // No surviving code may still point at deleted text: t("terms.bill3") would
  // render the bare key name on screen. Every key-shaped literal left in the
  // bundle has to resolve in the shipped table — which catches indirect lookups
  // too, since the key has to appear as a literal somewhere to be looked up.
  if (KEY_SHAPED) {
    const dangling = new Set();
    for (const lit of src.match(STRING_LITERAL_RE) ?? []) {
      const text = lit.slice(1, -1);
      if (!KEY_SHAPED.test(text) || liveKeys.has(text)) continue;
      // Keys are also built at runtime from a prefix ("sleep.amb_" + id), so a
      // literal that begins a live key is a live lookup, not a dangling one.
      if ([...liveKeys].some((k) => k.startsWith(text))) continue;
      dangling.add(text);
    }
    if (dangling.size) {
      report(file, "reference to a key the paywall strip removed", [...dangling].slice(0, 5).join(", "));
    }
  }
}

const chunkNames = walk(dist).map((f) => path.basename(f));
if (chunkNames.some((n) => /^Pricing[-.]/.test(n) || /^PlanSelection[-.]/.test(n))) {
  failures++;
  console.error("✗ a paywall chunk was emitted into the native build");
}

if (failures) {
  console.error(`\n✗ native bundle check FAILED with ${failures} finding(s).`);
  process.exit(1);
}
console.log(
  `✓ native bundle clean — ${textFiles.length} files scanned, ${strippedKeys.length} paywall keys stripped, no price text or checkout link left.`
);
