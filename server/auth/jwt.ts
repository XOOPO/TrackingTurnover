import jwt from "jsonwebtoken";
import type { User } from "../../drizzle/schema";

const JWT_SECRET = process.env.JWT_SECRET!;

export function signJwt(user: User) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
    }
  );
}

export function verifyJwt(token: string) {
  return jwt.verify(token, JWT_SECRET) as {
    sub: number;
    role: string;
    email: string;
  };
}
