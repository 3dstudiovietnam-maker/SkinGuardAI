// Apple App Store Review Guideline 2.3.1 (Hidden Features) + 3.1.1 (In-App Purchase).
//
// The native build must not merely HIDE the paywall at runtime — the price
// strings, the plan cards and the external checkout links have to be physically
// absent from the shipped bundle. Component code is removed by dead-code
// elimination (see the __NATIVE_BUILD__ define in vite.config.ts), but the
// price *text* lives inside one big translations object, which no bundler can
// tree-shake at property level. This plugin removes those entries from the
// module source before it is bundled.
//
// It runs only when NATIVE_BUILD=1. The web build is byte-for-byte unaffected.
//
// The list of removed key paths is written to node_modules/.cache so that
// scripts/verify-native-bundle.mjs can assert afterwards that no surviving code
// still asks for a key that no longer exists (which would render the raw key
// name in the UI).

import fs from "node:fs";
import path from "node:path";
import { transform } from "esbuild";

// A value is paywall text if it names a price, a currency amount, or the
// external payment provider.
const PAYWALL_RE =
  /(\$\s?\d)|(\d[\d.,]*\s*(?:USD|US\$|\$))|\bUSD\b|(\d+[.,]99\b)|gumroad/i;

const CACHE_FILE = "node_modules/.cache/paywall-stripped-keys.json";

// The language t() falls back to when a key is missing (LanguageContext.tsx).
const FALLBACK_LANG = "en";

function collect(node, prefix, out) {
  for (const [key, value] of Object.entries(node)) {
    const p = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      if (PAYWALL_RE.test(value)) out.add(p);
    } else if (value && typeof value === "object") {
      // Only whole VALUES are matched, never whole sections: the `pricing`
      // namespace also holds plain feature bullets that the dashboard renders in
      // the native app, and deleting those would leave raw key names on screen.
      collect(value, p, out);
    }
  }
}

function remove(node, parts) {
  const [head, ...rest] = parts;
  if (!node || typeof node !== "object" || !(head in node)) return;
  if (rest.length === 0) delete node[head];
  else remove(node[head], rest);
}

export function stripPaywallStrings({ projectRoot }) {
  return {
    name: "strip-paywall-strings",
    enforce: "pre",
    apply: "build",
    async transform(code, id) {
      if (!id.replace(/\\/g, "/").endsWith("/lib/translations.ts")) return null;

      // The module is pure data, so it is safe to evaluate, edit and re-emit.
      const js = (await transform(code, { loader: "ts", format: "cjs" })).code;
      const mod = { exports: {} };
      // eslint-disable-next-line no-new-func
      new Function("exports", "module", js)(mod.exports, mod);
      const { LANGUAGES, translations } = mod.exports;
      if (!translations) throw new Error("strip-paywall: translations not found");

      // Stripping is per language: a key whose English copy is price-free
      // ("Pro") but whose Hungarian copy carries the price ("Pro (6,99 $/hó)")
      // loses only the Hungarian entry, and t() falls back to the clean English
      // one. Keys that carry a price in EVERY language disappear completely —
      // those are the ones the verifier then hunts for dangling references to.
      const paths = new Set();
      for (const lang of Object.keys(translations)) {
        const langPaths = new Set();
        collect(translations[lang], "", langPaths);
        for (const p of langPaths) {
          paths.add(p);
          remove(translations[lang], p.split("."));
        }
      }

      // t() looks the key up in the active language and then falls back to
      // English — so a key is unusable the moment ENGLISH loses it, even if some
      // other locale still has a copy. Those are the keys that would render as a
      // bare "terms.bill3" on screen, and the ones the verifier hunts for.
      const resolves = (lang, parts) =>
        parts.reduce((node, k) => (node == null ? undefined : node[k]), translations[lang]) !== undefined;
      const gone = [...paths].filter((p) => !resolves(FALLBACK_LANG, p.split(".")));

      const sorted = gone.sort();

      // Every key path the fallback language still resolves, so the verifier can
      // tell a live lookup from one left pointing at deleted text — including
      // lookups made indirectly, through a variable rather than a literal.
      const surviving = [];
      (function walkKeys(node, prefix) {
        for (const [key, value] of Object.entries(node)) {
          const p = prefix ? `${prefix}.${key}` : key;
          surviving.push(p);
          if (value && typeof value === "object") walkKeys(value, p);
        }
      })(translations[FALLBACK_LANG], "");

      const cache = path.join(projectRoot, CACHE_FILE);
      fs.mkdirSync(path.dirname(cache), { recursive: true });
      fs.writeFileSync(
        cache,
        JSON.stringify({ stripped: sorted, sections: Object.keys(translations[FALLBACK_LANG]), keys: surviving.sort() }, null, 2)
      );
      this.info?.(
        `stripped paywall text from ${paths.size} key paths; ${sorted.length} of them are gone from every language`
      );

      return {
        code:
          `// Generated at build time by vite-plugin-strip-paywall.mjs.\n` +
          `// ${paths.size} paywall key paths stripped for the native build.\n` +
          `export const LANGUAGES = ${JSON.stringify(LANGUAGES)};\n` +
          `export const translations = ${JSON.stringify(translations)};\n`,
        map: null,
      };
    },
  };
}
