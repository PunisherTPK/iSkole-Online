import { sampleCatalog } from "@/lib/sample-data";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type {
  Catalog,
  Curriculum,
  Level,
  QuestionSet,
  SearchResult,
  Subject,
  SubTopic,
  Teacher,
  Topic,
  Unit,
} from "@/lib/types";

export async function getCatalog(): Promise<Catalog> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) return sampleCatalog;

  const [
    profiles,
    curriculums,
    levels,
    subjects,
    units,
    topics,
    subTopics,
    teachers,
    teacherAssignments,
    questionSets,
    mcqQuestions,
    discussionVideos,
  ] = await Promise.all([
    supabase.from("profiles").select("*"),
    supabase.from("curriculums").select("*").is("deleted_at", null).order("display_order"),
    supabase.from("levels").select("*").is("deleted_at", null).order("display_order"),
    supabase.from("subjects").select("*").is("deleted_at", null).order("display_order"),
    supabase.from("units").select("*").is("deleted_at", null).order("display_order"),
    supabase.from("topics").select("*").is("deleted_at", null).order("display_order"),
    supabase.from("sub_topics").select("*").is("deleted_at", null).order("display_order"),
    supabase.from("teachers").select("*").is("deleted_at", null).order("name"),
    supabase.from("teacher_assignments").select("*"),
    supabase.from("question_sets").select("*").is("deleted_at", null).order("display_order"),
    supabase.from("mcq_questions").select("*").is("deleted_at", null).order("display_order"),
    supabase.from("discussion_videos").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
  ]);

  const queries = [
    profiles,
    curriculums,
    levels,
    subjects,
    units,
    topics,
    subTopics,
    teachers,
    teacherAssignments,
    questionSets,
    mcqQuestions,
    discussionVideos,
  ];

  if (queries.some((query) => query.error)) return sampleCatalog;

  return {
    profiles: (profiles.data ?? []) as Catalog["profiles"],
    curriculums: (curriculums.data ?? []) as Catalog["curriculums"],
    levels: (levels.data ?? []) as Catalog["levels"],
    subjects: (subjects.data ?? []) as Catalog["subjects"],
    units: (units.data ?? []) as Catalog["units"],
    topics: (topics.data ?? []) as Catalog["topics"],
    subTopics: (subTopics.data ?? []) as Catalog["subTopics"],
    teachers: normalizeTeachers((teachers.data ?? []) as Catalog["teachers"]),
    teacherAssignments: (teacherAssignments.data ?? []) as Catalog["teacherAssignments"],
    questionSets: (questionSets.data ?? []) as Catalog["questionSets"],
    mcqQuestions: (mcqQuestions.data ?? []) as Catalog["mcqQuestions"],
    discussionVideos: (discussionVideos.data ?? []) as Catalog["discussionVideos"],
  };
}

export async function getCurriculumBySlug(curriculumSlug: string) {
  const catalog = await getCatalog();
  return { catalog, curriculum: catalog.curriculums.find((item) => item.slug === curriculumSlug) };
}

export async function getLevelBySlugs(curriculumSlug: string, levelSlug: string) {
  const { catalog, curriculum } = await getCurriculumBySlug(curriculumSlug);
  const level = curriculum ? catalog.levels.find((item) => item.curriculum_id === curriculum.id && item.slug === levelSlug) : undefined;
  return { catalog, curriculum, level };
}

export async function getSubjectBySlugs(curriculumSlug: string, levelSlug: string, subjectSlug: string) {
  const { catalog, curriculum, level } = await getLevelBySlugs(curriculumSlug, levelSlug);
  const subject = level ? catalog.subjects.find((item) => item.level_id === level.id && item.slug === subjectSlug) : undefined;
  return { catalog, curriculum, level, subject };
}

