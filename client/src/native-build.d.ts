/**
 * Compile-time flag, replaced with a literal `true` / `false` by Vite (see the
 * `define` block in vite.config.ts) — NOT a runtime check.
 *
 * That is the whole point: Apple 2.3.1 forbids a hidden, dormant paywall, so in
 * the native build the price cards, the checkout links and the pricing route
 * must be eliminated by the bundler rather than skipped at runtime. Use the
 * runtime `Capacitor.isNativePlatform()` check only for genuine platform
 * behaviour (camera, file sharing, API base URL) — never for the paywall.
 */
declare const __NATIVE_BUILD__: boolean;
