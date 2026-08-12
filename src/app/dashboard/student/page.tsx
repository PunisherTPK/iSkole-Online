import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, CreditCard, FileText, History, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function StudentDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard");
  const { data: profile } = await supabase.from("profiles").select("full_name, role, is_active").eq("id", user.id).maybeSingle();
  if (!profile?.is_active) redirect("/login");
  if (profile.role === "admin") redirect("/admin");
  if (profile.role === "teacher") redirect("/teacher");
  const name = profile.full_name?.trim() || user.email?.split("@")[0] || "Student";
  const { data: subscriptions } = await supabase.from("student_subscriptions").select("id, plan_type, ends_at, subjects(name), curriculums(name)").eq("user_id", user.id).eq("status", "active").order("starts_at", { ascending: false });
  const premium = (subscriptions ?? []).some((s) => s.plan_type === "premium");
  const subjects = (subscriptions ?? []).filter((s) => s.plan_type === "subject");
  const cards = [["/question-bank", BookOpen, "Question Bank", "Browse questions and practice your available content."], ["/dashboard/practice", History, "Practice", "Continue practice sessions and review results."], ["/subscriptions", CreditCard, "Subscriptions", "View subject access and subscription options."], ["/notes", FileText, "Notes", "Open the iSkole Notes learning application."] ] as const;
  return <main className="min-h-[calc(100vh-5rem)] bg-background"><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Student Dashboard</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Welcome back, {name.split(" ")[0]}.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Your learning space for subjects, Question Bank, practice and notes.</p></section><section className="mt-6 rounded-2xl border border-border bg-card p-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><UserRound size={19}/></div><div><h2 className="font-semibold text-foreground">Subscription</h2><p className="text-sm text-muted-foreground">{premium ? "Premium access" : subjects.length ? `${subjects.length} subject subscription${subjects.length === 1 ? "" : "s"}` : "Free plan"}</p></div><Link href="/subscriptions" className="ml-auto rounded-xl border border-border px-3 py-2 text-sm font-semibold">Manage</Link></div></section><section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{cards.map(([href, Icon, title, description]) => <Link key={href} href={href} className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"><Icon size={21}/></div><h2 className="mt-5 font-semibold text-foreground">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p><p className="mt-4 text-sm font-semibold text-primary">Open →</p></Link>)}</section><div className="mt-8"><LogoutButton /></div></div></main>;
}
