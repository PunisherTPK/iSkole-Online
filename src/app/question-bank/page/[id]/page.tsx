import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, FileQuestion, Lock, PlayCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type QuestionPage = {
  id: string;
  subject_id: string;
  content_node_id: string | null;
  title: string;
  description: string | null;
  page_type: "mcq" | "structured";
};

type Question = {
  id: string;
  question_page_id: string;
  question_number: number;
  question_type: "mcq" | "structured" | "essay";
  marks: number;
  order_index: number;
  question_image_url: string | null;
};

type DiscussionVideo = {
  youtube_url: string;
};

function getYoutubeVideoId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1);
    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}

export default async function QuestionPageRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: page, error: pageError } = await supabase
    .from("question_pages")
    .select("id, subject_id, content_node_id, title, description, page_type")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle<QuestionPage>();

  if (pageError || !page) notFound();

  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("id, question_page_id, question_number, question_type, marks, order_index, question_image_url")
    .eq("question_page_id", page.id)
    .order("order_index", { ascending: true })
    .returns<Question[]>();

  if (questionsError) throw new Error(questionsError.message);

  const { data: discussion } = await supabase
    .from("question_page_discussions")
    .select("youtube_url")
    .eq("question_page_id", page.id)
    .maybeSingle<DiscussionVideo>();

  const videoId = discussion ? getYoutubeVideoId(discussion.youtube_url) : null;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/question-bank" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft size={16} />
            Back to Question Bank
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <BookOpen size={18} />
            <span>Question Page</span>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize text-muted-foreground">{page.page_type}</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{page.title}</h1>
          {page.description && <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{page.description}</p>}
        </div>

        {questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <FileQuestion size={30} className="mx-auto text-muted-foreground" />
            <h2 className="mt-4 font-semibold text-foreground">No questions yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">This Question Page has not been populated yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {questions.map((question) => (
              <QuestionCard key={question.id} question={question} pageType={page.page_type} />
            ))}
          </div>
        )}

        {videoId && (
          <section className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border p-6">
              <div className="flex items-center gap-2 text-primary">
                <PlayCircle size={20} />
                <h2 className="font-bold text-foreground">Discussion</h2>
              </div>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="Question Page discussion"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function QuestionCard({
  question,
  pageType,
}: {
  question: Question;
  pageType: "mcq" | "structured";
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-foreground">Question {question.question_number}</h2>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {question.marks} {question.marks === 1 ? "mark" : "marks"}
          </span>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize text-muted-foreground">
          {pageType}
        </span>
      </div>

      <div className="p-5 sm:p-6">
        {question.question_image_url ? (
          <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
            <img src={question.question_image_url} alt={`Question ${question.question_number}`} className="block h-auto w-full" />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
            No question image has been uploaded yet.
          </div>
        )}

        <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/20 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Lock size={16} />
            Answers and marking information are not shown yet.
          </div>
        </div>
      </div>
    </article>
  );
}
