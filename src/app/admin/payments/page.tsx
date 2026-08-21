"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, CreditCard, ExternalLink, Loader2, Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type RequestRow = { id: string; user_id: string; plan_type: "subject" | "premium"; amount: number; currency: string; status: string; payment_reference: string | null; proof_image_url: string | null; admin_note: string | null; created_at: string; reviewed_at: string | null };
type User = { id: string; full_name: string | null; email: string | null };
type Item = { payment_request_id: string; curriculum_id: string; level_id: string; subject_id: string; amount: number };
type Subject = { id: string; name: string; code: string | null };
type Curriculum = { id: string; name: string };
type Level = { id: string; name: string; curriculum_id: string };

export default function AdminPaymentsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError("");
    const [r, i, u, s, c, l] = await Promise.all([
      supabase.from("payment_requests").select("id,user_id,plan_type,amount,currency,status,payment_reference,proof_image_url,admin_note,created_at,reviewed_at").order("created_at", { ascending: false }),
      supabase.from("payment_request_items").select("payment_request_id,curriculum_id,level_id,subject_id,amount"),
      supabase.rpc("admin_list_users"),
      supabase.from("subjects").select("id,name,code"),
      supabase.from("curriculums").select("id,name"),
      supabase.from("levels").select("id,name,curriculum_id"),
    ]);
    if (r.error) setError(r.error.message); else setRequests((r.data ?? []) as RequestRow[]);
    if (i.error) setError(i.error.message); else setItems((i.data ?? []) as Item[]);
    if (u.error) setError(u.error.message); else setUsers((u.data ?? []) as User[]);
    if (!s.error) setSubjects((s.data ?? []) as Subject[]);
    if (!c.error) setCurriculums((c.data ?? []) as Curriculum[]);
    if (!l.error) setLevels((l.data ?? []) as Level[]);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  const userMap = new Map(users.map((u) => [u.id, u]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const curriculumMap = new Map(curriculums.map((c) => [c.id, c]));
  const levelMap = new Map(levels.map((l) => [l.id, l]));

  const itemsFor = (requestId: string) => items.filter((item) => item.payment_request_id === requestId);

  const shown = requests.filter((r) => filter === "all" || r.status === filter).filter((r) => {
    const u = userMap.get(r.user_id);
    const requestItems = itemsFor(r.id);
    const text = `${u?.full_name ?? ""} ${u?.email ?? ""} ${r.plan_type} ${r.payment_reference ?? ""} ${requestItems.map((i) => `${subjectMap.get(i.subject_id)?.name ?? ""} ${curriculumMap.get(i.curriculum_id)?.name ?? ""} ${levelMap.get(i.level_id)?.name ?? ""}`).join(" ")}`.toLowerCase();
    return text.includes(search.trim().toLowerCase());
  });

  async function review(row: RequestRow, status: "approved" | "rejected") {
    const label = status === "approved" ? "approve" : "reject";
    if (!window.confirm(`Are you sure you want to ${label} this payment request?`)) return;
    setBusy(row.id); setError("");

    if (status === "approved") {
      const { error: approvalError } = await supabase.rpc("admin_approve_payment_request", { p_request_id: row.id });
      if (approvalError) setError(approvalError.message);
    } else {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { setError("Authentication required."); setBusy(null); return; }
      const { error: rejectError } = await supabase.from("payment_requests").update({ status: "rejected", reviewed_by: auth.user.id, reviewed_at: new Date().toISOString() }).eq("id", row.id).eq("status", "pending");
      if (rejectError) setError(rejectError.message);
    }

    await load(); setBusy(null);
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  return <div className="space-y-7">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-sm font-semibold text-primary">Administration</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight">Payment Requests</h1><p className="mt-2 text-sm text-muted-foreground">Review payments and activate the exact access purchased.</p></div>
      <div className="flex h-10 items-center gap-2 rounded-xl border border-input bg-card px-3 lg:w-80"><Search className="h-4 w-4 shrink-0 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search payments..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60" /></div>
    </div>

    <div className="grid gap-4 sm:grid-cols-3"><Stat icon={<CreditCard className="h-5 w-5 text-primary" />} value={pendingCount} label="Pending requests" /><Stat icon={<Check className="h-5 w-5 text-emerald-600" />} value={approvedCount} label="Approved" /><Stat icon={<X className="h-5 w-5 text-destructive" />} value={rejectedCount} label="Rejected" /></div>

    <div className="flex flex-wrap gap-2">{["pending","approved","rejected","cancelled","all"].map((value) => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-full px-4 py-2 text-xs font-bold capitalize transition ${filter === value ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:bg-muted"}`}>{value}{value === "pending" && pendingCount > 0 ? ` · ${pendingCount}` : ""}</button>)}</div>

    {error && <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}

    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4"><h2 className="font-bold">Requests</h2><p className="mt-1 text-xs text-muted-foreground">{shown.length} request{shown.length === 1 ? "" : "s"} shown</p></div>
      {loading ? <div className="flex items-center justify-center py-16 text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading payment requests...</div> : !shown.length ? <div className="py-16 text-center text-sm text-muted-foreground">No payment requests found.</div> : <div className="divide-y divide-border">
        {shown.map((row) => {
          const user = userMap.get(row.user_id);
          const requestItems = itemsFor(row.id);
          const isExpanded = expanded === row.id;
          return <article key={row.id} className="p-5">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${row.status === "pending" ? "bg-amber-500/10 text-amber-700" : row.status === "approved" ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{row.status}</span><span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">{row.plan_type === "premium" ? "Premium" : `${requestItems.length} Subject${requestItems.length === 1 ? "" : "s"}`}</span></div>
                <div><h3 className="font-bold">{user?.full_name || user?.email || "Unknown student"}</h3><p className="mt-1 text-xs text-muted-foreground">{user?.email ?? ""}</p></div>
                {row.plan_type === "premium" ? <div className="rounded-xl bg-primary/5 p-4 text-sm"><p className="font-bold">Premium access</p><p className="mt-1 text-xs text-muted-foreground">All available subjects</p></div> : <div className="space-y-2">{requestItems.slice(0, isExpanded ? undefined : 3).map((item) => <div key={`${item.curriculum_id}-${item.level_id}-${item.subject_id}`} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background px-4 py-3"><div className="min-w-0"><p className="truncate text-sm font-bold">{subjectMap.get(item.subject_id)?.name ?? "Unknown subject"}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{curriculumMap.get(item.curriculum_id)?.name ?? "—"} · {levelMap.get(item.level_id)?.name ?? "—"}</p></div><span className="shrink-0 text-xs font-bold">{row.currency} {Number(item.amount).toLocaleString()}</span></div>)}{requestItems.length > 3 && <button type="button" onClick={() => setExpanded(isExpanded ? null : row.id)} className="inline-flex items-center gap-1 text-xs font-bold text-primary">{isExpanded ? "Show less" : `Show ${requestItems.length - 3} more`}<ChevronDown className={`h-3.5 w-3.5 transition ${isExpanded ? "rotate-180" : ""}`} /></button>}</div>}
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground"><span>Submitted {new Date(row.created_at).toLocaleString()}</span>{row.payment_reference && <span>Reference: <strong className="text-foreground">{row.payment_reference}</strong></span>}<span className="font-bold text-foreground">Total: {row.currency} {Number(row.amount).toLocaleString()}</span></div>
              </div>
              <div className="w-full shrink-0 xl:w-56">{row.proof_image_url ? <a href={row.proof_image_url} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-xl border border-border bg-muted"><img src={row.proof_image_url} alt="Payment proof" className="h-36 w-full object-cover transition group-hover:scale-[1.02]" /><span className="flex items-center justify-center gap-1 py-2 text-xs font-semibold"><ExternalLink className="h-3.5 w-3.5" />View proof</span></a> : <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">No proof uploaded</div>}</div>
            </div>
            {row.status === "pending" && <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-border pt-4"><button type="button" disabled={busy === row.id} onClick={() => void review(row, "rejected")} className="rounded-xl border border-destructive/20 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/5 disabled:opacity-50">{busy === row.id ? "Processing..." : "Reject"}</button><button type="button" disabled={busy === row.id} onClick={() => void review(row, "approved")} className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50">{busy === row.id ? "Processing..." : "Approve & activate"}</button></div>}
          </article>;
        })}
      </div>}
    </section>
  </div>;
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) { return <div className="rounded-2xl border border-border bg-card p-5">{icon}<p className="mt-4 text-2xl font-black">{value}</p><p className="mt-1 text-sm text-muted-foreground">{label}</p></div>; }
