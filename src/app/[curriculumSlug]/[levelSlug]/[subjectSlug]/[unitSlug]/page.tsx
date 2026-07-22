import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/custom/EmptyState";
import { FadeIn } from "@/components/ui/custom/FadeIn";
import { SubjectCard } from "@/components/ui/custom/CurriculumCard";
import { getSubjectBySlugs, pathForCurriculum, pathForLevel, pathForSubject, pathForTopic, topicsForUnit } from "@/lib/data";
import { FolderOpen } from "lucide-react";

type Props = { params: Promise<{ curriculumSlug: string; levelSlug: string; subjectSlug: string; unitSlug: string }> };

export default async function UnitPage({ params }: Props) {
  const { curriculumSlug, levelSlug, subjectSlug, unitSlug } = await params;
  const { catalog, curriculum, level, subject } = await getSubjectBySlugs(curriculumSlug, levelSlug, subjectSlug);
  const unit = subject ? catalog.units.find((item) => item.subject_id === subject.id && item.slug === unitSlug) : undefined;
  if (!curriculum || !level || !subject || !unit) notFound();

  const topics = topicsForUnit(catalog, unit);

  return (
    <>
      <PageHeader eyebrow={subject.name} title={unit.name} description={unit.description || "Choose a topic to continue."} />
      <PageContainer>
        <Breadcrumbs items={[{ label: curriculum.name, href: pathForCurriculum(curriculum) }, { label: level.name, href: pathForLevel(curriculum, level) }, { label: subject.name, href: pathForSubject(curriculum, level, subject) }, { label: unit.name }]} />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic, index) => (
            <FadeIn key={topic.id} delay={index * 0.05}>
              <SubjectCard title={topic.name} href={pathForTopic(curriculum, level, subject, unit, topic)} description={topic.description || "Open sub topics."} />
            </FadeIn>
          ))}
        </div>
        {!topics.length ? <EmptyState icon={FolderOpen} title="No topics yet" description="Topics will appear here once a teacher uploads them." /> : null}
      </PageContainer>
    </>
  );
}
