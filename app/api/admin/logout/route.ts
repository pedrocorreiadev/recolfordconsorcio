import { clearAdminSession } from "@/lib/admin-session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await clearAdminSession();
  return Response.redirect(new URL("/admin/login", request.url), 303);
}
