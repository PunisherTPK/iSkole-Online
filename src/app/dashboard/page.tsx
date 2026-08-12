import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  FileText,
  UserRound,
  ShieldCheck,
  Crown,
  CheckCircle2,
  History,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("full_name, avatar_url, role, is_active").eq("id", user.id).maybeSingle();
  const { data: subscriptions } = await supabase.from("student_subscriptions").select("id, plan_type, status, starts_at, ends_at, curriculum_id, subject_id, curriculums(name), subjects(name)").eq("user_id", user.id).eq("status", "active").order("starts_at", { ascending: false });

  const fullName = profile?.full_name?.trim() || user.email?.split("@")[0] || "Student";
  const role = profile?.role || "student";
  const activeSubscriptions = subscriptions ?? [];
  const premiumSubscription = activeSubscriptions.find((subscription) => subscription.plan_type === "premium");
  const subjectSubscriptions = activeSubscriptions.filter((subscription) => subscription.plan_type === "subject");

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8"><div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8"><div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Dashboard</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Welcome back, {fullName.split(" ")[0]}.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Your iSkole learning space. Access your subjects, Question Bank and other learning resources from here.</p></div><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">{role === "admin" ? <ShieldCheck size={30} /> : role === "teacher" ? <GraduationCap size={30} /> : <UserRound size={30} />}</div></div></div></section>

        <section className="mb-8"><div className="rounded-2xl border border-border bg-card p-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground"><UserRound size={19} /></div><div><h2 className="font-semibold text-foreground">Account</h2><p className="text-sm text-muted-foreground">{user.email}</p></div></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-muted/50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Account type</p><p className="mt-1 font-semibold capitalize text-foreground">{role}</p></div><div className="rounded-xl bg-muted/50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</p><p className="mt-1 font-semibold text-foreground">{profile?.is_active === false ? "Inactive" : "Active"}</p></div></div><div className="mt-6 border-t border-border pt-6"><LogoutButton /></div></div></section>

        <section className="mb-8"><div className="rounded-2xl border border-border bg-card p-6 sm:p-7"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">{premiumSubscription ? <Crown size={20} /> : <CheckCircle2 size={20} />}</div><div><h2 className="font-semibold text-foreground">Subscription</h2><p className="text-sm text-muted-foreground">Your current access to iSkole learning content.</p></div></div></div><span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold capitalize text-primary">{premiumSubscription ? "Premium" : subjectSubscriptions.length > 0 ? "Subject access" : "Free plan"}</span></div>
          {premiumSubscription ? <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5"><p className="font-semibold text-foreground">Premium</p><p className="mt-1 text-sm text-muted-foreground">Full access to available iSkole learning features and content.</p><p className="mt-3 text-sm font-semibold text-primary">Active</p></div> : subjectSubscriptions.length > 0 ? <div className="mt-6 grid gap-3 sm:grid-cols-2">{subjectSubscriptions.map((subscription) => { const curriculum = Array.isArray(subscription.curriculums) ? subscription.curriculums[0] : subscription.curriculums; const subject = Array.isArray(subscription.subjects) ? subscription.subjects[0] : subscription.subjects; return <div key={subscription.id} className="rounded-xl border border-border bg-muted/30 p-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subject subscription</p><h3 className="mt-2 font-semibold text-foreground">{subject?.name ?? "Subject"}</h3><p className="mt-1 text-sm text-muted-foreground">{curriculum?.name ?? "Curriculum"}</p><div className="mt-4 flex items-center justify-between gap-3 text-sm"><span className="font-semibold text-emerald-600 dark:text-emerald-400">Active</span>{subscription.ends_at && <span className="text-muted-foreground">Until {new Date(subscription.ends_at).toLocaleDateString()}</span>}</div></div>; })}</div> : <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/30 p-5"><p className="font-semibold text-foreground">Free plan</p><p className="mt-1 text-sm leading-6 text-muted-foreground">You can browse Question Bank questions. Answers, practice features and discussion videos require access through a subject subscription or Premium.</p><Link href="/question-bank" className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Browse Question Bank</Link></div>}
        </div></section>

        <section><div className="mb-4"><h2 className="text-xl font-bold text-foreground">Quick access</h2><p className="mt-1 text-sm text-muted-foreground">Continue where you need to go.</p></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><DashboardCard href="/question-bank" icon={<BookOpen size={22} />} title="Question Bank" description="Browse questions and access your available learning features." /><DashboardCard href="/dashboard/practice" icon={<History size={22} />} title="Practice History" description="Review your completed practice sessions and scores." /><DashboardCard href="/notes" icon={<FileText size={22} />} title="Notes" description="Open the iSkole Notes learning application." /><DashboardCard href="/mentor" icon={<GraduationCap size={22} />} title="Mentor" description="Connect with mentors and find learning guidance." /></div></section>
      </div>
    </main>
  );
}

function DashboardCard({ href, icon, title, description }: { href: string; icon: React.ReactNode; title: string; description: string; }) {
  return <Link href={href} className="group rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">{icon}</div><h3 className="mt-5 font-semibold text-foreground">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p><p className="mt-4 text-sm font-semibold text-primary">Open →</p></Link>;
}
