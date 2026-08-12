"use server";

import { createClient } from "@/lib/supabase/server";

export async function createPaymentRequest(input: {
  planType: "subject" | "premium";
  amount: number;
  curriculumId?: string | null;
  subjectId?: string | null;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");
  if (!Number.isFinite(input.amount) || input.amount <= 0) throw new Error("Invalid payment amount.");
  if (input.planType === "subject" && !input.subjectId) throw new Error("A subject is required.");

  const { data: existing } = await supabase
    .from("payment_requests")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("plan_type", input.planType)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) return { id: existing.id, status: existing.status };

  const { data, error } = await supabase
    .from("payment_requests")
    .insert({
      user_id: user.id,
      plan_type: input.planType,
      amount: input.amount,
      curriculum_id: input.curriculumId ?? null,
      subject_id: input.subjectId ?? null,
      status: "pending",
    })
    .select("id, status")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function markPaymentCompleted(input: { requestId: string; paymentReference?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");

  const { error } = await supabase
    .from("payment_requests")
    .update({ payment_reference: input.paymentReference?.trim() || null, paid_at: new Date().toISOString() })
    .eq("id", input.requestId)
    .eq("user_id", user.id)
    .eq("status", "pending");

  if (error) throw new Error(error.message);
}
