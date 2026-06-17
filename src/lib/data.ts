import { sampleCatalog } from "@/lib/sample-data";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { Catalog, Curriculum, Level, PastPaper, Resource, SearchResult, Subject } from "@/lib/types";

export async function getCatalog(): Promise<Catalog> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) return sampleCatalog;

  const [curriculums, levels, subjects, resourceTypes, resources, pastPapers, teachers, teacherAssignments] = await Promise.all([
    supabase.from("curriculums").select("*").is("deleted_at", null).order("display_order"),
    supabase.from("levels").select("*").is("deleted_at", null).order("display_order"),
    supabase.from("subjects").select("*").is("deleted_at", null).order("display_order"),
    supabase.from("resource_types").select("*").order("name"),
    supabase.from("resources").select("*").is("deleted_at", null).order("display_order"),
    supabase.from("past_papers").select("*").is("deleted_at", null).order("year", { ascending: false }),
    supabase.from("teachers").select("*").is("deleted_at", null).order("name"),
    supabase.from("teacher_assignments").select("*"),
  ]);

  if (
    curriculums.error ||
    levels.error ||
    subjects.error ||
    resourceTypes.error ||
    resources.error ||
    pastPapers.error ||
    teachers.error ||
    teacherAssignments.error
  ) {
    return sampleCatalog;
  }

  return {
    curriculums: (curriculums.data ?? []) as Catalog["curriculums"],
    levels: (levels.data ?? []) as Catalog["levels"],
    subjects: (subjects.data ?? []) as Catalog["subjects"],
    resourceTypes: (resourceTypes.data ?? []) as Catalog["resourceTypes"],
    resources: (resources.data ?? []) as Catalog["resources"],
    pastPapers: (pastPapers.data ?? []) as Catalog["pastPapers"],
    teachers: (teachers.data ?? []) as Catalog["teachers"],
    teacherAssignments: (teacherAssignments.data ?? []) as Catalog["teacherAssignments"],
  };
}

export async function getCurriculumBySlug(curriculumSlug: string) {
  const catalog = await getCatalog();
  return {
    catalog,
    curriculum: catalog.curriculums.find((item) => item.slug === curriculumSlug),
  };
}

export async function getLevelBySlugs(curriculumSlug: string, levelSlug: string) {
  const { catalog, curriculum } = await getCurriculumBySlug(curriculumSlug);
  const level = curriculum
    ? catalog.levels.find((item) => item.curriculum_id === curriculum.id && item.slug === levelSlug)
    : undefined;

  return { catalog, curriculum, level };
}

export async function getSubjectBySlugs(curriculumSlug: string, levelSlug: string, subjectSlug: string) {
  const { catalog, curriculum, level } = await getLevelBySlugs(curriculumSlug, levelSlug);
  const subject = level ? catalog.subjects.find((item) => item.level_id === level.id && item.slug === subjectSlug) : undefined;

  return { catalog, curriculum, level, subject };
}

export function levelsForCurriculum(catalog: Catalog, curriculum: Curriculum) {
  return catalog.levels.filter((item) => item.curriculum_id === curriculum.id).sort(byDisplayOrder);
}

export function subjectsForLevel(catalog: Catalog, level: Level) {
  return catalog.subjects.filter((item) => item.level_id === level.id).sort(byDisplayOrder);
}

export function resourcesForSubject(catalog: Catalog, subject: Subject, resourceTypeId?: string) {
  return catalog.resources
    .filter((item) => item.subject_id === subject.id && (!resourceTypeId || item.resource_type_id === resourceTypeId))
    .sort(byDisplayOrder);
}

export function pastPapersForSubject(catalog: Catalog, subject: Subject) {
  return catalog.pastPapers.filter((item) => item.subject_id === subject.id).sort((a, b) => b.year - a.year || a.display_order - b.display_order);
}

export function pathForCurriculum(curriculum: Curriculum) {
  return `/${curriculum.slug}`;
}

export function pathForLevel(curriculum: Curriculum, level: Level) {
  return `${pathForCurriculum(curriculum)}/${level.slug}`;
}

export function pathForSubject(curriculum: Curriculum, level: Level, subject: Subject) {
  return `${pathForLevel(curriculum, level)}/${subject.slug}`;
}

export function pathForPastPapers(curriculum: Curriculum, level: Level, subject: Subject) {
  return `${pathForSubject(curriculum, level, subject)}/past-papers`;
}

export function searchCatalog(catalog: Catalog, query: string): SearchResult[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return [];

  const results: SearchResult[] = [];

  for (const curriculum of catalog.curriculums) {
    if (matches(normalized, curriculum.name)) {
      results.push({
        title: curriculum.name,
        description: "Browse levels and subjects in this curriculum.",
        href: pathForCurriculum(curriculum),
        type: "Curriculum",
      });
    }
  }

  for (const level of catalog.levels) {
    const curriculum = catalog.curriculums.find((item) => item.id === level.curriculum_id);
    if (curriculum && matches(normalized, `${curriculum.name} ${level.name}`)) {
      results.push({
        title: level.name,
        description: curriculum.name,
        href: pathForLevel(curriculum, level),
        type: "Level",
      });
    }
  }

  for (const subject of catalog.subjects) {
    const context = getSubjectContext(catalog, subject);
    if (context && matches(normalized, `${context.curriculum.name} ${context.level.name} ${subject.name}`)) {
      results.push({
        title: subject.name,
        description: `${context.curriculum.name} > ${context.level.name}`,
        href: pathForSubject(context.curriculum, context.level, subject),
        type: "Subject",
      });
    }
  }

  for (const resource of catalog.resources) {
    const context = getResourceContext(catalog, resource);
    if (context && matches(normalized, `${resource.title} ${resource.description} ${resource.content}`)) {
      results.push({
        title: resource.title,
        description: `${context.curriculum.name} > ${context.level.name} > ${context.subject.name}`,
        href: `${pathForSubject(context.curriculum, context.level, context.subject)}#${resource.id}`,
        type: "Resource",
      });
    }
  }

  for (const paper of catalog.pastPapers) {
    const context = getPastPaperContext(catalog, paper);
    if (context && matches(normalized, `${paper.year} ${paper.session}`)) {
      results.push({
        title: `${paper.year} ${paper.session}`,
        description: `${context.curriculum.name} > ${context.level.name} > ${context.subject.name}`,
        href: pathForPastPapers(context.curriculum, context.level, context.subject),
        type: "Past Paper",
      });
    }
  }

  return results.slice(0, 40);
}

function getSubjectContext(catalog: Catalog, subject: Subject) {
  const level = catalog.levels.find((item) => item.id === subject.level_id);
  const curriculum = level ? catalog.curriculums.find((item) => item.id === level.curriculum_id) : undefined;
  return curriculum && level ? { curriculum, level, subject } : null;
}

function getResourceContext(catalog: Catalog, resource: Resource) {
  const subject = catalog.subjects.find((item) => item.id === resource.subject_id);
  return subject ? getSubjectContext(catalog, subject) : null;
}

function getPastPaperContext(catalog: Catalog, paper: PastPaper) {
  const subject = catalog.subjects.find((item) => item.id === paper.subject_id);
  return subject ? getSubjectContext(catalog, subject) : null;
}

function byDisplayOrder<T extends { display_order: number; name?: string; title?: string }>(a: T, b: T) {
  return a.display_order - b.display_order || (a.name ?? a.title ?? "").localeCompare(b.name ?? b.title ?? "");
}

function matches(query: string, value: string) {
  return value.toLowerCase().includes(query);
}
