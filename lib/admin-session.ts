import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { getSpecialist, SPECIALISTS, type SpecialistId } from "@/lib/consorcio";

const COOKIE_NAME = "recol_admin_session";

export type AdminSession = {
  id: SpecialistId;
  name: string;
};

function settings() {
  return {
    secret: process.env.ADMIN_SESSION_SECRET ?? "",
  };
}

function adminCredentials() {
  return [
    {
      id: "flavio" as const,
      identifier: process.env.ADMIN_FLAVIO_IDENTIFIER ?? "",
      password: process.env.ADMIN_FLAVIO_PASSWORD ?? "",
    },
    {
      id: "jessica" as const,
      identifier: process.env.ADMIN_JESSICA_IDENTIFIER ?? "",
      password: process.env.ADMIN_JESSICA_PASSWORD ?? "",
    },
    {
      id: "jersey" as const,
      identifier: process.env.ADMIN_JERSEY_IDENTIFIER ?? "",
      password: process.env.ADMIN_JERSEY_PASSWORD ?? "",
    },
  ];
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function isSpecialistId(value: string): value is SpecialistId {
  return SPECIALISTS.some((specialist) => specialist.id === value);
}

function signature(secret: string, adminId: SpecialistId) {
  return createHmac("sha256", secret).update(`recol-admin:${adminId}`).digest("hex");
}

function safePasswordMatch(received: string, expected: string, secret: string) {
  const receivedHash = createHmac("sha256", secret).update(received).digest();
  const expectedHash = createHmac("sha256", secret).update(expected).digest();
  return timingSafeEqual(receivedHash, expectedHash);
}

function toSession(adminId: SpecialistId): AdminSession | null {
  const specialist = getSpecialist(adminId);
  if (!specialist) return null;
  return { id: specialist.id, name: specialist.name };
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const { secret } = settings();
  if (!secret) return null;
  const value = (await cookies()).get(COOKIE_NAME)?.value ?? "";
  const [adminId, receivedSignature] = value.split(".");
  if (!isSpecialistId(adminId) || !receivedSignature) return null;
  const expected = signature(secret, adminId);
  if (receivedSignature.length !== expected.length) return null;
  const isValid = timingSafeEqual(Buffer.from(receivedSignature), Buffer.from(expected));
  return isValid ? toSession(adminId) : null;
}

export async function hasAdminSession() {
  return Boolean(await getAdminSession());
}

export async function createAdminSession(identifier: string, receivedPassword: string) {
  const { secret } = settings();
  if (!secret) return null;
  const admin = adminCredentials().find(
    (item) => item.identifier && normalize(item.identifier) === normalize(identifier),
  );
  if (!admin?.password || !safePasswordMatch(receivedPassword, admin.password, secret)) {
    return null;
  }
  const expected = signature(secret, admin.id);
  (await cookies()).set(COOKIE_NAME, `${admin.id}.${expected}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return toSession(admin.id);
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE_NAME);
}
