"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-destructive">Something went wrong</p>
      <h1 className="mt-3 text-3xl font-bold text-foreground">We could not load this page.</h1>
      <p className="mt-4 text-muted-foreground">Please try again, or check the Supabase configuration if this keeps happening.</p>
      <Button className="mt-8 rounded-xl" onClick={reset} type="button">
        Try again
      </Button>
    </section>
  );
}
