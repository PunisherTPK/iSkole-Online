"use client";

import { useState } from "react";
import { createPaymentRequest, markPaymentCompleted } from "@/lib/payment-actions";

export default function PaymentRequestForm({ planType, amount, curriculumId, subjectId }: { planType: "subject" | "premium"; amount: number; curriculumId?: string | null; subjectId?: string | null }) {
  const [requestId, setRequestId] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function startPayment() {
    setLoading(true); setError("");
    try {
      const result = await createPaymentRequest({ planType, amount, curriculumId, subjectId });
      setRequestId(result.id);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to create payment request."); }
    finally { setLoading(false); }
  }

  async function confirmPayment() {
    if (!requestId) return;
    setLoading(true); setError("");
    try { await markPaymentCompleted({ requestId, paymentReference: reference }); setDone(true); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to submit payment confirmation."); }
    finally { setLoading(false); }
  }

  if (done) return <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5"><p className="font-semibold text-foreground">Payment confirmation submitted</p><p className="mt-1 text-sm text-muted-foreground">Your request is pending administrator verification. Your subscription will activate after approval.</p><p className="mt-3 text-sm font-semibold text-primary">Request: #{requestId?.slice(0, 8).toUpperCase()}</p></div>;

  if (!requestId) return <div><button type="button" onClick={startPayment} disabled={loading} className="inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">{loading ? "Preparing…" : "Continue to Payment"}</button>{error && <p className="mt-2 text-sm text-destructive">{error}</p>}</div>;

  return <div className="mt-5 space-y-5 rounded-2xl border border-border bg-muted/20 p-5">
    <div><p className="text-sm font-semibold text-foreground">Scan to pay</p><p className="mt-1 text-sm text-muted-foreground">Complete the payment using the QR payment method shown by iSkole.</p></div>
    <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-border bg-background p-6 text-center"><div><p className="font-semibold text-foreground">QR payment setup</p><p className="mt-1 text-sm text-muted-foreground">An administrator will configure the payment QR code here.</p></div></div>
    <div><label className="text-sm font-medium text-foreground" htmlFor={`payment-ref-${requestId}`}>Payment reference <span className="text-muted-foreground">(optional)</span></label><input id={`payment-ref-${requestId}`} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Bank / transaction reference" className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" /></div>
    <button type="button" onClick={confirmPayment} disabled={loading} className="inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">{loading ? "Submitting…" : "I've Completed the Payment"}</button>
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>;
}
