import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const baseUrl = process.env.SMOKE_BASE_URL || "http://localhost:3000";

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (!process.env[key]) process.env[key] = rest.join("=").trim();
  }
}

async function request(pathname, init = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

loadLocalEnv();

const identifier = process.env.ADMIN_FLAVIO_IDENTIFIER;
const password = process.env.ADMIN_FLAVIO_PASSWORD;
assert(identifier, "ADMIN_FLAVIO_IDENTIFIER ausente");
assert(password, "ADMIN_FLAVIO_PASSWORD ausente");

const login = await request("/api/admin/login", {
  method: "POST",
  body: JSON.stringify({ identifier, password }),
});
assert.equal(login.response.status, 200, "login administrativo");

const cookie = login.response.headers.get("set-cookie")?.split(";")[0];
assert(cookie, "cookie de sessao ausente");

const leadsResponse = await request("/api/leads", {
  headers: { cookie },
});
assert.equal(leadsResponse.response.status, 200, "listar leads");
assert(Array.isArray(leadsResponse.data.leads), "lista de leads");
assert(
  leadsResponse.data.leads.some((lead) => lead.name === "Lead Teste Smoke"),
  "lead de WhatsApp do smoke test deve persistir apos restart",
);
assert(
  leadsResponse.data.leads.some((lead) => lead.name === "Lead Email Smoke"),
  "lead de e-mail do smoke test deve persistir apos restart",
);

const campaignsResponse = await request("/api/campaigns?all=1", {
  headers: { cookie },
});
assert.equal(campaignsResponse.response.status, 200, "listar campanhas");
assert(Array.isArray(campaignsResponse.data.campaigns), "lista de campanhas");
assert(
  campaignsResponse.data.campaigns.some((campaign) => campaign.title === "Campanha Smoke Atualizada"),
  "campanha do smoke test deve persistir apos restart",
);

console.log("Persistence check OK");
