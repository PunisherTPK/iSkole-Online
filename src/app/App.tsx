"use client";

/**
 * iSkole Online — single-file frontend.
 *
 * Every screen (home, curriculum/level/subject/unit/topic/sub-topic browsing,
 * teachers, search, admin login, admin dashboard, content manager, settings)
 * lives in this one component tree. Navigation is local React state, not
 * routes — nothing here depends on a URL.
 *
 * Data mutations call the server actions in "@/lib/actions" (the one file
 * that's required to stay separate, since it holds server-only secrets).
 * After every mutation we just refetch the catalog and re-render.
 */

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, ChevronRight, FileQuestion, FolderOpen, GraduationCap, Home as HomeIcon,
  LogOut, Play, Search, Settings as SettingsIcon, Trash2, UserRound, Users, ArrowUp, ArrowDown,
} from "lucide-react";
import type {
  Catalog, Curriculum, Level, Subject, Unit, Topic, SubTopic, QuestionType, Question,
  Teacher, Difficulty,
} from "@/lib/types";
import * as actions from "@/lib/actions";
import type { Session } from "@/lib/actions";

// ============================================================================
// Small pure helpers (used to be lib/data.ts)
// ============================================================================

function byOrder<T extends { display_order: number; name?: string; title?: string }>(a: T, b: T) {
  return a.display_order - b.display_order || (a.name ?? a.title ?? "").localeCompare(b.name ?? b.title ?? "");
}
const levelsOf = (c: Catalog, curriculumId: string) => c.levels.filter((l) => l.curriculum_id === curriculumId).sort(byOrder);
const subjectsOf = (c: Catalog, levelId: string) => c.subjects.filter((s) => s.level_id === levelId).sort(byOrder);
const unitsOf = (c: Catalog, subjectId: string) => c.units.filter((u) => u.subject_id === subjectId).sort(byOrder);
const topicsOf = (c: Catalog, unitId: string) => c.topics.filter((t) => t.unit_id === unitId).sort(byOrder);
const subTopicsOf = (c: Catalog, topicId: string) => c.subTopics.filter((s) => s.topic_id === topicId).sort(byOrder);
const questionTypesOf = (c: Catalog, subTopicId: string) => c.questionTypes.filter((q) => q.sub_topic_id === subTopicId).sort(byOrder);
const questionsOf = (c: Catalog, questionTypeId: string) => c.questions.filter((q) => q.question_type_id === questionTypeId).sort(byOrder);
const videoFor = (c: Catalog, questionTypeId: string) => c.discussionVideos.find((v) => v.question_type_id === questionTypeId);
const subjectsForTeacher = (c: Catalog, teacherId: string) => {
  const ids = c.teacherSubjects.filter((t) => t.teacher_id === teacherId).map((t) => t.subject_id);
  return c.subjects.filter((s) => ids.includes(s.id));
};

type SearchHit = { title: string; description: string; kind: string; onOpen: () => void };

// ============================================================================
// Top-level app
// ============================================================================

type PublicScreen =
  | { name: "home" }
  | { name: "curriculum"; curriculumId: string }
  | { name: "level"; curriculumId: string; levelId: string }
  | { name: "subject"; curriculumId: string; levelId: string; subjectId: string }
  | { name: "unit"; curriculumId: string; levelId: string; subjectId: string; unitId: string }
  | { name: "topic"; curriculumId: string; levelId: string; subjectId: string; unitId: string; topicId: string }
  | { name: "subTopic"; curriculumId: string; levelId: string; subjectId: string; unitId: string; topicId: string; subTopicId: string }
  | { name: "teachers" }
  | { name: "teacherProfile"; teacherId: string }
  | { name: "search" };

export default function App({ initialCatalog, initialSession }: { initialCatalog: Catalog; initialSession: Session }) {
  const [catalog, setCatalog] = useState(initialCatalog);
  const [session, setSession] = useState(initialSession);
  const [screen, setScreen] = useState<PublicScreen>({ name: "home" });
  const [showAdmin, setShowAdmin] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function refresh() {
    setCatalog(await actions.getCatalog());
  }

  /** Every mutation goes through here: run it, show an error if any, refresh on success. */
  async function run<T extends { error?: string }>(fn: () => Promise<T>) {
    const result = await fn();
    if (result?.error) {
      setToast(result.error);
      setTimeout(() => setToast(null), 4000);
    } else {
      await refresh();
    }
    return result;
  }

  if (showAdmin) {
    return (
      <Shell
        onGoHome={() => setShowAdmin(false)}
        onGoAdmin={() => setShowAdmin(true)}
        session={session}
        toast={toast}
      >
        <AdminArea
          catalog={catalog}
          session={session}
          run={run}
          onSessionChange={setSession}
          onExit={() => setShowAdmin(false)}
        />
      </Shell>
    );
  }

  return (
    <Shell onGoHome={() => setScreen({ name: "home" })} onGoAdmin={() => setShowAdmin(true)} session={session} toast={toast}>
      <PublicArea catalog={catalog} screen={screen} setScreen={setScreen} />
    </Shell>
  );
}

// ============================================================================
// Shell (was Topbar + Footer)
// ============================================================================

function Shell({
  children, onGoHome, onGoAdmin, session, toast,
}: {
  children: React.ReactNode;
  onGoHome: () => void;
  onGoAdmin: () => void;
  session: Session;
  toast: string | null;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <button onClick={onGoHome} className="text-lg font-bold text-foreground">
            iSkole Online
          </button>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onGoHome}><HomeIcon className="mr-1 h-4 w-4" />Home</Button>
            <Button variant="ghost" size="sm" onClick={onGoAdmin}>
              {session.authenticated ? "Dashboard" : "Admin Login"}
            </Button>
          </nav>
        </div>
      </header>

      {toast ? (
        <div className="fixed right-4 top-16 z-50 max-w-sm rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive shadow-brand-lg">
          {toast}
        </div>
      ) : null}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} iSkole Online.
      </footer>
    </div>
  );
}

// ============================================================================
// PUBLIC AREA
// ============================================================================

