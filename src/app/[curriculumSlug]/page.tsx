import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { LevelCard } from "@/components/ui/custom/CurriculumCard";
import { FadeIn } from "@/components/ui/custom/FadeIn";
import { getCurriculumBySlug, levelsForCurriculum, pathForLevel } from "@/lib/data";

type Props = {
  params: Promise<{ curriculumSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { curriculumSlug } = await params;
  const { curriculum } = await getCurriculumBySlug(curriculumSlug);

  if (!curriculum) return {};

  return {
    title: `${curriculum.name} Levels`,
    description: `Browse levels, subjects, topical questions, and discussion videos for ${curriculum.name}.`,
  };
}

export default async function CurriculumPage({ params }: Props) {
  const { curriculumSlug } = await params;
  const { catalog, curriculum } = await getCurriculumBySlug(curriculumSlug);

  if (!curriculum) notFound();

  const levels = levelsForCurriculum(catalog, curriculum);

  return (
    <>
      <PageHeader eyebrow="Curriculum" title={curriculum.name} description="Choose a level to continue into subjects, units, and topical question sets." />
      <PageContainer>
        <Breadcrumbs items={[{ label: curriculum.name }]} />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {levels.map((level, index) => (
            <FadeIn key={level.id} delay={index * 0.05}>
              <LevelCard title={level.name} href={pathForLevel(curriculum, level)} description="Open subjects for this level." />
            </FadeIn>
          ))}
        </div>
      </PageContainer>
    </>
  );
}
