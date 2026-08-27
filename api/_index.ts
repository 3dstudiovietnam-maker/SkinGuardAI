/**
 * Vercel Serverless Entry Point
 * Wraps the Express app for Vercel's Node.js runtime.
 * Static files are served directly by Vercel from dist/public/.
 */
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
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

// Lemon Squeezy webhook — registered BEFORE express.json on purpose: the
// signature is an HMAC of the raw bytes, and a parsed-then-restringified body
// does not reproduce it (key order and spacing differ). This route therefore
// takes the body as a Buffer.
app.post("/api/webhooks/lemon-squeezy", express.raw({ type: "*/*", limit: "1mb" }), async (req, res) => {
  const { handleWebhookRequest } = await import("../server/_core/lemonSqueezy");
  const signature = req.header("X-Signature") ?? req.header("x-signature");
  const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from(String(req.body ?? ""));
  const result = await handleWebhookRequest(raw, signature);
  res.status(result.status).json(result.body);
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Expose safe config to frontend (client ID for Google OAuth)
app.get("/api/config", (_req, res) => {
  res.json({ googleClientId: ENV.googleClientId });
});

// Google / Microsoft / Twitter OAuth callbacks
registerOAuthRoutes(app);

// AI Chat (streaming) — REMOVED, deliberately.
//
// registerChatRoutes() published POST /api/chat: an unauthenticated, unmetered
// streaming relay to gpt-4o, with the starter template's example tools still
// wired in ("You are a helpful assistant" + getWeather + calculate). Nothing in
// this app ever called it — the only consumer, AIChatBox, lives solely in the
// unrouted ComponentShowcase page. So it was an open LLM proxy on a public URL,
// billable to us by anyone who found it, and, if found, a general-purpose
// unmoderated chatbot answering under a skin-health brand.
//
// server/_core/chat.ts is left on disk. If a real assistant is ever wanted here,
// re-register it behind the session check used by protectedProcedure, add rate
// limiting like server/ai.ts's checkIpLimit, and replace the example tools and
// the system prompt with ones written for this app.
// NOTE: this only takes effect on the next API deploy.

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default app;
