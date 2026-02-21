import { Router } from "express";
import { verifyGoogleToken } from "../auth/google";
import { signJwt } from "../auth/jwt";
import * as db from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const authRouter = Router();

authRouter.post("/google", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Missing token" });

  const googleUser = await verifyGoogleToken(token);

  let user = await db.query.users.findFirst({
    where: eq(users.googleId, googleUser.googleId),
  });

  if (!user) {
    const inserted = await db
      .insert(users)
      .values({
        googleId: googleUser.googleId,
        email: googleUser.email,
        name: googleUser.name,
      })
      .returning();

    user = inserted[0];
  }

  const jwtToken = signJwt(user);

  res.cookie("auth_token", jwtToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ success: true });
});

authRouter.post("/logout", (_, res) => {
  res.clearCookie("auth_token");
  res.json({ success: true });
});
