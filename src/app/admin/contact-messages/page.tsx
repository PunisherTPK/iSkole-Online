"use client";

import { useEffect, useMemo, useState } from "react";
import { Archive, Check, Clock3, Mail, MailOpen, RefreshCw, Search, Trash2, UserRound, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Message = { id: string; name: string; email: string; subject: string; message: string; status: "pending" | "read" | "archived"; created_at: string; read_at: string | null };

export default function AdminContactMessagesPage() {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [filter, setFilter] = useState<"pending" | "read" | "archived" | "all">("pending");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    const { data, error: loadError } = await supabase.from("contact_messages").select("id,name,email,subject,message,status,created_at,read_at").order("created_at", { ascending: false });
    if (loadError) setError(loadError.message); else setMessages((data ?? []) as Message[]);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  const pendingCount = messages.filter((m) => m.status === "pending").length;
  const shown = messages.filter((m) => filter === "all" || m.status === filter).filter((m) => `${m.name} ${m.email} ${m.subject} ${m.message}`.toLowerCase().includes(search.trim().toLowerCase()));

  async function updateMessage(id: string, patch: Record<string, unknown>) {
    setBusy(true); setError("");
    const { error: updateError } = await supabase.from("contact_messages").update(patch).eq("id", id);
    if (updateError) setError(updateError.message);
    await load();
    const updated = messages.find((m) => m.id === id);
    if (updated) setSelected({ ...updated, ...(patch as Partial<Message>) });
    setBusy(false);
  }

  async function markRead(message: Message) {
    if (message.status !== "pending") return;
    const { data: auth } = await supabase.auth.getUser();
    await updateMessage(message.id, { status: "read", read_at: new Date().toISOString(), read_by: auth.user?.id ?? null });
  }

  async function archive(message: Message) {
    await updateMessage(message.id, { status: "archived" });
  }

  async function remove(message: Message) {
    if (!window.confirm("Delete this contact message permanently?")) return;
    setBusy(true); setError("");
    const { error: deleteError } = await supabase.from("contact_messages").delete().eq("id", message.id);
    if (deleteError) setError(deleteError.message); else setSelected(null);
    await load(); setBusy(false);
  }

  function openMessage(message: Message) {
    setSelected(message);
    if (message.status === "pending") void markRead(message);
  }

  return <div className="space-y-7">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-sm font-semibold text-primary">Administration</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight">Contact Messages</h1><p className="mt-2 text-sm text-muted-foreground">Read enquiries and messages sent through the website.</p></div>
      <div className="flex items-center gap-2 rounded-xl border border-input bg-card px-3 lg:w-80"><Search className="h-4 w-4 shrink-0 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search messages..." className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground/60" /></div>
    </div>

    <div className="flex flex-wrap items-center gap-2"><FilterButton active={filter === "pending"} onClick={() => setFilter("pending")}>Unread {pendingCount > 0 && <span>· {pendingCount}</span>}</FilterButton><FilterButton active={filter === "read"} onClick={() => setFilter("read")}>Read</FilterButton><FilterButton active={filter === "archived"} onClick={() => setFilter("archived")}>Archived</FilterButton><FilterButton active={filter === "all"} onClick={() => setFilter("all")}>All</FilterButton><button type="button" onClick={() => void load()} className="ml-auto inline-flex h-9 items-center gap-2 rounded-xl border border-border px-3 text-xs font-bold hover:bg-muted"><RefreshCw className="h-3.5 w-3.5" />Refresh</button></div>

    {error && <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}

    <section className="grid min-h-[560px] overflow-hidden rounded-3xl border border-border bg-card lg:grid-cols-[360px_minmax(0,1fr)]">
      <div className="border-b border-border lg:border-b-0 lg:border-r">
        {loading ? <div className="flex items-center justify-center py-16 text-sm text-muted-foreground"><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Loading...</div> : !shown.length ? <div className="p-8 text-center"><MailOpen className="mx-auto h-8 w-8 text-muted-foreground/50" /><p className="mt-3 text-sm font-bold">No messages</p><p className="mt-1 text-xs text-muted-foreground">There are no messages matching this filter.</p></div> : <div className="max-h-[680px] overflow-y-auto">{shown.map((message) => <button key={message.id} type="button" onClick={() => openMessage(message)} className={`block w-full border-b border-border p-5 text-left transition hover:bg-muted/40 ${selected?.id === message.id ? "bg-primary/[0.05]" : ""}`}><div className="flex items-start gap-3"><div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${message.status === "pending" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}><Mail className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className={`truncate text-sm ${message.status === "pending" ? "font-extrabold" : "font-bold"}`}>{message.name}</p><span className="shrink-0 text-[10px] text-muted-foreground">{formatDate(message.created_at)}</span></div><p className="mt-1 truncate text-xs font-semibold">{message.subject}</p><p className="mt-1 truncate text-xs text-muted-foreground">{message.message}</p></div></div></button>)}</div>}
      </div>

      <div className="min-w-0">
        {!selected ? <div className="flex h-full min-h-[560px] flex-col items-center justify-center p-8 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><MailOpen className="h-6 w-6" /></div><h2 className="mt-5 text-lg font-extrabold">Select a message</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Choose an enquiry from the inbox to read the full message.</p></div> : <div className="flex h-full min-h-[560px] flex-col"><div className="border-b border-border p-6 sm:p-7"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${selected.status === "pending" ? "bg-amber-500/10 text-amber-700" : selected.status === "read" ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{selected.status}</span><h2 className="mt-3 text-2xl font-extrabold tracking-tight">{selected.subject}</h2><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1.5"><UserRound className="h-3.5 w-3.5" />{selected.name}</span><a href={`mailto:${selected.email}`} className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"><Mail className="h-3.5 w-3.5" />{selected.email}</a><span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{new Date(selected.created_at).toLocaleString()}</span></div></div><button type="button" onClick={() => setSelected(null)} className="self-start rounded-lg p-2 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button></div></div><div className="flex-1 overflow-y-auto p-6 sm:p-7"><div className="whitespace-pre-wrap rounded-2xl bg-muted/30 p-5 text-sm leading-7">{selected.message}</div></div><div className="flex flex-wrap justify-end gap-2 border-t border-border p-5"><a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground"><Mail className="h-3.5 w-3.5" />Reply by email</a>{selected.status !== "archived" && <button type="button" disabled={busy} onClick={() => void archive(selected)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-xs font-bold hover:bg-muted disabled:opacity-50"><Archive className="h-3.5 w-3.5" />Archive</button>}<button type="button" disabled={busy} onClick={() => void remove(selected)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-destructive/20 px-4 text-xs font-bold text-destructive hover:bg-destructive/5 disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" />Delete</button></div></div>}
      </div>
    </section>
  </div>;
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button type="button" onClick={onClick} className={`rounded-full px-4 py-2 text-xs font-bold transition ${active ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:bg-muted"}`}>{children}</button>; }
function formatDate(value: string) { const date = new Date(value); const now = new Date(); if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); return date.toLocaleDateString([], { month: "short", day: "numeric" }); }