function PublicArea({
  catalog, screen, setScreen,
}: {
  catalog: Catalog;
  screen: PublicScreen;
  setScreen: (s: PublicScreen) => void;
}) {
  const [query, setQuery] = useState("");

  const searchHits: SearchHit[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const hits: SearchHit[] = [];
    for (const c of catalog.curriculums) {
      if (c.name.toLowerCase().includes(q)) hits.push({ title: c.name, description: "Curriculum", kind: "Curriculum", onOpen: () => setScreen({ name: "curriculum", curriculumId: c.id }) });
    }
    for (const s of catalog.subjects) {
      if (s.name.toLowerCase().includes(q)) {
        const level = catalog.levels.find((l) => l.id === s.level_id);
        const curriculum = level ? catalog.curriculums.find((cu) => cu.id === level.curriculum_id) : undefined;
        if (level && curriculum) {
          hits.push({
            title: s.name, description: `${curriculum.name} > ${level.name}`, kind: "Subject",
            onOpen: () => setScreen({ name: "subject", curriculumId: curriculum.id, levelId: level.id, subjectId: s.id }),
          });
        }
      }
    }
    for (const t of catalog.teachers) {
      if (t.name.toLowerCase().includes(q)) hits.push({ title: t.name, description: t.short_bio, kind: "Teacher", onOpen: () => setScreen({ name: "teacherProfile", teacherId: t.id }) });
    }
    return hits.slice(0, 30);
  }, [query, catalog, setScreen]);

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (e.target.value) setScreen({ name: "search" }); }}
            placeholder="Search curriculum, subject, teacher..."
            className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Button variant="outline" onClick={() => setScreen({ name: "teachers" })}><Users className="mr-2 h-4 w-4" />Teachers</Button>
      </div>

      {screen.name === "search" ? <SearchResults hits={searchHits} query={query} /> : null}
      {screen.name === "home" ? <HomeView catalog={catalog} setScreen={setScreen} /> : null}
      {screen.name === "curriculum" ? <CurriculumView catalog={catalog} screen={screen} setScreen={setScreen} /> : null}
      {screen.name === "level" ? <LevelView catalog={catalog} screen={screen} setScreen={setScreen} /> : null}
      {screen.name === "subject" ? <SubjectView catalog={catalog} screen={screen} setScreen={setScreen} /> : null}
      {screen.name === "unit" ? <UnitView catalog={catalog} screen={screen} setScreen={setScreen} /> : null}
      {screen.name === "topic" ? <TopicView catalog={catalog} screen={screen} setScreen={setScreen} /> : null}
      {screen.name === "subTopic" ? <SubTopicView catalog={catalog} screen={screen} /> : null}
      {screen.name === "teachers" ? <TeachersView catalog={catalog} setScreen={setScreen} /> : null}
      {screen.name === "teacherProfile" ? <TeacherProfileView catalog={catalog} teacherId={screen.teacherId} setScreen={setScreen} /> : null}
    </div>
  );
}

function SearchResults({ hits, query }: { hits: SearchHit[]; query: string }) {
  return (
    <div className="grid gap-3">
      <p className="text-sm text-muted-foreground">{hits.length} result{hits.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo;</p>
      {hits.map((hit, i) => (
        <button key={i} onClick={hit.onOpen} className="rounded-2xl border border-border bg-card p-5 text-left shadow-brand transition hover:border-primary/30">
          <Badge variant="outline">{hit.kind}</Badge>
          <p className="mt-2 font-semibold text-foreground">{hit.title}</p>
          <p className="text-sm text-muted-foreground">{hit.description}</p>
        </button>
      ))}
    </div>
  );
}

function NavGrid({ items }: { items: { title: string; description?: string; onOpen: () => void }[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <button key={i} onClick={item.onOpen} className="group flex min-h-32 flex-col justify-between rounded-2xl border border-border bg-card p-5 text-left shadow-brand transition hover:border-primary/30">
          <div>
            <p className="font-semibold text-foreground group-hover:text-primary">{item.title}</p>
            {item.description ? <p className="mt-1 text-sm text-muted-foreground">{item.description}</p> : null}
          </div>
          <ChevronRight className="mt-3 h-4 w-4 text-muted-foreground group-hover:text-primary" />
        </button>
      ))}
      {!items.length ? <p className="text-sm text-muted-foreground">Nothing here yet.</p> : null}
    </div>
  );
}

function HomeView({ catalog, setScreen }: { catalog: Catalog; setScreen: (s: PublicScreen) => void }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Select a curriculum</h1>
      <div className="mt-4">
        <NavGrid items={catalog.curriculums.map((c) => ({ title: c.name, onOpen: () => setScreen({ name: "curriculum", curriculumId: c.id }) }))} />
      </div>
    </div>
  );
}

function CurriculumView({ catalog, screen, setScreen }: { catalog: Catalog; screen: Extract<PublicScreen, { name: "curriculum" }>; setScreen: (s: PublicScreen) => void }) {
  const curriculum = catalog.curriculums.find((c) => c.id === screen.curriculumId);
  if (!curriculum) return null;
  return (
    <div>
      <Crumbs items={[{ label: "Home", onOpen: () => setScreen({ name: "home" }) }, { label: curriculum.name }]} />
      <h1 className="mt-2 text-2xl font-bold text-foreground">{curriculum.name}</h1>
      <div className="mt-4">
        <NavGrid items={levelsOf(catalog, curriculum.id).map((l) => ({ title: l.name, onOpen: () => setScreen({ name: "level", curriculumId: curriculum.id, levelId: l.id }) }))} />
      </div>
    </div>
  );
}

function LevelView({ catalog, screen, setScreen }: { catalog: Catalog; screen: Extract<PublicScreen, { name: "level" }>; setScreen: (s: PublicScreen) => void }) {
  const curriculum = catalog.curriculums.find((c) => c.id === screen.curriculumId);
  const level = catalog.levels.find((l) => l.id === screen.levelId);
  if (!curriculum || !level) return null;
  return (
    <div>
      <Crumbs items={[{ label: "Home", onOpen: () => setScreen({ name: "home" }) }, { label: curriculum.name, onOpen: () => setScreen({ name: "curriculum", curriculumId: curriculum.id }) }, { label: level.name }]} />
      <h1 className="mt-2 text-2xl font-bold text-foreground">{level.name}</h1>
      <div className="mt-4">
        <NavGrid items={subjectsOf(catalog, level.id).map((s) => ({ title: s.name, onOpen: () => setScreen({ name: "subject", curriculumId: curriculum.id, levelId: level.id, subjectId: s.id }) }))} />
      </div>
    </div>
  );
}

