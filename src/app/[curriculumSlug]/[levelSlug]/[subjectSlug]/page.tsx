import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/custom/EmptyState";
import { FadeIn } from "@/components/ui/custom/FadeIn";
import { ResourceCard } from "@/components/ui/custom/ResourceCard";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/custom/SectionHeader";
import {
  getSubjectBySlugs,
  pathForCurriculum,
  pathForLevel,
  pathForPastPapers,
  resourcesForSubject,
} from "@/lib/data";
import { FileText } from "lucide-react";

type Props = {
  params: Promise<{ curriculumSlug: string; levelSlug: string; subjectSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { curriculumSlug, levelSlug, subjectSlug } = await params;
  const { curriculum, level, subject } = await getSubjectBySlugs(curriculumSlug, levelSlug, subjectSlug);

  if (!curriculum || !level || !subject) return {};

  return {
    title: `${curriculum.name} ${level.name}: ${subject.name}`,
    description: `Browse resources and past papers for ${subject.name}.`,
  };
}

export default async function SubjectPage({ params }: Props) {
  const { curriculumSlug, levelSlug, subjectSlug } = await params;
  const { catalog, curriculum, level, subject } = await getSubjectBySlugs(curriculumSlug, levelSlug, subjectSlug);

  if (!curriculum || !level || !subject) notFound();

  const regularTypes = catalog.resourceTypes.filter((type) => type.name !== "Past Papers");

  return (
    <>
      <PageHeader
        eyebrow={`${curriculum.name} / ${level.name}`}
        title={subject.name}
        description="Browse resources by type or open dedicated past papers."
      />
      <PageContainer>
        <Breadcrumbs
          items={[
            { label: curriculum.name, href: pathForCurriculum(curriculum) },
            { label: level.name, href: pathForLevel(curriculum, level) },
            { label: subject.name },
          ]}
        />
        <div className="mt-8 flex flex-wrap gap-3">
          {regularTypes.map((type) => (
            <Button key={type.id} variant="outline" asChild className="rounded-xl">
              <a href={`#${type.id}`}>{type.name}</a>
            </Button>
          ))}
          <Button asChild className="rounded-xl">
            <Link href={pathForPastPapers(curriculum, level, subject)}>Past Papers</Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-12">
          {regularTypes.map((type, typeIndex) => {
            const resources = resourcesForSubject(catalog, subject, type.id);
            return (
              <FadeIn key={type.id} delay={typeIndex * 0.05}>
                <section id={type.id}>
                  <SectionHeader title={type.name} />
                  <div className="grid gap-5">
                    {resources.length ? (
                      resources.map((resource) => (
                        <ResourceCard key={resource.id} resource={resource} typeName={type.name} />
                      ))
                    ) : (
                      <EmptyState
                        icon={FileText}
                        title="No resources uploaded yet"
                        description={`There are no ${type.name.toLowerCase()} for this subject yet. Check back soon.`}
                      />
                    )}
                  </div>
                </section>
              </FadeIn>
            );
          })}
        </div>
      </PageContainer>
    </>
  );
}
