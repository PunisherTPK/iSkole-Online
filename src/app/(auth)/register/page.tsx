"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Mail, LockKeyhole, UserRound, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const benefits = ["Access your personalized learning space", "Practice questions and track your progress", "Discover expert mentors and subjects"];
const SITE_URL = "https://www.iskole.online";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    const fullName = name.trim(); const normalizedEmail = email.trim().toLowerCase();
    if (!fullName) return setError("Please enter your full name.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { full_name: fullName, role: "student" },
          emailRedirectTo: `${SITE_URL}/auth/callback?next=/student`,
        },
      });
      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("Unable to create your account. Please try again.");
      if (data.session) { router.replace("/student"); router.refresh(); return; }
      setMessage("Account created successfully. Please check your email to confirm your account, then sign in.");
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : "Unable to create your account. Please try again.");
    } finally { setLoading(false); }
  }

  return <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
    <div aria-hidden="true" className="pointer-events-none absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
    <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-10 h-[28rem] w-[28rem] rounded-full bg-violet-200/20 blur-3xl" />
    <div className="container-site relative flex min-h-[calc(100vh-64px)] items-center justify-center py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft lg:grid-cols-[0.9fr_1.1fr]">
        <div className="order-2 p-6 sm:p-10 lg:order-1"><div className="mx-auto max-w-md">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Create account</p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-foreground">Start your learning journey</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Create your iSkole account and get started.</p>
          {message && <div role="status" className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm leading-5 text-emerald-700">{message}</div>}
          {error && <div role="alert" className="mt-5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-5 text-destructive">{error}</div>}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div><label htmlFor="name" className="mb-2 block text-sm font-semibold text-foreground">Full name</label><div className="relative"><UserRound aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input id="name" name="name" type="text" autoComplete="name" placeholder="Your full name" required value={name} onChange={(event) => setName(event.target.value)} className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10" /></div></div>
            <div><label htmlFor="email" className="mb-2 block text-sm font-semibold text-foreground">Email address</label><div className="relative"><Mail aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10" /></div></div>
            <div><label htmlFor="password" className="mb-2 block text-sm font-semibold text-foreground">Password</label><div className="relative"><LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input id="password" name="password" type="password" autoComplete="new-password" placeholder="Create a password" required value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10" /></div><p className="mt-2 text-[11px] text-muted-foreground">Use at least 8 characters.</p></div>
            <div><label htmlFor="confirm-password" className="mb-2 block text-sm font-semibold text-foreground">Confirm password</label><div className="relative"><LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" placeholder="Confirm your password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10" /></div></div>
            <button type="submit" disabled={loading} className="button-primary mt-2 h-11 w-full disabled:pointer-events-none disabled:opacity-60">{loading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating Account...</> : <>Create Account<ArrowRight className="h-4 w-4" /></>}</button>
          </form>
          <div className="my-7 flex items-center gap-3"><div className="h-px flex-1 bg-border" /><span className="text-xs text-muted-foreground">Already have an account?</span><div className="h-px flex-1 bg-border" /></div>
          <Link href="/login" className="button-secondary h-11 w-full">Sign In</Link>
          <p className="mt-6 text-center text-[11px] leading-5 text-muted-foreground">By creating an account, you agree to iSkole&apos;s <Link href="/terms" className="font-semibold text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="font-semibold text-primary hover:underline">Privacy Policy</Link>.</p>
        </div></div>
        <div className="order-1 relative hidden overflow-hidden bg-primary p-10 text-white lg:order-2 lg:flex lg:flex-col lg:justify-between">
          <div aria-hidden="true" className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" /><div aria-hidden="true" className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-violet-300/10 blur-3xl" />
          <div className="relative"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15"><CheckCircle2 className="h-5 w-5" /></div><p className="mt-10 text-xs font-bold uppercase tracking-[0.18em] text-white/65">Why iSkole?</p><h2 className="mt-3 max-w-sm font-heading text-4xl font-extrabold leading-tight tracking-tight">Everything you need to keep moving forward.</h2><p className="mt-5 max-w-sm text-sm leading-6 text-white/70">Your account gives you a personalized place to learn, practice, and follow your academic journey.</p></div>
          <div className="relative mt-12 space-y-3">{benefits.map((benefit) => <div key={benefit} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15"><CheckCircle2 className="h-4 w-4" /></span><span className="text-xs font-semibold text-white/85">{benefit}</span></div>)}</div>
        </div>
      </div>
    </div>
  </div>;
}
