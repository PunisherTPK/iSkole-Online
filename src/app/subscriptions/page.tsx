import Link from "next/link";
import { Check, Crown, Lock, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function SubscriptionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-[calc(100vh-5rem)] bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">iSkole Access</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Choose your learning access</h1>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Sign in to view and manage your iSkole subscription.</p>
            <Link href="/login?next=/subscriptions" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Sign in <ArrowRight size={16} /></Link>
          </div>
        </div>
      </main>
    );
  }

  const [{ data: activeSubscriptions }, { data: subjects }] = await Promise.all([
    supabase
      .from("student_subscriptions")
      .select("id, plan_type, status, starts_at, ends_at, curriculum_id, subject_id, curriculums(name), subjects(name, level_id, levels(name))")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("starts_at", { ascending: false }),
    supabase
      .from("subjects")
      .select("id, name, code, level_id, levels(name, curriculum_id, curriculums(name))")
      .eq("is_active", true)
      .order("name", { ascending: true }),
  ]);

  const current = activeSubscriptions ?? [];
  const premium = current.some((item) => item.plan_type === "premium");
  const subjectIds = new Set(current.filter((item) => item.plan_type === "subject").map((item) => item.subject_id));

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">iSkole Access</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Subscriptions</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Unlock answers, practice and discussion videos for the subjects you study. Subject access is the lowest purchasable level.</p>
            </div>
            <Link href="/dashboard" className="inline-flex w-fit items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">Back to dashboard</Link>
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-3">
          <PlanCard title="Free" eyebrow="START HERE" description="Browse the public Question Bank and explore available questions." features={["Browse Question Pages", "View question images", "Explore subjects"]} current={!premium && current.length === 0} />
          <PlanCard title="Subject Access" eyebrow="FOR STUDENTS" description="Unlock the complete learning experience for a specific subject." features={["Answers and marking information", "MCQ Practice", "Structured / Essay answers", "Discussion videos"]} />
          <PlanCard title="Premium" eyebrow="FULL ACCESS" description="One plan for full access to available iSkole Question Bank content." features={["All subject access", "All answers", "All practice features", "All discussion videos"]} premium current={premium} />
        </section>

        {premium ? (
          <section className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Crown size={21} /></div><div><h2 className="font-semibold text-foreground">Premium is active</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">You currently have full access to available Question Bank learning features. No additional subject subscription is required.</p></div></div>
          </section>
        ) : null}

        <section className="mt-8">
          <div className="mb-4"><h2 className="text-xl font-bold text-foreground">Subject access</h2><p className="mt-1 text-sm text-muted-foreground">Subject subscriptions will unlock the full Question Bank experience for that subject.</p></div>
          {subjects && subjects.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => {
                const level = Array.isArray(subject.levels) ? subject.levels[0] : subject.levels;
                const curriculum = level && Array.isArray(level.curriculums) ? level.curriculums[0] : level?.curriculums;
                const owned = subjectIds.has(subject.id);
                return (
                  <article key={subject.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{curriculum?.name ?? "Curriculum"}</p><h3 className="mt-1 text-lg font-semibold text-foreground">{subject.name}</h3><p className="mt-1 text-sm text-muted-foreground">{level?.name ?? "Level"}{subject.code ? ` · ${subject.code}` : ""}</p></div>{owned ? <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">Active</span> : <Lock size={18} className="text-muted-foreground" />}</div>
                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4"><span className="text-sm text-muted-foreground">{owned ? "Access enabled" : "Subject access"}</span>{owned ? <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Unlocked</span> : <button type="button" disabled className="rounded-xl bg-muted px-3.5 py-2 text-sm font-semibold text-muted-foreground">Coming soon</button>}</div>
                  </article>
                );
              })}
            </div>
          ) : <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No subjects are currently available for subscription.</div>}
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground">Current access</h2>
          {current.length === 0 ? <p className="mt-2 text-sm leading-6 text-muted-foreground">You are currently on the Free plan. You can browse questions, while paid learning features remain locked.</p> : <div className="mt-4 grid gap-3 sm:grid-cols-2">{current.map((subscription) => { const curriculum = Array.isArray(subscription.curriculums) ? subscription.curriculums[0] : subscription.curriculums; const subject = Array.isArray(subscription.subjects) ? subscription.subjects[0] : subscription.subjects; return <div key={subscription.id} className="rounded-xl bg-muted/40 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{subscription.plan_type === "premium" ? "Premium" : "Subject"}</p><p className="mt-1 font-semibold text-foreground">{subscription.plan_type === "premium" ? "Full access" : subject?.name ?? "Subject"}</p><p className="mt-1 text-sm text-muted-foreground">{subscription.plan_type === "premium" ? "All available content" : curriculum?.name ?? "Curriculum"}</p>{subscription.ends_at && <p className="mt-3 text-xs text-muted-foreground">Active until {new Date(subscription.ends_at).toLocaleDateString()}</p>}</div>; })}</div>}
        </section>
      </div>
    </main>
  );
}

function PlanCard({ title, eyebrow, description, features, premium = false, current = false }: { title: string; eyebrow: string; description: string; features: string[]; premium?: boolean; current?: boolean }) {
  return (
    <article className={`rounded-2xl border bg-card p-6 shadow-sm ${premium ? "border-primary/40 ring-1 ring-primary/10" : "border-border"}`}>
      <div className="flex items-center justify-between gap-3"><p className="text-xs font-bold tracking-[0.14em] text-primary">{eyebrow}</p>{current && <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Current</span>}</div>
      <h2 className="mt-3 text-2xl font-bold text-foreground">{title}</h2>
      <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{description}</p>
      <ul className="mt-6 space-y-3">{features.map((feature) => <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground"><Check size={17} className="mt-0.5 shrink-0 text-primary" />{feature}</li>)}</ul>
      <div className="mt-7 rounded-xl bg-muted/50 px-4 py-3 text-sm font-semibold text-muted-foreground">{current ? "Your current plan" : premium ? "Full access · Payment coming soon" : title === "Subject Access" ? "Choose a subject below" : "Free access"}</div>
    </article>
  );
}
