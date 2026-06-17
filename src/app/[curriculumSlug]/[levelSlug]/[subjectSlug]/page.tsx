import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { ResourceCard } from "@/components/ResourceCard";
import {
  getSubjectBySlugs,
  pathForCurriculum,
  pathForLevel,
  pathForPastPapers,
  resourcesForSubject,
} from "@/lib/data";

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
      <PageHeader eyebrow={`${curriculum.name} / ${level.name}`} title={subject.name} description="Browse resources by type or open dedicated past papers." />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Breadcrumbs
          items={[
            { label: curriculum.name, href: pathForCurriculum(curriculum) },
            { label: level.name, href: pathForLevel(curriculum, level) },
            { label: subject.name },
          ]}
        />
        <div className="mt-6 flex flex-wrap gap-3">
          {regularTypes.map((type) => (
            <a key={type.id} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700" href={`#${type.id}`}>
              {type.name}
            </a>
          ))}
          <Link className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white" href={pathForPastPapers(curriculum, level, subject)}>
            Past Papers
          </Link>
        </div>
        <div className="mt-8 grid gap-8">
          {regularTypes.map((type) => {
            const resources = resourcesForSubject(catalog, subject, type.id);
            return (
              <section key={type.id} id={type.id}>
                <h2 className="text-2xl font-bold text-slate-950">{type.name}</h2>
                <div className="mt-4 grid gap-4">
                  {resources.length ? (
                    resources.map((resource) => <ResourceCard key={resource.id} resource={resource} typeName={type.name} />)
                  ) : (
                    <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">No resources uploaded yet.</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </>
  );
}
