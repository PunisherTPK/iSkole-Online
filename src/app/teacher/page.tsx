import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, FileQuestion, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function TeacherDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/teacher");
  const { data: profile } = await supabase.from("profiles").select("full_name, role, is_active").eq("id", user.id).maybeSingle();
  if (!profile?.is_active || !["teacher", "admin"].includes(profile.role)) redirect("/dashboard");
  const name = profile.full_name?.trim() || (profile.role === "admin" ? "Admin" : "Teacher");
  const isAdmin = profile.role === "admin";
  const cards = [
    ["/teacher/content", BookOpen, "Content Studio", "Build your subject hierarchy and manage learning content."],
    ["/teacher/question-pages/new", FileQuestion, "Create Question Page", "Create a new MCQ, structured or essay question page."],
    ["/teacher/content", FileQuestion, "Question Pages", "Open question pages and add questions, answers and discussions."],
    ...(isAdmin ? [["/admin/assignments", Users, "Teacher Assignments", "Manage teacher-to-subject assignments."]] as const : []),
  ] as const;
  return <main className="min-h-[calc(100vh-5rem)] bg-background"><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Teacher Studio</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Welcome back, {name.split(" ")[0]}.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Create and maintain the learning content students use in iSkole. {isAdmin ? "As an administrator, you have full teacher privileges as well." : "You only see and edit subjects assigned to you."}</p></section><section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([href, Icon, title, description]) => <Link key={title} href={href} className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"><Icon size={21}/></div><h2 className="mt-5 font-semibold text-foreground">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p><p className="mt-4 text-sm font-semibold text-primary">Open →</p></Link>)}</section><div className="mt-8 rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Signed in as <span className="font-semibold text-foreground">{user.email}</span></p><div className="mt-4"><LogoutButton /></div></div></div></main>;
}
