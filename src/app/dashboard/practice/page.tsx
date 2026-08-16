import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock3, History, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type Session = {
  id: string;
  question_page_id: string;
  page_type: "mcq" | "structured";
  total_questions: number;
  answered_questions: number;
  correct_questions: number;
  earned_marks: number;
  total_marks: number;
  completed_at: string;
};

type PageRow = { id: string; title: string };

export default async function PracticeHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: sessions, error } = await supabase
    .from("practice_sessions")
    .select("id, question_page_id, page_type, total_questions, answered_questions, correct_questions, earned_marks, total_marks, completed_at")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(50)
    .returns<Session[]>();

  if (error) throw new Error(error.message);

  const pageIds = [...new Set((sessions ?? []).map((session) => session.question_page_id))];
  const { data: pages, error: pagesError } = pageIds.length
    ? await supabase.from("question_pages").select("id, title").in("id", pageIds).returns<PageRow[]>()
    : { data: [], error: null };

  if (pagesError) throw new Error(pagesError.message);

  const pageMap = new Map((pages ?? []).map((page) => [page.id, page.title]));

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <header className="mt-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <History size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Learning progress</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Practice History</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Review your completed practice sessions and scores.</p>
            </div>
          </div>
        </header>

        {(sessions ?? []).length === 0 ? (
          <section className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <Target size={32} className="mx-auto text-muted-foreground" />
            <h2 className="mt-4 font-semibold text-foreground">No practice sessions yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Complete a Question Page practice session and it will appear here.</p>
            <Link href="/question-bank" className="mt-5 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Browse Question Bank</Link>
          </section>
        ) : (
          <section className="space-y-4">
            {(sessions ?? []).map((session) => {
              const percentage = Number(session.total_marks) > 0 ? Math.round((Number(session.earned_marks) / Number(session.total_marks)) * 100) : 0;
              return (
                <Link
                  key={session.id}
                  href={`/dashboard/practice/${session.id}`}
                  className="group block rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">{session.page_type === "mcq" ? "MCQ" : "Structured"}</span>
                        <span className="text-xs text-muted-foreground">{new Date(session.completed_at).toLocaleString()}</span>
                      </div>
                      <h2 className="mt-3 truncate text-lg font-bold text-foreground">{pageMap.get(session.question_page_id) ?? "Question Page"}</h2>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                        <span>{session.correct_questions} correct</span>
                        <span>{session.answered_questions}/{session.total_questions} answered</span>
                        <span>{session.earned_marks}/{session.total_marks} marks</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:shrink-0">
                      <div className="text-right">
                        <p className="text-3xl font-bold text-foreground">{percentage}%</p>
                        <p className="text-xs font-semibold text-muted-foreground">Score</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 transition group-hover:scale-105 dark:text-emerald-400">
                        <CheckCircle2 size={22} />
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-primary">Open review →</p>
                </Link>
              );
            })}
          </section>
        )}

        <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock3 size={16} /> Showing your 50 most recent practice sessions.
        </div>
      </div>
    </main>
  );
}
