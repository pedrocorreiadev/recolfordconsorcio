import { normalizePhone, type ContactType } from "@/lib/consorcio";

export type ContactDetection =
  | { ok: true; contactValue: string; contactType: ContactType }
  | { ok: false; error: string };

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function detectContact(value: string): ContactDetection {
  const contactValue = value.trim();
  if (!contactValue) return { ok: false, error: "Informe WhatsApp ou e-mail." };

  if (contactValue.includes("@")) {
    if (!isValidEmail(contactValue)) return { ok: false, error: "Informe um e-mail válido." };
    return { ok: true, contactValue: contactValue.toLowerCase(), contactType: "email" };
  }

  if (normalizePhone(contactValue).length < 10) {
    return { ok: false, error: "Informe um WhatsApp com DDD." };
  }

  return { ok: true, contactValue, contactType: "whatsapp" };
}
