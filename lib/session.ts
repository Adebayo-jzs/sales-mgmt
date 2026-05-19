// lib/session.ts
import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  adminId?: string;
  adminEmail?: string;
  adminName?: string;
  isLoggedIn?: boolean;
}

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.trim().length < 32) {
  throw new Error("SESSION_SECRET env variable is required and must be at least 32 characters long");
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: "salesms-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  return session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return null;
  }
  return session;
}
