"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <p className="text-sm font-bold uppercase tracking-wide text-red-600">Something went wrong</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-950">We could not load this page.</h1>
      <p className="mt-4 text-slate-600">Please try again, or check the Supabase configuration if this keeps happening.</p>
      <button className="mt-8 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white" onClick={reset} type="button">
        Try again
      </button>
    </section>
  );
}
