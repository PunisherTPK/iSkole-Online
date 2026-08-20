"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronRight, FileText, FolderTree, Search, Sparkles, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Curriculum = { id: string; name: string; description: string | null };
type Level = { id: string; curriculum_id: string; name: string; description: string | null };
type Subject = { id: string; level_id: string; name: string; code: string | null; description: string | null };
type Node = { id: string; subject_id: string | null; parent_id: string | null; name: string; description: string | null };
type Page = { id: string; subject_id: string; content_node_id: string | null; title: string; description: string | null; page_type: string };
type Breadcrumb = { id: string; name: string };

export default function QuestionBankPage() {
  const supabase = useMemo(() => createClient(), []);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [path, setPath] = useState<Breadcrumb[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      const [curriculumQuery, levelQuery, subjectQuery, nodeQuery, pageQuery] = await Promise.all([
        supabase.from("curriculums").select("id,name,description").eq("is_active", true).order("name"),
        supabase.from("levels").select("id,curriculum_id,name,description").eq("is_active", true).order("name"),
        supabase.from("subjects").select("id,level_id,name,code,description").eq("is_active", true).order("name"),
        supabase.from("content_nodes").select("id,subject_id,parent_id,name,description").eq("is_active", true).order("name"),
        supabase.from("question_pages").select("id,subject_id,content_node_id,title,description,page_type").eq("is_published", true).order("created_at", { ascending: false }),
      ]);
      const firstError = curriculumQuery.error ?? levelQuery.error ?? subjectQuery.error ?? nodeQuery.error ?? pageQuery.error;
      if (firstError) { setError(firstError.message); setLoading(false); return; }
      setCurriculums((curriculumQuery.data ?? []) as Curriculum[]);
      setLevels((levelQuery.data ?? []) as Level[]);
      setSubjects((subjectQuery.data ?? []) as Subject[]);
      setNodes((nodeQuery.data ?? []) as Node[]);
      setPages((pageQuery.data ?? []) as Page[]);
      setLoading(false);
    }
    void load();
  }, [supabase]);

  const currentCurriculum = path.length === 1 ? path[0] : null;
  const currentLevel = path.length === 2 ? path[1] : null;
  const currentNode = selectedNode ? nodes.find((node) => node.id === selectedNode) ?? null : null;
  const currentSubject = selectedSubject ? subjects.find((subject) => subject.id === selectedSubject) ?? null : null;
  const visibleLevels = currentCurriculum ? levels.filter((level) => level.curriculum_id === currentCurriculum.id) : [];
  const visibleSubjects = currentLevel ? subjects.filter((subject) => subject.level_id === currentLevel.id) : [];
  const childNodes = selectedSubject && !selectedNode ? nodes.filter((node) => node.subject_id === selectedSubject && node.parent_id === null) : selectedNode ? nodes.filter((node) => node.subject_id === selectedSubject && node.parent_id === selectedNode) : [];
  const directPages = selectedSubject ? pages.filter((page) => page.subject_id === selectedSubject && (selectedNode ? page.content_node_id === selectedNode : page.content_node_id === null)) : [];

  const breadcrumb = useMemo(() => {
    if (!selectedSubject) return path;
    const subject = subjects.find((item) => item.id === selectedSubject);
    if (!subject) return path;
    const level = levels.find((item) => item.id === subject.level_id);
    const curriculum = level ? curriculums.find((item) => item.id === level.curriculum_id) : null;
    const items: Breadcrumb[] = [];
    if (curriculum) items.push({ id: curriculum.id, name: curriculum.name });
    if (level) items.push({ id: level.id, name: level.name });
    items.push({ id: subject.id, name: subject.name });
    if (selectedNode) {
      const chain: Node[] = [];
      let node = nodes.find((item) => item.id === selectedNode);
      while (node) { chain.unshift(node); node = node.parent_id ? nodes.find((item) => item.id === node!.parent_id) : undefined; }
      chain.forEach((item) => items.push({ id: item.id, name: item.name }));
    }
    return items;
  }, [selectedSubject, selectedNode, subjects, levels, curriculums, nodes, path]);

  const searchResults = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [] as Array<{ kind: "page" | "node" | "subject"; id: string; title: string; subtitle: string; pageId?: string }>;
    const results: Array<{ kind: "page" | "node" | "subject"; id: string; title: string; subtitle: string; pageId?: string }> = [];
    pages.forEach((page) => {
      const subject = subjects.find((item) => item.id === page.subject_id);
      const node = page.content_node_id ? nodes.find((item) => item.id === page.content_node_id) : null;
      const haystack = `${page.title} ${page.description ?? ""} ${page.page_type} ${subject?.name ?? ""} ${node?.name ?? ""}`.toLowerCase();
      if (haystack.includes(term)) results.push({ kind: "page", id: page.id, title: page.title, subtitle: `${subject?.name ?? "Subject"}${node ? ` · ${node.name}` : ""} · ${page.page_type}`, pageId: page.id });
    });
    subjects.forEach((subject) => { if (`${subject.name} ${subject.code ?? ""} ${subject.description ?? ""}`.toLowerCase().includes(term)) results.push({ kind: "subject", id: subject.id, title: subject.name, subtitle: subject.code ? `Subject · ${subject.code}` : "Subject" }); });
    nodes.forEach((node) => { if (`${node.name} ${node.description ?? ""}`.toLowerCase().includes(term)) { const subject = subjects.find((item) => item.id === node.subject_id); results.push({ kind: "node", id: node.id, title: node.name, subtitle: `${subject?.name ?? "Subject"} · Topic` }); } });
    return results.slice(0, 30);
  }, [search, pages, subjects, nodes]);

  function chooseCurriculum(curriculum: Curriculum) { setPath([{ id: curriculum.id, name: curriculum.name }]); setSelectedSubject(null); setSelectedNode(null); }
  function chooseLevel(level: Level) { const curriculum = curriculums.find((item) => item.id === level.curriculum_id); setPath(curriculum ? [{ id: curriculum.id, name: curriculum.name }, { id: level.id, name: level.name }] : [{ id: level.id, name: level.name }]); setSelectedSubject(null); setSelectedNode(null); }
  function chooseSubject(subject: Subject) { const level = levels.find((item) => item.id === subject.level_id); const curriculum = level ? curriculums.find((item) => item.id === level.curriculum_id) : null; setPath(curriculum && level ? [{ id: curriculum.id, name: curriculum.name }, { id: level.id, name: level.name }] : path); setSelectedSubject(subject.id); setSelectedNode(null); setSearch(""); }
  function chooseNode(node: Node) { setSelectedNode(node.id); setSearch(""); }
  function reset() { setPath([]); setSelectedSubject(null); setSelectedNode(null); setSearch(""); }
  function breadcrumbClick(index: number) { if (index === 0) { const curriculum = curriculums.find((item) => item.id === breadcrumb[0]?.id); if (curriculum) chooseCurriculum(curriculum); } else if (index === 1) { const level = levels.find((item) => item.id === breadcrumb[1]?.id); if (level) chooseLevel(level); } else if (index === 2 && selectedSubject) { const subject = subjects.find((item) => item.id === selectedSubject); if (subject) chooseSubject(subject); } }

  const showSearch = search.trim().length > 0;
  const title = currentNode?.name ?? currentSubject?.name ?? currentLevel?.name ?? currentCurriculum?.name ?? "Question Bank";
  const subtitle = currentNode ? "Question Pages and topics in this section." : currentSubject ? "Choose a topic, or practise a Question Page directly." : "Find questions by curriculum, subject, topic, or Question Page.";

  return (
    <main className="min-h-[calc(100vh-72px)] bg-background">
      <section className="border-b border-border/60 bg-gradient-to-b from-primary/[0.07] via-background to-background">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:px-8"><div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"><Sparkles className="h-5 w-5" /></div>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.2em] text-primary">iSkole Question Bank</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Find a question. Start practising.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground">Browse questions by curriculum, subject and topic, or search directly for the paper you need.</p>
          <div className="relative mx-auto mt-7 max-w-2xl"><Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" /><input autoComplete="off" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search questions, subjects, topics or papers..." className="h-14 w-full rounded-2xl border border-border bg-card pl-13 pr-12 text-sm font-medium shadow-lg shadow-black/[0.04] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />{showSearch && <button type="button" aria-label="Clear search" onClick={() => setSearch("")} className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"><X className="h-4 w-4" /></button>}{showSearch && <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 max-h-[420px] overflow-auto rounded-2xl border border-border bg-card p-2 text-left shadow-2xl shadow-black/10">{searchResults.length ? searchResults.map((result) => result.kind === "page" ? <Link key={`page-${result.id}`} href={`/student/question/${result.pageId}`} onClick={() => setSearch("")} className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-muted"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileText className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{result.title}</span><span className="block truncate text-xs text-muted-foreground">{result.subtitle}</span></span><ChevronRight className="h-4 w-4 text-muted-foreground" /></Link> : <button key={`${result.kind}-${result.id}`} type="button" onClick={() => { if (result.kind === "subject") { const subject = subjects.find((item) => item.id === result.id); if (subject) chooseSubject(subject); } else { const node = nodes.find((item) => item.id === result.id); if (node) { setSelectedSubject(node.subject_id); setSelectedNode(node.id); } } }} className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-muted"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><FolderTree className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{result.title}</span><span className="block truncate text-xs text-muted-foreground">{result.subtitle}</span></span><ChevronRight className="h-4 w-4 text-muted-foreground" /></button>) : <div className="p-7 text-center text-sm text-muted-foreground">No matching questions, subjects or topics.</div>}</div>}</div>
        </div></div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
        {!showSearch && breadcrumb.length > 0 && <nav aria-label="Question Bank path" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm">{breadcrumb.map((item, index) => <span key={`${item.id}-${index}`} className="flex items-center gap-1.5"><button type="button" onClick={() => breadcrumbClick(index)} disabled={index > 2} className={`font-semibold ${index <= 2 ? "text-muted-foreground hover:text-foreground" : "text-foreground"}`}>{item.name}</button>{index < breadcrumb.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground/50" />}</span>)}<button type="button" onClick={reset} className="ml-2 rounded-lg px-2 py-1 text-xs font-bold text-primary hover:bg-primary/10">All</button></nav>}
        {loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-44 animate-pulse rounded-2xl bg-muted" />)}</div> : showSearch ? null : !path.length && !selectedSubject ? <section><div className="mb-4"><p className="text-xs font-bold uppercase tracking-wider text-primary">Start here</p><h2 className="mt-1 text-2xl font-black">Choose your curriculum</h2></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{curriculums.map((curriculum) => <button key={curriculum.id} type="button" onClick={() => chooseCurriculum(curriculum)} className="group rounded-2xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/[0.06]"><div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><BookOpen className="h-5 w-5" /></span><ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" /></div><h3 className="mt-5 font-bold">{curriculum.name}</h3>{curriculum.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{curriculum.description}</p>}<p className="mt-4 text-xs font-semibold text-muted-foreground">{levels.filter((level) => level.curriculum_id === curriculum.id).length} levels</p></button>)}</div></section> : currentCurriculum && !currentLevel ? <section><div className="mb-5"><p className="text-xs font-bold uppercase tracking-wider text-primary">{currentCurriculum.name}</p><h2 className="mt-1 text-2xl font-black">Choose a level</h2></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visibleLevels.map((level) => <button key={level.id} type="button" onClick={() => chooseLevel(level)} className="group rounded-2xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"><div className="flex items-center justify-between"><span className="text-lg font-black">{level.name}</span><ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" /></div><p className="mt-3 text-sm text-muted-foreground">{subjects.filter((subject) => subject.level_id === level.id).length} subjects</p></button>)}</div></section> : currentLevel && !selectedSubject ? <section><div className="mb-5"><p className="text-xs font-bold uppercase tracking-wider text-primary">{currentLevel.name}</p><h2 className="mt-1 text-2xl font-black">Choose a subject</h2></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visibleSubjects.map((subject) => <button key={subject.id} type="button" onClick={() => chooseSubject(subject)} className="group rounded-2xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"><div className="flex items-center justify-between"><div><h3 className="font-bold">{subject.name}</h3>{subject.code && <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{subject.code}</p>}</div><ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" /></div><p className="mt-4 text-xs font-semibold text-muted-foreground">{pages.filter((page) => page.subject_id === subject.id).length} Question Pages</p></button>)}</div></section> : selectedSubject ? <section><div className="mb-6"><p className="text-xs font-bold uppercase tracking-wider text-primary">{breadcrumb.slice(0, -1).map((item) => item.name).join(" · ")}</p><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="mt-1 text-3xl font-black">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{subtitle}</p></div><span className="rounded-full bg-muted px-3 py-1.5 text-xs font-bold">{directPages.length + childNodes.reduce((count, node) => count + pages.filter((page) => page.content_node_id === node.id).length, 0)}+ pages</span></div></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{childNodes.map((node) => <button key={node.id} type="button" onClick={() => chooseNode(node)} className="group rounded-2xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-foreground"><FolderTree className="h-5 w-5" /></span><h3 className="mt-5 font-bold">{node.name}</h3>{node.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{node.description}</p>}<p className="mt-4 text-xs font-semibold text-muted-foreground">Browse topics and Question Pages <ChevronRight className="ml-1 inline h-3 w-3" /></p></button>)}{directPages.map((page) => <Link key={page.id} href={`/student/question/${page.id}`} className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"><div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileText className="h-5 w-5" /></span><ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" /></div><p className="mt-5 text-[11px] font-extrabold uppercase tracking-wider text-primary">{page.page_type}</p><h3 className="mt-1 line-clamp-2 font-bold">{page.title}</h3>{page.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{page.description}</p>}<span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-primary">View questions <ArrowRight className="h-4 w-4" /></span></Link>)}</div>{!childNodes.length && !directPages.length && <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center"><FolderTree className="mx-auto h-9 w-9 text-muted-foreground" /><p className="mt-4 font-bold">Nothing published here yet</p><p className="mt-1 text-sm text-muted-foreground">Check another subject or topic.</p></div>}</section> : null}
      </div>
    </main>
  );
}
