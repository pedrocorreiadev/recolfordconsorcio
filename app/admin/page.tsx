import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin-dashboard";
import { hasAdminSession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await hasAdminSession())) redirect("/admin/login");
  return <AdminDashboard userName="Pedro" />;
}
