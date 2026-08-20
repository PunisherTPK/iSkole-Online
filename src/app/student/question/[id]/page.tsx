"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, CircleAlert, Loader2, RotateCcw, Send, Trophy, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Page = {
  id: string;
  title: string;
  description: string | null;
  page_type: string;
  is_published: boolean;
};

type Question = {
  id: string;
  question_number: number | null;
  question_type: string;
  marks: number;
  order_index: number;
  question_image_url: string | null;
};

type Answer = {
  question_id: string;
  answer_image_url: string | null;
  answer_text: string | null;
  correct_option: string | null;
};

type Result = {
  answered: number;
  correct: number;
  earnedMarks: number;
  totalMarks: number;
};

const OPTIONS = ["A", "B", "C", "D"] as const;

export default function StudentQuestionPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const pageId = params.id;

  const [page, setPage] = useState<Page | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace(`/login?next=/student/question/${pageId}`);
        return;
      }

      if (!pageId) {
        setError("Question Page ID is missing.");
        setLoading(false);
        return;
      }

      const { data: pageData, error: pageError } = await supabase
        .from("question_pages")
        .select("id, title, description, page_type, is_published")
        .eq("id", pageId)
        .eq("is_published", true)
        .maybeSingle();

      if (pageError || !pageData) {
        setError(pageError?.message ?? "This Question Page is unavailable.");
        setLoading(false);
        return;
      }

      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .select("id, question_number, question_type, marks, order_index, question_image_url")
        .eq("question_page_id", pageId)
        .order("order_index", { ascending: true });

      if (questionError) {
        setError(questionError.message);
        setLoading(false);
        return;
      }

      const questionRows = (questionData ?? []) as Question[];
      const ids = questionRows.map((question) => question.id);
      let answerRows: Answer[] = [];

      if (ids.length) {
        const { data: answerData, error: answerError } = await supabase
          .from("question_answers")
          .select("question_id, answer_image_url, answer_text, correct_option")
          .in("question_id", ids);

        if (answerError) {
          setError(answerError.message);
          setLoading(false);
          return;
        }

        answerRows = (answerData ?? []) as Answer[];
      }

      setPage(pageData as Page);
      setQuestions(questionRows);
      setAnswers(Object.fromEntries(answerRows.map((answer) => [answer.question_id, answer])));
      setLoading(false);
    }

    void load();
  }, [pageId, router, supabase]);

  function choose(questionId: string, option: string) {
    if (result) return;
    setSelected((current) => ({ ...current, [questionId]: option }));
  }

  async function submit() {
    if (!page || result || submitting) return;

    const unanswered = questions.length - Object.keys(selected).length;
    if (unanswered > 0 && !window.confirm(`You have ${unanswered} unanswered question${unanswered === 1 ? "" : "s"}. Submit anyway?`)) return;

    setSubmitting(true);
    setError("");

    let correct = 0;
    let earnedMarks = 0;

    for (const question of questions) {
      const chosen = selected[question.id];
      const correctOption = answers[question.id]?.correct_option;
      if (chosen && correctOption && chosen.toUpperCase() === correctOption.toUpperCase()) {
        correct += 1;
        earnedMarks += Number(question.marks);
      }
    }

    const totalMarks = questions.reduce((sum, question) => sum + Number(question.marks), 0);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error: sessionError } = await supabase.from("practice_sessions").insert({
        user_id: user.id,
        question_page_id: page.id,
        page_type: page.page_type,
        total_questions: questions.length,
        answered_questions: Object.keys(selected).length,
        correct_questions: correct,
        earned_marks: earnedMarks,
        total_marks: totalMarks,
        completed_at: new Date().toISOString(),
      });

      if (sessionError) {
        setError(`Your result was calculated, but the practice session could not be saved: ${sessionError.message}`);
      }
    }

    setResult({
      answered: Object.keys(selected).length,
      correct,
      earnedMarks,
      totalMarks,
    });
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetAttempt() {
    setSelected({});
    setResult(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) {
    return <div className="space-y-5"><div className="h-24 animate-pulse rounded-2xl bg-muted" /><div className="h-[560px] animate-pulse rounded-2xl bg-muted" /></div>;
  }

  if (!page) {
    return <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">{error || "Question Page not found."}</div>;
  }

  const answeredCount = Object.keys(selected).length;
  const percentage = result && result.totalMarks > 0 ? Math.round((result.earnedMarks / result.totalMarks) * 100) : 0;
  const videoEmbedUrl = getYouTubeEmbedUrl(null);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button type="button" onClick={() => router.back()} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back</button>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Question Page</p>
            {result && <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600">Completed</span>}
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{page.title}</h1>
          {page.description && <p className="mt-2 text-sm text-muted-foreground">{page.description}</p>}
        </div>
      </div>

      {error && <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}

      {result && (
        <section className="overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Trophy className="h-7 w-7" /></div>
            <p className="mt-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">Your Result</p>
            <p className="mt-1 text-4xl font-black tracking-tight">{result.earnedMarks} / {result.totalMarks}</p>
            <p className="mt-1 text-lg font-bold text-primary">{percentage}%</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-semibold"><span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-emerald-600">{result.correct} correct</span><span className="rounded-full bg-muted px-3 py-1.5 text-muted-foreground">{result.answered} answered</span><span className="rounded-full bg-muted px-3 py-1.5 text-muted-foreground">{questions.length - result.answered} unanswered</span></div>
            <button type="button" onClick={resetAttempt} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-muted"><RotateCcw className="h-4 w-4" /> Try Again</button>
          </div>
        </section>
      )}

      <div className="sticky top-3 z-10 rounded-2xl border border-border bg-card/95 p-3 shadow-sm backdrop-blur sm:p-4">
        <div className="flex items-center justify-between gap-4 text-sm"><span className="font-bold">{result ? "Review" : "Progress"}</span><span className="font-semibold text-muted-foreground">{answeredCount} / {questions.length} answered</span></div>
        {!result && <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }} /></div>}
      </div>

      <section className="space-y-5">
        {questions.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">This Question Page has no questions yet.</div>
        ) : questions.map((question, index) => {
          const chosen = selected[question.id];
          const correctOption = answers[question.id]?.correct_option?.toUpperCase();
          const isCorrect = result && chosen && correctOption && chosen.toUpperCase() === correctOption;
          const isIncorrect = result && chosen && correctOption && chosen.toUpperCase() !== correctOption;

          return (
            <article key={question.id} className={`rounded-2xl border bg-card p-4 sm:p-6 ${result ? isCorrect ? "border-emerald-500/30" : isIncorrect ? "border-destructive/30" : "border-border" : "border-border"}`}>
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Question {question.question_number ?? index + 1}</p><h2 className="mt-1 text-lg font-bold">{question.marks} mark{Number(question.marks) === 1 ? "" : "s"}</h2></div>
                {result && (isCorrect ? <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" /> : isIncorrect ? <XCircle className="h-6 w-6 shrink-0 text-destructive" /> : <CircleAlert className="h-6 w-6 shrink-0 text-muted-foreground" />)}
              </div>

              {question.question_image_url ? <img src={question.question_image_url} alt={`Question ${question.question_number ?? index + 1}`} className="mt-5 max-h-[700px] w-full rounded-xl border border-border object-contain" /> : <div className="mt-5 flex h-28 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">Question image unavailable</div>}

              {page.page_type.toLowerCase() === "mcq" && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {OPTIONS.map((option) => {
                    const chosenThis = chosen?.toUpperCase() === option;
                    const correctThis = result && correctOption === option;
                    return <button key={option} type="button" onClick={() => choose(question.id, option)} disabled={Boolean(result)} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${chosenThis ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted/60"} ${correctThis ? "!border-emerald-500/40 !bg-emerald-500/10 !text-emerald-700" : ""} ${result && chosenThis && !correctThis ? "!border-destructive/40 !bg-destructive/5 !text-destructive" : ""}`}><span className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs ${chosenThis ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{option}</span>{option === chosenThis ? "Selected" : `Option ${option}`}</button>;
                  })}
                </div>
              )}

              {result && page.page_type.toLowerCase() === "mcq" && (
                <div className="mt-4 rounded-xl bg-muted/50 p-4 text-sm"><p className="font-semibold">{chosen ? `Your answer: ${chosen}` : "You did not answer this question."}</p>{correctOption && <p className="mt-1 text-muted-foreground">Correct answer: <span className="font-bold text-foreground">{correctOption}</span></p>}{answers[question.id]?.answer_text && <p className="mt-3 whitespace-pre-wrap text-muted-foreground">{answers[question.id].answer_text}</p>}</div>
              )}

              {result && page.page_type.toLowerCase() !== "mcq" && answers[question.id]?.answer_text && <div className="mt-4 rounded-xl bg-muted/50 p-4 text-sm"><p className="font-semibold">Discussion / Explanation</p><p className="mt-2 whitespace-pre-wrap text-muted-foreground">{answers[question.id].answer_text}</p></div>}
            </article>
          );
        })}
      </section>

      {!result && questions.length > 0 && (
        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">Ready to submit?</p><p className="mt-1 text-sm text-muted-foreground">You have answered {answeredCount} of {questions.length} questions.</p></div><button type="button" onClick={() => void submit()} disabled={submitting} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground disabled:opacity-50">{submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="h-4 w-4" /> Submit Answers</>}</button></div>
        </section>
      )}
    </div>
  );
}

function getYouTubeEmbedUrl(url: string | null) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}
