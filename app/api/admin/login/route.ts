import { createAdminSession } from "@/lib/admin-session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json() as { identifier?: string; password?: string };
  const admin = await createAdminSession(
    String(body.identifier ?? ""),
    String(body.password ?? ""),
  );
  if (!admin) {
    return Response.json({ error: "Identificação ou senha incorreta" }, { status: 401 });
  }
  return Response.json({ ok: true, admin });
}
