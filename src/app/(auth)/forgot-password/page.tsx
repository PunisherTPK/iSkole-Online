"use client";

"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: "https://www.iskole.online/auth/callback?next=/reset-password" },
      );

      if (resetError) throw resetError;
      setMessage("If an account exists for that email address, you will receive a password reset link shortly.");
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Unable to send the reset link. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-violet-200/20 blur-3xl"
      />

      <div className="container-site relative flex min-h-[calc(100vh-64px)] items-center justify-center py-12">
        <div className="w-full max-w-md rounded-[2rem] border border-border bg-card p-6 shadow-soft sm:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Mail className="h-5 w-5" />
          </div>

          <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Account recovery
          </p>

          <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-foreground">
            Forgot your password?
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Enter the email address associated with your account and we&apos;ll
            send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </div>

            {message && <div role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm leading-5 text-emerald-700">{message}</div>}
            {error && <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-5 text-destructive">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="button-primary h-11 w-full disabled:pointer-events-none disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 rounded-xl border border-primary/10 bg-primary/[0.035] p-4">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

              <p className="text-xs leading-5 text-muted-foreground">
                If an account exists for that email address, you&apos;ll
                receive instructions to reset your password.
              </p>
            </div>
          </div>

          <Link
            href="/login"
            className="mt-7 inline-flex w-full items-center justify-center gap-2 text-sm font-bold text-muted-foreground transition hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}