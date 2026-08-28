import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "pedrao_admin_session";
const SESSION_VALUE = "pedrao-admin";

function settings() {
  return {
    password: process.env.ADMIN_PASSWORD ?? "",
    secret: process.env.ADMIN_SESSION_SECRET ?? "",
  };
}

function signature(secret: string) {
  return createHmac("sha256", secret).update(SESSION_VALUE).digest("hex");
}

function safePasswordMatch(received: string, expected: string, secret: string) {
  const receivedHash = createHmac("sha256", secret).update(received).digest();
  const expectedHash = createHmac("sha256", secret).update(expected).digest();
  return timingSafeEqual(receivedHash, expectedHash);
}

export async function hasAdminSession() {
  const { password, secret } = settings();
  if (!password || !secret) return false;
  const value = (await cookies()).get(COOKIE_NAME)?.value ?? "";
  const expected = signature(secret);
  if (value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export async function createAdminSession(receivedPassword: string) {
  const { password, secret } = settings();
  if (!password || !secret || !safePasswordMatch(receivedPassword, password, secret)) return false;
  (await cookies()).set(COOKIE_NAME, signature(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return true;
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE_NAME);
}
