export default function QuestionBankLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 animate-pulse space-y-3">
          <div className="h-4 w-40 rounded bg-muted" />
          <div className="h-9 w-72 rounded bg-muted" />
          <div className="h-4 w-full max-w-xl rounded bg-muted" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="animate-pulse rounded-2xl border border-border bg-card p-5">
              <div className="h-11 w-11 rounded-xl bg-muted" />
              <div className="mt-5 h-5 w-2/3 rounded bg-muted" />
              <div className="mt-3 h-4 w-full rounded bg-muted" />
              <div className="mt-2 h-4 w-4/5 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
