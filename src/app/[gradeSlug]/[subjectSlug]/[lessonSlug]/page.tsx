import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { getLessonBySlugs, papersForLesson, pathForPaper } from "@/lib/data";

type Props = {
  params: Promise<{ gradeSlug: string; subjectSlug: string; lessonSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gradeSlug, subjectSlug, lessonSlug } = await params;
  const { grade, subject, lesson } = await getLessonBySlugs(gradeSlug, subjectSlug, lessonSlug);

  if (!grade || !subject || !lesson) return {};

  return {
    title: `${grade.name} ${subject.name}: ${lesson.name}`,
    description: lesson.description,
    openGraph: {
      title: `${lesson.name} Papers and Questions - iSkole Online`,
      description: lesson.description,
    },
  };
}

export default async function LessonPage({ params }: Props) {
  const { gradeSlug, subjectSlug, lessonSlug } = await params;
  const { catalog, grade, subject, lesson } = await getLessonBySlugs(gradeSlug, subjectSlug, lessonSlug);

  if (!grade || !subject || !lesson) notFound();

  const papers = papersForLesson(catalog, lesson);

  return (
    <>
      <PageHeader eyebrow={`${grade.name} / ${subject.name}`} title={lesson.name} description={lesson.description} />
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-950">Available Papers</h2>
        <div className="mt-5 grid gap-3">
          {papers.map((paper) => (
            <Link
              key={paper.id}
              href={pathForPaper(grade, subject, lesson, paper)}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-soft"
            >
              <span>
                <span className="block text-lg font-bold text-slate-900">{paper.title}</span>
                <span className="mt-1 block text-sm text-slate-500">{paper.year} paper with answers and explanations</span>
              </span>
              <span className="text-sm font-semibold text-blue-600">Open</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
