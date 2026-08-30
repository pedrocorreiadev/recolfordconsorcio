import type { Campaign, Goal, Lead, LeadStatus, LeadTemperature, SpecialistId } from "@/lib/consorcio";
import type { CampaignInput, CampaignUpdate, LeadInput, LeadUpdate, Repository } from "@/lib/backend/types";

type Row = Record<string, unknown>;

function settings() {
  return {
    url: process.env.SUPABASE_URL ?? "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  };
}

function assertConfigured() {
  const config = settings();
  if (!config.url || !config.serviceRoleKey) {
    throw new Error("Banco de produção não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no servidor.");
  }
  return config;
}

async function request(path: string, init: RequestInit = {}) {
  const config = assertConfigured();
  const response = await fetch(`${config.url.replace(/\/$/, "")}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.serviceRoleKey,
      authorization: `Bearer ${config.serviceRoleKey}`,
      "content-type": "application/json",
      prefer: "return=representation",
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = typeof data?.message === "string" ? data.message : "Erro ao acessar banco de produção";
    throw new Error(message);
  }
  return data;
}

function campaignToRow(input: CampaignInput | CampaignUpdate) {
  return {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.subtitle !== undefined ? { subtitle: input.subtitle } : {}),
    ...(input.segment !== undefined ? { segment: input.segment } : {}),
    ...(input.credit !== undefined ? { credit: input.credit } : {}),
    ...(input.term !== undefined ? { term: input.term } : {}),
    ...(input.adminRate !== undefined ? { admin_rate: input.adminRate } : {}),
    ...(input.insuranceRate !== undefined ? { insurance_rate: input.insuranceRate } : {}),
    ...(input.reducedPercent !== undefined ? { reduced_percent: input.reducedPercent } : {}),
    ...(input.featured !== undefined ? { featured: input.featured } : {}),
    ...(input.active !== undefined ? { active: input.active } : {}),
  };
}

function campaignFromRow(row: Row): Campaign {
  return {
    id: Number(row.id),
    title: String(row.title),
    subtitle: String(row.subtitle ?? ""),
    segment: String(row.segment) as Goal,
    credit: Number(row.credit),
    term: Number(row.term),
    adminRate: Number(row.admin_rate),
    insuranceRate: Number(row.insurance_rate),
    reducedPercent: Number(row.reduced_percent),
    featured: Boolean(row.featured),
    active: Boolean(row.active),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function leadFromRow(row: Row): Lead {
  return {
    id: Number(row.id),
    name: String(row.name),
    contactValue: String(row.contact_value),
    contactType: String(row.contact_type) as Lead["contactType"],
    goal: String(row.goal) as Goal,
    credit: Number(row.credit),
    term: Number(row.term),
    estimatedInstallment: Number(row.estimated_installment),
    status: String(row.status) as LeadStatus,
    temperature: String(row.temperature) as LeadTemperature,
    preferredSpecialistId: row.preferred_specialist_id ? String(row.preferred_specialist_id) as SpecialistId : null,
    assignedSpecialistId: row.assigned_specialist_id ? String(row.assigned_specialist_id) as SpecialistId : null,
    adminNotes: String(row.admin_notes ?? ""),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    updatedBy: row.updated_by ? String(row.updated_by) as SpecialistId : null,
  };
}

export function createSupabaseRepository(): Repository {
  return {
    async listCampaigns(includeInactive = false) {
      const query = includeInactive
        ? "campaigns?select=*&order=featured.desc,created_at.desc"
        : "campaigns?select=*&active=eq.true&order=featured.desc,created_at.desc";
      return (await request(query) as Row[]).map(campaignFromRow);
    },

    async createCampaign(input: CampaignInput) {
      const rows = await request("campaigns", {
        method: "POST",
        body: JSON.stringify(campaignToRow(input)),
      }) as Row[];
      return Number(rows[0]?.id);
    },

    async updateCampaign(id: number, changes: CampaignUpdate) {
      const rows = await request(`campaigns?id=eq.${id}`, {
        method: "PATCH",
        body: JSON.stringify({ ...campaignToRow(changes), updated_at: new Date().toISOString() }),
      }) as Row[];
      return rows[0] ? campaignFromRow(rows[0]) : null;
    },

    async removeCampaign(id: number) {
      await request(`campaigns?id=eq.${id}`, { method: "DELETE" });
    },

    async listLeads() {
      return (await request("leads?select=*&order=created_at.desc") as Row[]).map(leadFromRow);
    },

    async createLead(input: LeadInput) {
      const rows = await request("leads", {
        method: "POST",
        body: JSON.stringify({
          name: input.name,
          contact_value: input.contactValue,
          contact_type: input.contactType,
          goal: input.goal,
          credit: input.credit,
          term: input.term,
          estimated_installment: input.estimatedInstallment,
          status: "novo",
          temperature: "nao_classificado",
          preferred_specialist_id: input.preferredSpecialistId,
          assigned_specialist_id: input.preferredSpecialistId,
          admin_notes: "",
        }),
      }) as Row[];
      return Number(rows[0]?.id);
    },

    async updateLead(id: number, changes: LeadUpdate, updatedBy: SpecialistId) {
      const rows = await request(`leads?id=eq.${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...(changes.status !== undefined ? { status: changes.status } : {}),
          ...(changes.temperature !== undefined ? { temperature: changes.temperature } : {}),
          ...(changes.assignedSpecialistId !== undefined ? { assigned_specialist_id: changes.assignedSpecialistId } : {}),
          ...(changes.adminNotes !== undefined ? { admin_notes: changes.adminNotes } : {}),
          updated_by: updatedBy,
          updated_at: new Date().toISOString(),
        }),
      }) as Row[];
      return rows[0] ? leadFromRow(rows[0]) : null;
    },
  };
}
