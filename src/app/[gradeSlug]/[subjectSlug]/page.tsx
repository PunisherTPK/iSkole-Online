import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonCard } from "@/components/Cards";
import { PageHeader } from "@/components/PageHeader";
import { getSubjectBySlugs, lessonsForSubject, pathForLesson } from "@/lib/data";

type Props = {
  params: Promise<{ gradeSlug: string; subjectSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gradeSlug, subjectSlug } = await params;
  const { grade, subject } = await getSubjectBySlugs(gradeSlug, subjectSlug);

  if (!grade || !subject) return {};

  return {
    title: `${grade.name} ${subject.name} Lessons`,
    description: `Browse ${grade.name} ${subject.name} lessons, past papers, answers, and explanations.`,
    openGraph: {
      title: `${grade.name} ${subject.name} - iSkole Online`,
      description: `Lesson-based Sri Lankan question bank for ${grade.name} ${subject.name}.`,
    },
  };
}

export default async function SubjectPage({ params }: Props) {
  const { gradeSlug, subjectSlug } = await params;
  const { catalog, grade, subject } = await getSubjectBySlugs(gradeSlug, subjectSlug);

  if (!grade || !subject) notFound();

  const lessons = lessonsForSubject(catalog, subject);

  return (
    <>
      <PageHeader
        eyebrow={`${grade.name} / ${subject.name}`}
        title={`${subject.name} Lessons`}
        description="Pick a lesson to view available papers and practice questions."
      />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              title={lesson.name}
              href={pathForLesson(grade, subject, lesson)}
              description={lesson.description}
            />
          ))}
        </div>
      </section>
    </>
  );
}
