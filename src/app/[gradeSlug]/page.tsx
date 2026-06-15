import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubjectCard } from "@/components/Cards";
import { PageHeader } from "@/components/PageHeader";
import { getGradeBySlug, pathForSubject, subjectsForGrade } from "@/lib/data";

type Props = {
  params: Promise<{ gradeSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gradeSlug } = await params;
  const { grade } = await getGradeBySlug(gradeSlug);

  if (!grade) return {};

  return {
    title: `${grade.name} Past Papers and Lessons`,
    description: `Browse ${grade.name} subjects, lessons, past papers, answers, and explanations on iSkole Online.`,
    openGraph: {
      title: `${grade.name} Past Papers - iSkole Online`,
      description: `Search ${grade.name} Sri Lankan school question bank content.`,
    },
  };
}

export default async function GradePage({ params }: Props) {
  const { gradeSlug } = await params;
  const { catalog, grade } = await getGradeBySlug(gradeSlug);

  if (!grade) notFound();

  const subjects = subjectsForGrade(catalog, grade);

  return (
    <>
      <PageHeader
        eyebrow="Grade"
        title={`${grade.name} Subjects`}
        description={`Choose a ${grade.name} subject to browse lessons, past papers, answers, and explanations.`}
      />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} title={subject.name} href={pathForSubject(grade, subject)} description="Open lessons and available papers." />
          ))}
        </div>
      </section>
    </>
  );
}
