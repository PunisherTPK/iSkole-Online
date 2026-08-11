"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Folder,
  FileQuestion,
  BookOpen,
  Search,
  Lock,
} from "lucide-react";

type Curriculum = {
  id: string;
  name: string;
  description: string | null;
};

type Level = {
  id: string;
  curriculum_id: string;
  name: string;
  description: string | null;
};

type Subject = {
  id: string;
  level_id: string;
  name: string;
  code: string | null;
  description: string | null;
};

type ContentNode = {
  id: string;
  subject_id: string;
  parent_id: string | null;
  name: string;
  description: string | null;
};

type QuestionPage = {
  id: string;
  subject_id: string;
  content_node_id: string | null;
  title: string;
  description: string | null;
  page_type: "mcq" | "structured";
  is_published: boolean;
};

type Props = {
  curriculums: Curriculum[];
};

export default function QuestionBankShell({
  curriculums,
}: Props) {
  const [selectedCurriculum, setSelectedCurriculum] =
    useState<Curriculum | null>(null);

  const [selectedLevel, setSelectedLevel] =
    useState<Level | null>(null);

  const [selectedSubject, setSelectedSubject] =
    useState<Subject | null>(null);

  const [nodes, setNodes] = useState<ContentNode[]>([]);
  const [questionPages, setQuestionPages] =
    useState<QuestionPage[]>([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  /*
   * Reset everything below curriculum when curriculum changes.
   */
  useEffect(() => {
    setSelectedLevel(null);
    setSelectedSubject(null);
    setNodes([]);
    setQuestionPages([]);
  }, [selectedCurriculum]);

  /*
   * Reset content when subject changes.
   */
  useEffect(() => {
    if (!selectedSubject) {
      setNodes([]);
      setQuestionPages([]);
      return;
    }

    loadSubjectContent(selectedSubject.id);
  }, [selectedSubject]);

  async function loadSubjectContent(subjectId: string) {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/question-bank/subject/${subjectId}`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load Question Bank content."
        );
      }

      const data = await response.json();

      setNodes(data.nodes ?? []);
      setQuestionPages(data.questionPages ?? []);
    } catch (error) {
      console.error(error);
      setNodes([]);
      setQuestionPages([]);
    } finally {
      setLoading(false);
    }
  }

  /*
   * We don't navigate to generated pages for every
   * content level.
   *
   * The Question Bank remains a single application.
   */
  return (
    <div className="min-h-screen bg-background">

      {/* ------------------------------------------------
          Header
      ------------------------------------------------ */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <BookOpen size={17} />
                iSkole Question Bank
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Question Bank
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Browse questions by curriculum, level and
                subject.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              <ArrowLeft size={17} />
              Dashboard
            </Link>

          </div>

        </div>
      </header>

      {/* ------------------------------------------------
          Application
      ------------------------------------------------ */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">

          <button
            type="button"
            onClick={() => {
              setSelectedCurriculum(null);
              setSelectedLevel(null);
              setSelectedSubject(null);
            }}
            className="font-semibold text-primary hover:underline"
          >
            Curriculums
          </button>

          {selectedCurriculum && (
            <>
              <ChevronRight
                size={15}
                className="text-muted-foreground"
              />

              <button
                type="button"
                onClick={() => {
                  setSelectedLevel(null);
                  setSelectedSubject(null);
                }}
                className="font-semibold text-primary hover:underline"
              >
                {selectedCurriculum.name}
              </button>
            </>
          )}

          {selectedLevel && (
            <>
              <ChevronRight
                size={15}
                className="text-muted-foreground"
              />

              <button
                type="button"
                onClick={() => {
                  setSelectedSubject(null);
                }}
                className="font-semibold text-primary hover:underline"
              >
                {selectedLevel.name}
              </button>
            </>
          )}

          {selectedSubject && (
            <>
              <ChevronRight
                size={15}
                className="text-muted-foreground"
              />

              <span className="font-semibold text-foreground">
                {selectedSubject.name}
              </span>
            </>
          )}

        </div>

        {/* ------------------------------------------------
            Curriculum
        ------------------------------------------------ */}
        {!selectedCurriculum && (
          <ExplorerSection
            title="Choose a curriculum"
            description="Select the curriculum you want to study."
          >
            {curriculums.map((curriculum) => (
              <ExplorerCard
                key={curriculum.id}
                icon={<BookOpen size={21} />}
                title={curriculum.name}
                description={
                  curriculum.description ||
                  "Explore available learning content."
                }
                onClick={() =>
                  setSelectedCurriculum(curriculum)
                }
              />
            ))}
          </ExplorerSection>
        )}

        {/* ------------------------------------------------
            Level
        ------------------------------------------------ */}
        {selectedCurriculum && !selectedLevel && (
          <LevelSelector
            curriculumId={selectedCurriculum.id}
            onSelect={setSelectedLevel}
          />
        )}

        {/* ------------------------------------------------
            Subject
        ------------------------------------------------ */}
        {selectedLevel && !selectedSubject && (
          <SubjectSelector
            levelId={selectedLevel.id}
            onSelect={setSelectedSubject}
          />
        )}

        {/* ------------------------------------------------
            Subject content
        ------------------------------------------------ */}
        {selectedSubject && (
          <section>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                  {selectedSubject.code ||
                    "Subject"}
                </p>

                <h2 className="mt-1 text-2xl font-bold text-foreground">
                  {selectedSubject.name}
                </h2>

                {selectedSubject.description && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {selectedSubject.description}
                  </p>
                )}
              </div>

              <div className="relative w-full sm:w-72">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search content..."
                  className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>

            </div>

            {loading ? (
              <LoadingState />
            ) : (
              <ContentExplorer
                nodes={nodes}
                questionPages={questionPages}
                search={search}
              />
            )}

          </section>
        )}

      </main>
    </div>
  );
}

/* ======================================================
   Level selector
====================================================== */

function LevelSelector({
  curriculumId,
  onSelect,
}: {
  curriculumId: string;
  onSelect: (level: Level) => void;
}) {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(
          `/api/question-bank/curriculum/${curriculumId}`
        );

        if (!response.ok) {
          throw new Error();
        }

        const data = await response.json();

        setLevels(data.levels ?? []);
      } catch {
        setLevels([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [curriculumId]);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <ExplorerSection
      title="Choose a level"
      description="Select the level you want to study."
    >
      {levels.map((level) => (
        <ExplorerCard
          key={level.id}
          icon={<GraduationCapIcon />}
          title={level.name}
          description={
            level.description ||
            "View subjects available for this level."
          }
          onClick={() => onSelect(level)}
        />
      ))}
    </ExplorerSection>
  );
}

/* ======================================================
   Subject selector
====================================================== */

function SubjectSelector({
  levelId,
  onSelect,
}: {
  levelId: string;
  onSelect: (subject: Subject) => void;
}) {
  const [subjects, setSubjects] =
    useState<Subject[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(
          `/api/question-bank/level/${levelId}`
        );

        if (!response.ok) {
          throw new Error();
        }

        const data = await response.json();

        setSubjects(data.subjects ?? []);
      } catch {
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [levelId]);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <ExplorerSection
      title="Choose a subject"
      description="Select a subject to browse its Question Bank."
    >
      {subjects.map((subject) => (
        <ExplorerCard
          key={subject.id}
          icon={<BookOpen size={21} />}
          title={subject.name}
          description={
            subject.description ||
            "Browse available question pages."
          }
          onClick={() => onSelect(subject)}
        />
      ))}
    </ExplorerSection>
  );
}

/* ======================================================
   Content explorer
====================================================== */

function ContentExplorer({
  nodes,
  questionPages,
  search,
}: {
  nodes: ContentNode[];
  questionPages: QuestionPage[];
  search: string;
}) {
  const filteredNodes = nodes.filter((node) =>
    node.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredPages = questionPages.filter((page) =>
    page.title
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">

      {/* Content nodes */}
      {filteredNodes.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Folder
              size={19}
              className="text-primary"
            />

            <h3 className="font-bold text-foreground">
              Content
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredNodes.map((node) => (
              <ExplorerCard
                key={node.id}
                icon={<Folder size={21} />}
                title={node.name}
                description={
                  node.description ||
                  "Open this section."
                }
                onClick={() => {
                  /*
                   * Nested content navigation will be
                   * added in the next iteration.
                   */
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Question pages */}
      {filteredPages.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <FileQuestion
              size={19}
              className="text-primary"
            />

            <h3 className="font-bold text-foreground">
              Question Pages
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPages.map((page) => (
              <QuestionPageCard
                key={page.id}
                page={page}
              />
            ))}
          </div>
        </section>
      )}

      {filteredNodes.length === 0 &&
        filteredPages.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <FileQuestion
              size={30}
              className="mx-auto text-muted-foreground"
            />

            <h3 className="mt-4 font-semibold text-foreground">
              Nothing found
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              There are no matching content sections or
              question pages.
            </p>
          </div>
        )}

    </div>
  );
}

/* ======================================================
   Question Page card
====================================================== */

function QuestionPageCard({
  page,
}: {
  page: QuestionPage;
}) {
  return (
    <Link
      href={`/question-bank/page/${page.id}`}
      className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileQuestion size={21} />
        </div>

        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold capitalize text-muted-foreground">
          {page.page_type}
        </span>

      </div>

      <h3 className="mt-5 font-semibold text-foreground group-hover:text-primary">
        {page.title}
      </h3>

      {page.description && (
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {page.description}
        </p>
      )}

      <div className="mt-5 flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">
          Open Question Page
        </span>

        <Lock
          size={15}
          className="text-muted-foreground"
        />
      </div>
    </Link>
  );
}

/* ======================================================
   Generic components
====================================================== */

function ExplorerSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          {title}
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      {children ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          No content available.
        </div>
      )}
    </section>
  );
}

function ExplorerCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-2xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </div>

      <h3 className="mt-5 font-semibold text-foreground">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      <p className="mt-4 text-sm font-semibold text-primary">
        Explore →
      </p>
    </button>
  );
}

function LoadingState() {
  return (
    <div className="rounded-2xl border border-border bg-card p-10 text-center">
      <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />

      <p className="mt-4 text-sm text-muted-foreground">
        Loading Question Bank...
      </p>
    </div>
  );
}

function GraduationCapIcon() {
  return <BookOpen size={21} />;
}