export default function AdminLoading() {
  return (
    <section className="min-h-[calc(100vh-4rem)] bg-background px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="h-9 w-64 animate-pulse rounded-xl bg-muted/20" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-3xl border border-border bg-card" />
          ))}
        </div>
      </div>
    </section>
  );
}