function SubjectView({ catalog, screen, setScreen }: { catalog: Catalog; screen: Extract<PublicScreen, { name: "subject" }>; setScreen: (s: PublicScreen) => void }) {
  const curriculum = catalog.curriculums.find((c) => c.id === screen.curriculumId);
  const level = catalog.levels.find((l) => l.id === screen.levelId);
  const subject = catalog.subjects.find((s) => s.id === screen.subjectId);
  if (!curriculum || !level || !subject) return null;
  return (
    <div>
      <Crumbs items={[
        { label: "Home", onOpen: () => setScreen({ name: "home" }) },
        { label: curriculum.name, onOpen: () => setScreen({ name: "curriculum", curriculumId: curriculum.id }) },
        { label: level.name, onOpen: () => setScreen({ name: "level", curriculumId: curriculum.id, levelId: level.id }) },
        { label: subject.name },
      ]} />
      <h1 className="mt-2 text-2xl font-bold text-foreground">{subject.name}</h1>
      <div className="mt-4">
        <NavGrid items={unitsOf(catalog, subject.id).map((u) => ({
          title: u.name, description: u.description,
          onOpen: () => setScreen({ name: "unit", curriculumId: curriculum.id, levelId: level.id, subjectId: subject.id, unitId: u.id }),
        }))} />
      </div>
    </div>
  );
}

function UnitView({ catalog, screen, setScreen }: { catalog: Catalog; screen: Extract<PublicScreen, { name: "unit" }>; setScreen: (s: PublicScreen) => void }) {
  const curriculum = catalog.curriculums.find((c) => c.id === screen.curriculumId);
  const level = catalog.levels.find((l) => l.id === screen.levelId);
  const subject = catalog.subjects.find((s) => s.id === screen.subjectId);
  const unit = catalog.units.find((u) => u.id === screen.unitId);
  if (!curriculum || !level || !subject || !unit) return null;
  return (
    <div>
      <Crumbs items={[
        { label: "Home", onOpen: () => setScreen({ name: "home" }) },
        { label: subject.name, onOpen: () => setScreen({ name: "subject", curriculumId: curriculum.id, levelId: level.id, subjectId: subject.id }) },
        { label: unit.name },
      ]} />
      <h1 className="mt-2 text-2xl font-bold text-foreground">{unit.name}</h1>
      <div className="mt-4">
        <NavGrid items={topicsOf(catalog, unit.id).map((t) => ({
          title: t.name, description: t.description,
          onOpen: () => setScreen({ name: "topic", curriculumId: curriculum.id, levelId: level.id, subjectId: subject.id, unitId: unit.id, topicId: t.id }),
        }))} />
      </div>
    </div>
  );
}

function TopicView({ catalog, screen, setScreen }: { catalog: Catalog; screen: Extract<PublicScreen, { name: "topic" }>; setScreen: (s: PublicScreen) => void }) {
  const subject = catalog.subjects.find((s) => s.id === screen.subjectId);
  const unit = catalog.units.find((u) => u.id === screen.unitId);
  const topic = catalog.topics.find((t) => t.id === screen.topicId);
  if (!subject || !unit || !topic) return null;
  return (
    <div>
      <Crumbs items={[{ label: "Home", onOpen: () => setScreen({ name: "home" }) }, { label: unit.name, onOpen: () => setScreen({ ...screen, name: "unit" }) }, { label: topic.name }]} />
      <h1 className="mt-2 text-2xl font-bold text-foreground">{topic.name}</h1>
      <div className="mt-4">
        <NavGrid items={subTopicsOf(catalog, topic.id).map((st) => ({
          title: st.name, description: st.description,
          onOpen: () => setScreen({ ...screen, name: "subTopic", subTopicId: st.id }),
        }))} />
      </div>
    </div>
  );
}

function SubTopicView({ catalog, screen }: { catalog: Catalog; screen: Extract<PublicScreen, { name: "subTopic" }> }) {
  const subTopic = catalog.subTopics.find((s) => s.id === screen.subTopicId);
  if (!subTopic) return null;
  const questionTypes = questionTypesOf(catalog, subTopic.id);
  return (
    <div className="grid gap-8">
      <h1 className="text-2xl font-bold text-foreground">{subTopic.name}</h1>
      {questionTypes.map((qt) => (
        <QuestionTypeBlock key={qt.id} catalog={catalog} questionType={qt} />
      ))}
      {!questionTypes.length ? <EmptyBlock icon={FileQuestion} title="No question types yet" /> : null}
    </div>
  );
}

