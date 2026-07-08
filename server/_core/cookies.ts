import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

// Shared parent domain for the HealthGuard app family. Scoping the session
// cookie here lets ONE free account work across every *.healthguardai.app
// sub-app (mind/fit/rehab/skin/mealguard) — a session created on one is sent
// to all of them. Custom domains (e.g. www.skinguardai.app) and localhost/IP
// stay host-only (no shared cookie there), which is fine.
const FAMILY_DOMAIN = "healthguardai.app";

function getSharedCookieDomain(req: Request): string | undefined {
  const hostname = (req.hostname || "").toLowerCase();
  if (!hostname || LOCAL_HOSTS.has(hostname) || isIpAddress(hostname)) return undefined;
  if (hostname === FAMILY_DOMAIN || hostname.endsWith(`.${FAMILY_DOMAIN}`)) {
    return `.${FAMILY_DOMAIN}`;
  }
  return undefined;
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  // SameSite=None REQUIRES Secure; on local http that combo makes the browser
  // silently drop the cookie. Use "lax" when not secure (local dev), "none"
  // for real https deployments (needed for cross-site OAuth redirects).
  const secure = isSecureRequest(req);
  const domain = getSharedCookieDomain(req);
  return {
    httpOnly: true,
    path: "/",
    sameSite: secure ? "none" : "lax",
    secure,
    ...(domain ? { domain } : {}),
  };
}
