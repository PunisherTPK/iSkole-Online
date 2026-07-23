import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { readAdminFlash } from "@/lib/admin-actions";
import { getAdminRole } from "@/lib/admin-session";

const navItems = [
  "Dashboard",
  "Teachers",
  "Students",
  "Curriculums",
  "Levels",
  "Subjects",
  "Assignments",
  "Settings",
];

export async function AdminShell({ children }: { children: ReactNode }) {
  const role = getAdminRole();
  const flash = await readAdminFlash();
  const visibleLabels =
    role === "teacher"
      ? ["Dashboard", "My Subjects", "Content Manager", "Profile", "Statistics", "Settings"]
      : navItems;

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <Sidebar visibleLabels={visibleLabels} />
        <div className="min-w-0 flex-1">
          {flash ? (
            <div
              className={`mb-4 rounded-2xl border p-4 text-sm font-medium ${
                flash.type === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              {flash.message}
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </section>
  );
}
