import { createClient } from "@/lib/supabase/server";
import { approvePaymentRequest, rejectPaymentRequest } from "@/lib/payment-actions";

export default async function AdminPaymentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return <div className="app-page"><div className="app-page-content"><h1>Access denied</h1><p>You do not have permission to view payment requests.</p></div></div>;

  const { data: requests, error } = await supabase.from("payment_requests").select("id, user_id, plan_type, amount, currency, status, payment_reference, created_at, paid_at, subject_id, curriculum_id").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const userIds = [...new Set((requests ?? []).map((r) => r.user_id))];
  const subjectIds = [...new Set((requests ?? []).map((r) => r.subject_id).filter(Boolean))] as string[];
  const [{ data: profiles }, { data: subjects }] = await Promise.all([
    userIds.length ? supabase.from("profiles").select("id, full_name").in("id", userIds) : Promise.resolve({ data: [] as { id: string; full_name: string | null }[] }),
    subjectIds.length ? supabase.from("subjects").select("id, name").in("id", subjectIds) : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name || "Student"]));
  const subjectMap = new Map((subjects ?? []).map((s) => [s.id, s.name]));

  return <div className="app-page"><div className="app-page-content max-w-6xl">
    <p className="app-eyebrow">Administration</p><h1>Payment Requests</h1><p>Review student payment confirmations and activate subscriptions after verification.</p>
    <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-border bg-muted/40"><tr><th className="px-4 py-3">Student</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr></thead><tbody>
      {(requests ?? []).map((request) => <tr key={request.id} className="border-b border-border last:border-0"><td className="px-4 py-4"><div className="font-medium">{profileMap.get(request.user_id) ?? "Student"}</div><div className="text-xs text-muted-foreground">{request.id.slice(0, 8).toUpperCase()}</div></td><td className="px-4 py-4"><div className="font-medium">{request.plan_type === "premium" ? "Premium" : subjectMap.get(request.subject_id ?? "") ?? "Subject"}</div></td><td className="px-4 py-4">{request.currency} {Number(request.amount).toLocaleString()}</td><td className="px-4 py-4">{request.payment_reference || "—"}</td><td className="px-4 py-4"><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">{request.status}</span></td><td className="px-4 py-4">{request.status === "pending" ? <div className="flex gap-2"><form action={approvePaymentRequest}><input type="hidden" name="requestId" value={request.id}/><button className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">Approve</button></form><form action={rejectPaymentRequest}><input type="hidden" name="requestId" value={request.id}/><button className="rounded-lg border border-border px-3 py-2 text-xs font-semibold">Reject</button></form></div> : <span className="text-xs text-muted-foreground">Reviewed</span>}</td></tr>)}
      {!(requests ?? []).length && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No payment requests yet.</td></tr>}
      </tbody></table></div>
    </section>
  </div></div>;
}
