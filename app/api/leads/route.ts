import { getAdminSession, hasAdminSession } from "@/lib/admin-session";
import { createLead, listLeads, removeLead, updateLead, type LeadUpdate } from "@/lib/backend/repository";
import { detectContact } from "@/lib/contact";
import {
  LEAD_STATUSES,
  LEAD_TEMPERATURES,
  SPECIALISTS,
  type Goal,
  type LeadStatus,
  type LeadTemperature,
  type SpecialistId,
} from "@/lib/consorcio";

export const runtime = "nodejs";

const goals: Goal[] = ["carro", "imovel", "moto"];
const statuses = LEAD_STATUSES.map((item) => item.value);
const temperatures = LEAD_TEMPERATURES.map((item) => item.value);
const specialistIds = SPECIALISTS.map((item) => item.id);
const PUBLIC_REQUEST_ERROR =
  "Não foi possível concluir sua solicitação neste momento. Tente novamente em instantes ou entre em contato com um de nossos especialistas.";

function isLeadStatus(value: string): value is LeadStatus {
  return statuses.includes(value as LeadStatus);
}

function isLeadTemperature(value: string): value is LeadTemperature {
  return temperatures.includes(value as LeadTemperature);
}

function isSpecialistId(value: string): value is SpecialistId {
  return specialistIds.includes(value as SpecialistId);
}

export async function GET() {
  if (!(await hasAdminSession())) return Response.json({ error: "Não autorizado" }, { status: 401 });
  try {
    return Response.json({ leads: await listLeads() });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao carregar leads" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const contact = detectContact(String(body.contactValue ?? ""));
    const preferredSpecialistId = String(body.preferredSpecialistId ?? "");
    const input = {
      name: String(body.name ?? "").trim().slice(0, 80),
      goal: String(body.goal) as Goal,
      credit: Number(body.credit),
      term: Number(body.term),
      estimatedInstallment: Number(body.estimatedInstallment),
      preferredSpecialistId: isSpecialistId(preferredSpecialistId) ? preferredSpecialistId : null,
    };

    if (!input.name) return Response.json({ error: "Informe seu nome" }, { status: 400 });
    if (!contact.ok) return Response.json({ error: contact.error }, { status: 400 });
    if (
      !goals.includes(input.goal) ||
      !Number.isFinite(input.credit) ||
      input.credit < 20000 ||
      !Number.isFinite(input.term) ||
      input.term < 1 ||
      !Number.isFinite(input.estimatedInstallment)
    ) {
      return Response.json({ error: "Dados da simulação inválidos" }, { status: 400 });
    }

    const id = await createLead({
      ...input,
      contactValue: contact.contactValue,
      contactType: contact.contactType,
    });
    return Response.json({ id }, { status: 201 });
  } catch {
    return Response.json({ error: PUBLIC_REQUEST_ERROR }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;
  const id = Number(body.id);
  const changes: LeadUpdate = {};
  if (!id) return Response.json({ error: "Lead inválido" }, { status: 400 });

  if ("status" in body) {
    const status = String(body.status);
    if (!isLeadStatus(status)) return Response.json({ error: "Situação inválida" }, { status: 400 });
    changes.status = status;
  }

  if ("temperature" in body) {
    const temperature = String(body.temperature);
    if (!isLeadTemperature(temperature)) return Response.json({ error: "Temperatura inválida" }, { status: 400 });
    changes.temperature = temperature;
  }

  if ("assignedSpecialistId" in body) {
    const assignedSpecialistId = body.assignedSpecialistId;
    if (assignedSpecialistId === null || assignedSpecialistId === "" || assignedSpecialistId === "unassigned") {
      changes.assignedSpecialistId = null;
    } else {
      const value = String(assignedSpecialistId);
      if (!isSpecialistId(value)) return Response.json({ error: "Especialista inválido" }, { status: 400 });
      changes.assignedSpecialistId = value;
    }
  }

  if ("adminNotes" in body) {
    changes.adminNotes = String(body.adminNotes ?? "").slice(0, 1200);
  }

  if (Object.keys(changes).length === 0) {
    return Response.json({ error: "Nenhuma alteração enviada" }, { status: 400 });
  }

  try {
    const lead = await updateLead(id, changes, admin.id);
    if (!lead) return Response.json({ error: "Lead não encontrado" }, { status: 404 });
    return Response.json({ ok: true, lead });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao atualizar lead" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await hasAdminSession())) return Response.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isInteger(id) || id <= 0) return Response.json({ error: "Lead inválido" }, { status: 400 });
    await removeLead(id);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao remover lead" }, { status: 500 });
  }
}
