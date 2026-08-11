import Link from "next/link";
import { ArrowLeft, FileQuestion, Lock } from "lucide-react";
import { notFound } from "next/navigation";
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
  question_number: number;
  question_type: "mcq" | "structured" | "essay";
  marks: number;
  order_index: number;
  question_image_url: string | null;
};

export default async function QuestionPageRoute({ params }: { params: Promise<{ id: string }> }) {
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
    .select("id, question_number, question_type, marks, order_index, question_image_url")
    .eq("question_page_id", page.id)
    .order("order_index", { ascending: true })
    .returns<Question[]>();

  if (questionsError) throw new Error(questionsError.message);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/question-bank" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft size={16} /> Back to Question Bank
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              {page.page_type === "mcq" ? "MCQ" : "Structured + Essay"}
            </span>
            <span className="text-sm text-muted-foreground">Question Page</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{page.title}</h1>
          {page.description && <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{page.description}</p>}
        </header>

        {questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <FileQuestion size={30} className="mx-auto text-muted-foreground" />
            <h2 className="mt-4 font-semibold text-foreground">No questions yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">This Question Page has not been populated yet.</p>
          </div>
        ) : (
          <section className="space-y-8">
            {questions.map((question) => (
              <QuestionCard key={question.id} question={question} pageType={page.page_type} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function QuestionCard({ question, pageType }: { question: Question; pageType: "mcq" | "structured" }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <h2 className="font-bold text-foreground">Question {question.question_number}</h2>
        <p className="mt-1 text-xs capitalize text-muted-foreground">
          {question.question_type === "essay" ? "Essay" : pageType === "mcq" ? "Multiple Choice" : "Structured"}
        </p>
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
          <div className="flex items-start gap-3">
            <Lock size={18} className="mt-0.5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">Answer features are locked</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Answers, marking information, practice and discussion videos will be available according to the student&apos;s subscription.
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
