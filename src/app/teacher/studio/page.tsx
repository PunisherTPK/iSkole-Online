"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Layers3,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type Subject = {
  id: string;
  name: string;
  code: string | null;
  level_id: string;
  level_name?: string;
  curriculum_id?: string;
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

type AssignmentRow = {
  subject_id: string;
};

type SubjectRow = {
  id: string;
  name: string;
  code: string | null;
  level_id: string;
  levels:
    | {
        id: string;
        name: string;
        curriculum_id: string;
        curriculums:
          | { id: string; name: string }
          | { id: string; name: string }[]
          | null;
      }
    | {
        id: string;
        name: string;
        curriculum_id: string;
        curriculums:
          | { id: string; name: string }
          | { id: string; name: string }[]
          | null;
      }[]
    | null;
};

export default function TeacherStudioPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

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
        if (mounted) setError(profileError.message);
        setLoading(false);
        return;
      }

      if (profile?.role !== "teacher" && profile?.role !== "admin") {
        router.replace("/");
        return;
      }

      let subjectIds: string[] | null = null;

      if (profile.role === "teacher") {
        const { data: assignmentData, error: assignmentError } = await supabase
          .from("teacher_subjects")
          .select("subject_id")
          .eq("teacher_id", user.id)
          .eq("is_active", true);

        if (assignmentError) {
          if (mounted) setError(assignmentError.message);
          setLoading(false);
          return;
        }

        const assignments = (assignmentData ?? []) as AssignmentRow[];
        subjectIds = assignments.map((item) => item.subject_id);

        if (subjectIds.length === 0) {
          if (mounted) {
            setSubjects([]);
            setNodes([]);
            setLoading(false);
          }
          return;
        }
      }

      let subjectQuery = supabase
        .from("subjects")
        .select(
          "id, name, code, level_id, levels(id, name, curriculum_id, curriculums(id, name))",
        )
        .eq("is_active", true)
        .order("name");

      if (subjectIds) {
        subjectQuery = subjectQuery.in("id", subjectIds);
      }

      const { data: subjectData, error: subjectError } = await subjectQuery;

      if (subjectError) {
        if (mounted) setError(subjectError.message);
        setLoading(false);
        return;
      }

      const subjectRows = (subjectData ?? []) as SubjectRow[];
      const normalizedSubjects: Subject[] = subjectRows.map((item) => {
        const level = Array.isArray(item.levels) ? item.levels[0] : item.levels;
        const curriculum = level
          ? Array.isArray(level.curriculums)
            ? level.curriculums[0]
            : level.curriculums
          : undefined;

        return {
          id: item.id,
          name: item.name,
          code: item.code,
          level_id: item.level_id,
          level_name: level?.name,
          curriculum_id: level?.curriculum_id,
          curriculum_name: curriculum?.name,
        };
      });

      const allowedSubjectIds = normalizedSubjects.map((item) => item.id);

      let nodeData: Node[] = [];
      if (allowedSubjectIds.length > 0) {
        const { data, error: nodeError } = await supabase
          .from("content_nodes")
          .select("id, subject_id, parent_id, name, description, is_active")
          .in("subject_id", allowedSubjectIds)
          .eq("is_active", true)
          .order("name");

        if (nodeError) {
          if (mounted) setError(nodeError.message);
          setLoading(false);
          return;
        }

        nodeData = (data ?? []) as Node[];
      }

      if (!mounted) return;

      setSubjects(normalizedSubjects);
      setNodes(nodeData);
      setSelectedSubjectId((current) =>
        current && normalizedSubjects.some((item) => item.id === current)
          ? current
          : normalizedSubjects[0]?.id ?? "",
      );
      setLoading(false);
    }

    void loadStudio();
    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  const selectedSubject = subjects.find((item) => item.id === selectedSubjectId);
  const subjectNodes = nodes.filter((item) => item.subject_id === selectedSubjectId);
  const normalizedSearch = search.trim().toLowerCase();

  const visibleNodes = normalizedSearch
    ? subjectNodes.filter((node) =>
        `${node.name} ${node.description ?? ""}`.toLowerCase().includes(normalizedSearch),
      )
    : subjectNodes;

  const roots = visibleNodes.filter((node) => !node.parent_id);

  function childrenOf(parentId: string) {
    return visibleNodes.filter((node) => node.parent_id === parentId);
  }

  function toggleNode(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function nodeDepth(node: Node) {
    let depth = 0;
    let parentId = node.parent_id;
    const seen = new Set<string>();

    while (parentId && !seen.has(parentId)) {
      seen.add(parentId);
      const parent = subjectNodes.find((item) => item.id === parentId);
      if (!parent) break;
      depth += 1;
      parentId = parent.parent_id;
    }

    return depth;
  }

  function nodeLabel(depth: number) {
    if (depth === 0) return "Unit";
    if (depth === 1) return "Topic";
    if (depth === 2) return "Sub Topic";
    return "Content";
  }

  function renderNode(node: Node) {
    const children = childrenOf(node.id);
    const isOpen = expanded.has(node.id) || Boolean(normalizedSearch);
    const depth = nodeDepth(node);

    return (
      <div key={node.id}>
        <button
          type="button"
          onClick={() => toggleNode(node.id)}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-muted/50"
          style={{ paddingLeft: `${12 + depth * 24}px` }}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {children.length > 0 ? (
              isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            ) : (
              <Layers3 className="h-3.5 w-3.5" />
            )}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-foreground">
              {node.name}
            </span>
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              {nodeLabel(depth)}
            </span>
          </span>

          {children.length > 0 && (
            <span className="text-[10px] font-semibold text-muted-foreground">
              {children.length}
            </span>
          )}
        </button>

        {isOpen && children.length > 0 && (
          <div>{children.map(renderNode)}</div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 animate-pulse rounded-2xl bg-muted" />
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
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
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
            Teacher Studio
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Build and manage learning content for your assigned subjects.
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
        <section className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-lg font-bold text-foreground">No subjects assigned</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            An administrator needs to assign subjects to your teacher account before you can manage learning content.
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
              {subjects.map((subject) => {
                const active = subject.id === selectedSubjectId;
                return (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => {
                      setSelectedSubjectId(subject.id);
                      setSearch("");
                      setExpanded(new Set());
                    }}
                    className={`w-full rounded-xl px-3 py-3 text-left transition ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                        <BookOpen className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">{subject.name}</span>
                        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                          {[subject.curriculum_name, subject.level_name].filter(Boolean).join(" → ") || "Assigned subject"}
                        </span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <span>{selectedSubject?.curriculum_name ?? "Curriculum"}</span>
                    <span>→</span>
                    <span>{selectedSubject?.level_name ?? "Level"}</span>
                  </div>
                  <h2 className="mt-1 truncate text-xl font-bold text-foreground">
                    {selectedSubject?.name ?? "Subject"}
                  </h2>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search content..."
                    className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </div>
            </div>

            <div className="p-3">
              {roots.length === 0 ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <Layers3 className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-bold text-foreground">
                    {search ? "No matching content" : "No content yet"}
                  </p>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                    {search
                      ? "Try a different search term."
                      : "Units, topics and sub topics for this subject will appear here."}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">{roots.map(renderNode)}</div>
              )}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
