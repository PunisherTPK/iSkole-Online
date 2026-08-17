import Link from "next/link";
import { ArrowRight, CheckCircle2, Crown, UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-12">
        <div className="w-full rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <UserCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold">Sign in to view your profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your profile and subscription details are available after signing in.</p>
          <Link href="/login" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Sign in <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </main>
    );
  }

  const [{ data: profile }, { data: subscriptions }] = await Promise.all([
    supabase.from("profiles").select("full_name, email, role, created_at").eq("id", user.id).maybeSingle(),
    supabase.from("student_subscriptions").select("id, plan_type, status, starts_at, ends_at, subjects(name), curriculums(name)").eq("user_id", user.id).eq("status", "active").order("starts_at", { ascending: false }),
  ]);

  const active = subscriptions ?? [];
  const premium = active.some((item) => item.plan_type === "premium");
  const name = profile?.full_name?.trim() || user.email?.split("@")[0] || "Student";
  const role = profile?.role ?? "student";

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Account</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage your account and see your current learning access.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.25fr]">
          <section className="rounded-3xl border border-border bg-card p-7 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UserCircle className="h-9 w-9" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold">{name}</h2>
                <p className="truncate text-sm text-muted-foreground">{profile?.email ?? user.email}</p>
                <span className="mt-2 inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-semibold capitalize">{role}</span>
              </div>
            </div>
            <div className="mt-7 border-t border-border pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Member since</p>
              <p className="mt-1 text-sm font-medium">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}</p>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-7 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-primary">Learning Access</p>
                <h2 className="mt-1 text-2xl font-bold">Subscription</h2>
              </div>
              {premium ? <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary"><Crown className="h-3.5 w-3.5" /> Premium</span> : null}
            </div>

            {premium ? (
              <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Premium access is active</p>
                    <p className="mt-1 text-sm text-muted-foreground">You have access to all available Question Bank learning features.</p>
                  </div>
                </div>
              </div>
            ) : active.length > 0 ? (
              <div className="mt-6 space-y-3">
                {active.map((subscription) => {
                  const subjectRelation = subscription.subjects;
                  const subject = Array.isArray(subjectRelation) ? subjectRelation[0] : subjectRelation;
                  return (
                    <div key={subscription.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-muted/30 p-4">
                      <div>
                        <p className="font-semibold">{subject?.name ?? "Subject Access"}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Active subject subscription</p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-border p-5">
                <p className="font-semibold">Free access</p>
                <p className="mt-1 text-sm text-muted-foreground">Upgrade to unlock answers, practice and discussion videos.</p>
              </div>
            )}

            <Link href="/subscriptions/student" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
              {active.length ? "Manage subscriptions" : "View subscription plans"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
