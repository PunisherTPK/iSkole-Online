"use server";

import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin" || !profile.is_active) {
    throw new Error("Administrator access required.");
  }

  return { supabase, user };
}

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

export async function approvePaymentRequest(formData: FormData) {
  const requestId = String(formData.get("requestId") ?? "");
  if (!requestId) throw new Error("Payment request is required.");

  const { supabase, user } = await requireAdmin();
  const { data: request, error: requestError } = await supabase
    .from("payment_requests")
    .select("id, user_id, plan_type, curriculum_id, subject_id, status")
    .eq("id", requestId)
    .maybeSingle();

  if (requestError) throw new Error(requestError.message);
  if (!request) throw new Error("Payment request not found.");
  if (request.status !== "pending") throw new Error("This payment request has already been reviewed.");

  const startsAt = new Date();
  const endsAt = new Date(startsAt);
  endsAt.setDate(endsAt.getDate() + 30);

  const { data: existing } = await supabase
    .from("student_subscriptions")
    .select("id")
    .eq("user_id", request.user_id)
    .eq("plan_type", request.plan_type)
    .eq("status", "active")
    .eq("subject_id", request.subject_id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("student_subscriptions")
      .update({ ends_at: endsAt.toISOString(), updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("student_subscriptions").insert({
      user_id: request.user_id,
      plan_type: request.plan_type,
      curriculum_id: request.curriculum_id,
      subject_id: request.subject_id,
      status: "active",
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
    });
    if (error) throw new Error(error.message);
  }

  const { error: updateError } = await supabase
    .from("payment_requests")
    .update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", request.id)
    .eq("status", "pending");

  if (updateError) throw new Error(updateError.message);
}

export async function rejectPaymentRequest(formData: FormData) {
  const requestId = String(formData.get("requestId") ?? "");
  if (!requestId) throw new Error("Payment request is required.");

  const { supabase, user } = await requireAdmin();
  const { error } = await supabase
    .from("payment_requests")
    .update({
      status: "rejected",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("status", "pending");

  if (error) throw new Error(error.message);
}
