import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  FileText,
  UserRound,
  ShieldCheck,
  Crown,
  CheckCircle2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/LogoutButton";

type Subscription = {
  id: string;
  plan_type: "subject" | "premium";
  curriculum_id: string | null;
  subject_id: string | null;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
};

type Curriculum = {
  id: string;
  name: string;
};

type Subject = {
  id: string;
  name: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
   * Middleware already protects this route.
   *
   * This check is still useful as defense in depth.
   */
  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, avatar_url, role, is_active"
    )
    .eq("id", user.id)
    .maybeSingle();

  const { data: subscriptions } = await supabase
    .from("student_subscriptions")
    .select(
      "id, plan_type, curriculum_id, subject_id, status, starts_at, ends_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const activeSubscriptions = (subscriptions ?? []).filter(
    (subscription: Subscription) => subscription.status === "active"
  ) as Subscription[];

  const curriculumIds = activeSubscriptions
    .map((subscription) => subscription.curriculum_id)
    .filter((id): id is string => Boolean(id));

  const subjectIds = activeSubscriptions
    .map((subscription) => subscription.subject_id)
    .filter((id): id is string => Boolean(id));

  const [{ data: curriculums }, { data: subjects }] = await Promise.all([
    curriculumIds.length > 0
      ? supabase.from("curriculums").select("id, name").in("id", curriculumIds)
      : Promise.resolve({ data: [] as Curriculum[] }),
    subjectIds.length > 0
      ? supabase.from("subjects").select("id, name").in("id", subjectIds)
      : Promise.resolve({ data: [] as Subject[] }),
  ]);

  const curriculumMap = new Map(
    (curriculums ?? []).map((item) => [item.id, item.name])
  );
  const subjectMap = new Map(
    (subjects ?? []).map((item) => [item.id, item.name])
  );

  const premiumSubscription = activeSubscriptions.find(
    (subscription) => subscription.plan_type === "premium"
  );

  const subjectSubscriptions = activeSubscriptions.filter(
    (subscription) => subscription.plan_type === "subject"
  );

  const fullName =
    profile?.full_name?.trim() ||
    user.email?.split("@")[0] ||
    "Student";

  const role = profile?.role || "student";

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ------------------------------------------------
            Header
        ------------------------------------------------ */}
        <section className="mb-8">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                  Dashboard
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Welcome back, {fullName.split(" ")[0]}.
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Your iSkole learning space. Access your
                  subjects, Question Bank and other learning
                  resources from here.
                </p>
              </div>

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                {role === "admin" ? (
                  <ShieldCheck size={30} />
                ) : role === "teacher" ? (
                  <GraduationCap size={30} />
                ) : (
                  <UserRound size={30} />
                )}
              </div>

            </div>
          </div>
        </section>

        {/* ------------------------------------------------
            Account
        ------------------------------------------------ */}
        <section className="mb-8">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground">
                <UserRound size={19} />
              </div>

              <div>
                <h2 className="font-semibold text-foreground">
                  Account
                </h2>

                <p className="text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Account type
                </p>

                <p className="mt-1 capitalize font-semibold text-foreground">
                  {role}
                </p>
              </div>

              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </p>

                <p className="mt-1 font-semibold text-foreground">
                  {profile?.is_active === false
                    ? "Inactive"
                    : "Active"}
                </p>
              </div>
              <div className="mt-6 border-t border-border pt-6">
                <LogoutButton />
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------
            Subscription
        ------------------------------------------------ */}
        <section className="mb-8">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {premiumSubscription ? <Crown size={19} /> : <CheckCircle2 size={19} />}
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Subscription</h2>
                  <p className="text-sm text-muted-foreground">
                    Your current iSkole access and learning entitlements.
                  </p>
                </div>
              </div>

              <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold capitalize text-primary">
                {premiumSubscription ? "Premium" : "Free"}
              </span>
            </div>

            {premiumSubscription ? (
              <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5">
                <p className="text-sm font-bold text-foreground">Premium access</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  You have full access to iSkole learning content and features.
                </p>
                {premiumSubscription.ends_at && (
                  <p className="mt-3 text-xs font-medium text-muted-foreground">
                    Expires {formatDate(premiumSubscription.ends_at)}
                  </p>
                )}
              </div>
            ) : subjectSubscriptions.length > 0 ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {subjectSubscriptions.map((subscription) => (
                  <div key={subscription.id} className="rounded-xl border border-border bg-muted/30 p-5">
                    <p className="font-semibold text-foreground">
                      {subjectMap.get(subscription.subject_id ?? "") ?? "Subject"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {curriculumMap.get(subscription.curriculum_id ?? "") ?? "Curriculum"} · Subject subscription
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
                      <span className="capitalize">{subscription.status}</span>
                      {subscription.ends_at && <span>Expires {formatDate(subscription.ends_at)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/30 p-5">
                <p className="font-semibold text-foreground">Free plan</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  You can browse available Question Bank questions. Answers, practice features and discussion videos require the appropriate subscription.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ------------------------------------------------
            Quick access
        ------------------------------------------------ */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-foreground">
              Quick access
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Continue where you need to go.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">

            <DashboardCard
              href="/question-bank"
              icon={<BookOpen size={22} />}
              title="Question Bank"
              description="Browse questions and access your available learning features."
            />

            <DashboardCard
              href="/notes"
              icon={<FileText size={22} />}
              title="Notes"
              description="Open the iSkole Notes learning application."
            />

            <DashboardCard
              href="/mentor"
              icon={<GraduationCap size={22} />}
              title="Mentor"
              description="Connect with mentors and find learning guidance."
            />

          </div>
        </section>

      </div>
    </main>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function DashboardCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </div>

      <h3 className="mt-5 font-semibold text-foreground">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      <p className="mt-4 text-sm font-semibold text-primary">
        Open →
      </p>
    </Link>
  );
}
