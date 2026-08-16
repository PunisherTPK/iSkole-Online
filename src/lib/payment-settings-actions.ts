"use server";

import { createClient } from "@/lib/supabase/server";

export async function updatePaymentSettings(input: { id: string; payment_method: string; qr_image_url: string; account_name: string; instructions: string; subject_price: string; premium_price: string; currency: string; is_active: boolean }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") throw new Error("Administrator access required.");

  const subjectPrice = Number(input.subject_price);
  const premiumPrice = Number(input.premium_price);
  if (!Number.isFinite(subjectPrice) || subjectPrice <= 0) throw new Error("Enter a valid subject price.");
  if (!Number.isFinite(premiumPrice) || premiumPrice <= 0) throw new Error("Enter a valid Premium price.");
  if (!input.qr_image_url.trim()) throw new Error("Enter the payment QR image URL.");

  const { error } = await supabase.from("payment_settings").update({ payment_method: input.payment_method.trim() || "LankaQR", qr_image_url: input.qr_image_url.trim(), account_name: input.account_name.trim() || null, instructions: input.instructions.trim() || null, subject_price: subjectPrice, premium_price: premiumPrice, currency: input.currency.trim().toUpperCase() || "LKR", is_active: input.is_active, updated_at: new Date().toISOString() }).eq("id", input.id);
  if (error) throw new Error(error.message);
}