function QuestionTypeBlock({ catalog, questionType }: { catalog: Catalog; questionType: QuestionType }) {
  const questions = questionsOf(catalog, questionType.id);
  const video = videoFor(catalog, questionType.id);
  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-semibold text-foreground">{questionType.title}</h2>
      {questionType.type === "mcq" ? (
        <McqRunner questions={questions} />
      ) : (
        <div className="grid gap-4">
          {questions.map((q) => (
            <Card key={q.id}>
              <CardContent className="p-5">
                <Badge variant="outline" className="capitalize">{q.difficulty}</Badge>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={q.question_image_url} alt={`Structured question, difficulty ${q.difficulty}`} className="mt-3 w-full rounded-xl" />
                <p className="mt-3 text-sm"><b>Marking scheme:</b> {q.marking_scheme || "Coming soon."}</p>
                <p className="text-sm"><b>Explanation:</b> {q.explanation || "Coming soon."}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {video ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-brand">
          <div className="aspect-video bg-black">
            <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${video.youtube_video_id}`} title={video.title} allowFullScreen />
          </div>
          <div className="p-5">
            <h3 className="font-bold">{video.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{video.description}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function McqRunner({ questions }: { questions: Question[] }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const q = questions[index];
  if (!q) return <EmptyBlock icon={FileQuestion} title="No questions uploaded yet" />;
  const answers = ["A", "B", "C", "D"] as const;
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">Question {index + 1} of {questions.length}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={q.question_image_url} alt={`Question ${index + 1} of ${questions.length}`} className="mt-3 w-full rounded-xl" />
        <div className="mt-4 grid grid-cols-4 gap-2">
          {answers.map((a) => {
            const isSelected = selected[q.id] === a;
            const isCorrect = q.correct_answer === a;
            return (
              <button
                key={a}
                disabled={submitted}
                onClick={() => setSelected((s) => ({ ...s, [q.id]: a }))}
                className={`h-12 rounded-xl border text-sm font-bold ${submitted && isCorrect ? "border-emerald-500 bg-emerald-500/10" : submitted && isSelected ? "border-destructive bg-destructive/10" : isSelected ? "border-primary bg-primary/10" : "border-border"}`}
              >
                {a}
              </button>
            );
          })}
        </div>
        {submitted ? <p className="mt-3 text-sm text-muted-foreground">{q.explanation}</p> : null}
        <div className="mt-4 flex justify-between">
          <Button variant="outline" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>Previous</Button>
          {!submitted ? <Button onClick={() => setSubmitted(true)}>Submit</Button> : null}
          <Button variant="outline" disabled={index === questions.length - 1} onClick={() => setIndex((i) => i + 1)}>Next</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TeachersView({ catalog, setScreen }: { catalog: Catalog; setScreen: (s: PublicScreen) => void }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Teachers</h1>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {catalog.teachers.map((t) => (
          <button key={t.id} onClick={() => setScreen({ name: "teacherProfile", teacherId: t.id })} className="rounded-2xl border border-border bg-card p-5 text-left shadow-brand">
            <div className="flex items-center gap-3">
              {t.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.photo_url} alt={t.name} className="h-14 w-14 rounded-xl object-cover" />
              ) : (
                <div className="grid h-14 w-14 place-items-center rounded-xl bg-primary/10 text-primary"><UserRound className="h-6 w-6" /></div>
              )}
              <div>
                <p className="font-bold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.subjects.join(", ") || "Subject mentor"}</p>
              </div>
            </div>
            <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{t.short_bio}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function TeacherProfileView({ catalog, teacherId, setScreen }: { catalog: Catalog; teacherId: string; setScreen: (s: PublicScreen) => void }) {
  const teacher = catalog.teachers.find((t) => t.id === teacherId);
  if (!teacher) return null;
  const videos = catalog.discussionVideos.filter((v) => v.teacher_id === teacher.id);
  const questionTypes = catalog.questionTypes.filter((q) => q.teacher_id === teacher.id);
  return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => setScreen({ name: "teachers" })}>&larr; Back to teachers</Button>
      <div className="mt-4 grid gap-6 lg:grid-cols-[300px_1fr]">
        <Card><CardContent className="p-5">
          {teacher.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={teacher.photo_url} alt={teacher.name} className="h-32 w-32 rounded-2xl object-cover" />
          ) : null}
          <h1 className="mt-4 text-2xl font-bold">{teacher.name}</h1>
          <p className="text-sm text-muted-foreground">{teacher.qualifications}</p>
          <p className="text-sm font-semibold text-primary">{teacher.experience_years} years experience</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <h2 className="text-xl font-bold">Biography</h2>
          <p className="mt-2 text-sm text-muted-foreground">{teacher.biography}</p>
          <h3 className="mt-4 font-semibold">Content ({videos.length} videos, {questionTypes.length} question sets)</h3>
        </CardContent></Card>
      </div>
    </div>
  );
}

function Crumbs({ items }: { items: { label: string; onOpen?: () => void }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 ? <ChevronRight className="h-3 w-3" /> : null}
          {item.onOpen ? <button onClick={item.onOpen} className="hover:text-primary">{item.label}</button> : <span className="font-semibold text-foreground">{item.label}</span>}
        </span>
      ))}
    </div>
  );
}

function EmptyBlock({ icon: Icon, title }: { icon: typeof FileQuestion; title: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
      <Icon className="h-8 w-8" />
      <p className="mt-3">{title}</p>
    </div>
  );
}

// ============================================================================
// ADMIN AREA
// ============================================================================

type RunFn = <T extends { error?: string }>(fn: () => Promise<T>) => Promise<T>;
type AdminTab = "dashboard" | "curriculums" | "levels" | "subjects" | "teachers" | "content" | "settings";

function AdminArea({
  catalog, session, run, onSessionChange, onExit,
}: {
  catalog: Catalog;
  session: Session;
  run: RunFn;
  onSessionChange: (s: Session) => void;
  onExit: () => void;
}) {
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [tab, setTab] = useState<AdminTab>("dashboard");

  if (!session.authenticated) {
    return (
      <div className="mx-auto max-w-md">
        <Card><CardContent className="p-8">
          <h1 className="text-2xl font-bold">Admin Sign In</h1>
          <form
            className="mt-6 grid gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData();
              fd.set("password", password);
              const result = await actions.login(fd);
              if (result.error) { setLoginError(result.error); return; }
              setLoginError(null);
              onSessionChange(await actions.getSession());
            }}
          >
            <label className="grid gap-2 text-sm font-semibold">
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 rounded-xl border border-input bg-background px-4" />
            </label>
            {loginError ? <p className="text-sm font-semibold text-destructive">{loginError}</p> : null}
            <Button type="submit" className="h-11">Sign in</Button>
          </form>
        </CardContent></Card>
      </div>
    );
  }

  const role = session.role;
  const tabs: { id: AdminTab; label: string; icon: typeof HomeIcon }[] = role === "admin"
    ? [
        { id: "dashboard", label: "Dashboard", icon: HomeIcon },
        { id: "curriculums", label: "Curriculums", icon: BookOpen },
        { id: "levels", label: "Levels", icon: FolderOpen },
        { id: "subjects", label: "Subjects", icon: GraduationCap },
        { id: "teachers", label: "Teachers", icon: Users },
        { id: "content", label: "Content Manager", icon: FileQuestion },
        { id: "settings", label: "Settings", icon: SettingsIcon },
      ]
    : [
        { id: "dashboard", label: "Dashboard", icon: HomeIcon },
        { id: "content", label: "My Subjects", icon: FileQuestion },
      ];

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="rounded-2xl border border-border bg-card p-3">
        <nav className="grid gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${tab === t.id ? "bg-brand-gradient text-white" : "text-muted-foreground hover:bg-muted/10"}`}
            >
              <t.icon className="h-4 w-4" />{t.label}
            </button>
          ))}
        </nav>
        <div className="mt-4 border-t border-border pt-3">
          <button
            onClick={async () => { await actions.logout(); onSessionChange(await actions.getSession()); onExit(); }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />Sign Out
          </button>
        </div>
      </aside>

      <div>
        {tab === "dashboard" ? <DashboardPanel catalog={catalog} role={role!} /> : null}
        {tab === "curriculums" && role === "admin" ? <CurriculumsPanel catalog={catalog} run={run} /> : null}
        {tab === "levels" && role === "admin" ? <LevelsPanel catalog={catalog} run={run} /> : null}
        {tab === "subjects" && role === "admin" ? <SubjectsPanel catalog={catalog} run={run} /> : null}
        {tab === "teachers" && role === "admin" ? <TeachersPanel catalog={catalog} run={run} /> : null}
        {tab === "content" ? <ContentManagerPanel catalog={catalog} session={session} run={run} /> : null}
        {tab === "settings" && role === "admin" ? <SettingsPanel /> : null}
      </div>
    </div>
  );
}

function DashboardPanel({ catalog, role }: { catalog: Catalog; role: "admin" | "teacher" }) {
  const stats = [
    { label: "Curriculums", value: catalog.curriculums.length, icon: BookOpen },
    { label: "Subjects", value: catalog.subjects.length, icon: GraduationCap },
    { label: "Sub Topics", value: catalog.subTopics.length, icon: FolderOpen },
    { label: "Questions", value: catalog.questions.length, icon: FileQuestion },
  ];
  return (
    <div>
      <h1 className="text-2xl font-bold">{role === "admin" ? "Admin Dashboard" : "Teacher Dashboard"}</h1>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}><CardContent className="p-5">
            <s.icon className="h-6 w-6 text-primary" />
            <p className="mt-2 text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}

// ---------- Generic reorderable list (replaces broken drag-and-drop) ----------

function ReorderableList({
  items, onReorder,
}: {
  items: { id: string; label: string }[];
  onReorder: (orderedIds: string) => Promise<unknown>;
}) {
  async function move(index: number, dir: -1 | 1) {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    await onReorder(next.map((i) => i.id).join(","));
  }
  return (
    <div className="grid gap-2">
      {items.map((item, i) => (
        <div key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/5 px-4 py-2">
          <span className="text-sm font-medium">{i + 1}. {item.label}</span>
          <div className="flex gap-1">
            <button disabled={i === 0} onClick={() => move(i, -1)} className="rounded-lg p-1.5 hover:bg-muted/20 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
            <button disabled={i === items.length - 1} onClick={() => move(i, 1)} className="rounded-lg p-1.5 hover:bg-muted/20 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ConfirmDeleteButton({ label, onDelete }: { label: string; onDelete: () => Promise<unknown> }) {
  return (
    <button
      onClick={() => { if (window.confirm(`Delete ${label}? This can't be undone from here.`)) onDelete(); }}
      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-destructive hover:bg-destructive/10"
    >
      <Trash2 className="h-4 w-4" />Delete
    </button>
  );
}

function TextField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="grid gap-1 text-sm font-semibold">
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} type={type} className="h-10 rounded-xl border border-input bg-background px-3 text-sm" />
    </label>
  );
}

// ---------- Curriculums / Levels / Subjects panels ----------

function CurriculumsPanel({ catalog, run }: { catalog: Catalog; run: RunFn }) {
  const [name, setName] = useState("");
  const curriculums = [...catalog.curriculums].sort(byOrder);
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">Curriculums</h1>
      <Card><CardContent className="p-5">
        <div className="flex gap-2">
          <TextField label="New curriculum name" value={name} onChange={setName} />
          <Button className="mt-6" onClick={async () => {
            const fd = new FormData(); fd.set("name", name); fd.set("display_order", String(curriculums.length + 1));
            await run(() => actions.createCurriculum(fd)); setName("");
          }}>Add</Button>
        </div>
      </CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Order</CardTitle></CardHeader><CardContent>
        <ReorderableList items={curriculums.map((c) => ({ id: c.id, label: c.name }))} onReorder={(ids) => run(() => actions.reorderCurriculums(ids))} />
      </CardContent></Card>
      <div className="grid gap-3">
        {curriculums.map((c) => <CurriculumRow key={c.id} curriculum={c} run={run} />)}
      </div>
    </div>
  );
}
function CurriculumRow({ curriculum, run }: { curriculum: Curriculum; run: RunFn }) {
  const [name, setName] = useState(curriculum.name);
  return (
    <Card><CardContent className="flex items-end gap-3 p-4">
      <TextField label="Name" value={name} onChange={setName} />
      <Button onClick={() => {
        const fd = new FormData(); fd.set("id", curriculum.id); fd.set("name", name); fd.set("display_order", String(curriculum.display_order));
        run(() => actions.updateCurriculum(fd));
      }}>Save</Button>
      <ConfirmDeleteButton label={curriculum.name} onDelete={() => run(() => actions.deleteCurriculum(curriculum.id))} />
    </CardContent></Card>
  );
}

function LevelsPanel({ catalog, run }: { catalog: Catalog; run: RunFn }) {
  const [curriculumId, setCurriculumId] = useState(catalog.curriculums[0]?.id ?? "");
  const [name, setName] = useState("");
  const levels = curriculumId ? levelsOf(catalog, curriculumId) : [];
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">Levels</h1>
      <Card><CardContent className="p-5">
        <label className="grid gap-1 text-sm font-semibold">
          Curriculum
          <select value={curriculumId} onChange={(e) => setCurriculumId(e.target.value)} className="h-10 rounded-xl border border-input bg-background px-3 text-sm">
            {catalog.curriculums.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <div className="mt-3 flex gap-2">
          <TextField label="New level name" value={name} onChange={setName} />
          <Button className="mt-6" onClick={async () => {
            const fd = new FormData(); fd.set("curriculum_id", curriculumId); fd.set("name", name); fd.set("display_order", String(levels.length + 1));
            await run(() => actions.createLevel(fd)); setName("");
          }}>Add</Button>
        </div>
      </CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Order</CardTitle></CardHeader><CardContent>
        <ReorderableList items={levels.map((l) => ({ id: l.id, label: l.name }))} onReorder={(ids) => run(() => actions.reorderLevels(ids))} />
      </CardContent></Card>
      <div className="grid gap-3">
        {levels.map((l) => <LevelRow key={l.id} level={l} run={run} />)}
      </div>
    </div>
  );
}
function LevelRow({ level, run }: { level: Level; run: RunFn }) {
  const [name, setName] = useState(level.name);
  return (
    <Card><CardContent className="flex items-end gap-3 p-4">
      <TextField label="Name" value={name} onChange={setName} />
      <Button onClick={() => {
        const fd = new FormData(); fd.set("id", level.id); fd.set("curriculum_id", level.curriculum_id); fd.set("name", name); fd.set("display_order", String(level.display_order));
        run(() => actions.updateLevel(fd));
      }}>Save</Button>
      <ConfirmDeleteButton label={level.name} onDelete={() => run(() => actions.deleteLevel(level.id))} />
    </CardContent></Card>
  );
}

function SubjectsPanel({ catalog, run }: { catalog: Catalog; run: RunFn }) {
  const [levelId, setLevelId] = useState(catalog.levels[0]?.id ?? "");
  const [name, setName] = useState("");
  const subjects = levelId ? subjectsOf(catalog, levelId) : [];
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">Subjects</h1>
      <Card><CardContent className="p-5">
        <label className="grid gap-1 text-sm font-semibold">
          Level
          <select value={levelId} onChange={(e) => setLevelId(e.target.value)} className="h-10 rounded-xl border border-input bg-background px-3 text-sm">
            {catalog.levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </label>
        <div className="mt-3 flex gap-2">
          <TextField label="New subject name" value={name} onChange={setName} />
          <Button className="mt-6" onClick={async () => {
            const fd = new FormData(); fd.set("level_id", levelId); fd.set("name", name); fd.set("display_order", String(subjects.length + 1));
            await run(() => actions.createSubject(fd)); setName("");
          }}>Add</Button>
        </div>
      </CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Order</CardTitle></CardHeader><CardContent>
        <ReorderableList items={subjects.map((s) => ({ id: s.id, label: s.name }))} onReorder={(ids) => run(() => actions.reorderSubjects(ids))} />
      </CardContent></Card>
      <div className="grid gap-3">
        {subjects.map((s) => <SubjectRow key={s.id} subject={s} run={run} />)}
      </div>
    </div>
  );
}
function SubjectRow({ subject, run }: { subject: Subject; run: RunFn }) {
  const [name, setName] = useState(subject.name);
  return (
    <Card><CardContent className="flex items-end gap-3 p-4">
      <TextField label="Name" value={name} onChange={setName} />
      <Button onClick={() => {
        const fd = new FormData(); fd.set("id", subject.id); fd.set("level_id", subject.level_id); fd.set("name", name); fd.set("display_order", String(subject.display_order));
        run(() => actions.updateSubject(fd));
      }}>Save</Button>
      <ConfirmDeleteButton label={subject.name} onDelete={() => run(() => actions.deleteSubject(subject.id))} />
    </CardContent></Card>
  );
}

function TeachersPanel({ catalog, run }: { catalog: Catalog; run: RunFn }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [assignTeacherId, setAssignTeacherId] = useState(catalog.teachers[0]?.id ?? "");
  const [assignSubjectId, setAssignSubjectId] = useState(catalog.subjects[0]?.id ?? "");
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">Teachers</h1>
      <Card><CardContent className="flex flex-wrap items-end gap-3 p-5">
        <TextField label="Name" value={name} onChange={setName} />
        <TextField label="Email" value={email} onChange={setEmail} type="email" />
        <Button onClick={async () => {
          const fd = new FormData(); fd.set("name", name); fd.set("email", email);
          await run(() => actions.createTeacher(fd)); setName(""); setEmail("");
        }}>Create Teacher</Button>
      </CardContent></Card>

      <Card><CardHeader><CardTitle className="text-base">Assign a Subject</CardTitle></CardHeader><CardContent className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-sm font-semibold">Teacher
          <select value={assignTeacherId} onChange={(e) => setAssignTeacherId(e.target.value)} className="h-10 rounded-xl border border-input bg-background px-3 text-sm">
            {catalog.teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">Subject
          <select value={assignSubjectId} onChange={(e) => setAssignSubjectId(e.target.value)} className="h-10 rounded-xl border border-input bg-background px-3 text-sm">
            {catalog.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <Button onClick={() => {
          const fd = new FormData(); fd.set("teacher_id", assignTeacherId); fd.set("subject_id", assignSubjectId);
          run(() => actions.assignTeacherSubject(fd));
        }}>Assign</Button>
      </CardContent></Card>

      <div className="grid gap-3">
        {catalog.teachers.map((t) => (
          <Card key={t.id}><CardContent className="p-4">
            <TeacherRow teacher={t} run={run} />
            <div className="mt-3 flex flex-wrap gap-2">
              {catalog.teacherSubjects.filter((ts) => ts.teacher_id === t.id).map((ts) => {
                const subject = catalog.subjects.find((s) => s.id === ts.subject_id);
                return (
                  <span key={ts.id} className="flex items-center gap-2 rounded-lg border border-border bg-muted/5 px-3 py-1 text-sm">
                    {subject?.name ?? "Unknown subject"}
                    <button onClick={() => { if (window.confirm("Remove this assignment?")) run(() => actions.deleteTeacherAssignment(ts.id)); }} className="text-destructive">&times;</button>
                  </span>
                );
              })}
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
function TeacherRow({ teacher, run }: { teacher: Teacher; run: RunFn }) {
  const [name, setName] = useState(teacher.name);
  const [email, setEmail] = useState(teacher.email);
  return (
    <div className="flex items-end gap-3">
      <TextField label="Name" value={name} onChange={setName} />
      <TextField label="Email" value={email} onChange={setEmail} type="email" />
      <Button onClick={() => {
        const fd = new FormData(); fd.set("id", teacher.id); fd.set("name", name); fd.set("email", email);
        run(() => actions.updateTeacher(fd));
      }}>Save</Button>
      <ConfirmDeleteButton label={teacher.name} onDelete={() => run(() => actions.deleteTeacher(teacher.id))} />
    </div>
  );
}

function SettingsPanel() {
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card><CardContent className="grid gap-3 p-5 text-sm text-muted-foreground">
        <p><b className="text-foreground">Admin role:</b> controlled by <code>ADMIN_ROLE</code></p>
        <p><b className="text-foreground">Teacher profile:</b> controlled by <code>ADMIN_TEACHER_EMAIL</code></p>
        <p><b className="text-foreground">Supabase writes:</b> require <code>SUPABASE_SERVICE_ROLE_KEY</code></p>
      </CardContent></Card>
    </div>
  );
}

// ---------- Content Manager (cascading selects instead of a tree widget) ----------

function ContentManagerPanel({ catalog, session, run }: { catalog: Catalog; session: Session; run: RunFn }) {
  const visibleSubjects = session.role === "admin"
    ? catalog.subjects
    : (() => {
        const teacher = catalog.teachers.find((t) => t.email === session.teacherEmail);
        return teacher ? subjectsForTeacher(catalog, teacher.id) : [];
      })();

  const [subjectId, setSubjectId] = useState(visibleSubjects[0]?.id ?? "");
  const [unitId, setUnitId] = useState<string>("");
  const [topicId, setTopicId] = useState<string>("");
  const [subTopicId, setSubTopicId] = useState<string>("");
  const [questionTypeId, setQuestionTypeId] = useState<string>("");

  const subject = catalog.subjects.find((s) => s.id === subjectId);
  const units = subject ? unitsOf(catalog, subject.id) : [];
  const topics = unitId ? topicsOf(catalog, unitId) : [];
  const subTopics = topicId ? subTopicsOf(catalog, topicId) : [];
  const questionTypes = subTopicId ? questionTypesOf(catalog, subTopicId) : [];
  const questionType = catalog.questionTypes.find((q) => q.id === questionTypeId);

  if (!visibleSubjects.length) {
    return <Card><CardContent className="p-6">No subjects assigned yet. Ask an admin to assign one.</CardContent></Card>;
  }

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">Content Manager</h1>

      <Card><CardContent className="p-5">
        <label className="grid gap-1 text-sm font-semibold">Subject
          <select value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setUnitId(""); setTopicId(""); setSubTopicId(""); setQuestionTypeId(""); }} className="h-10 rounded-xl border border-input bg-background px-3 text-sm">
            {visibleSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
      </CardContent></Card>

      {subject ? (
        <ContentLevel
          title="Units" parentLabel={subject.name}
          items={units} selectedId={unitId} onSelect={(id) => { setUnitId(id); setTopicId(""); setSubTopicId(""); setQuestionTypeId(""); }}
          onCreate={(name) => run(() => { const fd = new FormData(); fd.set("subject_id", subject.id); fd.set("name", name); fd.set("display_order", String(units.length + 1)); fd.set("description", ""); return actions.createUnit(fd); })}
          onRename={(id, name) => { const u = units.find((x) => x.id === id)!; const fd = new FormData(); fd.set("id", id); fd.set("subject_id", subject.id); fd.set("name", name); fd.set("display_order", String(u.display_order)); fd.set("description", u.description); return run(() => actions.updateUnit(fd)); }}
          onDelete={(id) => run(() => actions.deleteUnit(id))}
        />
      ) : null}

      {unitId ? (
        <ContentLevel
          title="Topics" parentLabel={units.find((u) => u.id === unitId)?.name ?? ""}
          items={topics} selectedId={topicId} onSelect={(id) => { setTopicId(id); setSubTopicId(""); setQuestionTypeId(""); }}
          onCreate={(name) => run(() => { const fd = new FormData(); fd.set("unit_id", unitId); fd.set("name", name); fd.set("display_order", String(topics.length + 1)); fd.set("description", ""); return actions.createTopic(fd); })}
          onRename={(id, name) => { const t = topics.find((x) => x.id === id)!; const fd = new FormData(); fd.set("id", id); fd.set("unit_id", unitId); fd.set("name", name); fd.set("display_order", String(t.display_order)); fd.set("description", t.description); return run(() => actions.updateTopic(fd)); }}
          onDelete={(id) => run(() => actions.deleteTopic(id))}
        />
      ) : null}

      {topicId ? (
        <ContentLevel
          title="Sub Topics" parentLabel={topics.find((t) => t.id === topicId)?.name ?? ""}
          items={subTopics} selectedId={subTopicId} onSelect={(id) => { setSubTopicId(id); setQuestionTypeId(""); }}
          onCreate={(name) => run(() => { const fd = new FormData(); fd.set("topic_id", topicId); fd.set("name", name); fd.set("display_order", String(subTopics.length + 1)); fd.set("description", ""); return actions.createSubTopic(fd); })}
          onRename={(id, name) => { const s = subTopics.find((x) => x.id === id)!; const fd = new FormData(); fd.set("id", id); fd.set("topic_id", topicId); fd.set("name", name); fd.set("display_order", String(s.display_order)); fd.set("description", s.description); return run(() => actions.updateSubTopic(fd)); }}
          onDelete={(id) => run(() => actions.deleteSubTopic(id))}
        />
      ) : null}

      {subTopicId ? (
        <QuestionTypesEditor
          subTopicId={subTopicId} questionTypes={questionTypes} catalog={catalog} run={run}
          selectedId={questionTypeId} onSelect={setQuestionTypeId}
        />
      ) : null}

      {questionType ? <QuestionTypeEditor questionType={questionType} catalog={catalog} run={run} /> : null}
    </div>
  );
}

function ContentLevel({
  title, parentLabel, items, selectedId, onSelect, onCreate, onRename, onDelete,
}: {
  title: string; parentLabel: string;
  items: { id: string; name: string }[];
  selectedId: string; onSelect: (id: string) => void;
  onCreate: (name: string) => Promise<unknown>;
  onRename: (id: string, name: string) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}) {
  const [newName, setNewName] = useState("");
  return (
    <Card><CardHeader><CardTitle className="text-base">{title} in {parentLabel}</CardTitle></CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex gap-2">
          <TextField label={`New ${title.toLowerCase().slice(0, -1)}`} value={newName} onChange={setNewName} />
          <Button className="mt-6" onClick={async () => { await onCreate(newName); setNewName(""); }}>Add</Button>
        </div>
        <div className="grid gap-2">
          {items.map((item) => (
            <ContentRow key={item.id} item={item} selected={item.id === selectedId} onSelect={() => onSelect(item.id)} onRename={(name) => onRename(item.id, name)} onDelete={() => onDelete(item.id)} />
          ))}
          {!items.length ? <p className="text-sm text-muted-foreground">Nothing here yet.</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function ContentRow({
  item, selected, onSelect, onRename, onDelete,
}: {
  item: { id: string; name: string };
  selected: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(item.name);
  return (
    <div className={`flex items-center gap-2 rounded-xl border p-2 ${selected ? "border-primary bg-primary/5" : "border-border"}`}>
      <button onClick={onSelect} className="flex-1 text-left text-sm font-semibold">{item.name}</button>
      <input value={name} onChange={(e) => setName(e.target.value)} className="h-9 w-40 rounded-lg border border-input bg-background px-2 text-sm" />
      <Button size="sm" onClick={() => onRename(name)}>Save</Button>
      <ConfirmDeleteButton label={item.name} onDelete={async () => onDelete()} />
    </div>
  );
}

function QuestionTypesEditor({
  subTopicId, questionTypes, catalog, run, selectedId, onSelect,
}: {
  subTopicId: string;
  questionTypes: QuestionType[];
  catalog: Catalog;
  run: RunFn;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"mcq" | "structured">("mcq");
  return (
    <Card><CardHeader><CardTitle className="text-base">Question Types</CardTitle></CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex flex-wrap items-end gap-2">
          <TextField label="Title" value={title} onChange={setTitle} />
          <label className="grid gap-1 text-sm font-semibold">Type
            <select value={type} onChange={(e) => setType(e.target.value as "mcq" | "structured")} className="h-10 rounded-xl border border-input bg-background px-3 text-sm">
              <option value="mcq">MCQ</option>
              <option value="structured">Structured</option>
            </select>
          </label>
          <Button onClick={async () => {
            const fd = new FormData();
            fd.set("sub_topic_id", subTopicId); fd.set("title", title); fd.set("type", type);
            fd.set("description", ""); fd.set("display_order", String(questionTypes.length + 1));
            await run(() => actions.createQuestionType(fd)); setTitle("");
          }}>Add</Button>
        </div>
        <div className="grid gap-2">
          {questionTypes.map((qt) => (
            <div key={qt.id} className={`flex items-center justify-between rounded-xl border p-2 ${qt.id === selectedId ? "border-primary bg-primary/5" : "border-border"}`}>
              <button onClick={() => onSelect(qt.id)} className="text-left text-sm font-semibold">{qt.type.toUpperCase()} — {qt.title}</button>
              <ConfirmDeleteButton label={qt.title} onDelete={() => run(() => actions.deleteQuestionType(qt.id))} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function QuestionTypeEditor({ questionType, catalog, run }: { questionType: QuestionType; catalog: Catalog; run: RunFn }) {
  const questions = questionsOf(catalog, questionType.id);
  const video = videoFor(catalog, questionType.id);
  const [imageUrl, setImageUrl] = useState("");
  const [correct, setCorrect] = useState<"" | "A" | "B" | "C" | "D">("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [videoTitle, setVideoTitle] = useState(video?.title ?? `${questionType.title} Discussion`);
  const [videoUrl, setVideoUrl] = useState(video?.youtube_url ?? "");

  return (
    <div className="grid gap-6">
      <Card><CardHeader><CardTitle className="text-base">Questions in &ldquo;{questionType.title}&rdquo;</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_120px_120px_auto]">
            <TextField label="Question image URL" value={imageUrl} onChange={setImageUrl} />
            <label className="grid gap-1 text-sm font-semibold">Correct
              <select value={correct} onChange={(e) => setCorrect(e.target.value as typeof correct)} className="h-10 rounded-xl border border-input bg-background px-2 text-sm">
                <option value="">None</option><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold">Difficulty
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} className="h-10 rounded-xl border border-input bg-background px-2 text-sm">
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
            </label>
            <Button className="mt-6" onClick={async () => {
              const fd = new FormData();
              fd.set("question_type_id", questionType.id); fd.set("question_image_url", imageUrl);
              fd.set("correct_answer", correct); fd.set("difficulty", difficulty);
              fd.set("marking_scheme", ""); fd.set("explanation", ""); fd.set("display_order", String(questions.length + 1));
              const result = await run(() => actions.createQuestion(fd));
              if (!result.error) setImageUrl("");
            }}>Add</Button>
          </div>
          <div className="grid gap-2">
            {questions.map((q) => (
              <div key={q.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                <span className="text-sm">{q.difficulty} — {q.correct_answer ?? "no answer set"}</span>
                <ConfirmDeleteButton label="this question" onDelete={() => run(() => actions.deleteQuestion(q.id))} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card><CardHeader><CardTitle className="text-base">Discussion Video</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          <TextField label="Title" value={videoTitle} onChange={setVideoTitle} />
          <TextField label="YouTube URL" value={videoUrl} onChange={setVideoUrl} />
          <div className="flex gap-2">
            <Button onClick={() => {
              const fd = new FormData();
              if (video) fd.set("id", video.id);
              fd.set("question_type_id", questionType.id); fd.set("title", videoTitle); fd.set("youtube_url", videoUrl);
              fd.set("description", video?.description ?? ""); fd.set("resources", video?.resources ?? "");
              run(() => (video ? actions.updateDiscussionVideo(fd) : actions.createDiscussionVideo(fd)));
            }}>{video ? "Save Video" : "Add Video"}</Button>
            {video ? <ConfirmDeleteButton label="this video" onDelete={() => run(() => actions.deleteDiscussionVideo(video.id))} /> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
