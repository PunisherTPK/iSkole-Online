import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubjectCard } from "@/components/Cards";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
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
    description: `Browse levels and subjects for ${curriculum.name} on iSkole Online.`,
  };
}

export default async function CurriculumPage({ params }: Props) {
  const { curriculumSlug } = await params;
  const { catalog, curriculum } = await getCurriculumBySlug(curriculumSlug);

  if (!curriculum) notFound();

  const levels = levelsForCurriculum(catalog, curriculum);

  return (
    <>
      <PageHeader eyebrow="Curriculum" title={curriculum.name} description="Choose a level to continue into subject resources." />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Breadcrumbs items={[{ label: curriculum.name }]} />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {levels.map((level) => (
            <SubjectCard key={level.id} title={level.name} href={pathForLevel(curriculum, level)} description="Open subjects for this level." />
          ))}
        </div>
      </section>
    </>
  );
}
