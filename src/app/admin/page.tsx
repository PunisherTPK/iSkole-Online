import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CreditCard,
  GraduationCap,
  Users,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const modules = [
  {
    title: "Content Manager",
    description: "Manage curriculum, levels, and subjects.",
    href: "/admin/content-manager",
    icon: BookOpen,
  },
  {
    title: "Teacher Studio",
    description: "Manage learning content and question pages.",
    href: "/admin/studio",
    icon: GraduationCap,
  },
  {
    title: "Teachers",
    description: "Manage teachers and subject assignments.",
    href: "/admin/teachers",
    icon: Users,
  },
  {
    title: "Students",
    description: "Manage student accounts and access.",
    href: "/admin/students",
    icon: Users,
  },
  {
    title: "Payment Requests",
    description: "Review submitted payment requests.",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    title: "Payment Settings",
    description: "Manage pricing and payment information.",
    href: "/admin/payment-settings",
    icon: CreditCard,
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold text-primary">
          Administration
        </p>

        <div className="mt-1 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Manage your iSkole platform from one place.
            </p>
          </div>
        </div>
      </div>

      {/* Attention */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-primary" />

          <h2 className="text-sm font-bold text-foreground">
            Needs attention
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/payments"
            className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-soft"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CreditCard className="h-5 w-5" />
              </div>

              <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition group-hover:translate-x-1 group-hover:text-primary" />
            </div>

            <p className="mt-5 text-2xl font-extrabold text-foreground">
              —
            </p>

            <p className="mt-1 text-sm font-bold text-foreground">
              Payment requests
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Pending submissions requiring review.
            </p>
          </Link>

          <Link
            href="/admin/teachers"
            className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-soft"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>

              <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition group-hover:translate-x-1 group-hover:text-primary" />
            </div>

            <p className="mt-5 text-2xl font-extrabold text-foreground">
              —
            </p>

            <p className="mt-1 text-sm font-bold text-foreground">
              Teachers
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Manage teachers and subject assignments.
            </p>
          </Link>

          <Link
            href="/admin/students"
            className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-soft"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <GraduationCap className="h-5 w-5" />
              </div>

              <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition group-hover:translate-x-1 group-hover:text-primary" />
            </div>

            <p className="mt-5 text-2xl font-extrabold text-foreground">
              —
            </p>

            <p className="mt-1 text-sm font-bold text-foreground">
              Students
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Manage student accounts and subscriptions.
            </p>
          </Link>
        </div>
      </section>

      {/* Overview */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />

          <h2 className="text-sm font-bold text-foreground">
            Platform overview
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <OverviewCard
            label="Students"
            value="—"
            icon={GraduationCap}
          />

          <OverviewCard
            label="Teachers"
            value="—"
            icon={Users}
          />

          <OverviewCard
            label="Subjects"
            value="—"
            icon={BookOpen}
          />

          <OverviewCard
            label="Active subscriptions"
            value="—"
            icon={CreditCard}
          />
        </div>
      </section>

      {/* Management */}
      <section>
        <div className="mb-4">
          <h2 className="text-sm font-bold text-foreground">
            Management
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Quickly access the areas you manage most.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <Link
                key={module.href}
                href={module.href}
                className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-soft"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary">
                    <Icon className="h-5 w-5" />
                  </div>

                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition group-hover:translate-x-1 group-hover:text-primary" />
                </div>

                <h3 className="mt-5 text-sm font-bold text-foreground">
                  {module.title}
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                  {module.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function OverviewCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-5 text-2xl font-extrabold tracking-tight text-foreground">
        {value}
      </p>

      <p className="mt-1 text-xs font-semibold text-muted-foreground">
        {label}
      </p>
    </div>
  );
}