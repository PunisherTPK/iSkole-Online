"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, CircleAlert, Loader2, RotateCcw, Send, Trophy, XCircle, CreditCard } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Page = { id: string; title: string; description: string | null; page_type: string; is_published: boolean; subject_id: string };
type Question = { id: string; question_number: number | null; question_type: string; marks: number; order_index: number; question_image_url: string | null };
type Detail = { question_id: string; question_number: number | null; selected_option: string | null; correct_option: string | null; is_correct: boolean; explanation: string | null; answer_text?: string | null; answer_image_url: string | null };
type Result = { answered: number; correct: number; wrong: number; earnedMarks: number; totalMarks: number; isPaid: boolean; details: Detail[]; youtubeUrl: string | null };
type PracticeUser = { id: string; role: string } | null;
const OPTIONS = ["A", "B", "C", "D"] as const;

export default function StudentQuestionPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const { id: pageId } = useParams<{ id: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [discussionUrl, setDiscussionUrl] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [subjectContext, setSubjectContext] = useState<{ curriculumId: string; levelId: string; subjectId: string } | null>(null);
  const [practiceUser, setPracticeUser] = useState<PracticeUser>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true); setError("");
      if (!pageId) { setError("Question Page ID is missing."); setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
        if (profile?.role === "student") setPracticeUser({ id: user.id, role: profile.role });
      }
      const { data: pageData, error: pageError } = await supabase.from("question_pages").select("id,title,description,page_type,is_published,subject_id").eq("id", pageId).eq("is_published", true).maybeSingle();
      if (pageError || !pageData) { setError(pageError?.message ?? "This Question Page is unavailable."); setLoading(false); return; }
      const { data: questionData, error: questionError } = await supabase.from("questions").select("id,question_number,question_type,marks,order_index,question_image_url").eq("question_page_id", pageId).order("order_index");
      if (questionError) { setError(questionError.message); setLoading(false); return; }

      const { data: discussionData } = await supabase
        .from("question_page_discussions")
        .select("youtube_url")
        .eq("question_page_id", pageId)
        .maybeSingle();
      setDiscussionUrl(discussionData?.youtube_url ?? null);

      const { data: subjectData } = await supabase
        .from("subjects")
        .select("id,level_id,levels!inner(id,curriculum_id)")
        .eq("id", pageData.subject_id)
        .maybeSingle();
      const level = Array.isArray(subjectData?.levels) ? subjectData.levels[0] : subjectData?.levels;
      if (subjectData?.id && level?.id && level?.curriculum_id) {
        const context = { curriculumId: level.curriculum_id as string, levelId: level.id as string, subjectId: subjectData.id as string };
        setSubjectContext(context);
        if (user) {
          const { data: subscriptionRows } = await supabase
            .from("student_subscriptions")
            .select("plan_type,curriculum_id,level_id,subject_id,status,starts_at,ends_at")
            .eq("user_id", user.id)
            .eq("status", "active")
            .lte("starts_at", new Date().toISOString());
          type SubscriptionRow = {
            plan_type: string;
            curriculum_id: string | null;
            level_id: string | null;
            subject_id: string | null;
            status: string;
            starts_at: string | null;
            ends_at: string | null;
          };
          const now = Date.now();
          setHasAccess(((subscriptionRows ?? []) as SubscriptionRow[]).some((sub) => {
            const active = !sub.ends_at || new Date(sub.ends_at).getTime() > now;
            return active && (
              sub.plan_type === "premium" ||
              (sub.plan_type === "subject" && sub.curriculum_id === context.curriculumId && sub.level_id === context.levelId && sub.subject_id === context.subjectId) ||
              (sub.plan_type === "bundle" && sub.curriculum_id === context.curriculumId && sub.level_id === context.levelId)
            );
          }));
        }
      }

      setPage(pageData as Page); setQuestions((questionData ?? []) as Question[]); setLoading(false);
    }
    void load();
  }, [pageId, supabase]);

  async function submit() {
    if (!page || result || submitting || !practiceUser) return;
    const unanswered = questions.length - Object.keys(selected).length;
    if (unanswered > 0 && !window.confirm(`You have ${unanswered} unanswered question${unanswered === 1 ? "" : "s"}. Submit anyway?`)) return;
    setSubmitting(true); setError("");
    const { data, error: submitError } = await supabase.rpc("submit_question_page_practice", { p_question_page_id: page.id, p_answers: selected });
    if (submitError) { setError(submitError.message); setSubmitting(false); return; }
    const raw = data as { answered: number; correct: number; wrong: number; earned_marks: number; total_marks: number; is_paid: boolean; details: Detail[]; youtube_url: string | null };
    let normalizedDetails = (raw.details ?? []).map((detail) => ({ ...detail, explanation: detail.explanation ?? (detail as Detail).answer_text ?? null }));

    if (raw.is_paid) {
      const questionIds = questions.map((question) => question.id);
      const { data: answerData } = await supabase
        .from("question_answers")
        .select("question_id,answer_text,answer_image_url,correct_option")
        .in("question_id", questionIds);

      if (answerData) {
        type AnswerRow = { question_id: string; answer_text: string | null; answer_image_url: string | null; correct_option: string | null };
        const answers = answerData as AnswerRow[];
        const answersByQuestion = new Map(answers.map((answer) => [answer.question_id, answer]));
        normalizedDetails = normalizedDetails.map((detail) => {
          const answer = answersByQuestion.get(detail.question_id);
          return {
            ...detail,
            correct_option: detail.correct_option ?? answer?.correct_option ?? null,
            answer_text: detail.answer_text ?? answer?.answer_text ?? null,
            explanation: detail.explanation ?? detail.answer_text ?? answer?.answer_text ?? null,
            answer_image_url: detail.answer_image_url ?? answer?.answer_image_url ?? null,
          };
        });
      }
    }

    setResult({ answered: raw.answered, correct: raw.correct, wrong: raw.wrong, earnedMarks: Number(raw.earned_marks), totalMarks: Number(raw.total_marks), isPaid: Boolean(raw.is_paid), details: normalizedDetails, youtubeUrl: raw.youtube_url ?? discussionUrl });
    setSubmitting(false); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function choose(questionId: string, option: string) { if (!practiceUser || result) return; setSelected((current) => ({ ...current, [questionId]: option })); }
  function resetAttempt() { setSelected({}); setResult(null); setError(""); window.scrollTo({ top: 0, behavior: "smooth" }); }

  if (loading) return <div className="space-y-5"><div className="h-24 animate-pulse rounded-2xl bg-muted" /><div className="h-[560px] animate-pulse rounded-2xl bg-muted" /></div>;
  if (!page) return <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">{error || "Question Page not found."}</div>;

  const isPublicViewer = !practiceUser;
  const answeredCount = Object.keys(selected).length;
  const percentage = result && result.totalMarks > 0 ? Math.round((result.earnedMarks / result.totalMarks) * 100) : 0;
  const detailMap = Object.fromEntries((result?.details ?? []).map((d) => [d.question_id, d]));

  return (
    <div className="w-full space-y-6 px-4 pb-12 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between gap-4"><div><button type="button" onClick={() => router.push("/question-bank")} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Question Bank</button><p className="text-xs font-bold uppercase tracking-wider text-primary">Question Page</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{page.title}</h1>{page.description && <p className="mt-2 text-sm text-muted-foreground">{page.description}</p>}</div></div>

      {isPublicViewer && <div className="rounded-2xl border border-border bg-muted/40 p-4"><p className="text-sm font-bold">Preview</p><p className="mt-1 text-xs text-muted-foreground">You are viewing this Question Page publicly. Questions are available to everyone; log in as a student to practise.</p></div>}
      {practiceUser && !result && <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold">Practice mode</p><p className="mt-1 text-xs text-muted-foreground">You can practise this paper for free. Subscription unlocks answer-by-answer review, explanations, and discussion videos.</p></div>{!hasAccess && subjectContext && <button type="button" onClick={() => router.push(`/student/payment?plan=subject&curriculumId=${subjectContext.curriculumId}&levelId=${subjectContext.levelId}&subjectId=${subjectContext.subjectId}`)} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"><CreditCard className="h-4 w-4" /> Subscribe</button>}</div></div>}
      {error && <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}

      {result && <section className="overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-8"><div className="flex flex-col items-center text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Trophy className="h-7 w-7" /></div><p className="mt-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">Your Result</p><p className="mt-1 text-4xl font-black">{result.earnedMarks} / {result.totalMarks}</p><p className="mt-1 text-lg font-bold text-primary">{percentage}%</p><div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-semibold"><span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-emerald-600">{result.correct} correct</span><span className="rounded-full bg-destructive/10 px-3 py-1.5 text-destructive">{result.wrong} wrong</span><span className="rounded-full bg-muted px-3 py-1.5 text-muted-foreground">{questions.length - result.answered} unanswered</span></div>{!result.isPaid && <p className="mt-4 max-w-lg text-sm text-muted-foreground">Your score is shown, but answer-by-answer review, correct answers, explanations and discussion videos are available to subscribed students.</p>}<button type="button" onClick={resetAttempt} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-muted"><RotateCcw className="h-4 w-4" /> Try Again</button></div></section>}

      {practiceUser && <div className="sticky top-3 z-10 rounded-2xl border border-border bg-card/95 p-3 shadow-sm backdrop-blur sm:p-4"><div className="flex items-center justify-between gap-4 text-sm"><span className="font-bold">{result ? "Result" : "Progress"}</span><span className="font-semibold text-muted-foreground">{answeredCount} / {questions.length} answered</span></div>{!result && <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }} /></div>}</div>}

      <section className="space-y-5">
        {questions.length === 0 ? <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">This Question Page has no questions yet.</div> : questions.map((question, index) => {
          const chosen = selected[question.id];
          const detail = detailMap[question.id];
          const paidReview = Boolean(result?.isPaid && detail);
          const isCorrect = paidReview && detail.is_correct;
          const isIncorrect = paidReview && !detail.is_correct && Boolean(detail.selected_option);
          return (
            <article key={question.id} className={`rounded-2xl border bg-card p-4 sm:p-6 ${paidReview ? isCorrect ? "border-emerald-500/30" : isIncorrect ? "border-destructive/30" : "border-border" : "border-border"}`}>
              <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">Question {question.question_number ?? index + 1}</p><h2 className="mt-1 text-lg font-bold">{question.marks} mark{Number(question.marks) === 1 ? "" : "s"}</h2></div>{paidReview && (isCorrect ? <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" /> : isIncorrect ? <XCircle className="h-6 w-6 shrink-0 text-destructive" /> : <CircleAlert className="h-6 w-6 shrink-0 text-muted-foreground" />)}</div>
              {question.question_image_url ? <Image src={question.question_image_url} alt={`Question ${question.question_number ?? index + 1}`} width={1200} height={900} sizes="(max-width: 768px) 100vw, 896px" className="mt-5 max-h-[700px] w-full rounded-xl border border-border object-contain" /> : <div className="mt-5 flex h-28 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">Question image unavailable</div>}
              {page.page_type.toLowerCase() === "mcq" && practiceUser && <div className="mt-5 grid gap-3 sm:grid-cols-2">{OPTIONS.map((option) => { const chosenThis = chosen?.toUpperCase() === option; const correctThis = paidReview && detail.correct_option?.toUpperCase() === option; return <button key={option} type="button" onClick={() => choose(question.id, option)} disabled={Boolean(result)} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${chosenThis ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted/60"} ${correctThis ? "!border-emerald-500/40 !bg-emerald-500/10 !text-emerald-700" : ""} ${paidReview && chosenThis && !correctThis ? "!border-destructive/40 !bg-destructive/5 !text-destructive" : ""}`}><span className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs ${chosenThis ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{option}</span>{chosenThis ? "Selected" : `Option ${option}`}</button>; })}</div>}
              {paidReview && page.page_type.toLowerCase() === "mcq" && <div className="mt-4 rounded-xl bg-muted/50 p-4 text-sm"><p className="font-semibold">{detail.selected_option ? `Your answer: ${detail.selected_option}` : "You did not answer this question."}</p>{detail.correct_option && <p className="mt-1 text-muted-foreground">Correct answer: <span className="font-bold text-foreground">{detail.correct_option}</span></p>}{(detail.explanation ?? detail.answer_text) && <p className="mt-3 whitespace-pre-wrap text-muted-foreground">{detail.explanation ?? detail.answer_text}</p>}{detail.answer_image_url && <Image src={detail.answer_image_url} alt="Answer explanation" width={1000} height={750} sizes="(max-width: 768px) 100vw, 896px" className="mt-3 max-h-[600px] w-full rounded-xl border border-border object-contain" />}</div>}
            </article>
          );
        })}
      </section>

      {practiceUser && !result && questions.length > 0 && <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">Ready to submit?</p><p className="mt-1 text-sm text-muted-foreground">You have answered {answeredCount} of {questions.length} questions.</p></div><button type="button" onClick={() => void submit()} disabled={submitting} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground disabled:opacity-50">{submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="h-4 w-4" /> Submit Answers</>}</button></div></section>}

      {result?.isPaid && (result.youtubeUrl ?? discussionUrl) && <section className="rounded-2xl border border-border bg-card p-5 sm:p-6"><p className="font-bold">Discussion Video</p><div className="mt-4 aspect-video overflow-hidden rounded-xl"><iframe src={getYouTubeEmbedUrl(result.youtubeUrl ?? discussionUrl) ?? undefined} title="Discussion video" className="h-full w-full" allowFullScreen /></div></section>}
    </div>
  );
}

function getYouTubeEmbedUrl(url: string | null) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) { const id = parsed.pathname.slice(1); return id ? `https://www.youtube.com/embed/${id}` : null; }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts[0] === "shorts" && parts[1]) return `https://www.youtube.com/embed/${parts[1]}`;
      if (parts[0] === "embed" && parts[1]) return `https://www.youtube.com/embed/${parts[1]}`;
    }
    return null;
  } catch { return null; }
}
