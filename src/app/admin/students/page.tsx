import { redirect } from "next/navigation";
import { AdminCard } from "@/components/admin/AdminForms";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminRole } from "@/lib/admin-session";
import { getCatalog } from "@/lib/data";

export default async function StudentsAdminPage() {
  if (getAdminRole() === "teacher") redirect("/admin/content-manager");

  const catalog = await getCatalog();
  const students = catalog.profiles.filter((profile) => profile.role === "student");

  return (
    <AdminShell>
      <div className="grid gap-6">
        <AdminPageHeader title="Students" description="View student profiles synced from authentication." />
        <AdminCard title="Student Profiles">
          <div className="grid gap-3">
            {students.map((student) => (
              <div key={student.id} className="rounded-xl border border-border bg-muted/5 p-4">
                <p className="font-semibold text-foreground">{student.full_name || student.email}</p>
                <p className="text-sm text-muted-foreground">{student.email}</p>
              </div>
            ))}
            {!students.length ? <p className="text-sm text-muted-foreground">No student profiles found.</p> : null}
          </div>
        </AdminCard>
      </div>
    </AdminShell>
  );
}
