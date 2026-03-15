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
