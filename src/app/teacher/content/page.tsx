import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createTeacherContent, deleteTeacherContent } from "@/lib/teacher-actions";

type Curriculum = { name: string } | null;
type Level = { name: string; curriculums: Curriculum } | null;
type Subject = { id: string; name: string; code: string | null; levels: Level };
type Node = { id: string; subject_id: string; parent_id: string | null; name: string; description: string | null; is_active: boolean; created_at: string };
type Assignment = { subject_id: string; subjects: Subject | null };
type QuestionPage = { id: string; title: string; page_type: string; is_published: boolean; content_node_id: string | null };

function qs(values: Record<string, string | null | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value) params.set(key, value);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export default async function TeacherContentPage({ searchParams }: { searchParams: Promise<{ subjectId?: string; nodeId?: string }> }) {
  const params = await searchParams;
  const selectedSubjectId = params.subjectId ?? "";
  const selectedNodeId = params.nodeId ?? "";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div className="app-page"><div className="app-page-content"><h1>Sign in required</h1><p>Please sign in as a teacher or administrator.</p></div></div>;

  const { data: profile } = await supabase.from("profiles").select("role, is_active, full_name").eq("id", user.id).maybeSingle();
  if (!profile?.is_active || !["teacher", "admin"].includes(profile.role)) return <div className="app-page"><div className="app-page-content"><h1>Teacher access</h1><p>Your account is not assigned teacher access.</p></div></div>;

  const assignments = profile.role === "admin"
    ? await supabase.from("subjects").select("id, name, code, levels(name, curriculums(name))").order("name")
    : await supabase.from("teacher_subjects").select("subject_id, subjects(id, name, code, levels(name, curriculums(name)))").eq("teacher_id", user.id).eq("is_active", true);

  const subjects: Subject[] = profile.role === "admin"
    ? (assignments.data ?? []) as unknown as Subject[]
    : ((assignments.data ?? []) as unknown as Assignment[]).map((row) => row.subjects).filter((subject): subject is Subject => subject !== null);

  const subject = subjects.find((item) => item.id === selectedSubjectId) ?? null;
  const subjectId = subject?.id ?? null;
  const { data: rawNodes } = subjectId
    ? await supabase.from("content_nodes").select("id, subject_id, parent_id, name, description, is_active, created_at").eq("subject_id", subjectId).eq("is_active", true).order("name")
    : { data: [] as Node[] };
  const nodes = (rawNodes ?? []) as Node[];
  const node = nodes.find((item) => item.id === selectedNodeId) ?? null;
  const currentParentId = node?.id ?? null;
  const children = nodes.filter((item) => item.parent_id === currentParentId);

  let rawPages;

  if (subjectId) {
    const pagesQuery = supabase
      .from("question_pages")
      .select("id, title, page_type, is_published, content_node_id")
      .eq("subject_id", subjectId)
      .order("title");

    rawPages = node
      ? await pagesQuery.eq("content_node_id", node.id)
      : await pagesQuery.is("content_node_id", null);
  } else {
    rawPages = { data: [] as QuestionPage[] };
  }

  const pages = (rawPages.data ?? []) as QuestionPage[];

  const breadcrumb: Node[] = [];
  if (node) {
    let cursor: Node | undefined = node;
    while (cursor) {
      breadcrumb.unshift(cursor);
      cursor = cursor.parent_id ? nodes.find((item) => item.id === cursor?.parent_id) : undefined;
    }
  }

  const locationLabel = node?.name ?? subject?.name ?? "Question Bank";

  return <div className="app-page"><div className="app-page-content max-w-7xl">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="app-eyebrow">Teacher Studio</p>
        <h1>Question Bank</h1>
        <p className="mt-2 text-muted-foreground">Navigate like a file explorer. Folders are optional and can be nested to any depth.</p>
      </div>
      <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">{profile.role === "admin" ? "Admin" : "Teacher"}</span>
    </div>

    <nav className="mt-6 flex flex-wrap items-center gap-2 text-sm" aria-label="Breadcrumb">
      <Link href="/teacher/content" className="font-semibold text-primary hover:underline">Question Bank</Link>
      {subject && <><span className="text-muted-foreground">/</span><Link href={`/teacher/content${qs({ subjectId: subject.id })}`} className={!node ? "font-semibold text-foreground" : "font-semibold text-primary hover:underline"}>{subject.name}</Link></>}
      {breadcrumb.map((item, index) => <span key={item.id} className="flex items-center gap-2"><span className="text-muted-foreground">/</span>{index === breadcrumb.length - 1 ? <span className="font-semibold text-foreground">{item.name}</span> : <Link href={`/teacher/content${qs({ subjectId: subject?.id, nodeId: item.id })}`} className="font-semibold text-primary hover:underline">{item.name}</Link>}</span>)}
    </nav>

    {!subject ? <section className="mt-8"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-semibold">Subjects</h2><p className="text-sm text-muted-foreground">Choose a subject to open its root.</p></div></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {subjects.map((item) => <Link key={item.id} href={`/teacher/content${qs({ subjectId: item.id })}`} className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"><div className="text-3xl">📁</div><h3 className="mt-4 text-lg font-semibold group-hover:text-primary">{item.name}</h3><p className="mt-1 text-sm text-muted-foreground">{item.levels?.curriculums?.name ?? "Curriculum"} · {item.levels?.name ?? "Level"}{item.code ? ` · ${item.code}` : ""}</p></Link>)}
      {!subjects.length && <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center"><h2 className="font-semibold">No subjects assigned</h2><p className="mt-1 text-sm text-muted-foreground">Ask an administrator to assign a subject to your teacher account.</p></div>}
    </div></section> : <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm"><div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current location</p><h2 className="mt-1 text-xl font-semibold">{locationLabel}</h2></div><div className="flex flex-wrap gap-2"><Link href={`/teacher/question-pages/new${qs({ subjectId: subject.id, nodeId: node?.id })}`} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">+ Question Page</Link><form action={createTeacherContent} className="flex gap-2"><input type="hidden" name="subjectId" value={subject.id}/>{node && <input type="hidden" name="parentId" value={node.id}/>}<input name="name" required placeholder="New folder" className="w-36 rounded-xl border border-border bg-background px-3 py-2.5 text-sm"/><button className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold">+ Folder</button></form></div></div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {children.map((child) => <Link key={child.id} href={`/teacher/content${qs({ subjectId: subject.id, nodeId: child.id })}`} className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"><span className="text-3xl">📁</span><div className="min-w-0 flex-1"><h3 className="truncate font-semibold group-hover:text-primary">{child.name}</h3><p className="mt-1 text-xs text-muted-foreground">Folder</p></div></Link>)}
        {pages.map((page) => <Link key={page.id} href={`/teacher/question-pages/${page.id}`} className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"><span className="text-3xl">📄</span><div className="min-w-0 flex-1"><h3 className="truncate font-semibold group-hover:text-primary">{page.title}</h3><p className="mt-1 text-xs text-muted-foreground">{page.page_type.toUpperCase()} · {page.is_published ? "Published" : "Draft"}</p></div></Link>)}
        {!children.length && !pages.length && <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center"><div className="text-4xl">📂</div><h3 className="mt-3 font-semibold">This folder is empty</h3><p className="mt-1 text-sm text-muted-foreground">Create a folder or a question page here.</p></div>}
      </div>

      {node && <form action={deleteTeacherContent} className="mt-6"><input type="hidden" name="id" value={node.id}/><button className="text-sm font-semibold text-destructive">Delete this folder</button></form>}
    </section>}
  </div></div>;
}
