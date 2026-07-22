"use client";

import {
  BookOpen,
  ChevronLeft,
  ClipboardList,
  FolderTree,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAdmin } from "@/lib/admin-actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const mainNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "My Subjects", href: "/admin/subjects", icon: GraduationCap },
  { label: "Content Manager", href: "/admin/content-manager", icon: FolderTree },
  { label: "Profile", href: "/admin/teachers", icon: Users },
  { label: "Statistics", href: "/admin", icon: LayoutDashboard },
  { label: "Curriculums", href: "/admin/curriculums", icon: BookOpen },
  { label: "Levels", href: "/admin/levels", icon: FolderTree },
  { label: "Subjects", href: "/admin/subjects", icon: GraduationCap },
  { label: "Teachers", href: "/admin/teachers", icon: Users },
  { label: "Students", href: "/admin", icon: Users },
  { label: "Assignments", href: "/admin/teachers", icon: ClipboardList },
];

const secondaryNav: NavItem[] = [
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function NavLink({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "bg-brand-gradient text-white shadow-brand"
          : "text-muted-foreground hover:bg-muted/10 hover:text-foreground",
        collapsed && "justify-center px-2",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      {!collapsed ? <span>{item.label}</span> : <span className="sr-only">{item.label}</span>}
    </Link>
  );
}

function SidebarContent({
  collapsed,
  setCollapsed,
  visibleItems,
  onNavigate,
}: {
  collapsed: boolean;
  setCollapsed?: (v: boolean) => void;
  visibleItems: NavItem[];
  onNavigate?: () => void;
}) {
  const mainItems = visibleItems.filter((item) => mainNav.some((m) => m.href === item.href));
  const secondaryItems = visibleItems.filter((item) => secondaryNav.some((s) => s.href === item.href));

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex items-center gap-3 px-3 py-4", collapsed && "justify-center")}>
        <Image src="/iskole-logo.png" alt="iSkole Online" width={36} height={36} className="h-9 w-auto shrink-0" />
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">iSkole Online</p>
            <p className="truncate text-xs text-muted-foreground">Admin</p>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 px-2" aria-label="Admin navigation">
        {mainItems.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}

        {secondaryItems.length > 0 ? (
          <>
            <Separator className="my-3" />
            {secondaryItems.map((item) => (
              <NavLink key={item.href} item={item} collapsed={collapsed} onNavigate={onNavigate} />
            ))}
          </>
        ) : null}
      </nav>

      <div className="mt-auto space-y-2 p-2">
        <Separator />
        <form action={logoutAdmin}>
          <button
            type="submit"
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              collapsed && "justify-center px-2",
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
            {!collapsed ? "Sign Out" : <span className="sr-only">Sign Out</span>}
          </button>
        </form>
        {setCollapsed ? (
          <Button
            variant="ghost"
            size="sm"
            className={cn("hidden w-full lg:flex", collapsed && "px-2")}
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
            {!collapsed ? <span className="ml-2">Collapse</span> : null}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function Sidebar({ visibleLabels }: { visibleLabels: string[] }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const allItems = [...mainNav, ...secondaryNav];
  const visibleItems = allItems.filter((item) => visibleLabels.includes(item.label));

  return (
    <>
      {/* Mobile trigger */}
      <div className="mb-4 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Menu className="h-4 w-4" />
              Menu
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SidebarContent
              collapsed={false}
              visibleItems={visibleItems}
              onNavigate={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 rounded-3xl border border-border bg-card shadow-brand transition-all duration-300 lg:sticky lg:top-6 lg:block lg:self-start",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} visibleItems={visibleItems} />
      </aside>
    </>
  );
}

export { mainNav, secondaryNav };
