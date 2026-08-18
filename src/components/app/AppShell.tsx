"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/services/auth";
import { useState } from "react";
import {
  Bell,
  Menu,
  Search,
  UserRound,
} from "lucide-react";

import AppSidebar, { type AppRole } from "./AppSidebar";

type AppShellProps = {
  role: AppRole;
  children: React.ReactNode;
};

const roleLabels: Record<AppRole, string> = {
  admin: "Administrator",
  teacher: "Teacher",
  student: "Student",
};

export default function AppShell({
  role,
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);



  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await signOut();
      router.replace("/");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <AppSidebar
          role={role}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search */}
            <div className="hidden max-w-md flex-1 md:block">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  type="search"
                  placeholder="Search..."
                  className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                aria-label="Notifications"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <Bell className="h-[18px] w-[18px]" />
              </button>

              <div className="hidden h-7 w-px bg-border sm:block" />

              <div className="relative">
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-muted [&::-webkit-details-marker]:hidden">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UserRound className="h-4 w-4" />
                    </span>

                    <span className="hidden text-left sm:block">
                      <span className="block text-xs font-bold text-foreground">
                        Account
                      </span>

                      <span className="block text-[10px] text-muted-foreground">
                        {roleLabels[role]}
                      </span>
                    </span>
                  </summary>

                  <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-border bg-card p-2 shadow-soft">
                    <a
                      href="/profile"
                      className="flex h-10 items-center rounded-xl px-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                      Profile & Settings
                    </a>

                    <div className="my-1 h-px bg-border" />

                    <button
                      type="button"
                      disabled={loggingOut}
                      onClick={handleLogout}
                      className="flex h-10 w-full items-center rounded-xl px-3 text-sm font-semibold text-destructive transition hover:bg-destructive/5 disabled:opacity-50"
                    >
                      {loggingOut ? "Signing out..." : "Sign out"}
                    </button>
                  </div>
                </details>
              </div>

            </div>
          </header>

          {/* Page */}
          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-[1440px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}