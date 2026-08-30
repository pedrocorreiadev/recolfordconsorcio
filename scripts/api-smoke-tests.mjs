import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
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

function contactLinks(lead) {
  const message = encodeURIComponent("Mensagem de teste");
  if (lead.contactType === "email") {
    return `mailto:${lead.contactValue}?subject=Teste&body=${message}`;
  }
  return `https://wa.me/${lead.contactValue.replace(/\D/g, "")}?text=${message}`;
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
assert(cookie, "cookie de sessão ausente");

const baseLead = {
  name: "Lead Teste Smoke",
  goal: "carro",
  credit: 150000,
  term: 84,
  estimatedInstallment: 1700,
  preferredSpecialistId: null,
};

const noContact = await request("/api/leads", {
  method: "POST",
  body: JSON.stringify({ ...baseLead, contactValue: "" }),
});
assert.equal(noContact.response.status, 400, "envio sem contato deve falhar");

const invalidContact = await request("/api/leads", {
  method: "POST",
  body: JSON.stringify({ ...baseLead, contactValue: "abc" }),
});
assert.equal(invalidContact.response.status, 400, "contato inválido deve falhar");

const whatsappLead = await request("/api/leads", {
  method: "POST",
  body: JSON.stringify({ ...baseLead, contactValue: "(68) 99999-9999" }),
});
assert.equal(whatsappLead.response.status, 201, "WhatsApp válido deve criar lead");

const emailLead = await request("/api/leads", {
  method: "POST",
  body: JSON.stringify({ ...baseLead, name: "Lead Email Smoke", contactValue: "teste.outlook@example.com" }),
});
assert.equal(emailLead.response.status, 201, "e-mail válido deve criar lead");

const list = await request("/api/leads", {
  headers: { cookie },
});
assert.equal(list.response.status, 200, "listar leads");
const leads = list.data.leads;
assert(Array.isArray(leads), "lista de leads");
const createdWhatsapp = leads.find((lead) => lead.id === whatsappLead.data.id);
const createdEmail = leads.find((lead) => lead.id === emailLead.data.id);
assert.equal(createdWhatsapp?.contactType, "whatsapp", "detecta WhatsApp");
assert.equal(createdEmail?.contactType, "email", "detecta e-mail");
assert.equal(createdWhatsapp?.temperature, "nao_classificado", "temperatura inicial manual");
assert(contactLinks(createdWhatsapp).startsWith("https://wa.me/"), "link WhatsApp válido");
assert(contactLinks(createdEmail).startsWith("mailto:"), "link mailto válido");

const assume = await request("/api/leads", {
  method: "PATCH",
  headers: { cookie },
  body: JSON.stringify({ id: whatsappLead.data.id, assignedSpecialistId: "flavio" }),
});
assert.equal(assume.response.status, 200, "assumir lead");
assert.equal(assume.data.lead.assignedSpecialistId, "flavio");

const transfer = await request("/api/leads", {
  method: "PATCH",
  headers: { cookie },
  body: JSON.stringify({ id: whatsappLead.data.id, assignedSpecialistId: "jessica" }),
});
assert.equal(transfer.response.status, 200, "transferir lead");
assert.equal(transfer.data.lead.assignedSpecialistId, "jessica");

const notes = await request("/api/leads", {
  method: "PATCH",
  headers: { cookie },
  body: JSON.stringify({ id: whatsappLead.data.id, status: "contatado", temperature: "quente", adminNotes: "Observação de teste smoke." }),
});
assert.equal(notes.response.status, 200, "editar observação/status/temperatura");
assert.equal(notes.data.lead.status, "contatado");
assert.equal(notes.data.lead.temperature, "quente");

const campaign = await request("/api/campaigns", {
  method: "POST",
  headers: { cookie },
  body: JSON.stringify({
    title: "Campanha Smoke",
    subtitle: "Teste local",
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
assert.equal(campaign.response.status, 201, "criar campanha");

const campaignUpdate = await request("/api/campaigns", {
  method: "PATCH",
  headers: { cookie },
  body: JSON.stringify({ id: campaign.data.id, title: "Campanha Smoke Atualizada", active: false, featured: true }),
});
assert.equal(campaignUpdate.response.status, 200, "atualizar campanha");
assert.equal(campaignUpdate.data.campaign.title, "Campanha Smoke Atualizada");

const campaigns = await request("/api/campaigns?all=1", {
  headers: { cookie },
});
assert.equal(campaigns.response.status, 200, "listar campanhas");
assert(campaigns.data.campaigns.some((item) => item.id === campaign.data.id), "campanha atualizada persiste");

const campaignToDelete = await request("/api/campaigns", {
  method: "POST",
  headers: { cookie },
  body: JSON.stringify({
    title: "Campanha Smoke Excluir",
    subtitle: "Teste de exclusao local",
    segment: "moto",
    credit: 30000,
    term: 60,
    adminRate: 16,
    insuranceRate: 0.08168,
    reducedPercent: 75,
    featured: false,
    active: false,
  }),
});
assert.equal(campaignToDelete.response.status, 201, "criar campanha para exclusao");

const deleteCampaign = await request(`/api/campaigns?id=${campaignToDelete.data.id}`, {
  method: "DELETE",
  headers: { cookie },
});
assert.equal(deleteCampaign.response.status, 200, "excluir campanha criada");

const campaignsAfterDelete = await request("/api/campaigns?all=1", {
  headers: { cookie },
});
assert.equal(campaignsAfterDelete.response.status, 200, "listar campanhas apos exclusao");
assert(
  !campaignsAfterDelete.data.campaigns.some((item) => item.id === campaignToDelete.data.id),
  "campanha excluida nao deve aparecer na lista",
);

console.log("Smoke tests OK");
