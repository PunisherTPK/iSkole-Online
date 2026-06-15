import { sampleCatalog } from "@/lib/sample-data";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { Catalog, Grade, Lesson, Paper, Question, SearchResult, Subject } from "@/lib/types";
import { paperSlug, slugify } from "@/lib/slug";

export async function getCatalog(): Promise<Catalog> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return sampleCatalog;
  }

  const [grades, subjects, lessons, papers, questions] = await Promise.all([
    supabase.from("grades").select("*").order("name"),
    supabase.from("subjects").select("*").order("name"),
    supabase.from("lessons").select("*").order("name"),
    supabase.from("papers").select("*").order("year", { ascending: false }),
    supabase.from("questions").select("*").order("id"),
  ]);

  if (grades.error || subjects.error || lessons.error || papers.error || questions.error) {
    return sampleCatalog;
  }

  return {
    grades: (grades.data ?? []) as Catalog["grades"],
    subjects: (subjects.data ?? []) as Catalog["subjects"],
    lessons: (lessons.data ?? []) as Catalog["lessons"],
    papers: (papers.data ?? []) as Catalog["papers"],
    questions: (questions.data ?? []) as Catalog["questions"],
  };
}

export async function getGradeBySlug(gradeSlug: string) {
  const catalog = await getCatalog();
  return {
    catalog,
    grade: catalog.grades.find((grade) => slugify(grade.name) === gradeSlug),
  };
}

export async function getSubjectBySlugs(gradeSlug: string, subjectSlug: string) {
  const { catalog, grade } = await getGradeBySlug(gradeSlug);
  const subject = grade
    ? catalog.subjects.find((item) => item.grade_id === grade.id && slugify(item.name) === subjectSlug)
    : undefined;

  return { catalog, grade, subject };
}

export async function getLessonBySlugs(gradeSlug: string, subjectSlug: string, lessonSlug: string) {
  const { catalog, grade, subject } = await getSubjectBySlugs(gradeSlug, subjectSlug);
  const lesson = subject
    ? catalog.lessons.find((item) => item.subject_id === subject.id && slugify(item.name) === lessonSlug)
    : undefined;

  return { catalog, grade, subject, lesson };
}

export async function getPaperBySlugs(
  gradeSlug: string,
  subjectSlug: string,
  lessonSlug: string,
  selectedPaperSlug: string,
) {
  const { catalog, grade, subject, lesson } = await getLessonBySlugs(gradeSlug, subjectSlug, lessonSlug);
  const paper = lesson
    ? catalog.papers.find((item) => item.lesson_id === lesson.id && paperSlug(item.year, item.title) === selectedPaperSlug)
    : undefined;

  return { catalog, grade, subject, lesson, paper };
}

export function subjectsForGrade(catalog: Catalog, grade: Grade) {
  return catalog.subjects.filter((subject) => subject.grade_id === grade.id);
}

export function lessonsForSubject(catalog: Catalog, subject: Subject) {
  return catalog.lessons.filter((lesson) => lesson.subject_id === subject.id);
}

export function papersForLesson(catalog: Catalog, lesson: Lesson) {
  return catalog.papers.filter((paper) => paper.lesson_id === lesson.id).sort((a, b) => b.year - a.year);
}

export function questionsForPaper(catalog: Catalog, paper: Paper) {
  return catalog.questions.filter((question) => question.paper_id === paper.id);
}

export function pathForGrade(grade: Grade) {
  return `/${slugify(grade.name)}`;
}

export function pathForSubject(grade: Grade, subject: Subject) {
  return `${pathForGrade(grade)}/${slugify(subject.name)}`;
}

export function pathForLesson(grade: Grade, subject: Subject, lesson: Lesson) {
  return `${pathForSubject(grade, subject)}/${slugify(lesson.name)}`;
}

export function pathForPaper(grade: Grade, subject: Subject, lesson: Lesson, paper: Paper) {
  return `${pathForLesson(grade, subject, lesson)}/${paperSlug(paper.year, paper.title)}`;
}

export function searchCatalog(catalog: Catalog, query: string): SearchResult[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return [];

  const results: SearchResult[] = [];

  for (const grade of catalog.grades) {
    if (matches(normalized, grade.name)) {
      results.push({ title: grade.name, description: "Browse subjects and papers for this grade.", href: pathForGrade(grade), type: "Grade" });
    }
  }

  for (const subject of catalog.subjects) {
    const grade = catalog.grades.find((item) => item.id === subject.grade_id);
    if (grade && matches(normalized, `${grade.name} ${subject.name}`)) {
      results.push({ title: subject.name, description: `${grade.name} subject`, href: pathForSubject(grade, subject), type: "Subject" });
    }
  }

  for (const lesson of catalog.lessons) {
    const context = getLessonContext(catalog, lesson);
    if (context && matches(normalized, `${context.grade.name} ${context.subject.name} ${lesson.name} ${lesson.description}`)) {
      results.push({
        title: lesson.name,
        description: `${context.grade.name} ${context.subject.name} - ${lesson.description}`,
        href: pathForLesson(context.grade, context.subject, lesson),
        type: "Lesson",
      });
    }
  }

  for (const paper of catalog.papers) {
    const context = getPaperContext(catalog, paper);
    if (context && matches(normalized, `${context.grade.name} ${context.subject.name} ${context.lesson.name} ${paper.title} ${paper.year}`)) {
      results.push({
        title: paper.title,
        description: `${context.grade.name} ${context.subject.name} - ${context.lesson.name}`,
        href: pathForPaper(context.grade, context.subject, context.lesson, paper),
        type: "Paper",
      });
    }
  }

  for (const question of catalog.questions) {
    const context = getQuestionContext(catalog, question);
    if (context && matches(normalized, `${question.question_text} ${question.answer_text} ${question.explanation_text}`)) {
      results.push({
        title: question.question_text,
        description: `${context.grade.name} ${context.subject.name} - ${context.paper.title}`,
        href: `${pathForPaper(context.grade, context.subject, context.lesson, context.paper)}#${question.id}`,
        type: "Question",
      });
    }
  }

  return results.slice(0, 30);
}

function matches(query: string, value: string) {
  return value.toLowerCase().includes(query);
}

function getLessonContext(catalog: Catalog, lesson: Lesson) {
  const subject = catalog.subjects.find((item) => item.id === lesson.subject_id);
  const grade = subject ? catalog.grades.find((item) => item.id === subject.grade_id) : undefined;
  return subject && grade ? { grade, subject } : null;
}

function getPaperContext(catalog: Catalog, paper: Paper) {
  const lesson = catalog.lessons.find((item) => item.id === paper.lesson_id);
  const context = lesson ? getLessonContext(catalog, lesson) : null;
  return context && lesson ? { ...context, lesson } : null;
}

function getQuestionContext(catalog: Catalog, question: Question) {
  const paper = catalog.papers.find((item) => item.id === question.paper_id);
  const context = paper ? getPaperContext(catalog, paper) : null;
  return context && paper ? { ...context, paper } : null;
}
