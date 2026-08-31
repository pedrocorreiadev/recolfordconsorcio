import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { getSpecialist, SPECIALISTS, type AdminActorId, type SpecialistId } from "@/lib/consorcio";

const COOKIE_NAME = "recol_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;
const DEMO_ADMIN_ID = "demo";
const DEMO_ADMIN_NAME = "Administrador de demonstração";

export type AdminSession = {
  id: AdminActorId;
  name: string;
  specialistId: SpecialistId | null;
  isDemo: boolean;
};

type AdminCredential = {
  id: AdminActorId;
  identifier: string;
  password: string;
};

function settings() {
  return {
    secret: process.env.ADMIN_SESSION_SECRET ?? "",
  };
}

function adminCredentials() {
  const credentials: AdminCredential[] = [
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

  if (process.env.DEMO_ADMIN_ENABLED === "true") {
    credentials.push({
      id: DEMO_ADMIN_ID,
      identifier: process.env.ADMIN_DEMO_IDENTIFIER ?? "",
      password: process.env.ADMIN_DEMO_PASSWORD ?? "",
    });
  }

  return credentials;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function isSpecialistId(value: string | null | undefined): value is SpecialistId {
  return SPECIALISTS.some((specialist) => specialist.id === value);
}

function isAdminActorId(value: string | null | undefined): value is AdminActorId {
  return value === DEMO_ADMIN_ID || isSpecialistId(value);
}

function signature(secret: string, adminId: AdminActorId, expiresAt: string) {
  return createHmac("sha256", secret).update(`recol-admin:${adminId}:${expiresAt}`).digest("hex");
}

function safePasswordMatch(received: string, expected: string, secret: string) {
  const receivedHash = createHmac("sha256", secret).update(received).digest();
  const expectedHash = createHmac("sha256", secret).update(expected).digest();
  return timingSafeEqual(receivedHash, expectedHash);
}

function toSession(adminId: AdminActorId): AdminSession | null {
  if (adminId === DEMO_ADMIN_ID) {
    return {
      id: DEMO_ADMIN_ID,
      name: DEMO_ADMIN_NAME,
      specialistId: null,
      isDemo: true,
    };
  }

  const specialist = getSpecialist(adminId);
  if (!specialist) return null;
  return {
    id: specialist.id,
    name: specialist.name,
    specialistId: specialist.id,
    isDemo: false,
  };
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const { secret } = settings();
  if (!secret) return null;
  const value = (await cookies()).get(COOKIE_NAME)?.value ?? "";
  const [adminId, expiresAt, receivedSignature] = value.split(".");
  if (!isAdminActorId(adminId) || !expiresAt || !receivedSignature) return null;
  if (!Number.isFinite(Number(expiresAt)) || Number(expiresAt) <= Date.now()) return null;
  const expected = signature(secret, adminId, expiresAt);
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
  const expiresAt = String(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  const expected = signature(secret, admin.id, expiresAt);
  (await cookies()).set(COOKIE_NAME, `${admin.id}.${expiresAt}.${expected}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return toSession(admin.id);
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE_NAME);
}
