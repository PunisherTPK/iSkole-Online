"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
} from "lucide-react";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setMessage("Your password has been updated successfully. You can now sign in with your new password.");
      setPassword("");
      setConfirmPassword("");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update your password. Please request a new reset link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-10 h-[28rem] w-[28rem] rounded-full bg-violet-200/20 blur-3xl"
      />

      <div className="container-site relative flex min-h-[calc(100vh-64px)] items-center justify-center py-12">
        <div className="w-full max-w-md rounded-[2rem] border border-border bg-card p-6 shadow-soft sm:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LockKeyhole className="h-5 w-5" />
          </div>

          <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            New password
          </p>

          <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-foreground">
            Create a new password
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Choose a strong password you haven&apos;t used elsewhere.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                New password
              </label>

              <div className="relative">
                <LockKeyhole
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter your new password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Confirm password
              </label>

              <div className="relative">
                <LockKeyhole
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Confirm your new password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/50 p-4">
              <p className="text-xs font-semibold text-foreground">
                Password requirements
              </p>

              <ul className="mt-2 space-y-1.5 text-[11px] text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  At least 8 characters
                </li>

                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  Avoid common or easily guessed passwords
                </li>
              </ul>
            </div>

            {message && <div role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm leading-5 text-emerald-700">{message}</div>}
            {error && <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-5 text-destructive">{error}</div>}
            <button type="submit" disabled={loading} className="button-primary h-11 w-full disabled:pointer-events-none disabled:opacity-60">
              {loading ? "Updating..." : "Update Password"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <Link
            href="/login"
            className="mt-7 inline-flex w-full items-center justify-center text-sm font-bold text-muted-foreground transition hover:text-primary"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}