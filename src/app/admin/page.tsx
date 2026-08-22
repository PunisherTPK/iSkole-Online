"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowRight, BookOpen, CheckCircle2, CreditCard, GraduationCap, Mail, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const modules = [
  { title: "Content Manager", description: "Manage curriculum, levels, and subjects.", href: "/admin/content-manager", icon: BookOpen },
  { title: "Teachers", description: "Manage teachers and subject assignments.", href: "/admin/teachers", icon: Users },
  { title: "Students", description: "Manage student accounts and access.", href: "/admin/students", icon: Users },
  { title: "Payment Requests", description: "Review submitted payment requests.", href: "/admin/payments", icon: CreditCard },
  { title: "Payment Settings", description: "Manage pricing and payment information.", href: "/admin/payment-settings", icon: CreditCard },
  { title: "Contact Messages", description: "Read enquiries sent through the website.", href: "/admin/contact-messages", icon: Mail },
];

type Counts = { students: number; teachers: number; subjects: number; subscriptions: number; pendingPayments: number; unreadMessages: number };

export default function AdminPage() {
  const supabase = useMemo(() => createClient(), []);
  const [counts, setCounts] = useState<Counts>({ students: 0, teachers: 0, subjects: 0, subscriptions: 0, pendingPayments: 0, unreadMessages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const [students, teachers, subjects, subscriptions, payments, messages] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "teacher"),
        supabase.from("subjects").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("payment_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      const failure = [students, teachers, subjects, subscriptions, payments, messages].find((result) => result.error);
      if (!active) return;
      if (failure?.error) setError(failure.error.message);
      setCounts({ students: students.count ?? 0, teachers: teachers.count ?? 0, subjects: subjects.count ?? 0, subscriptions: subscriptions.count ?? 0, pendingPayments: payments.count ?? 0, unreadMessages: messages.count ?? 0 });
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [supabase]);

  return (
    <div className="space-y-8">
      <div><p className="text-sm font-semibold text-primary">Administration</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">Dashboard</h1><p className="mt-2 text-sm text-muted-foreground">Manage your iSkole platform from one place.</p></div>
      {error && <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"><AlertCircle className="h-4 w-4" />{error}</div>}

      <section>
        <div className="mb-4 flex items-center gap-2"><AlertCircle className="h-4 w-4 text-primary" /><h2 className="text-sm font-bold text-foreground">Needs attention</h2></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AttentionCard href="/admin/payments" label="Payment requests" value={loading ? "—" : counts.pendingPayments} description="Pending submissions requiring review." icon={CreditCard} />
          <AttentionCard href="/admin/teachers" label="Teachers" value={loading ? "—" : counts.teachers} description="Active teacher accounts and assignments." icon={Users} />
          <AttentionCard href="/admin/contact-messages" label="Contact messages" value={loading ? "—" : counts.unreadMessages} description="Unread enquiries from the website." icon={Mail} />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /><h2 className="text-sm font-bold text-foreground">Platform overview</h2></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <OverviewCard label="Students" value={loading ? "—" : counts.students} icon={GraduationCap} /><OverviewCard label="Teachers" value={loading ? "—" : counts.teachers} icon={Users} /><OverviewCard label="Subjects" value={loading ? "—" : counts.subjects} icon={BookOpen} /><OverviewCard label="Active subscriptions" value={loading ? "—" : counts.subscriptions} icon={CreditCard} />
        </div>
      </section>

      <section>
        <div className="mb-4"><h2 className="text-sm font-bold text-foreground">Management</h2><p className="mt-1 text-xs text-muted-foreground">Quickly access the areas you manage most.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => { const Icon = module.icon; return <Link key={module.href} href={module.href} className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-soft"><div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary"><Icon className="h-5 w-5" /></div><ArrowRight className="h-4 w-4 text-muted-foreground/40 transition group-hover:translate-x-1 group-hover:text-primary" /></div><h3 className="mt-5 text-sm font-bold text-foreground">{module.title}</h3><p className="mt-1.5 text-xs leading-5 text-muted-foreground">{module.description}</p></Link>; })}
        </div>
      </section>
    </div>
  );
}

function AttentionCard({ href, label, value, description, icon: Icon }: { href: string; label: string; value: number | string; description: string; icon: React.ComponentType<{ className?: string }> }) { return <Link href={href} className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-soft"><div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div><ArrowRight className="h-4 w-4 text-muted-foreground/40 transition group-hover:translate-x-1 group-hover:text-primary" /></div><p className="mt-5 text-2xl font-extrabold text-foreground">{value}</p><p className="mt-1 text-sm font-bold text-foreground">{label}</p><p className="mt-1 text-xs text-muted-foreground">{description}</p></Link>; }

function OverviewCard({ label, value, icon: Icon }: { label: string; value: number | string; icon: React.ComponentType<{ className?: string }> }) { return <div className="rounded-2xl border border-border bg-card p-5"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div><p className="mt-5 text-2xl font-extrabold tracking-tight text-foreground">{value}</p><p className="mt-1 text-xs font-semibold text-muted-foreground">{label}</p></div>; }
