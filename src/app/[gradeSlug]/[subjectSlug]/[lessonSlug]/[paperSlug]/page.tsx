import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { QuestionCard } from "@/components/QuestionCard";
import { getPaperBySlugs, questionsForPaper } from "@/lib/data";

type Props = {
  params: Promise<{ gradeSlug: string; subjectSlug: string; lessonSlug: string; paperSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gradeSlug, subjectSlug, lessonSlug, paperSlug } = await params;
  const { grade, subject, lesson, paper } = await getPaperBySlugs(gradeSlug, subjectSlug, lessonSlug, paperSlug);

  if (!grade || !subject || !lesson || !paper) return {};

  return {
    title: `${paper.title}: ${grade.name} ${subject.name} ${lesson.name}`,
    description: `Practice ${paper.title} questions for ${grade.name} ${subject.name} ${lesson.name}, with answers and explanations.`,
    openGraph: {
      title: `${paper.title} - iSkole Online`,
      description: `Questions, answers, and explanations for ${lesson.name}.`,
    },
  };
}

export default async function PaperPage({ params }: Props) {
  const { gradeSlug, subjectSlug, lessonSlug, paperSlug } = await params;
  const { catalog, grade, subject, lesson, paper } = await getPaperBySlugs(gradeSlug, subjectSlug, lessonSlug, paperSlug);

  if (!grade || !subject || !lesson || !paper) notFound();

  const questions = questionsForPaper(catalog, paper);

  return (
    <>
      <PageHeader
        eyebrow={`${grade.name} / ${subject.name} / ${lesson.name}`}
        title={paper.title}
        description="Read each question, then reveal the answer and explanation when you are ready."
      />
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="grid gap-5">
          {questions.map((question, index) => (
            <QuestionCard key={question.id} question={question} index={index} />
          ))}
        </div>
        <div className="mt-8">
          <Pagination currentPage={1} totalPages={1} />
        </div>
      </section>
    </>
  );
}
