"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Subject = { id: string; name: string; code: string | null };
type Curriculum = { id: string; name: string };
type PaymentSettings = { payment_method: string; qr_image_url: string | null; account_name: string | null; instructions: string | null; subject_price: number | null; premium_price: number | null; currency: string; is_active: boolean };

export default function PaymentPage() {
  const supabase = useMemo(() => createClient(), []);
  const [plan, setPlan] = useState<"subject" | "premium">("premium");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [curriculumId, setCurriculumId] = useState("");
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [reference, setReference] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Please log in to continue."); setLoading(false); return; }
      const [s, c, p] = await Promise.all([
        supabase.from("subjects").select("id,name,code").eq("is_active", true).order("name"),
        supabase.from("curriculums").select("id,name").eq("is_active", true).order("name"),
        supabase.from("payment_settings").select("payment_method,qr_image_url,account_name,instructions,subject_price,premium_price,currency,is_active").limit(1).maybeSingle(),
      ]);
      if (s.error || c.error || p.error) setError(s.error?.message || c.error?.message || p.error?.message || "Unable to load payment details.");
      setSubjects((s.data ?? []) as Subject[]);
      setCurriculums((c.data ?? []) as Curriculum[]);
      if (p.data) setSettings(p.data as PaymentSettings);
      setLoading(false);
    }
    void load();
  }, [supabase]);

  const price = plan === "premium" ? settings?.premium_price : settings?.subject_price;
  const currency = settings?.currency || "LKR";

  async function submit() {
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Please log in to continue."); return; }
    if (!settings?.is_active) { setError("Payments are currently unavailable."); return; }
    if (plan === "subject" && !subjectId) { setError("Please select a subject."); return; }
    if (!price || Number(price) <= 0) { setError("This plan does not currently have a valid price."); return; }
    if (!reference.trim()) { setError("Please enter your payment reference."); return; }
    setSubmitting(true);
    try {
      let proofUrl: string | null = null;
      if (proof) {
        if (!proof.type.startsWith("image/")) throw new Error("Payment proof must be an image.");
        if (proof.size > 5 * 1024 * 1024) throw new Error("Payment proof must be 5 MB or smaller.");
        const path = `${user.id}/${crypto.randomUUID()}-${proof.name}`;
        const upload = await supabase.storage.from("payment-proofs").upload(path, proof, { upsert: false, contentType: proof.type });
        if (upload.error) throw upload.error;
        proofUrl = supabase.storage.from("payment-proofs").getPublicUrl(path).data.publicUrl;
      }
      const { error: insertError } = await supabase.from("payment_requests").insert({ user_id: user.id, plan_type: plan, curriculum_id: plan === "subject" ? (curriculumId || null) : null, subject_id: plan === "subject" ? subjectId : null, amount: Number(price), currency, payment_reference: reference.trim(), proof_image_url: proofUrl, status: "pending" });
      if (insertError) throw insertError;
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to submit payment request.");
    } finally { setSubmitting(false); }
  }

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (success) return <main className="mx-auto max-w-xl px-5 py-16 text-center sm:py-24"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10"><CheckCircle2 className="h-8 w-8 text-emerald-600" /></div><h1 className="mt-6 text-3xl font-extrabold tracking-tight">Payment request submitted</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Your request is now pending admin review. You will receive access after the payment is approved.</p><div className="mt-7 flex justify-center gap-3"><Link href="/student/subscription" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">View subscription</Link><Link href="/question-bank" className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold">Back to Question Bank</Link></div></main>;

  return <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14"><Link href="/pricing" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to pricing</Link><div className="mt-6"><p className="text-sm font-bold uppercase tracking-wider text-primary">Payment</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight">Complete your subscription</h1><p className="mt-2 text-sm text-muted-foreground">Pay using the details below, then submit your payment reference for review.</p></div>{error && <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}<div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]"><section className="rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="flex gap-2"><button type="button" onClick={() => setPlan("subject")} className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold ${plan === "subject" ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}>One subject</button><button type="button" onClick={() => setPlan("premium")} className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold ${plan === "premium" ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}>Premium</button></div>{plan === "subject" && <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="space-y-2 text-sm font-semibold">Subject<select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-normal"><option value="">Select a subject</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.name}{s.code ? ` (${s.code})` : ""}</option>)}</select></label><label className="space-y-2 text-sm font-semibold">Curriculum<select value={curriculumId} onChange={(e) => setCurriculumId(e.target.value)} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-normal"><option value="">Select curriculum (optional)</option>{curriculums.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label></div>}<div className="mt-6 rounded-2xl bg-muted/50 p-5"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount</p><p className="mt-1 text-3xl font-extrabold">{currency} {Number(price || 0).toLocaleString()}</p></div><div className="mt-6 space-y-5"><label className="block space-y-2 text-sm font-semibold">Payment reference<input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Bank transfer / transaction reference" className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-normal outline-none" /></label><label className="block space-y-2 text-sm font-semibold">Payment proof <span className="font-normal text-muted-foreground">(optional)</span><input type="file" accept="image/*" onChange={(e) => setProof(e.target.files?.[0] ?? null)} className="block w-full text-xs text-muted-foreground" /></label></div></section><aside className="space-y-5"><section className="rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><CreditCard className="h-5 w-5" /></div><div><p className="text-xs font-semibold text-muted-foreground">Payment method</p><p className="font-bold">{settings?.payment_method || "Manual payment"}</p></div></div>{settings?.qr_image_url && <div className="mt-5 rounded-2xl border border-border bg-white p-4"><Image src={settings.qr_image_url} alt="Payment QR" width={360} height={360} className="mx-auto aspect-square w-full max-w-xs object-contain" unoptimized /></div>}{settings?.account_name && <p className="mt-4 text-sm"><span className="font-semibold">Account:</span> {settings.account_name}</p>}{settings?.instructions && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{settings.instructions}</p>}</section><button type="button" disabled={submitting || !settings?.is_active} onClick={() => void submit()} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">{submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting...</> : "Submit payment request"}</button></aside></div></main>;
}
