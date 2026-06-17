import { redirect } from "next/navigation";
import { AdminCard } from "@/components/admin/AdminForms";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { isAdminAuthenticated } from "@/lib/admin-actions";
import { getAdminRole } from "@/lib/admin-session";

export default async function SettingsAdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  if (getAdminRole() === "teacher") redirect("/admin/resources");

  return (
    <AdminShell>
      <div className="grid gap-6">
        <AdminPageHeader title="Settings" description="System settings for authentication and deployment." />
        <AdminCard title="Environment">
          <div className="grid gap-4 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Admin role:</strong> controlled by{" "}
              <code className="rounded bg-muted/10 px-1.5 py-0.5 text-foreground">ADMIN_ROLE</code>
            </p>
            <p>
              <strong className="text-foreground">Teacher profile:</strong> controlled by{" "}
              <code className="rounded bg-muted/10 px-1.5 py-0.5 text-foreground">ADMIN_TEACHER_EMAIL</code>
            </p>
            <p>
              <strong className="text-foreground">Supabase writes:</strong> require{" "}
              <code className="rounded bg-muted/10 px-1.5 py-0.5 text-foreground">SUPABASE_SERVICE_ROLE_KEY</code>
            </p>
          </div>
        </AdminCard>
      </div>
    </AdminShell>
  );
}
