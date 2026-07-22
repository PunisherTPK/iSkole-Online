import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
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

export function AdminShell({ children }: { children: ReactNode }) {
  const role = getAdminRole();
  const visibleLabels =
    role === "teacher"
      ? ["Dashboard", "My Subjects", "Content Manager", "Profile", "Statistics", "Settings"]
      : navItems;

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <Sidebar visibleLabels={visibleLabels} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
