import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.skinguardai.app',
  appName: 'SkinGuard AI',
  webDir: 'client/dist',
  // No server.url: the native app ships its own web build from webDir, so it is
  // a real app rather than a WebView pointed at our website (Apple 4.2 Minimum
  // Functionality rejects the latter). API calls go to production explicitly via
  // client/src/lib/apiBase.ts, and api/_index.ts allows the native origin.
  ios: {
    // 'never': we handle the status bar and home indicator ourselves with
    // env(safe-area-inset-*), so the web view may draw edge to edge.
    contentInset: 'never',
  },
  plugins: {
    // Route fetch/XHR through the native HTTP client so the HttpOnly session
    // cookie set by login is persisted + sent back (WKWebView drops fetch-set
    // cookies by default → login didn't "stick"). CapacitorCookies mirrors the
    // native cookie store into document.cookie.
    CapacitorHttp: { enabled: true },
    CapacitorCookies: { enabled: true },
  },
};

export default config;
