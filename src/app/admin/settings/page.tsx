import { redirect } from "next/navigation";
import { AdminCard } from "@/components/admin/AdminForms";
import { AdminShell } from "@/components/admin/AdminShell";
import { isAdminAuthenticated } from "@/lib/admin-actions";
import { getAdminRole } from "@/lib/admin-session";

export default async function SettingsAdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  if (getAdminRole() === "teacher") redirect("/admin/resources");

  return (
    <AdminShell>
      <div className="grid gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">Admin</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Settings</h1>
          <p className="mt-2 text-slate-600">System settings for authentication and deployment.</p>
        </div>
        <AdminCard title="Environment">
          <div className="grid gap-3 text-sm text-slate-700">
            <p><strong>Admin role:</strong> controlled by <code>ADMIN_ROLE</code></p>
            <p><strong>Teacher profile:</strong> controlled by <code>ADMIN_TEACHER_EMAIL</code></p>
            <p><strong>Supabase writes:</strong> require <code>SUPABASE_SERVICE_ROLE_KEY</code></p>
          </div>
        </AdminCard>
      </div>
    </AdminShell>
  );
}
