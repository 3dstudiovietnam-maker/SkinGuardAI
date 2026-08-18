/**
 * Where API calls should go.
 *
 * On the web the app is served from the same origin as the API, so relative
 * paths work and this stays empty.
 *
 * In the native shell the app is bundled into the binary and served from
 * capacitor://localhost, so a relative "/api/..." path has no server behind it.
 * There we point at production explicitly. Requests are then cross-origin, which
 * the API allows for the native origins (see api/_index.ts) — and CapacitorHttp
 * carries the session cookie, which WKWebView would otherwise drop.
 */
export const PRODUCTION_ORIGIN = "https://www.skinguardai.app";

const isNativeShell = () =>
  typeof window !== "undefined" &&
  !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
    .Capacitor?.isNativePlatform?.();

export const API_BASE = isNativeShell() ? PRODUCTION_ORIGIN : "";

/**
 * Origin to use when we build a link that LEAVES the app — a URL copied to the
 * clipboard, shared with a doctor, opened in a browser.
 *
 * `window.location.origin` is "capacitor://localhost" inside the native shell,
 * so any share link built from it is dead the moment it leaves the device.
 * Always hand out the public https origin instead. On the web this is just the
 * current origin, so preview/staging deployments keep sharing themselves.
 */
export const WEB_ORIGIN = isNativeShell()
  ? PRODUCTION_ORIGIN
  : typeof window !== "undefined"
    ? window.location.origin
    : PRODUCTION_ORIGIN;
