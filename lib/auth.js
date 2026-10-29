import { SignJWT, jwtVerify } from "jose";

export const COOKIE = "cn_admin";
const MAX_AGE = 60 * 60 * 8; // 8 jam

function key() {
  const s = process.env.AUTH_SECRET;
  return s && s.length >= 16 ? new TextEncoder().encode(s) : null;
}

export async function createToken(username) {
  const k = key();
  if (!k) throw new Error("AUTH_SECRET belum diatur");
  return new SignJWT({ role: "admin", username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(k);
}

export async function verifyToken(token) {
  const k = key();
  if (!k || !token) return null;
  try {
    const { payload } = await jwtVerify(token, k);
    return payload.role === "admin" ? payload : null;
  } catch {
    return null;
  }
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};
