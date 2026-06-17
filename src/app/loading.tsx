export default function Loading() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="h-8 w-48 animate-pulse rounded-xl bg-muted/20" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-3xl border border-border bg-card" />
        ))}
      </div>
    </section>
  );
}
