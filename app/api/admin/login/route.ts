import { createAdminSession } from "@/lib/admin-session";

export async function POST(request: Request) {
  const body = await request.json() as { password?: string };
  if (!(await createAdminSession(String(body.password ?? "")))) {
    return Response.json({ error: "Senha incorreta" }, { status: 401 });
  }
  return Response.json({ ok: true });
}
