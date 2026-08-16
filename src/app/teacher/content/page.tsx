import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  createTeacherContent,
  createTeacherQuestionPage,
  deleteTeacherContent,
} from "@/lib/teacher-actions";

type Subject = {
  id: string;
  name: string;
  code: string | null;
  levels?: {
    name: string;
    curriculums?: { name: string } | null;
  } | null;
};

type RawSubject = {
  id: string;
  name: string;
  code: string | null;
  levels: Array<{
    name: string;
    curriculums: Array<{ name: string }>;
  }>;
};

type AdminAssignment = RawSubject;
type TeacherAssignment = {
  subject_id: string;
  subjects: RawSubject[];
};

type ContentNode = {
  id: string;
  subject_id: string;
  parent_id: string | null;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

type QuestionPage = {
  id: string;
  subject_id: string;
  content_node_id: string;
  title: string;
  page_type: string;
  is_published: boolean;
  created_at: string;
};

function normalizeSubject(subject: RawSubject): Subject {
  const level = subject.levels?.[0];
  const curriculum = level?.curriculums?.[0];

  return {
    id: subject.id,
    name: subject.name,
    code: subject.code,
    levels: level
      ? {
          name: level.name,
          curriculums: curriculum ? { name: curriculum.name } : null,
        }
      : null,
  };
}

export default async function TeacherContentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="app-page">
        <div className="app-page-content">
          <h1>Sign in required</h1>
          <p>Please sign in as a teacher.</p>
        </div>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_active || !["teacher", "admin"].includes(profile.role)) {
    return (
      <div className="app-page">
        <div className="app-page-content">
          <h1>Teacher access</h1>
          <p>Your account is not assigned teacher access.</p>
        </div>
      </div>
    );
  }

  const { data: assignments } =
    profile.role === "admin"
      ? await supabase
          .from("subjects")
          .select("id, name, code, levels(name, curriculums(name))")
          .order("name")
      : await supabase
          .from("teacher_subjects")
          .select(
            "subject_id, subjects(id, name, code, levels(name, curriculums(name)))"
          )
          .eq("teacher_id", user.id)
          .eq("is_active", true);

  const subjects: Subject[] = (assignments ?? [])
    .flatMap((row) => {
      if (profile.role === "admin") {
        return [normalizeSubject(row as unknown as AdminAssignment)];
      }

      const assignment = row as unknown as TeacherAssignment;
      return (assignment.subjects ?? []).map(normalizeSubject);
    })
    .filter((subject, index, all) =>
      all.findIndex((candidate) => candidate.id === subject.id) === index
    );

  const subjectIds = subjects.map((subject) => subject.id);

  const { data: nodes } = subjectIds.length
    ? await supabase
        .from("content_nodes")
        .select(
          "id, subject_id, parent_id, name, description, is_active, created_at"
        )
        .in("subject_id", subjectIds)
        .order("name")
    : { data: [] as ContentNode[] };

  const contentNodes = (nodes ?? []) as ContentNode[];
  const nodeIds = contentNodes.map((node) => node.id);

  const { data: pages } = nodeIds.length
    ? await supabase
        .from("question_pages")
        .select(
          "id, subject_id, content_node_id, title, page_type, is_published, created_at"
        )
        .in("content_node_id", nodeIds)
        .order("created_at", { ascending: false })
    : { data: [] as QuestionPage[] };

  const questionPages = (pages ?? []) as QuestionPage[];

  return (
    <div className="app-page">
      <div className="app-page-content max-w-7xl">
        <p className="app-eyebrow">Teacher Studio</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1>Content Manager</h1>
            <p className="mt-2">
              Build Units, Topics, Sub Topics and Question Pages for the subjects
              you teach.
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            {profile.role === "admin" ? "Admin" : "Teacher"}
          </span>
        </div>

        <div className="mt-8 space-y-6">
          {subjects.map((subject) => {
            const subjectNodes = contentNodes.filter(
              (node) => node.subject_id === subject.id
            );
            const roots = subjectNodes.filter((node) => !node.parent_id);

            return (
              <section
                key={subject.id}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {subject.levels?.curriculums?.name ?? "Curriculum"} · {" "}
                      {subject.levels?.name ?? "Level"}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold">{subject.name}</h2>
                    {subject.code && (
                      <p className="text-sm text-muted-foreground">
                        {subject.code}
                      </p>
                    )}
                  </div>

                  <form
                    action={createTeacherContent}
                    className="flex flex-wrap gap-2"
                  >
                    <input
                      type="hidden"
                      name="subjectId"
                      value={subject.id}
                    />
                    <input
                      name="name"
                      required
                      placeholder="New Unit"
                      className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                    />
                    <button className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                      Add Unit
                    </button>
                  </form>
                </div>

                <div className="mt-6 space-y-3">
                  {roots.map((unit) => {
                    const topics = subjectNodes.filter(
                      (node) => node.parent_id === unit.id
                    );

                    return (
                      <div
                        key={unit.id}
                        className="rounded-xl border border-border bg-muted/20 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Unit
                            </span>
                            <h3 className="font-semibold">{unit.name}</h3>
                          </div>
                          <form action={deleteTeacherContent}>
                            <input type="hidden" name="id" value={unit.id} />
                            <button className="text-xs font-semibold text-destructive">
                              Delete
                            </button>
                          </form>
                        </div>

                        <div className="mt-3 pl-4">
                          {topics.map((topic) => {
                            const subTopics = subjectNodes.filter(
                              (node) => node.parent_id === topic.id
                            );

                            return (
                              <div
                                key={topic.id}
                                className="mb-3 rounded-lg border border-border bg-background p-3"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                      Topic
                                    </span>
                                    <p className="font-medium">{topic.name}</p>
                                  </div>
                                  <form action={deleteTeacherContent}>
                                    <input
                                      type="hidden"
                                      name="id"
                                      value={topic.id}
                                    />
                                    <button className="text-xs text-destructive">
                                      Delete
                                    </button>
                                  </form>
                                </div>

                                <div className="mt-2 space-y-2 pl-4">
                                  {subTopics.map((sub) => {
                                    const subPages = questionPages.filter(
                                      (page) => page.content_node_id === sub.id
                                    );

                                    return (
                                      <div
                                        key={sub.id}
                                        className="rounded-lg bg-muted/30 px-3 py-3"
                                      >
                                        <div className="flex items-center justify-between gap-3 text-sm">
                                          <span>
                                            <span className="mr-2 text-xs text-muted-foreground">
                                              Sub Topic
                                            </span>
                                            {sub.name}
                                          </span>
                                          <form action={deleteTeacherContent}>
                                            <input
                                              type="hidden"
                                              name="id"
                                              value={sub.id}
                                            />
                                            <button className="text-xs text-destructive">
                                              Delete
                                            </button>
                                          </form>
                                        </div>

                                        <div className="mt-3 space-y-2 pl-2">
                                          {subPages.map((page) => (
                                            <Link
                                              key={page.id}
                                              href={`/teacher/question-pages/${page.id}`}
                                              className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm hover:border-primary/40"
                                            >
                                              <span>{page.title}</span>
                                              <span className="text-xs text-muted-foreground">
                                                {page.page_type.toUpperCase()} · {" "}
                                                {page.is_published
                                                  ? "Published"
                                                  : "Draft"}
                                              </span>
                                            </Link>
                                          ))}
                                          {!subPages.length && (
                                            <p className="text-xs text-muted-foreground">
                                              No question pages yet.
                                            </p>
                                          )}
                                        </div>

                                        <form
                                          action={createTeacherQuestionPage}
                                          className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]"
                                        >
                                          <input
                                            type="hidden"
                                            name="subjectId"
                                            value={subject.id}
                                          />
                                          <input
                                            type="hidden"
                                            name="contentNodeId"
                                            value={sub.id}
                                          />
                                          <input
                                            name="title"
                                            required
                                            placeholder="New Question Page"
                                            className="min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-xs"
                                          />
                                          <select
                                            name="pageType"
                                            className="rounded-lg border border-border bg-background px-3 py-2 text-xs"
                                          >
                                            <option value="structured">
                                              Structured
                                            </option>
                                            <option value="mcq">MCQ</option>
                                          </select>
                                          <button className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
                                            Create Page
                                          </button>
                                        </form>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <form
                          action={createTeacherContent}
                          className="mt-3 flex gap-2"
                        >
                          <input
                            type="hidden"
                            name="subjectId"
                            value={subject.id}
                          />
                          <input
                            type="hidden"
                            name="parentId"
                            value={unit.id}
                          />
                          <input
                            name="name"
                            required
                            placeholder="Add Topic"
                            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs"
                          />
                          <button className="rounded-lg border border-border px-3 py-2 text-xs font-semibold">
                            Add Topic
                          </button>
                        </form>
                      </div>
                    );
                  })}

                  {!roots.length && (
                    <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      No Units yet. Add the first Unit above.
                    </p>
                  )}
                </div>
              </section>
            );
          })}

          {!subjects.length && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <h2 className="font-semibold">No subjects assigned</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ask an administrator to assign a subject to your teacher account.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
