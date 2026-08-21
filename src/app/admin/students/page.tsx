"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Users, Loader2, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Student = { id: string; full_name: string | null; email: string | null; avatar_url: string | null; created_at: string | null };

type Subscription = { user_id: string; plan_type: string; status: string; starts_at: string; ends_at: string | null };

export default function AdminStudentsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [students, setStudents] = useState<Student[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true); setError("");
      const [profilesResult, subscriptionsResult] = await Promise.all([
        supabase.from("profiles").select("id,full_name,email,avatar_url,created_at").eq("role", "student").order("created_at", { ascending: false }),
        supabase.from("student_subscriptions").select("user_id,plan_type,status,starts_at,ends_at").eq("status", "active"),
      ]);
      if (profilesResult.error) { setError(profilesResult.error.message); setLoading(false); return; }
      if (subscriptionsResult.error) { setError(subscriptionsResult.error.message); setLoading(false); return; }
      setStudents((profilesResult.data ?? []) as Student[]);
      setSubscriptions((subscriptionsResult.data ?? []) as Subscription[]);
      setLoading(false);
    }
    void load();
  }, [supabase]);

  const activeByStudent = new Map<string, Subscription[]>();
  for (const subscription of subscriptions) activeByStudent.set(subscription.user_id, [...(activeByStudent.get(subscription.user_id) ?? []), subscription]);
  const filtered = students.filter((student) => `${student.full_name ?? ""} ${student.email ?? ""}`.toLowerCase().includes(search.toLowerCase().trim()));

  return <div className="space-y-7">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-primary">Administration</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight">Students</h1><p className="mt-2 text-sm text-muted-foreground">View student accounts and their current learning access.</p></div><div className="flex h-10 items-center gap-2 rounded-xl border border-input bg-card px-3 sm:w-80"><Search className="h-4 w-4 shrink-0 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60" /></div></div>
    <div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-border bg-card p-5"><Users className="h-5 w-5 text-primary" /><p className="mt-4 text-2xl font-black">{students.length}</p><p className="mt-1 text-sm text-muted-foreground">Registered students</p></div><div className="rounded-2xl border border-border bg-card p-5"><UserRound className="h-5 w-5 text-primary" /><p className="mt-4 text-2xl font-black">{students.filter((student) => (activeByStudent.get(student.id)?.length ?? 0) > 0).length}</p><p className="mt-1 text-sm text-muted-foreground">Students with active subscriptions</p></div></div>
    {error && <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
    <section className="overflow-hidden rounded-2xl border border-border bg-card"><div className="border-b border-border px-5 py-4"><h2 className="font-bold">Student accounts</h2><p className="mt-1 text-xs text-muted-foreground">{filtered.length} student{filtered.length === 1 ? "" : "s"} shown</p></div>{loading ? <div className="flex items-center justify-center py-16 text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading students...</div> : !filtered.length ? <div className="py-16 text-center text-sm text-muted-foreground">{search ? "No students match your search." : "No student accounts found."}</div> : <div className="divide-y divide-border">{filtered.map((student) => { const active = activeByStudent.get(student.id) ?? []; const name = student.full_name || student.email || "Unnamed student"; const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); return <div key={student.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-center gap-3">{student.avatar_url ? <img src={student.avatar_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" /> : <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-extrabold text-primary">{initials || "U"}</div>}<div className="min-w-0"><p className="truncate text-sm font-bold">{name}</p><p className="truncate text-xs text-muted-foreground">{student.email ?? "No email"}</p></div></div><div className="flex flex-wrap items-center gap-2 sm:justify-end">{active.length ? active.map((subscription, index) => <span key={`${subscription.user_id}-${index}`} className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold capitalize text-emerald-700">{subscription.plan_type === "premium" ? "Premium" : "Subject subscription"}</span>) : <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground">Free</span>}<span className="text-[11px] text-muted-foreground">Joined {student.created_at ? new Date(student.created_at).toLocaleDateString() : "—"}</span></div></div>; })}</div>}</section>
  </div>;
}
