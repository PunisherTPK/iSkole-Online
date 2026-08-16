import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PaymentSettingsForm from "@/components/admin/PaymentSettingsForm";

export default async function AdminPaymentSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/settings/payment");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: settings } = await supabase.from("payment_settings").select("id, payment_method, qr_image_url, account_name, instructions, subject_price, premium_price, currency, is_active").limit(1).maybeSingle();
  if (!settings) throw new Error("Payment settings have not been initialized.");

  return <main className="min-h-[calc(100vh-5rem)] bg-background"><div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8"><div className="mb-6"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Administration</p><h1 className="mt-2 text-3xl font-bold text-foreground">Payment Settings</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Configure the manual QR payment information students see when purchasing a subject subscription or Premium.</p></div><PaymentSettingsForm initial={settings} /></div></main>;
}
