import Link from "next/link";
import { ArrowLeft, FileQuestion, Lock, PlayCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getQuestionBankAccess } from "@/lib/access/questionBankAccess";
import QuestionPageInteractive, { type InteractiveQuestion } from "@/components/learning/QuestionPageInteractive";

type QuestionPage = { id: string; subject_id: string; content_node_id: string | null; title: string; description: string | null; page_type: "mcq" | "structured" };
type Question = { id: string; question_number: number; question_type: "mcq" | "structured" | "essay"; marks: number; order_index: number; question_image_url: string | null };
type Answer = { question_id: string; answer_image_url: string | null; answer_text: string | null; correct_option: "A" | "B" | "C" | "D" | null };
type Discussion = { youtube_url: string };
type ContentNode = { id: string; parent_id: string | null };

function getYoutubeVideoId(url: string) { try { const parsed = new URL(url); if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1); if (parsed.hostname.endsWith("youtube.com")) { if (parsed.pathname.startsWith("/embed/")) return parsed.pathname.split("/")[2] ?? null; return parsed.searchParams.get("v"); } return null; } catch { return null; } }

export default async function QuestionPageRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const supabase = await createClient();
  const { data: page, error: pageError } = await supabase.from("question_pages").select("id, subject_id, content_node_id, title, description, page_type").eq("id", id).eq("is_published", true).maybeSingle<QuestionPage>();
  if (pageError || !page) notFound();
  const access = await getQuestionBankAccess(page.subject_id);
  const { data: questions, error: questionsError } = await supabase.from("questions").select("id, question_number, question_type, marks, order_index, question_image_url").eq("question_page_id", page.id).order("order_index", { ascending: true }).returns<Question[]>();
  if (questionsError) throw new Error(questionsError.message);

  let interactiveQuestions: InteractiveQuestion[] = []; let discussion: Discussion | null = null;
  if (access.hasAnswers) {
    const questionIds = questions.map(q => q.id);
    const { data: answers, error: answersError } = questionIds.length ? await supabase.from("question_answers").select("question_id, answer_image_url, answer_text, correct_option").in("question_id", questionIds).returns<Answer[]>() : { data: [], error: null };
    if (answersError) throw new Error(answersError.message);
    const answerMap = new Map((answers ?? []).map(answer => [answer.question_id, answer]));
    interactiveQuestions = questions.map(question => { const answer = answerMap.get(question.id); return { ...question, correct_option: answer?.correct_option ?? null, answer_text: answer?.answer_text ?? null, answer_image_url: answer?.answer_image_url ?? null }; });
    const { data: discussionRow, error: discussionError } = await supabase.from("question_page_discussions").select("youtube_url").eq("question_page_id", page.id).maybeSingle<Discussion>();
    if (discussionError) throw new Error(discussionError.message); discussion = discussionRow;
  }
  const videoId = discussion ? getYoutubeVideoId(discussion.youtube_url) : null;
  let backHref = "/question-bank";
  if (page.content_node_id) {
    const { data: node } = await supabase.from("content_nodes").select("id, parent_id").eq("id", page.content_node_id).maybeSingle<ContentNode>();
    if (node) backHref = `/question-bank?subject=${encodeURIComponent(page.subject_id)}&node=${encodeURIComponent(node.id)}`;
  } else backHref = `/question-bank?subject=${encodeURIComponent(page.subject_id)}`;

  return <main className="min-h-screen bg-background">
    <header className="border-b border-border bg-card"><div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8"><Link href={backHref} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><ArrowLeft size={16} /> Back to Question Bank</Link></div></header>
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">{page.page_type === "mcq" ? "MCQ" : "Structured + Essay"}</span><span className="text-sm text-muted-foreground">Question Page</span></div><h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{page.title}</h1>{page.description && <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{page.description}</p>}</header>
      {!access.hasAnswers && <div className="mb-8 rounded-2xl border border-border bg-card p-5"><div className="flex items-start gap-3"><Lock size={19} className="mt-0.5 shrink-0 text-muted-foreground" /><div><p className="font-semibold text-foreground">Free Question Bank access</p><p className="mt-1 text-sm leading-6 text-muted-foreground">You can view the questions. Answers and discussion videos require access to this subject or Premium.</p></div></div></div>}
      {questions.length === 0 ? <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center"><FileQuestion size={30} className="mx-auto text-muted-foreground" /><h2 className="mt-4 font-semibold text-foreground">No questions yet</h2><p className="mt-2 text-sm text-muted-foreground">This Question Page has not been populated yet.</p></div> : access.hasAnswers ? <QuestionPageInteractive questions={interactiveQuestions} pageType={page.page_type} questionPageId={page.id} /> : <section className="space-y-8">{questions.map(q => <article key={q.id} className="overflow-hidden rounded-2xl border border-border bg-card"><div className="border-b border-border px-5 py-4 sm:px-6"><h2 className="font-bold text-foreground">Question {q.question_number}</h2></div><div className="p-5 sm:p-6">{q.question_image_url ? <div className="overflow-hidden rounded-xl border border-border bg-muted/20"><img src={q.question_image_url} alt={`Question ${q.question_number}`} className="block h-auto w-full" /></div> : <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">No question image has been uploaded yet.</div>}</div></article>)}</section>}
      {access.hasDiscussion && videoId && <section className="mt-10 overflow-hidden rounded-2xl border border-border bg-card"><div className="border-b border-border p-6"><div className="flex items-center gap-2"><PlayCircle size={20} className="text-primary" /><h2 className="font-bold text-foreground">Discussion</h2></div></div><div className="aspect-video w-full bg-black"><iframe className="h-full w-full" src={`https://www.youtube.com/embed/${videoId}`} title="Question Page discussion" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div></section>}
    </div>
  </main>;
}
