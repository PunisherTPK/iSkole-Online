import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/custom/EmptyState";
import { FadeIn } from "@/components/ui/custom/FadeIn";
import { SubjectCard } from "@/components/ui/custom/CurriculumCard";
import { getSubjectBySlugs, pathForCurriculum, pathForLevel, pathForUnit, unitsForSubject } from "@/lib/data";
import { FolderOpen } from "lucide-react";

type Props = {
  params: Promise<{ curriculumSlug: string; levelSlug: string; subjectSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { curriculumSlug, levelSlug, subjectSlug } = await params;
  const { curriculum, level, subject } = await getSubjectBySlugs(curriculumSlug, levelSlug, subjectSlug);
  if (!curriculum || !level || !subject) return {};
  return {
    title: `${curriculum.name} ${level.name}: ${subject.name}`,
    description: `Browse units, topics, MCQs, and discussion videos for ${subject.name}.`,
  };
}

export default async function SubjectPage({ params }: Props) {
  const { curriculumSlug, levelSlug, subjectSlug } = await params;
  const { catalog, curriculum, level, subject } = await getSubjectBySlugs(curriculumSlug, levelSlug, subjectSlug);
  if (!curriculum || !level || !subject) notFound();

  const units = unitsForSubject(catalog, subject);

  return (
    <>
      <PageHeader eyebrow={`${curriculum.name} / ${level.name}`} title={subject.name} description="Choose a unit to continue into topical MCQs and discussion videos." />
      <PageContainer>
        <Breadcrumbs items={[{ label: curriculum.name, href: pathForCurriculum(curriculum) }, { label: level.name, href: pathForLevel(curriculum, level) }, { label: subject.name }]} />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {units.map((unit, index) => (
            <FadeIn key={unit.id} delay={index * 0.05}>
              <SubjectCard title={unit.name} href={pathForUnit(curriculum, level, subject, unit)} description={unit.description || "Open topics for this unit."} />
            </FadeIn>
          ))}
        </div>
        {!units.length ? <EmptyState icon={FolderOpen} title="No units yet" description="Units will appear here once a teacher uploads the structure." /> : null}
      </PageContainer>
    </>
  );
}
