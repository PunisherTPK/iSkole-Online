import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/custom/EmptyState";
import { FadeIn } from "@/components/ui/custom/FadeIn";
import { SubjectCard } from "@/components/ui/custom/CurriculumCard";
import { getSubjectBySlugs, pathForCurriculum, pathForLevel, pathForSubject, pathForSubTopic, pathForUnit, subTopicsForTopic } from "@/lib/data";
import { FileQuestion } from "lucide-react";

type Props = { params: Promise<{ curriculumSlug: string; levelSlug: string; subjectSlug: string; unitSlug: string; topicSlug: string }> };

export default async function TopicPage({ params }: Props) {
  const { curriculumSlug, levelSlug, subjectSlug, unitSlug, topicSlug } = await params;
  const { catalog, curriculum, level, subject } = await getSubjectBySlugs(curriculumSlug, levelSlug, subjectSlug);
  const unit = subject ? catalog.units.find((item) => item.subject_id === subject.id && item.slug === unitSlug) : undefined;
  const topic = unit ? catalog.topics.find((item) => item.unit_id === unit.id && item.slug === topicSlug) : undefined;
  if (!curriculum || !level || !subject || !unit || !topic) notFound();

  const subTopics = subTopicsForTopic(catalog, topic);

  return (
    <>
      <PageHeader eyebrow={unit.name} title={topic.name} description={topic.description || "Choose a sub topic to attempt MCQs and watch the discussion."} />
      <PageContainer>
        <Breadcrumbs items={[{ label: curriculum.name, href: pathForCurriculum(curriculum) }, { label: level.name, href: pathForLevel(curriculum, level) }, { label: subject.name, href: pathForSubject(curriculum, level, subject) }, { label: unit.name, href: pathForUnit(curriculum, level, subject, unit) }, { label: topic.name }]} />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {subTopics.map((subTopic, index) => (
            <FadeIn key={subTopic.id} delay={index * 0.05}>
              <SubjectCard title={subTopic.name} href={pathForSubTopic(curriculum, level, subject, unit, topic, subTopic)} description={subTopic.description || "Open MCQs and discussion video."} />
            </FadeIn>
          ))}
        </div>
        {!subTopics.length ? <EmptyState icon={FileQuestion} title="No sub topics yet" description="Sub topics will appear here once a teacher uploads them." /> : null}
      </PageContainer>
    </>
  );
}
