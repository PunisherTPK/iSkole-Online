import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  FileQuestion,
  Folder,
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
  levels: Level[];
  subjects: Subject[];
  nodes: ContentNode[];
  questionPages: QuestionPage[];
  currentNode: CurrentNode | null;
  selectedCurriculum: string | null;
  selectedLevel: string | null;
  selectedSubject: string | null;
  selectedNode: string | null;
};

type CurrentNode = {
  id: string;
  subject_id: string;
  parent_id: string | null;
  name: string;
  description: string | null;
};

export default function QuestionBankShell({
  curriculums,
  levels,
  subjects,
  nodes,
  questionPages,
  currentNode,
  selectedCurriculum,
  selectedLevel,
  selectedSubject,
  selectedNode,
}: Props) {
  const curriculum =
    curriculums.find(
      (item) => item.id === selectedCurriculum
    ) ?? null;

  const level =
    levels.find(
      (item) => item.id === selectedLevel
    ) ?? null;

  const subject =
    subjects.find(
      (item) => item.id === selectedSubject
    ) ?? null;

  const node =
    nodes.find(
      (item) => item.id === selectedNode
    ) ?? null;

  /*
   * Current URL helpers.
   */
  const base = "/question-bank";

  const curriculumUrl = `${base}?curriculum=${curriculum?.id ?? ""}`;

  const levelUrl =
    curriculum && level
      ? `${base}?curriculum=${curriculum.id}&level=${level.id}`
      : base;

  const subjectUrl =
    curriculum && level && subject
      ? `${base}?curriculum=${curriculum.id}&level=${level.id}&subject=${subject.id}`
      : base;

  return (
    <main className="min-h-screen bg-background">

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <BookOpen size={18} />
                iSkole Question Bank
              </div>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                Question Bank
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Browse questions by curriculum, level and subject.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              <ArrowLeft size={17} />
              Dashboard
            </Link>

          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm">

          <Link
            href={base}
            className="font-semibold text-primary hover:underline"
          >
            Question Bank
          </Link>

          {curriculum && (
            <>
              <ChevronRight
                size={15}
                className="text-muted-foreground"
              />

              <Link
                href={curriculumUrl}
                className="font-semibold text-primary hover:underline"
              >
                {curriculum.name}
              </Link>
            </>
          )}

          {level && (
            <>
              <ChevronRight
                size={15}
                className="text-muted-foreground"
              />

              <Link
                href={levelUrl}
                className="font-semibold text-primary hover:underline"
              >
                {level.name}
              </Link>
            </>
          )}

          {subject && (
            <>
              <ChevronRight
                size={15}
                className="text-muted-foreground"
              />

              <Link
                href={subjectUrl}
                className="font-semibold text-primary hover:underline"
              >
                {subject.name}
              </Link>
            </>
          )}

          {currentNode && (
            <>
              <ChevronRight
                size={15}
                className="text-muted-foreground"
              />

              <span className="font-semibold text-foreground">
                {currentNode.name}
              </span>
            </>
          )}
        </nav>

        {/* Curriculum */}
        {!selectedCurriculum && (
          <ExplorerSection
            title="Choose a curriculum"
            description="Select a curriculum to begin."
          >
            {curriculums.map((item) => (
              <ExplorerLink
                key={item.id}
                href={`${base}?curriculum=${item.id}`}
                icon={<BookOpen size={22} />}
                title={item.name}
                description={
                  item.description ??
                  "Explore available content."
                }
              />
            ))}
          </ExplorerSection>
        )}

        {/* Level */}
        {selectedCurriculum &&
          !selectedLevel && (
            <ExplorerSection
              title="Choose a level"
              description={`Select a level under ${curriculum?.name ?? "this curriculum"}.`}
            >
              {levels.map((item) => (
                <ExplorerLink
                  key={item.id}
                  href={`${base}?curriculum=${selectedCurriculum}&level=${item.id}`}
                  icon={<BookOpen size={22} />}
                  title={item.name}
                  description={
                    item.description ??
                    "Browse subjects available at this level."
                  }
                />
              ))}
            </ExplorerSection>
          )}

        {/* Subject */}
        {selectedLevel &&
          !selectedSubject && (
            <ExplorerSection
              title="Choose a subject"
              description={`Select a subject under ${level?.name ?? "this level"}.`}
            >
              {subjects.map((item) => (
                <ExplorerLink
                  key={item.id}
                  href={`${base}?curriculum=${selectedCurriculum}&level=${selectedLevel}&subject=${item.id}`}
                  icon={<BookOpen size={22} />}
                  title={item.name}
                  description={
                    item.description ??
                    "Browse available Question Pages."
                  }
                />
              ))}
            </ExplorerSection>
          )}

        {/* Subject / Content */}
        {selectedSubject && (
          <section>

            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary">
                {subject?.code ?? "Subject"}
              </p>

              <h2 className="mt-2 text-3xl font-bold text-foreground">
                {subject?.name}
              </h2>

              {subject?.description && (
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {subject.description}
                </p>
              )}
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">

              {/* Content nodes */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Folder
                    size={19}
                    className="text-primary"
                  />

                  <h3 className="font-bold text-foreground">
                    {selectedNode
                      ? "Subsections"
                      : "Content"}
                  </h3>
                </div>

                {nodes.length > 0 ? (
                  <div className="grid gap-3">
                    {nodes.map((item) => (
                      <ExplorerLink
                        key={item.id}
                        href={`${base}?curriculum=${selectedCurriculum}&level=${selectedLevel}&subject=${selectedSubject}&node=${item.id}`}
                        icon={<Folder size={20} />}
                        title={item.name}
                        description={
                          item.description ??
                          "Open this section."
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState text="No subsections have been created here." />
                )}
              </div>

              {/* Question Pages */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <FileQuestion
                    size={19}
                    className="text-primary"
                  />

                  <h3 className="font-bold text-foreground">
                    Question Pages
                  </h3>
                </div>

                {questionPages.length > 0 ? (
                  <div className="grid gap-3">
                    {questionPages.map((page) => (
                      <QuestionPageCard
                        key={page.id}
                        page={page}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState text="No Question Pages are available here." />
                )}
              </div>

            </div>

          </section>
        )}

      </div>
    </main>
  );
}

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

function ExplorerLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </div>

      <h3 className="mt-5 font-semibold text-foreground group-hover:text-primary">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      <p className="mt-4 text-sm font-semibold text-primary">
        Explore →
      </p>
    </Link>
  );
}

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
      <div className="flex items-center justify-between gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileQuestion size={19} />
        </div>

        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold capitalize text-muted-foreground">
          {page.page_type}
        </span>

      </div>

      <h3 className="mt-4 font-semibold text-foreground group-hover:text-primary">
        {page.title}
      </h3>

      {page.description && (
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {page.description}
        </p>
      )}

      <p className="mt-4 text-sm font-semibold text-primary">
        Open Question Page →
      </p>
    </Link>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
      <p className="text-sm text-muted-foreground">
        {text}
      </p>
    </div>
  );
}