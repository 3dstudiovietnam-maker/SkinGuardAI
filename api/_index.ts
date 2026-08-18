/**
 * Vercel Serverless Entry Point
 * Wraps the Express app for Vercel's Node.js runtime.
 * Static files are served directly by Vercel from dist/public/.
 */
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerChatRoutes } from "../server/_core/chat";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { ENV } from "../server/_core/env";

const app = express();

// The native iOS/Android shell is bundled locally, so it calls us from
// capacitor://localhost rather than our own domain. Those requests are
// cross-origin and carry the session cookie, so they need an explicit
// echoed origin (never "*") plus Allow-Credentials. The browser build is
// same-origin and never sends an Origin we recognise here.
const NATIVE_ORIGINS = new Set([
  "capacitor://localhost",  // iOS
  "https://localhost",      // Android (Capacitor 4+ default androidScheme)
  "ionic://localhost",      // legacy
  "http://localhost",       // legacy
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && NATIVE_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-trpc-source",
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
  }
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Expose safe config to frontend (client ID for Google OAuth)
app.get("/api/config", (_req, res) => {
  res.json({ googleClientId: ENV.googleClientId });
});

// Google / Microsoft / Twitter OAuth callbacks
registerOAuthRoutes(app);

// AI Chat (streaming)
registerChatRoutes(app);

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default app;
