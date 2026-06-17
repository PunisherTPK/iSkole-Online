import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { getAdminRole } from "@/lib/admin-session";

const navItems = [
  "Dashboard",
  "Curriculums",
  "Levels",
  "Subjects",
  "Resources",
  "Past Papers",
  "Teachers",
  "Settings",
];

export function AdminShell({ children }: { children: ReactNode }) {
  const role = getAdminRole();
  const visibleLabels =
    role === "teacher"
      ? navItems.filter((label) => ["Dashboard", "Resources", "Past Papers", "Teachers"].includes(label))
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
