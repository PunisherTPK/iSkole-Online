"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CreditCard, GraduationCap, LayoutDashboard, Settings, Users, X } from "lucide-react";

export type AppRole = "admin" | "teacher" | "student";
type NavItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }> };
const navigation: Record<AppRole, NavItem[]> = {
  admin: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard }, { label: "Content Manager", href: "/admin/content-manager", icon: BookOpen }, { label: "Teachers", href: "/admin/teachers", icon: GraduationCap }, { label: "Students", href: "/admin/students", icon: Users }, { label: "Payment Requests", href: "/admin/payments", icon: CreditCard }, { label: "Payment Settings", href: "/admin/payment-settings", icon: Settings },
  ],
  teacher: [
    { label: "Dashboard", href: "/teacher", icon: LayoutDashboard }, { label: "Teacher Studio", href: "/teacher/studio", icon: BookOpen }, { label: "Students", href: "/teacher/students", icon: Users },
  ],
  student: [
    { label: "Dashboard", href: "/student", icon: LayoutDashboard }, { label: "Question Bank", href: "/question-bank", icon: BookOpen }, { label: "My Learning", href: "/student/learning", icon: GraduationCap }, { label: "Subscription", href: "/student/subscription", icon: CreditCard },
  ],
};

type AppSidebarProps = { role: AppRole; mobileOpen: boolean; onMobileClose: () => void };
export default function AppSidebar({ role, mobileOpen, onMobileClose }: AppSidebarProps) {
  const pathname = usePathname(); const items = navigation[role];
  return <><>{mobileOpen && <button type="button" aria-label="Close navigation" onClick={onMobileClose} className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" />}</><aside className={["fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-border bg-card transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0", mobileOpen ? "translate-x-0" : "-translate-x-full"].join(" ")}><div className="flex h-16 items-center justify-between border-b border-border px-5"><Link href="/" onClick={onMobileClose} aria-label="Go to iSkole home" className="inline-flex items-center"><Image src="/iskole%20logo.png" alt="iSkole" width={145} height={47} priority className="h-9 w-auto object-contain" /></Link><button type="button" onClick={onMobileClose} aria-label="Close navigation" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"><X className="h-5 w-5" /></button></div><nav className="flex-1 overflow-y-auto px-3 py-5"><p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">Workspace</p><div className="space-y-1">{items.map((item) => { const Icon = item.icon; const active = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(`${item.href}/`)); return <Link key={item.href} href={item.href} onClick={onMobileClose} className={["flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition", active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"].join(" ")}><Icon className="h-[18px] w-[18px] shrink-0" />{item.label}</Link>; })}</div></nav><div className="border-t border-border p-3"><Link href="/account" onClick={onMobileClose} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"><Settings className="h-[18px] w-[18px]" />Profile & Settings</Link></div></aside></>;
}
