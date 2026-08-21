"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, KeyRound, Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Profile = { full_name: string; avatar_url: string; email: string; role: string };

export default function AccountPage() {
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<Profile>({ full_name: "", avatar_url: "", email: "", role: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Please sign in to manage your profile."); setLoading(false); return; }
      const { data, error: profileError } = await supabase.from("profiles").select("full_name,avatar_url,role").eq("id", user.id).maybeSingle();
      if (profileError) setError(profileError.message);
      setProfile({ full_name: data?.full_name ?? user.user_metadata?.full_name ?? "", avatar_url: data?.avatar_url ?? user.user_metadata?.avatar_url ?? "", email: user.email ?? "", role: data?.role ?? user.user_metadata?.role ?? "student" });
      setLoading(false);
    }
    void load();
  }, [supabase]);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage(""); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Your session has expired. Please sign in again."); setSaving(false); return; }
    const { error: updateError } = await supabase.from("profiles").update({ full_name: profile.full_name.trim(), avatar_url: profile.avatar_url.trim() || null }).eq("id", user.id);
    if (updateError) setError(updateError.message); else { await supabase.auth.updateUser({ data: { full_name: profile.full_name.trim(), avatar_url: profile.avatar_url.trim() || null } }); setMessage("Profile updated successfully."); }
    setSaving(false);
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault(); setChangingPassword(true); setMessage(""); setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); setChangingPassword(false); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); setChangingPassword(false); return; }
    const { error: passwordError } = await supabase.auth.updateUser({ password });
    if (passwordError) setError(passwordError.message); else { setPassword(""); setConfirmPassword(""); setMessage("Password changed successfully."); }
    setChangingPassword(false);
  }

  if (loading) return <div className="mx-auto max-w-3xl space-y-5"><div className="h-28 animate-pulse rounded-2xl bg-muted" /><div className="h-72 animate-pulse rounded-2xl bg-muted" /></div>;
  const displayName = profile.full_name || profile.role || "User";
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U";

  return <div className="mx-auto max-w-3xl space-y-6 pb-12">
    <div><p className="text-sm font-semibold text-primary">Account</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight">Profile & Settings</h1><p className="mt-2 text-sm text-muted-foreground">Manage your profile details and account security.</p></div>
    {message && <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm font-semibold text-emerald-700"><Check className="h-4 w-4" />{message}</div>}
    {error && <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-7"><div className="flex items-center gap-4 border-b border-border pb-6"><div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-lg font-black text-primary">{profile.avatar_url ? <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" /> : initials}</div><div><h2 className="text-lg font-bold">Personal information</h2><p className="text-sm text-muted-foreground">Your profile is shared across iSkole.</p></div></div><form onSubmit={saveProfile} className="mt-6 space-y-5"><div><label htmlFor="full_name" className="mb-2 block text-sm font-semibold">Full name</label><input id="full_name" value={profile.full_name} onChange={(event) => setProfile((current) => ({ ...current, full_name: event.target.value }))} className="input-field" placeholder="Your name" /></div><div><label htmlFor="email" className="mb-2 block text-sm font-semibold">Email address</label><input id="email" value={profile.email} disabled className="input-field cursor-not-allowed opacity-60" /><p className="mt-1.5 text-xs text-muted-foreground">Your login email is managed by your account.</p></div><div><label htmlFor="avatar_url" className="mb-2 block text-sm font-semibold">Profile picture URL <span className="font-normal text-muted-foreground">(optional)</span></label><input id="avatar_url" type="url" value={profile.avatar_url} onChange={(event) => setProfile((current) => ({ ...current, avatar_url: event.target.value }))} className="input-field" placeholder="https://..." /></div><button type="submit" disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground disabled:opacity-50">{saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save changes</>}</button></form></section>
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-7"><div className="flex items-center gap-3 border-b border-border pb-5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><KeyRound className="h-5 w-5" /></div><div><h2 className="text-lg font-bold">Password</h2><p className="text-sm text-muted-foreground">Change your iSkole login password.</p></div></div><form onSubmit={changePassword} className="mt-6 space-y-5"><div><label htmlFor="new_password" className="mb-2 block text-sm font-semibold">New password</label><input id="new_password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="input-field" placeholder="At least 6 characters" autoComplete="new-password" /></div><div><label htmlFor="confirm_password" className="mb-2 block text-sm font-semibold">Confirm password</label><input id="confirm_password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="input-field" placeholder="Repeat your new password" autoComplete="new-password" /></div><button type="submit" disabled={changingPassword} className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-5 text-sm font-bold hover:bg-muted disabled:opacity-50">{changingPassword ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</> : <><KeyRound className="h-4 w-4" /> Change password</>}</button></form></section>
  </div>;
}
