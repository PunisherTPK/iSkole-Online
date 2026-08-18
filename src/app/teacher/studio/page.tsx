"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  FolderPlus,
  GraduationCap,
  Layers3,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Subject = {
  id: string;
  name: string;
  code: string | null;
  level_name?: string;
  curriculum_name?: string;
};

type Node = {
  id: string;
  subject_id: string;
  parent_id: string | null;
  name: string;
  description: string | null;
  is_active: boolean;
};

type QuestionPage = {
  id: string;
  subject_id: string;
  content_node_id: string | null;
  title: string;
  description: string | null;
  page_type: string;
  is_published: boolean;
};

type AssignmentRow = { subject_id: string };

type SubjectRow = {
  id: string;
  name: string;
  code: string | null;
  levels:
    | {
        name: string;
        curriculums: { name: string } | { name: string }[] | null;
      }
    | {
        name: string;
        curriculums: { name: string } | { name: string }[] | null;
      }[]
    | null;
};

type ModalState =
  | { kind: "node"; parentId: string | null; editing?: Node }
  | { kind: "question"; nodeId: string | null }
  | null;

export default function TeacherStudioPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [questionPages, setQuestionPages] = useState<QuestionPage[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [nodeName, setNodeName] = useState("");
  const [nodeDescription, setNodeDescription] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [pageDescription, setPageDescription] = useState("");
  const [pageType, setPageType] = useState("mcq");

  async function loadStudio() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    if (profile?.role !== "teacher" && profile?.role !== "admin") {
      router.replace("/");
      return;
    }

    let subjectIds: string[] | null = null;

    if (profile.role === "teacher") {
      const { data, error: assignmentError } = await supabase
        .from("teacher_subjects")
        .select("subject_id")
        .eq("teacher_id", user.id)
        .eq("is_active", true);

      if (assignmentError) {
        setError(assignmentError.message);
        setLoading(false);
        return;
      }

      subjectIds = (data ?? as AssignmentRow[]).map((item) => item.subject_id);
    }

    let subjectQuery = supabase
      .from("subjects")
      .select("id, name, code, levels(name, curriculums(name))")
      .eq("is_active", true)
      .order("name");

    if (subjectIds) {
      subjectQuery = subjectQuery.in("id", subjectIds);
    }

    const { data: subjectData, error: subjectError } = await subjectQuery;

    if (subjectError) {
      setError(subjectError.message);
      setLoading(false);
      return;
    }

    const normalizedSubjects: Subject[] = (subjectData ?? as SubjectRow[]).map(
      (row) => {
        const level = Array.isArray(row.levels) ? row.levels[0] : row.levels;
        const curriculum = level
          ? Array.isArray(level.curriculums)
            ? level.curriculums[0]
            : level.curriculums
          : null;

        return {
          id: row.id,
          name: row.name,
          code: row.code,
          level_name: level?.name,
          curriculum_name: curriculum?.name,
        };
      },
    );

    const ids = normalizedSubjects.map((subject) => subject.id);
    let nodeData: Node[] = [];
    let pageData: QuestionPage[] = [];

    if (ids.length > 0) {
      const [nodeResult, pageResult] = await Promise.all([
        supabase
          .from("content_nodes")
          .select("id, subject_id, parent_id, name, description, is_active")
          .in("subject_id", ids)
          .eq("is_active", true)
          .order("name"),
        supabase
          .from("question_pages")
          .select(
            "id, subject_id, content_node_id, title, description, page_type, is_published",
          )
          .in("subject_id", ids)
          .order("title"),
      ]);

      if (nodeResult.error) {
        setError(nodeResult.error.message);
        setLoading(false);
        return;
      }

      if (pageResult.error) {
        setError(pageResult.error.message);
        setLoading(false);
        return;
      }

      nodeData = (nodeResult.data ?? []) as Node[];
      pageData = (pageResult.data ?? []) as QuestionPage[];
    }

    setSubjects(normalizedSubjects);
    setNodes(nodeData);
    setQuestionPages(pageData);
    setSelectedSubjectId((current) =>
      current && ids.includes(current) ? current : ids[0] ?? "",
    );
    setLoading(false);
  }

  useEffect(() => {
    void loadStudio();
  }, []);

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId);
  const subjectNodes = nodes.filter((node) => node.subject_id === selectedSubjectId);
  const subjectPages = questionPages.filter(
    (page) => page.subject_id === selectedSubjectId,
  );
  const term = search.trim().toLowerCase();

  function childrenOf(parentId: string | null) {
    return subjectNodes.filter((node) => node.parent_id === parentId);
  }

  function pagesAt(nodeId: string | null) {
    return subjectPages.filter((page) => page.content_node_id === nodeId);
  }

  function toggleNode(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openNodeModal(parentId: string | null, editing?: Node) {
    setNodeName(editing?.name ?? "");
    setNodeDescription(editing?.description ?? "");
    setModal({ kind: "node", parentId, editing });
  }

  function openQuestionModal(nodeId: string | null) {
    setPageTitle("");
    setPageDescription("");
    setPageType("mcq");
    setModal({ kind: "question", nodeId });
  }

  async function saveNode() {
    if (!selectedSubjectId || !nodeName.trim() || modal?.kind !== "node") return;
    if (saving) return;

    setSaving(true);
    setError("");

    const payload = {
      subject_id: selectedSubjectId,
      parent_id: modal.parentId,
      name: nodeName.trim(),
      description: nodeDescription.trim() || null,
      is_active: true,
    };

    const result = modal.editing
      ? await supabase.from("content_nodes").update(payload).eq("id", modal.editing.id)
      : await supabase.from("content_nodes").insert(payload);

    if (result.error) {
      setError(result.error.message);
    } else {
      setModal(null);
      await loadStudio();
    }

    setSaving(false);
  }

  async function deleteNode(node: Node) {
    if (!confirm(`Delete "${node.name}" and its content?`)) return;

    setError("");
    const descendants = new Set<string>([node.id]);
    let changed = true;

    while (changed) {
      changed = false;
      for (const candidate of subjectNodes) {
        if (
          candidate.parent_id &&
          descendants.has(candidate.parent_id) &&
          !descendants.has(candidate.id)
        ) {
          descendants.add(candidate.id);
          changed = true;
        }
      }
    }

    const result = await supabase
      .from("content_nodes")
      .delete()
      .in("id", [...descendants]);

    if (result.error) setError(result.error.message);
    else await loadStudio();
  }

  async function saveQuestionPage() {
    if (!selectedSubjectId || !pageTitle.trim() || modal?.kind !== "question") return;
    if (saving) return;

    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Your session has expired. Please sign in again.");
      setSaving(false);
      return;
    }

    const payload = {
      subject_id: selectedSubjectId,
      content_node_id: modal.nodeId,
      title: pageTitle.trim(),
      description: pageDescription.trim() || null,
      page_type: pageType,
      is_published: false,
      created_by: user.id,
    };

    const { error: insertError } = await supabase
      .from("question_pages")
      .insert(payload);

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setModal(null);
    setPageTitle("");
    setPageDescription("");
    await loadStudio();
    setSaving(false);
  }

  function pageMatches(page: QuestionPage) {
    return (
      !term ||
      `${page.title} ${page.description ?? ""}`.toLowerCase().includes(term)
    );
  }

  function nodeMatches(node: Node) {
    return (
      !term ||
      `${node.name} ${node.description ?? ""}`.toLowerCase().includes(term)
    );
  }

  function branchHasMatch(node: Node): boolean {
    if (!term) return true;
    if (nodeMatches(node)) return true;
    if (pagesAt(node.id).some(pageMatches)) return true;
    return childrenOf(node.id).some(branchHasMatch);
  }

  function renderPage(page: QuestionPage, depth: number) {
    if (!pageMatches(page)) return null;

    return (
      <div
        key={page.id}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5"
        style={{ paddingLeft: `${24 + depth * 24}px` }}
      >
        <FileText className="h-4 w-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{page.title}</p>
          <p className="text-[11px] text-muted-foreground">
            Question Page · {page.page_type.toUpperCase()}
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
            page.is_published
              ? "bg-emerald-500/10 text-emerald-600"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {page.is_published ? "Published" : "Draft"}
        </span>
      </div>
    );
  }

  function renderTree(parentId: string | null, depth = 0): React.ReactNode {
    const directPages = pagesAt(parentId).filter(pageMatches);
    const children = childrenOf(parentId).filter(branchHasMatch);

    return (
      <>
        {directPages.map((page) => renderPage(page, depth))}

        {children.map((node) => {
          const childNodes = childrenOf(node.id);
          const childPages = pagesAt(node.id);
          const open = expanded.has(node.id) || Boolean(term);

          return (
            <div key={node.id}>
              <div className="group flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-muted/50">
                <button
                  type="button"
                  onClick={() => toggleNode(node.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-2 text-left"
                  style={{ paddingLeft: `${depth * 24}px` }}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {childNodes.length || childPages.length ? (
                      open ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )
                    ) : (
                      <Layers3 className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {node.name}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      Content node · {childNodes.length + childPages.length} item
                      {childNodes.length + childPages.length === 1 ? "" : "s"}
                    </span>
                  </span>
                </button>

                <div className="flex shrink-0 opacity-0 transition group-hover:opacity-100">
                  <button
                    title="Add child content"
                    type="button"
                    onClick={() => openNodeModal(node.id)}
                    className="rounded-lg p-2 hover:bg-muted"
                  >
                    <FolderPlus className="h-4 w-4" />
                  </button>
                  <button
                    title="Add Question Page"
                    type="button"
                    onClick={() => openQuestionModal(node.id)}
                    className="rounded-lg p-2 hover:bg-muted"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  <button
                    title="Edit"
                    type="button"
                    onClick={() => openNodeModal(node.parent_id, node)}
                    className="rounded-lg p-2 hover:bg-muted"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    title="Delete"
                    type="button"
                    onClick={() => void deleteNode(node)}
                    className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {open && <div>{renderTree(node.id, depth + 1)}</div>}
            </div>
          );
        })}
      </>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 animate-pulse rounded-2xl bg-muted" />
        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          <div className="h-[520px] animate-pulse rounded-2xl bg-muted" />
          <div className="h-[520px] animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Teacher Workspace</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Teacher Studio</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Build your own content structure. There are no predefined levels below a subject.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground">
          <GraduationCap className="h-4 w-4 text-primary" />
          {subjects.length} assigned subject{subjects.length === 1 ? "" : "s"}
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {subjects.length === 0 ? (
        <section className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card text-center">
          <BookOpen className="h-8 w-8 text-primary" />
          <h2 className="mt-4 text-lg font-bold">No subjects assigned</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            An administrator needs to assign a subject first.
          </p>
        </section>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <aside className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                My Subjects
              </p>
            </div>
            <div className="space-y-1 p-2">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => {
                    setSelectedSubjectId(subject.id);
                    setSearch("");
                    setExpanded(new Set());
                  }}
                  className={`w-full rounded-xl px-3 py-3 text-left transition ${
                    subject.id === selectedSubjectId
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <BookOpen className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{subject.name}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {[subject.curriculum_name, subject.level_name].filter(Boolean).join(" → ")}
                      </span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <main className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-muted-foreground">
                    {selectedSubject?.curriculum_name} → {selectedSubject?.level_name}
                  </div>
                  <h2 className="mt-1 truncate text-xl font-bold">{selectedSubject?.name}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="relative w-full sm:w-64">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search content..."
                      className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => openNodeModal(null)}
                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" /> Content
                  </button>
                  <button
                    type="button"
                    onClick={() => openQuestionModal(null)}
                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold hover:bg-muted"
                  >
                    <FileText className="h-4 w-4" /> Q Page
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3">{renderTree(null)}</div>
          </main>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {modal.kind === "node"
                  ? modal.editing
                    ? "Edit Content"
                    : "Add Content"
                  : "Add Question Page"}
              </h3>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg p-2 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {modal.kind === "node" ? (
              <form
                className="mt-5 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void saveNode();
                }}
              >
                <label className="block text-sm font-semibold">
                  Name
                  <input
                    autoFocus
                    value={nodeName}
                    onChange={(event) => setNodeName(event.target.value)}
                    className="mt-2 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                    placeholder="e.g. Mechanics"
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Description
                  <textarea
                    value={nodeDescription}
                    onChange={(event) => setNodeDescription(event.target.value)}
                    className="mt-2 min-h-24 w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-primary"
                  />
                </label>
                <button
                  disabled={saving || !nodeName.trim()}
                  type="submit"
                  className="h-10 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Content"}
                </button>
              </form>
            ) : (
              <form
                className="mt-5 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void saveQuestionPage();
                }}
              >
                <label className="block text-sm font-semibold">
                  Title
                  <input
                    autoFocus
                    value={pageTitle}
                    onChange={(event) => setPageTitle(event.target.value)}
                    className="mt-2 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                    placeholder="Question page title"
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Description
                  <textarea
                    value={pageDescription}
                    onChange={(event) => setPageDescription(event.target.value)}
                    className="mt-2 min-h-20 w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Page Type
                  <select
                    value={pageType}
                    onChange={(event) => setPageType(event.target.value)}
                    className="mt-2 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    <option value="mcq">MCQ</option>
                    <option value="structured">Structured</option>
                  </select>
                </label>
                <button
                  disabled={saving || !pageTitle.trim()}
                  type="submit"
                  className="h-10 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Question Page"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
