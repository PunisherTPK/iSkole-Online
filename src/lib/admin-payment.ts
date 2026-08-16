"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") throw new Error("Admin access required.");
  return { supabase, user };
}

export async function approvePaymentRequest(formData: FormData) {
  const requestId = String(formData.get("requestId") ?? "");
  const { supabase, user } = await requireAdmin();
  const { data: request, error: requestError } = await supabase.from("payment_requests").select("*").eq("id", requestId).maybeSingle();
  if (requestError) throw new Error(requestError.message);
  if (!request || request.status !== "pending") throw new Error("Payment request is not pending.");

  const { error: approvalError } = await supabase.from("payment_requests").update({ status: "approved", reviewed_by: user.id, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", requestId).eq("status", "pending");
  if (approvalError) throw new Error(approvalError.message);

  const { data: existing } = await supabase.from("student_subscriptions").select("id").eq("user_id", request.user_id).eq("status", "active").eq("plan_type", request.plan_type).maybeSingle();
  if (!existing) {
    const { error } = await supabase.from("student_subscriptions").insert({ user_id: request.user_id, plan_type: request.plan_type, curriculum_id: request.curriculum_id, subject_id: request.subject_id, status: "active", starts_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/payments"); revalidatePath("/subscriptions"); revalidatePath("/dashboard");
}

export async function rejectPaymentRequest(formData: FormData) {
  const requestId = String(formData.get("requestId") ?? "");
  const { supabase, user } = await requireAdmin();
  const { error } = await supabase.from("payment_requests").update({ status: "rejected", reviewed_by: user.id, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", requestId).eq("status", "pending");
  if (error) throw new Error(error.message);
  revalidatePath("/admin/payments"); revalidatePath("/subscriptions");
}