export async function getSubTopicBySlugs(curriculumSlug: string, levelSlug: string, subjectSlug: string, unitSlug: string, topicSlug: string, subTopicSlug: string) {
  const context = await getSubjectBySlugs(curriculumSlug, levelSlug, subjectSlug);
  const unit = context.subject ? context.catalog.units.find((item) => item.subject_id === context.subject!.id && item.slug === unitSlug) : undefined;
  const topic = unit ? context.catalog.topics.find((item) => item.unit_id === unit.id && item.slug === topicSlug) : undefined;
  const subTopic = topic ? context.catalog.subTopics.find((item) => item.topic_id === topic.id && item.slug === subTopicSlug) : undefined;
  return { ...context, unit, topic, subTopic };
}

export function levelsForCurriculum(catalog: Catalog, curriculum: Curriculum) {
  return catalog.levels.filter((item) => item.curriculum_id === curriculum.id).sort(byDisplayOrder);
}

export function subjectsForLevel(catalog: Catalog, level: Level) {
  return catalog.subjects.filter((item) => item.level_id === level.id).sort(byDisplayOrder);
}

export function unitsForSubject(catalog: Catalog, subject: Subject) {
  return catalog.units.filter((item) => item.subject_id === subject.id).sort(byDisplayOrder);
}

export function topicsForUnit(catalog: Catalog, unit: Unit) {
  return catalog.topics.filter((item) => item.unit_id === unit.id).sort(byDisplayOrder);
}

export function subTopicsForTopic(catalog: Catalog, topic: Topic) {
  return catalog.subTopics.filter((item) => item.topic_id === topic.id).sort(byDisplayOrder);
}

export function questionSetsForSubTopic(catalog: Catalog, subTopic: SubTopic) {
  return catalog.questionSets.filter((item) => item.sub_topic_id === subTopic.id).sort(byDisplayOrder);
}

export function questionsForSet(catalog: Catalog, questionSet: QuestionSet) {
  return catalog.mcqQuestions.filter((item) => item.question_set_id === questionSet.id).sort(byDisplayOrder);
}

export function discussionVideoForSubTopic(catalog: Catalog, subTopic: SubTopic) {
  return catalog.discussionVideos.find((item) => item.sub_topic_id === subTopic.id);
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

export function pathForUnit(curriculum: Curriculum, level: Level, subject: Subject, unit: Unit) {
  return `${pathForSubject(curriculum, level, subject)}/${unit.slug}`;
}

export function pathForTopic(curriculum: Curriculum, level: Level, subject: Subject, unit: Unit, topic: Topic) {
  return `${pathForUnit(curriculum, level, subject, unit)}/${topic.slug}`;
}

export function pathForSubTopic(curriculum: Curriculum, level: Level, subject: Subject, unit: Unit, topic: Topic, subTopic: SubTopic) {
  return `${pathForTopic(curriculum, level, subject, unit, topic)}/${subTopic.slug}`;
}

export function teacherBySlug(catalog: Catalog, slug: string) {
  return catalog.teachers.find((teacher) => teacher.slug === slug);
}

export function videosForTeacher(catalog: Catalog, teacher: Teacher) {
  return catalog.discussionVideos.filter((video) => video.teacher_id === teacher.id);
}

export function questionSetsForTeacher(catalog: Catalog, teacher: Teacher) {
  return catalog.questionSets.filter((set) => set.teacher_id === teacher.id);
}

export function extractYouTubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return match?.[1] ?? url;
}

