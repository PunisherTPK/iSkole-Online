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
  question_image_url: string;
  correct_answer: "A" | "B" | "C" | "D" | null;
  marking_scheme: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  display_order: number;
};

type DiscussionVideo = {
  title: string;
  youtube_url: string;
  youtube_video_id: string;
  description: string;
};

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
    .is("deleted_at", null)
    .maybeSingle<QuestionPage>();

  if (pageError || !page) notFound();

  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("id, question_image_url, correct_answer, marking_scheme, explanation, difficulty, display_order")
    .eq("question_page_id", page.id)
    .is("deleted_at", null)
    .order("display_order", { ascending: true })
    .returns<Question[]>();

  if (questionsError) throw new Error(questionsError.message);

  const { data: discussion } = await supabase
    .from("discussion_videos")
    .select("title, youtube_url, youtube_video_id, description")
    .eq("question_page_id", page.id)
    .is("deleted_at", null)
    .maybeSingle<DiscussionVideo>();

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
            {questions.map((question, index) => (
              <QuestionCard key={question.id} question={question} number={index + 1} pageType={page.page_type} />
            ))}
          </div>
        )}

        {discussion && (
          <section className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border p-6">
              <div className="flex items-center gap-2 text-primary">
                <PlayCircle size={20} />
                <h2 className="font-bold text-foreground">Discussion</h2>
              </div>
              <h3 className="mt-2 text-xl font-semibold text-foreground">{discussion.title}</h3>
              {discussion.description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{discussion.description}</p>}
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${discussion.youtube_video_id}`}
                title={discussion.title}
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
  number,
  pageType,
}: {
  question: Question;
  number: number;
  pageType: "mcq" | "structured";
}) {
  const isMcq = pageType === "mcq";

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
        <h2 className="font-bold text-foreground">Question {number}</h2>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize text-muted-foreground">{question.difficulty}</span>
      </div>

      <div className="p-5 sm:p-6">
        <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
          <img src={question.question_image_url} alt={`Question ${number}`} className="block h-auto w-full" />
        </div>

        {isMcq ? (
          <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/20 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Lock size={16} />
              Answer checking will be available with your subscription.
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/20 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Lock size={16} />
              Marking scheme and explanation are available with your subscription.
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
