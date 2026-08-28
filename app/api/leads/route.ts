import { createLead, listLeads, updateLeadStatus } from "@/lib/backend/repository";
import { hasAdminSession } from "@/lib/admin-session";
import type { Goal, Lead } from "@/lib/consorcio";

const goals: Goal[] = ["carro", "imovel", "moto"];
const statuses: Lead["status"][] = ["novo", "contatado", "proposta", "fechado"];

export async function GET() {
  if (!(await hasAdminSession())) return Response.json({ error: "Não autorizado" }, { status: 401 });
  try { return Response.json({ leads: await listLeads() }); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Erro ao carregar interessados" }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const input = {
      name: String(body.name ?? "").trim().slice(0, 80),
      phone: String(body.phone ?? "").trim().slice(0, 30),
      goal: String(body.goal) as Goal,
      credit: Number(body.credit), term: Number(body.term),
      estimatedInstallment: Number(body.estimatedInstallment), consent: body.consent === true,
    };
    if (!input.name || input.phone.length < 8 || !goals.includes(input.goal) || input.credit < 20000 || input.term < 1 || !input.consent) {
      return Response.json({ error: "Dados de contato inválidos" }, { status: 400 });
    }
    const id = await createLead(input);
    return Response.json({ id }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao salvar contato" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await hasAdminSession())) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const body = await request.json() as { id?: number; status?: Lead["status"] };
  if (!body.id || !body.status || !statuses.includes(body.status)) return Response.json({ error: "Atualização inválida" }, { status: 400 });
  await updateLeadStatus(body.id, body.status);
  return Response.json({ ok: true });
}
