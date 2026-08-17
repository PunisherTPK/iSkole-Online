import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
} from "lucide-react";

export default function ResetPasswordPage() {
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

          <form className="mt-8 space-y-5">
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

            <button
              type="submit"
              className="button-primary h-11 w-full"
            >
              Update Password
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