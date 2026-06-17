import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubjectCard } from "@/components/ui/custom/CurriculumCard";
import { FadeIn } from "@/components/ui/custom/FadeIn";
import { getLevelBySlugs, pathForCurriculum, pathForSubject, subjectsForLevel } from "@/lib/data";

type Props = {
  params: Promise<{ curriculumSlug: string; levelSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { curriculumSlug, levelSlug } = await params;
  const { curriculum, level } = await getLevelBySlugs(curriculumSlug, levelSlug);

  if (!curriculum || !level) return {};

  return {
    title: `${curriculum.name}: ${level.name}`,
    description: `Browse subjects under ${curriculum.name} ${level.name}.`,
  };
}

export default async function LevelPage({ params }: Props) {
  const { curriculumSlug, levelSlug } = await params;
  const { catalog, curriculum, level } = await getLevelBySlugs(curriculumSlug, levelSlug);

  if (!curriculum || !level) notFound();

  const subjects = subjectsForLevel(catalog, level);

  return (
    <>
      <PageHeader eyebrow={curriculum.name} title={level.name} description="Choose a subject to view resources and past papers." />
      <PageContainer>
        <Breadcrumbs items={[{ label: curriculum.name, href: pathForCurriculum(curriculum) }, { label: level.name }]} />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject, index) => (
            <FadeIn key={subject.id} delay={index * 0.05}>
              <SubjectCard
                title={subject.name}
                href={pathForSubject(curriculum, level, subject)}
                description="Open notes, videos, topical questions, and past papers."
              />
            </FadeIn>
          ))}
        </div>
      </PageContainer>
    </>
  );
}
