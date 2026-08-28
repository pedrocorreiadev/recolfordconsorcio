import { createCampaign, listCampaigns, removeCampaign, updateCampaign } from "@/lib/backend/repository";
import { hasAdminSession } from "@/lib/admin-session";
import type { Goal } from "@/lib/consorcio";

const validGoals: Goal[] = ["carro", "imovel", "moto"];

export async function GET(request: Request) {
  try {
    const includeInactive = new URL(request.url).searchParams.get("all") === "1";
    if (includeInactive && !(await hasAdminSession())) return Response.json({ error: "Não autorizado" }, { status: 401 });
    return Response.json({ campaigns: await listCampaigns(includeInactive) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao carregar campanhas" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await hasAdminSession())) return Response.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const segment = String(body.segment) as Goal;
    const input = {
      title: String(body.title ?? "").trim(), subtitle: String(body.subtitle ?? "").trim(), segment,
      credit: Number(body.credit), term: Number(body.term), adminRate: Number(body.adminRate),
      insuranceRate: Number(body.insuranceRate), reducedPercent: Number(body.reducedPercent),
      featured: Boolean(body.featured), active: body.active !== false,
    };
    if (!input.title || !validGoals.includes(segment) || input.credit < 20000 || input.term < 1 || !Number.isFinite(input.adminRate) || !Number.isFinite(input.insuranceRate)) {
      return Response.json({ error: "Revise os dados da campanha" }, { status: 400 });
    }
    const id = await createCampaign(input);
    return Response.json({ id }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao criar campanha" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await hasAdminSession())) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const body = await request.json() as { id?: number; active?: boolean; featured?: boolean };
  if (!body.id) return Response.json({ error: "Campanha inválida" }, { status: 400 });
  await updateCampaign(body.id, Boolean(body.active), Boolean(body.featured));
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await hasAdminSession())) return Response.json({ error: "Não autorizado" }, { status: 401 });
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!id) return Response.json({ error: "Campanha inválida" }, { status: 400 });
  await removeCampaign(id);
  return Response.json({ ok: true });
}
