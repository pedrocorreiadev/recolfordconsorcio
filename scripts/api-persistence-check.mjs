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

function adminLoginCredentials() {
  if (process.env.DEMO_ADMIN_ENABLED === "true") {
    return {
      identifier: process.env.ADMIN_DEMO_IDENTIFIER,
      password: process.env.ADMIN_DEMO_PASSWORD,
      expectedId: "demo",
    };
  }

  return {
    identifier: process.env.ADMIN_FLAVIO_IDENTIFIER,
    password: process.env.ADMIN_FLAVIO_PASSWORD,
    expectedId: "flavio",
  };
}

loadLocalEnv();

const { identifier, password, expectedId } = adminLoginCredentials();
assert(identifier, "identificacao administrativa ausente");
assert(password, "senha administrativa ausente");

const login = await request("/api/admin/login", {
  method: "POST",
  body: JSON.stringify({ identifier, password }),
});
assert.equal(login.response.status, 200, "login administrativo");
assert.equal(login.data.admin.id, expectedId, "admin autenticado esperado");

const cookie = login.response.headers.get("set-cookie")?.split(";")[0];
assert(cookie, "cookie de sessao ausente");

const suffix = Date.now();
const lead = await request("/api/leads", {
  method: "POST",
  body: JSON.stringify({
    name: `Lead Persistencia ${suffix}`,
    contactValue: "persistencia@example.com",
    goal: "carro",
    credit: 150000,
    term: 84,
    estimatedInstallment: 1700,
    preferredSpecialistId: null,
  }),
});
assert.equal(lead.response.status, 201, "criar lead de persistencia");

const campaign = await request("/api/campaigns", {
  method: "POST",
  headers: { cookie },
  body: JSON.stringify({
    title: `Campanha Persistencia ${suffix}`,
    subtitle: "Teste local autocontido",
    segment: "carro",
    credit: 120000,
    term: 72,
    adminRate: 16,
    insuranceRate: 0.08168,
    reducedPercent: 75,
    featured: false,
    active: true,
  }),
});
assert.equal(campaign.response.status, 201, "criar campanha de persistencia");

const leadUpdate = await request("/api/leads", {
  method: "PATCH",
  headers: { cookie },
  body: JSON.stringify({
    id: lead.data.id,
    assignedSpecialistId: "jersey",
    status: "em_acompanhamento",
    temperature: "morno",
    adminNotes: `Nota persistida ${suffix}`,
  }),
});
assert.equal(leadUpdate.response.status, 200, "atualizar lead de persistencia");

const campaignUpdate = await request("/api/campaigns", {
  method: "PATCH",
  headers: { cookie },
  body: JSON.stringify({
    id: campaign.data.id,
    title: `Campanha Persistencia Atualizada ${suffix}`,
    active: false,
    featured: true,
  }),
});
assert.equal(campaignUpdate.response.status, 200, "atualizar campanha de persistencia");

const leadsResponse = await request("/api/leads", {
  headers: { cookie },
});
assert.equal(leadsResponse.response.status, 200, "listar leads");
assert(Array.isArray(leadsResponse.data.leads), "lista de leads");
const persistedLead = leadsResponse.data.leads.find((item) => item.id === lead.data.id);
assert.equal(persistedLead?.contactType, "email", "tipo de contato persistido");
assert.equal(persistedLead?.assignedSpecialistId, "jersey", "responsavel persistido");
assert.equal(persistedLead?.status, "em_acompanhamento", "status persistido");
assert.equal(persistedLead?.temperature, "morno", "temperatura persistida");
assert.equal(persistedLead?.adminNotes, `Nota persistida ${suffix}`, "observacao persistida");

const campaignsResponse = await request("/api/campaigns?all=1", {
  headers: { cookie },
});
assert.equal(campaignsResponse.response.status, 200, "listar campanhas");
assert(Array.isArray(campaignsResponse.data.campaigns), "lista de campanhas");
const persistedCampaign = campaignsResponse.data.campaigns.find((item) => item.id === campaign.data.id);
assert.equal(persistedCampaign?.title, `Campanha Persistencia Atualizada ${suffix}`, "campanha persistida");
assert.equal(persistedCampaign?.active, false, "estado ativo persistido");
assert.equal(persistedCampaign?.featured, true, "destaque persistido");

const deleteCampaign = await request(`/api/campaigns?id=${campaign.data.id}`, {
  method: "DELETE",
  headers: { cookie },
});
assert.equal(deleteCampaign.response.status, 200, "limpar campanha de persistencia");

const deleteLead = await request(`/api/leads?id=${lead.data.id}`, {
  method: "DELETE",
  headers: { cookie },
});
assert.equal(deleteLead.response.status, 200, "limpar lead de persistencia");

console.log("Persistence check OK");
