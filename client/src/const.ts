export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Publication date of the current Terms / Privacy Policy / Legal Notice /
 * Medical Disclaimer.
 *
 * These pages used to render `new Date().toLocaleDateString()`, so every visitor
 * was told the legal documents had been "last updated" today, whatever today
 * was. That is a misstatement on the face of the document, it makes it
 * impossible to show which version a given user accepted, and it defeats the
 * change-notification promise in leg.subjectChange. Bump this constant by hand
 * whenever the legal text actually changes.
 */
export const LEGAL_LAST_UPDATED = "2026-08-17";

// Generate login URL at runtime so redirect URI reflects the current origin.
// Falls back to /login if the OAuth portal is not configured (Google OAuth is used instead).
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;

  if (!oauthPortalUrl || !appId) {
    return "/login";
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
