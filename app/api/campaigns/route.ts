import { hasAdminSession } from "@/lib/admin-session";
import { createCampaign, listCampaigns, removeCampaign, updateCampaign, type CampaignUpdate } from "@/lib/backend/repository";
import type { Goal } from "@/lib/consorcio";

export const runtime = "nodejs";

const validGoals: Goal[] = ["carro", "imovel", "moto"];
const PUBLIC_REQUEST_ERROR =
  "Não foi possível concluir sua solicitação neste momento. Tente novamente em instantes ou entre em contato com um de nossos especialistas.";

function campaignInput(body: Record<string, unknown>) {
  const segment = String(body.segment) as Goal;
  return {
    title: String(body.title ?? "").trim().slice(0, 120),
    subtitle: String(body.subtitle ?? "").trim().slice(0, 240),
    segment,
    credit: Number(body.credit),
    term: Number(body.term),
    adminRate: Number(body.adminRate),
    insuranceRate: Number(body.insuranceRate),
    reducedPercent: Number(body.reducedPercent),
    featured: Boolean(body.featured),
    active: body.active !== false,
  };
}

function validateCampaign(input: ReturnType<typeof campaignInput>) {
  return Boolean(
    input.title &&
    validGoals.includes(input.segment) &&
    Number.isFinite(input.credit) &&
    input.credit >= 20000 &&
    Number.isInteger(input.term) &&
    input.term >= 1 &&
    Number.isFinite(input.adminRate) &&
    Number.isFinite(input.insuranceRate) &&
    Number.isFinite(input.reducedPercent),
  );
}

export async function GET(request: Request) {
  const includeInactive = new URL(request.url).searchParams.get("all") === "1";
  try {
    if (includeInactive && !(await hasAdminSession())) return Response.json({ error: "Não autorizado" }, { status: 401 });
    return Response.json(
      { campaigns: await listCampaigns(includeInactive) },
      {
        headers: {
          "cache-control": includeInactive ? "no-store" : "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch {
    return Response.json(
      { error: includeInactive ? "Erro ao carregar campanhas" : PUBLIC_REQUEST_ERROR },
      { status: 500, headers: { "cache-control": "no-store" } },
    );
  }
}

export async function POST(request: Request) {
  if (!(await hasAdminSession())) return Response.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const input = campaignInput(body);
    if (!validateCampaign(input)) return Response.json({ error: "Revise os dados da campanha" }, { status: 400 });
    const id = await createCampaign(input);
    return Response.json({ id }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao criar campanha" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await hasAdminSession())) return Response.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const id = Number(body.id);
    if (!id) return Response.json({ error: "Campanha inválida" }, { status: 400 });

    const changes: CampaignUpdate = {};
    if ("title" in body) changes.title = String(body.title ?? "").trim().slice(0, 120);
    if ("subtitle" in body) changes.subtitle = String(body.subtitle ?? "").trim().slice(0, 240);
    if ("segment" in body) {
      const segment = String(body.segment) as Goal;
      if (!validGoals.includes(segment)) return Response.json({ error: "Categoria inválida" }, { status: 400 });
      changes.segment = segment;
    }
    if ("credit" in body) changes.credit = Number(body.credit);
    if ("term" in body) changes.term = Number(body.term);
    if ("adminRate" in body) changes.adminRate = Number(body.adminRate);
    if ("insuranceRate" in body) changes.insuranceRate = Number(body.insuranceRate);
    if ("reducedPercent" in body) changes.reducedPercent = Number(body.reducedPercent);
    if ("featured" in body) changes.featured = Boolean(body.featured);
    if ("active" in body) changes.active = Boolean(body.active);

    if (changes.title !== undefined && !changes.title) return Response.json({ error: "Informe um título" }, { status: 400 });
    if (changes.credit !== undefined && (!Number.isFinite(changes.credit) || changes.credit < 20000)) return Response.json({ error: "Crédito inválido" }, { status: 400 });
    if (changes.term !== undefined && (!Number.isInteger(changes.term) || changes.term < 1)) return Response.json({ error: "Prazo inválido" }, { status: 400 });
    if (changes.adminRate !== undefined && !Number.isFinite(changes.adminRate)) return Response.json({ error: "Taxa administrativa inválida" }, { status: 400 });
    if (changes.insuranceRate !== undefined && !Number.isFinite(changes.insuranceRate)) return Response.json({ error: "Seguro inválido" }, { status: 400 });
    if (changes.reducedPercent !== undefined && !Number.isFinite(changes.reducedPercent)) return Response.json({ error: "Parcela reduzida inválida" }, { status: 400 });

    const campaign = await updateCampaign(id, changes);
    if (!campaign) return Response.json({ error: "Campanha não encontrada" }, { status: 404 });
    return Response.json({ ok: true, campaign });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao atualizar campanha" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await hasAdminSession())) return Response.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!id) return Response.json({ error: "Campanha inválida" }, { status: 400 });
    await removeCampaign(id);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao remover campanha" }, { status: 500 });
  }
}
