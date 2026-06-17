import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAdmin } from "@/lib/admin-actions";
import { getAdminRole } from "@/lib/admin-session";

const navItems = [
  ["Dashboard", "/admin"],
  ["Curriculums", "/admin/curriculums"],
  ["Levels", "/admin/levels"],
  ["Subjects", "/admin/subjects"],
  ["Resources", "/admin/resources"],
  ["Past Papers", "/admin/past-papers"],
  ["Teachers", "/admin/teachers"],
  ["Settings", "/admin/settings"],
];

export function AdminShell({ children }: { children: ReactNode }) {
  const role = getAdminRole();
  const visibleItems =
    role === "teacher" ? navItems.filter(([label]) => ["Dashboard", "Resources", "Past Papers", "Teachers"].includes(label)) : navItems;

  return (
    <section className="min-h-[calc(100vh-153px)] bg-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <aside className="lg:sticky lg:top-24 lg:h-fit lg:w-64">
          <details className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm lg:open" open>
            <summary className="cursor-pointer list-none px-2 py-2 text-sm font-bold text-slate-950 lg:pointer-events-none">
              Admin Navigation
            </summary>
            <nav className="mt-2 grid gap-1">
              {visibleItems.map(([label, href]) => (
                <Link key={href} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700" href={href}>
                  {label}
                </Link>
              ))}
            </nav>
            <form action={logoutAdmin} className="mt-3 border-t border-slate-200 pt-3">
              <button className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700" type="submit">
                Sign out
              </button>
            </form>
          </details>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
