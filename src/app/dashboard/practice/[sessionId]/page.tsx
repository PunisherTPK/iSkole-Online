import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleX, Clock3, History, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

interface Session {
  id: string;
  question_page_id: string;
  page_type: "mcq" | "structured";
  total_questions: number;
  answered_questions: number;
  correct_questions: number;
  earned_marks: number;
  total_marks: number;
  completed_at: string;
}

interface Attempt {
  id: string;
  question_id: string;
  selected_option: string | null;
  is_correct: boolean;
  earned_marks: number;
}

interface Question {
  id: string;
  question_number: number | null;
  question_type: string;
  marks: number;
  order_index: number;
  question_image_url: string;
}

interface Answer {
  question_id: string;
  answer_image_url: string | null;
  answer_text: string | null;
  correct_option: string | null;
}

export default async function PracticeReviewPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: session, error: sessionError } = await supabase
    .from("practice_sessions")
    .select(
      "id, question_page_id, page_type, total_questions, answered_questions, correct_questions, earned_marks, total_marks, completed_at"
    )
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle<Session>();

  if (sessionError) throw new Error(sessionError.message);

  if (!session) {
    return (
      <main className="min-h-[calc(100vh-5rem)] bg-background">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/practice"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft size={16} /> Back to Practice History
          </Link>
          <section className="mt-8 rounded-2xl border border-border bg-card p-10 text-center">
            <h1 className="text-2xl font-bold text-foreground">Practice session not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This session may have been removed or you may not have access to it.
            </p>
          </section>
        </div>
      </main>
    );
  }

  const [{ data: attempts, error: attemptsError }, { data: page, error: pageError }] = await Promise.all([
    supabase
      .from("practice_attempts")
      .select("id, question_id, selected_option, is_correct, earned_marks")
      .eq("session_id", session.id)
      .order("created_at", { ascending: true })
      .returns<Attempt[]>(),
    supabase
      .from("question_pages")
      .select("title, description")
      .eq("id", session.question_page_id)
      .maybeSingle<{ title: string; description: string }>(),
  ]);

  if (attemptsError) throw new Error(attemptsError.message);
  if (pageError) throw new Error(pageError.message);

  const attemptRows = attempts ?? [];
  const questionIds = [...new Set(attemptRows.map((attempt) => attempt.question_id))];

  const { data: questions, error: questionsError } = questionIds.length
    ? await supabase
        .from("questions")
        .select("id, question_number, question_type, marks, order_index, question_image_url")
        .in("id", questionIds)
        .order("order_index", { ascending: true })
        .returns<Question[]>()
    : { data: [], error: null };

  if (questionsError) throw new Error(questionsError.message);

  // Correct answers are subscription-protected in Supabase. If access is not
  // available, the review still shows the student's result without exposing answers.
  const { data: answers, error: answersError } = questionIds.length
    ? await supabase
        .from("question_answers")
        .select("question_id, answer_image_url, answer_text, correct_option")
        .in("question_id", questionIds)
        .returns<Answer[]>()
    : { data: [], error: null };

  if (answersError) {
    // RLS can intentionally return no answer rows for users without answer access.
    // The review remains useful, so do not fail the whole page.
  }

  const questionMap = new Map((questions ?? []).map((question) => [question.id, question]));
  const answerMap = new Map((answers ?? []).map((answer) => [answer.question_id, answer]));
  const attemptMap = new Map(attemptRows.map((attempt) => [attempt.question_id, attempt]));
  const orderedQuestions = [...(questions ?? [])].sort((a, b) => a.order_index - b.order_index);
  const percentage = Number(session.total_marks) > 0
    ? Math.round((Number(session.earned_marks) / Number(session.total_marks)) * 100)
    : 0;

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/practice"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft size={16} /> Back to Practice History
        </Link>

        <header className="mt-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Practice review</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {page?.title ?? "Practice Session"}
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {page?.description || "Review your answers, marks and performance."}
              </p>
            </div>
            <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              {session.page_type === "mcq" ? "MCQ" : "Structured"}
            </span>
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<Trophy size={19} />} label="Score" value={`${percentage}%`} />
          <StatCard icon={<CheckCircle2 size={19} />} label="Correct" value={`${session.correct_questions}/${session.total_questions}`} />
          <StatCard icon={<History size={19} />} label="Marks" value={`${session.earned_marks}/${session.total_marks}`} />
          <StatCard icon={<Clock3 size={19} />} label="Completed" value={new Date(session.completed_at).toLocaleDateString()} />
        </section>

        <section className="mt-8 space-y-5">
          {orderedQuestions.map((question, index) => {
            const attempt = attemptMap.get(question.id);
            const answer = answerMap.get(question.id);
            const isCorrect = attempt?.is_correct === true;
            const hasAttempt = Boolean(attempt);
            const selected = attempt?.selected_option?.toUpperCase() || null;
            const correct = answer?.correct_option?.toUpperCase() || null;

            return (
              <article key={question.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-sm font-bold text-foreground">
                      {question.question_number ?? index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Question {question.question_number ?? index + 1}
                      </p>
                      <p className="text-xs text-muted-foreground">{question.marks} mark{Number(question.marks) === 1 ? "" : "s"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={14} /> Correct
                      </span>
                    ) : hasAttempt ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600 dark:text-red-400">
                        <CircleX size={14} /> Incorrect
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">Not answered</span>
                    )}
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  {question.question_image_url && (
                    <div className="rounded-xl border border-border bg-background p-3">
                      <img
                        src={question.question_image_url}
                        alt={`Question ${question.question_number ?? index + 1}`}
                        className="mx-auto max-h-[520px] max-w-full rounded-lg object-contain"
                      />
                    </div>
                  )}

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <ResultBox
                      label="Your answer"
                      value={selected ?? "Not answered"}
                      tone={isCorrect ? "success" : hasAttempt ? "danger" : "neutral"}
                    />
                    <ResultBox
                      label="Correct answer"
                      value={correct ?? "Answer unavailable"}
                      tone={correct ? "success" : "neutral"}
                    />
                    <ResultBox
                      label="Marks earned"
                      value={`${attempt?.earned_marks ?? 0} / ${question.marks}`}
                      tone={isCorrect ? "success" : "neutral"}
                    />
                    <ResultBox
                      label="Question type"
                      value={question.question_type || (session.page_type === "mcq" ? "MCQ" : "Structured")}
                      tone="neutral"
                    />
                  </div>

                  {(answer?.answer_text || answer?.answer_image_url) && (
                    <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Answer / explanation</p>
                      {answer.answer_text && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">{answer.answer_text}</p>}
                      {answer.answer_image_url && (
                        <img
                          src={answer.answer_image_url}
                          alt="Answer explanation"
                          className="mt-3 max-h-[500px] max-w-full rounded-lg object-contain"
                        />
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        <div className="mt-8 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          <strong className="text-foreground">Session completed:</strong>{" "}
          {new Date(session.completed_at).toLocaleString()} · {session.answered_questions}/{session.total_questions} questions answered.
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3 text-primary">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">{icon}</div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      </div>
      <p className="mt-4 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function ResultBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "danger" | "neutral";
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-500/20 bg-emerald-500/5"
      : tone === "danger"
        ? "border-red-500/20 bg-red-500/5"
        : "border-border bg-muted/30";

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}
