import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { PastPaperCard } from "@/components/ResourceCard";
import { getSubjectBySlugs, pastPapersForSubject, pathForCurriculum, pathForLevel, pathForSubject } from "@/lib/data";

type Props = {
  params: Promise<{ curriculumSlug: string; levelSlug: string; subjectSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { curriculumSlug, levelSlug, subjectSlug } = await params;
  const { curriculum, level, subject } = await getSubjectBySlugs(curriculumSlug, levelSlug, subjectSlug);

  if (!curriculum || !level || !subject) return {};

  return {
    title: `${subject.name} Past Papers`,
    description: `Past papers and mark schemes for ${curriculum.name} ${level.name} ${subject.name}.`,
  };
}

export default async function PastPapersPage({ params }: Props) {
  const { curriculumSlug, levelSlug, subjectSlug } = await params;
  const { catalog, curriculum, level, subject } = await getSubjectBySlugs(curriculumSlug, levelSlug, subjectSlug);

  if (!curriculum || !level || !subject) notFound();

  const papers = pastPapersForSubject(catalog, subject);

  return (
    <>
      <PageHeader eyebrow={`${curriculum.name} / ${level.name} / ${subject.name}`} title="Past Papers" description="Past papers are managed separately from regular resources." />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Breadcrumbs
          items={[
            { label: curriculum.name, href: pathForCurriculum(curriculum) },
            { label: level.name, href: pathForLevel(curriculum, level) },
            { label: subject.name, href: pathForSubject(curriculum, level, subject) },
            { label: "Past Papers" },
          ]}
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {papers.map((paper) => (
            <PastPaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      </section>
    </>
  );
}
