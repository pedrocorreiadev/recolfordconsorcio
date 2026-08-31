import assert from "node:assert/strict";

process.env.SUPABASE_URL = "https://example.supabase.co";
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
process.env.SUPABASE_SECRET_KEY = "fake-server-only-key";

const calls = [];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

globalThis.fetch = async (url, init = {}) => {
  const parsed = new URL(String(url));
  const path = `${parsed.pathname}${parsed.search}`;
  const method = init.method ?? "GET";
  const body = init.body ? JSON.parse(String(init.body)) : null;
  const headers = Object.fromEntries(new Headers(init.headers));
  calls.push({ path, method, body, headers });

  if (path === "/rest/v1/campaigns?select=*&active=eq.true&order=featured.desc,created_at.desc") {
    return json([
      {
        id: 10,
        title: "Campanha Supabase",
        subtitle: "Contrato",
        segment: "carro",
        credit: 150000,
        term: 84,
        admin_rate: 16,
        insurance_rate: 0.08168,
        reduced_percent: 75,
        featured: true,
        active: true,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ]);
  }

  if (path === "/rest/v1/leads" && method === "POST") {
    return json([{ id: 42 }], 201);
  }

  if (path === "/rest/v1/leads?select=assigned_specialist_id&id=eq.42&limit=1") {
    return json([{ assigned_specialist_id: "flavio" }]);
  }

  if (path === "/rest/v1/leads?id=eq.42" && method === "PATCH") {
    return json([
      {
        id: 42,
        name: "Lead Supabase",
        contact_value: "lead@example.com",
        contact_type: "email",
        goal: "carro",
        credit: 150000,
        term: 84,
        estimated_installment: 1700,
        status: "contatado",
        temperature: "quente",
        preferred_specialist_id: null,
        assigned_specialist_id: "jessica",
        admin_notes: "Contrato OK",
        updated_by: "demo",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:01:00.000Z",
      },
    ]);
  }

  if (path === "/rest/v1/lead_transfers" && method === "POST") {
    return json([{ id: 1 }], 201);
  }

  if (path === "/rest/v1/lead_transfers?lead_id=eq.42" && method === "DELETE") {
    return json([]);
  }

  if (path === "/rest/v1/leads?id=eq.42" && method === "DELETE") {
    return json([]);
  }

  throw new Error(`Unexpected Supabase request: ${method} ${path}`);
};

const { createSupabaseRepository } = await import("../lib/backend/supabase.ts");
const repository = createSupabaseRepository();

const campaigns = await repository.listCampaigns();
assert.equal(campaigns[0].id, 10, "campanha mapeada");
assert.equal(campaigns[0].featured, true, "destaque mapeado");

const leadId = await repository.createLead({
  name: "Lead Supabase",
  contactValue: "lead@example.com",
  contactType: "email",
  goal: "carro",
  credit: 150000,
  term: 84,
  estimatedInstallment: 1700,
  preferredSpecialistId: null,
});
assert.equal(leadId, 42, "lead criado");

const updatedLead = await repository.updateLead(
  42,
  {
    assignedSpecialistId: "jessica",
    status: "contatado",
    temperature: "quente",
    adminNotes: "Contrato OK",
  },
  "demo",
);
assert.equal(updatedLead?.assignedSpecialistId, "jessica", "responsavel mapeado");
assert.equal(updatedLead?.updatedBy, "demo", "admin demo mapeado");

const transfer = calls.find((call) => call.path === "/rest/v1/lead_transfers" && call.method === "POST");
assert.deepEqual(
  transfer?.body,
  {
    lead_id: 42,
    from_specialist_id: "flavio",
    to_specialist_id: "jessica",
    admin_id: "demo",
  },
  "transferencia registrada",
);

await repository.removeLead(42);
assert(
  calls.some((call) => call.path === "/rest/v1/lead_transfers?lead_id=eq.42" && call.method === "DELETE"),
  "transferencias removidas antes do lead",
);
assert(
  calls.some((call) => call.path === "/rest/v1/leads?id=eq.42" && call.method === "DELETE"),
  "lead removido",
);
assert(
  calls.every((call) => call.headers.authorization === "Bearer fake-server-only-key"),
  "chave server-only usada apenas em chamadas servidor-servidor",
);

console.log("Supabase repository contract OK");
