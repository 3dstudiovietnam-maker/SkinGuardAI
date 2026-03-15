import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // Google OAuth callback — teljes server-side token csere
  app.get("/auth/google/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");

    if (!code) {
      res.redirect(302, "/login?error=missing_code");
      return;
    }

    try {
      const { getGoogleAccessToken, getGoogleUserInfo, handleSocialLogin } = await import("../oauth");

      // 1. Code → Access token csere a Google-lal
      const tokenResponse = await getGoogleAccessToken(code);

      // 2. Felhasználói adatok lekérése Google-tól
      const userInfo = await getGoogleUserInfo(tokenResponse.access_token);

      // 3. Felhasználó létrehozása vagy frissítése az adatbázisban
      await handleSocialLogin(
        "google",
        userInfo.id,
        userInfo.email,
        userInfo.name,
        tokenResponse.access_token,
        tokenResponse.refresh_token,
        tokenResponse.expires_in,
      );

      // 4. JWT session token létrehozása (az authenticateRequest JWT-t vár)
      const openId = `google_${userInfo.id}`;
      const sessionToken = await sdk.createSessionToken(openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // 5. Session cookie beállítása
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // 6. Átirányítás a dashboardra
      res.redirect(302, "/dashboard");
    } catch (error) {
      console.error("[Google OAuth] Callback failed", error);
      res.redirect(302, "/login?error=google_auth_failed");
    }
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// Export OAuth functions for use in routers
export { getGoogleAccessToken, getGoogleUserInfo, handleSocialLogin } from "../oauth";
