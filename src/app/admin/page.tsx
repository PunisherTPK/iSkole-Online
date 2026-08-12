import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, CreditCard, FolderTree, GraduationCap, Users, ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/admin");
  const { data: profile } = await supabase.from("profiles").select("full_name, role, is_active").eq("id", user.id).maybeSingle();
  if (!profile?.is_active || profile.role !== "admin") redirect("/dashboard");
  const name = profile.full_name?.trim() || "Admin";

  const cards = [
    ["/admin/content-manager", FolderTree, "Content Manager", "Manage the curriculum hierarchy and learning content."],
    ["/teacher/content", BookOpen, "Teacher Studio", "Create units, topics, question pages and questions."],
    ["/admin/teachers", Users, "Teachers", "Manage teacher accounts and assignments."],
    ["/admin/students", Users, "Students", "View and manage student accounts."],
    ["/admin/assignments", ClipboardList, "Assignments", "Assign teachers to their subjects."],
    ["/admin/payments", CreditCard, "Payment Requests", "Review and approve student payment requests."],
    ["/admin/settings/payment", CreditCard, "Payment Settings", "Configure QR payment details and prices."],
    ["/admin/curriculums", GraduationCap, "Academic Structure", "Manage curriculums, levels and subjects."],
  ] as const;

  return <main className="min-h-[calc(100vh-5rem)] bg-background"><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Administrator</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Welcome back, {name.split(" ")[0]}.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Manage iSkole, its academic structure, teachers, students, payments and learning content from one place.</p></section>
    <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([href, Icon, title, description]) => <Link key={href} href={href} className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"><Icon size={21}/></div><h2 className="mt-5 font-semibold text-foreground">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p><p className="mt-4 text-sm font-semibold text-primary">Open →</p></Link>)}</section>
    <div className="mt-8 rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Signed in as <span className="font-semibold text-foreground">{user.email}</span></p><div className="mt-4"><LogoutButton /></div></div>
  </div></main>;
}
