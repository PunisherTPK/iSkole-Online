import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/custom/EmptyState";
import { FadeIn } from "@/components/ui/custom/FadeIn";
import { PastPaperCard } from "@/components/ui/custom/ResourceCard";
import { getSubjectBySlugs, pastPapersForSubject, pathForCurriculum, pathForLevel, pathForSubject } from "@/lib/data";
import { ScrollText } from "lucide-react";

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
      <PageHeader
        eyebrow={`${curriculum.name} / ${level.name} / ${subject.name}`}
        title="Past Papers"
        description="Past papers are managed separately from regular resources."
      />
      <PageContainer size="narrow">
        <Breadcrumbs
          items={[
            { label: curriculum.name, href: pathForCurriculum(curriculum) },
            { label: level.name, href: pathForLevel(curriculum, level) },
            { label: subject.name, href: pathForSubject(curriculum, level, subject) },
            { label: "Past Papers" },
          ]}
        />
        {papers.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {papers.map((paper, index) => (
              <FadeIn key={paper.id} delay={index * 0.05}>
                <PastPaperCard paper={paper} />
              </FadeIn>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              icon={ScrollText}
              title="No past papers yet"
              description="Past papers for this subject haven't been uploaded yet."
            />
          </div>
        )}
      </PageContainer>
    </>
  );
}