export function searchCatalog(catalog: Catalog, query: string): SearchResult[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return [];

  const results: SearchResult[] = [];

  for (const curriculum of catalog.curriculums) {
    if (matches(normalized, curriculum.name)) {
      results.push({ title: curriculum.name, description: "Browse levels in this curriculum.", href: pathForCurriculum(curriculum), type: "Curriculum" });
    }
  }

  for (const level of catalog.levels) {
    const curriculum = catalog.curriculums.find((item) => item.id === level.curriculum_id);
    if (curriculum && matches(normalized, `${curriculum.name} ${level.name}`)) {
      results.push({ title: level.name, description: curriculum.name, href: pathForLevel(curriculum, level), type: "Level" });
    }
  }

  for (const subject of catalog.subjects) {
    const context = getSubjectContext(catalog, subject);
    if (context && matches(normalized, `${context.curriculum.name} ${context.level.name} ${subject.name} ${subject.code ?? ""}`)) {
      results.push({ title: subject.name, description: `${context.curriculum.name} > ${context.level.name}`, href: pathForSubject(context.curriculum, context.level, subject), type: "Subject" });
    }
  }

  for (const unit of catalog.units) {
    const context = getUnitContext(catalog, unit);
    if (context && matches(normalized, `${unit.name} ${unit.description}`)) {
      results.push({ title: unit.name, description: `${context.subject.name}`, href: pathForUnit(context.curriculum, context.level, context.subject, unit), type: "Unit" });
    }
  }

  for (const topic of catalog.topics) {
    const context = getTopicContext(catalog, topic);
    if (context && matches(normalized, `${topic.name} ${topic.description}`)) {
      results.push({ title: topic.name, description: `${context.subject.name} > ${context.unit.name}`, href: pathForTopic(context.curriculum, context.level, context.subject, context.unit, topic), type: "Topic" });
    }
  }

  for (const subTopic of catalog.subTopics) {
    const context = getSubTopicContext(catalog, subTopic);
    if (context && matches(normalized, `${subTopic.name} ${subTopic.description}`)) {
      results.push({ title: subTopic.name, description: `${context.topic.name}`, href: pathForSubTopic(context.curriculum, context.level, context.subject, context.unit, context.topic, subTopic), type: "Sub Topic" });
    }
  }

  for (const teacher of catalog.teachers) {
    if (matches(normalized, `${teacher.name} ${teacher.subjects.join(" ")} ${teacher.qualifications}`)) {
      results.push({ title: teacher.name, description: teacher.short_bio, href: `/teachers/${teacher.slug}`, type: "Teacher" });
    }
  }

  return results.slice(0, 40);
}

function getSubjectContext(catalog: Catalog, subject: Subject) {
  const level = catalog.levels.find((item) => item.id === subject.level_id);
  const curriculum = level ? catalog.curriculums.find((item) => item.id === level.curriculum_id) : undefined;
  return curriculum && level ? { curriculum, level, subject } : null;
}

function getUnitContext(catalog: Catalog, unit: Unit) {
  const subject = catalog.subjects.find((item) => item.id === unit.subject_id);
  const context = subject ? getSubjectContext(catalog, subject) : null;
  return context ? { ...context, unit } : null;
}

function getTopicContext(catalog: Catalog, topic: Topic) {
  const unit = catalog.units.find((item) => item.id === topic.unit_id);
  const context = unit ? getUnitContext(catalog, unit) : null;
  return context ? { ...context, topic } : null;
}

function getSubTopicContext(catalog: Catalog, subTopic: SubTopic) {
  const topic = catalog.topics.find((item) => item.id === subTopic.topic_id);
  const context = topic ? getTopicContext(catalog, topic) : null;
  return context ? { ...context, subTopic } : null;
}

function normalizeTeachers(teachers: Teacher[]) {
  return teachers.map((teacher) => ({
    ...teacher,
    subjects: Array.isArray(teacher.subjects) ? teacher.subjects : [],
    curriculums: Array.isArray(teacher.curriculums) ? teacher.curriculums : [],
    social_links: teacher.social_links ?? {},
  }));
}

function byDisplayOrder<T extends { display_order: number; name?: string; title?: string }>(a: T, b: T) {
  return a.display_order - b.display_order || (a.name ?? a.title ?? "").localeCompare(b.name ?? b.title ?? "");
}

function matches(query: string, value: string) {
  return value.toLowerCase().includes(query);
}
