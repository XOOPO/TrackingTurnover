import type { Request, Response } from "express";
import { ENV } from "./env";

/**
 * Generate Google OAuth login URL
 */
export function getOAuthLoginUrl(redirectUri: string): string {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: redirectUri,
    client_id: ENV.googleClientId,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
    state: btoa(redirectUri),
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}

/**
 * Handle OAuth login redirect
 * This route redirects the user to Google OAuth portal
 */
export function handleOAuthLogin(req: Request, res: Response) {
  try {
    if (!ENV.googleClientId) {
      throw new Error("GOOGLE_CLIENT_ID is not configured");
    }
    
    const redirectUri = `${req.protocol}://${req.get("host")}/api/oauth/callback`;
    const authUrl = getOAuthLoginUrl(redirectUri);
    
    console.log("[OAuth] Redirecting to Google:", authUrl);
    res.redirect(authUrl);
  } catch (error) {
    console.error("[OAuth] Login redirect failed:", error);
    res.status(500).json({ error: "Failed to initiate Google OAuth login" });
  }
}
