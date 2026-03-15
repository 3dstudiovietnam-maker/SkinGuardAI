import axios from "axios";
import { ENV } from "./_core/env";
import { getDb } from "./db";
import { users, socialLogins } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export interface MicrosoftTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

export interface MicrosoftUserInfo {
  id: string;
  userPrincipalName: string;
  displayName: string;
  mail: string;
}

export interface TwitterTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface TwitterUserInfo {
  id: string;
  username: string;
  name: string;
}

// Google OAuth
export async function getGoogleAccessToken(code: string): Promise<GoogleTokenResponse> {
  try {
    const response = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: ENV.googleClientId,
      client_secret: ENV.googleClientSecret,
      redirect_uri: `${process.env.APP_URL || (process.env.NODE_ENV === "production" ? "https://www.skinguardai.app" : "http://localhost:3000")}/auth/google/callback`,
      grant_type: "authorization_code",
    });
    return response.data;
  } catch (error) {
    console.error("Google token exchange failed:", error);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to exchange Google token" });
  }
}

export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  try {
    const response = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to get Google user info:", error);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get Google user info" });
  }
}

// Microsoft OAuth
export async function getMicrosoftAccessToken(code: string): Promise<MicrosoftTokenResponse> {
  try {
    const response = await axios.post("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      code,
      client_id: ENV.microsoftClientId,
      client_secret: ENV.microsoftClientSecret,
      redirect_uri: `${process.env.NODE_ENV === "production" ? "https://skinguardai.manus.space" : "http://localhost:3000"}/auth/microsoft/callback`,
      grant_type: "authorization_code",
      scope: "user.read",
    });
    return response.data;
  } catch (error) {
    console.error("Microsoft token exchange failed:", error);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to exchange Microsoft token" });
  }
}

export async function getMicrosoftUserInfo(accessToken: string): Promise<MicrosoftUserInfo> {
  try {
    const response = await axios.get("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to get Microsoft user info:", error);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get Microsoft user info" });
  }
}

// Twitter OAuth
export async function getTwitterAccessToken(code: string): Promise<TwitterTokenResponse> {
  try {
    const response = await axios.post("https://api.twitter.com/2/oauth2/token", {
      code,
      client_id: ENV.twitterClientId,
      client_secret: ENV.twitterClientSecret,
      redirect_uri: `${process.env.NODE_ENV === "production" ? "https://skinguardai.manus.space" : "http://localhost:3000"}/auth/twitter/callback`,
      grant_type: "authorization_code",
      code_challenge_method: "plain",
    });
    return response.data;
  } catch (error) {
    console.error("Twitter token exchange failed:", error);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to exchange Twitter token" });
  }
}

export async function getTwitterUserInfo(accessToken: string): Promise<TwitterUserInfo> {
  try {
    const response = await axios.get("https://api.twitter.com/2/users/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { "user.fields": "id,username,name" },
    });
    return response.data.data;
  } catch (error) {
    console.error("Failed to get Twitter user info:", error);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get Twitter user info" });
  }
}

// Social login handler
export async function handleSocialLogin(
  provider: "google" | "microsoft" | "twitter",
  providerUserId: string,
  providerEmail: string,
  userName: string,
  accessToken: string,
  refreshToken?: string,
  expiresIn?: number
) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

  // Check if social login exists
  const existingSocialLogin = await db
    .select()
    .from(socialLogins)
    .where(eq(socialLogins.providerUserId, providerUserId))
    .limit(1);

  if (existingSocialLogin.length > 0) {
    // Update existing social login
    await db
      .update(socialLogins)
      .set({
        accessToken,
        refreshToken: refreshToken || null,
        expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
      })
      .where(eq(socialLogins.id, existingSocialLogin[0].id));

    // Get user
    const user = await db.select().from(users).where(eq(users.id, existingSocialLogin[0].userId)).limit(1);
    if (user.length === 0) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return { userId: user[0].id, isNewUser: false };
  }

  // Check if user exists by email
  const existingUser = await db.select().from(users).where(eq(users.email, providerEmail)).limit(1);

  let userId: number;

  if (existingUser.length > 0) {
    // Link social login to existing user
    userId = existingUser[0].id;
  } else {
    // Create new user
    const result = await db.insert(users).values({
      name: userName,
      email: providerEmail,
      loginMethod: provider,
      plan: "essential",
      openId: `${provider}_${providerUserId}`,
    });

    const insertedUser = await db.select().from(users).where(eq(users.email, providerEmail)).limit(1);
    if (insertedUser.length === 0) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user" });
    }
    userId = insertedUser[0].id;
  }

  // Create social login record
  await db.insert(socialLogins).values({
    userId,
    provider,
    providerUserId,
    providerEmail,
    accessToken,
    refreshToken: refreshToken || null,
    expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
  });

  return { userId, isNewUser: existingUser.length === 0 };
}
