"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, ChevronRight, FileText, FolderTree, Search, Sparkles, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Curriculum = { id: string; name: string; description: string | null };
type Level = { id: string; curriculum_id: string; name: string; description: string | null };
type Subject = { id: string; level_id: string; name: string; code: string | null; description: string | null };
type Node = { id: string; subject_id: string | null; parent_id: string | null; name: string; description: string | null };
type Page = { id: string; subject_id: string; content_node_id: string | null; title: string; description: string | null; page_type: string };
type Crumb = { id: string; name: string; kind: "curriculum" | "level" | "subject" | "node" };

export default function QuestionBankClient() {
  const supabase = useMemo(() => createClient(), []);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]), [levels, setLevels] = useState<Level[]>([]), [subjects, setSubjects] = useState<Subject[]>([]), [nodes, setNodes] = useState<Node[]>([]), [pages, setPages] = useState<Page[]>([]);
  const [search, setSearch] = useState(""), [loading, setLoading] = useState(true), [error, setError] = useState("");
  const [crumbs, setCrumbs] = useState<Crumb[]>([]);

  useEffect(() => { let alive = true; async function load() {
    const [c,l,s,n,p] = await Promise.all([
      supabase.from("curriculums").select("id,name,description").eq("is_active",true).order("name"),
      supabase.from("levels").select("id,curriculum_id,name,description").eq("is_active",true).order("name"),
      supabase.from("subjects").select("id,level_id,name,code,description").eq("is_active",true).order("name"),
      supabase.from("content_nodes").select("id,subject_id,parent_id,name,description").eq("is_active",true).order("name"),
      supabase.from("question_pages").select("id,subject_id,content_node_id,title,description,page_type").eq("is_published",true).order("created_at",{ascending:false}),
    ]);
    if (!alive) return; const first = c.error ?? l.error ?? s.error ?? n.error ?? p.error;
    if (first) setError(first.message); else { setCurriculums((c.data??[]) as Curriculum[]); setLevels((l.data??[]) as Level[]); setSubjects((s.data??[]) as Subject[]); setNodes((n.data??[]) as Node[]); setPages((p.data??[]) as Page[]); }
    setLoading(false);
  } void load(); return () => { alive=false; }; }, [supabase]);

  const selectedSubject = crumbs.findLast((c) => c.kind === "subject");
  const selectedNode = crumbs.findLast((c) => c.kind === "node");
  const selectedLevel = crumbs.findLast((c) => c.kind === "level");
  const selectedCurriculum = crumbs.findLast((c) => c.kind === "curriculum");
  const currentSubject = selectedSubject ? subjects.find(s=>s.id===selectedSubject.id) : null;
  const currentNode = selectedNode ? nodes.find(n=>n.id===selectedNode.id) : null;
  const currentLevel = selectedLevel ? levels.find(l=>l.id===selectedLevel.id) : null;
  const visibleLevels = selectedCurriculum ? levels.filter(l=>l.curriculum_id===selectedCurriculum.id) : [];
  const visibleSubjects = currentLevel ? subjects.filter(s=>s.level_id===currentLevel.id) : [];
  const childNodes = currentSubject ? nodes.filter(n=>n.subject_id===currentSubject.id && n.parent_id===(currentNode?.id ?? null)) : [];
  const visiblePages = currentSubject ? pages.filter(p=>p.subject_id===currentSubject.id && p.content_node_id===(currentNode?.id ?? null)) : [];

  const searchResults = useMemo(() => { const q=search.trim().toLowerCase(); if(!q) return [] as Array<{kind:string;id:string;title:string;meta:string;pageId?:string}>; const out:Array<{kind:string;id:string;title:string;meta:string;pageId?:string}>=[];
    for(const p of pages){const s=subjects.find(x=>x.id===p.subject_id), n=p.content_node_id?nodes.find(x=>x.id===p.content_node_id):null; if(`${p.title} ${p.description??""} ${p.page_type} ${s?.name??""} ${n?.name??""}`.toLowerCase().includes(q)) out.push({kind:"page",id:p.id,title:p.title,meta:[s?.name,n?.name,p.page_type].filter(Boolean).join(" · "),pageId:p.id});}
    for(const s of subjects) if(`${s.name} ${s.code??""} ${s.description??""}`.toLowerCase().includes(q)) out.push({kind:"subject",id:s.id,title:s.name,meta:s.code?`Subject · ${s.code}`:"Subject"});
    for(const n of nodes) if(`${n.name} ${n.description??""}`.toLowerCase().includes(q)){const s=subjects.find(x=>x.id===n.subject_id);out.push({kind:"node",id:n.id,title:n.name,meta:`${s?.name??"Subject"} · Topic`});}
    return out.slice(0,24);
  },[search,pages,subjects,nodes]);

  function openCurriculum(c:Curriculum){setCrumbs([{id:c.id,name:c.name,kind:"curriculum"}]);setSearch("");}
  function openLevel(l:Level){const c=curriculums.find(x=>x.id===l.curriculum_id);setCrumbs([{id:c?.id??"",name:c?.name??"Curriculum",kind:"curriculum"},{id:l.id,name:l.name,kind:"level"}]);setSearch("");}
  function openSubject(s:Subject){const l=levels.find(x=>x.id===s.level_id),c=l&&curriculums.find(x=>x.id===l.curriculum_id);setCrumbs([{id:c?.id??"",name:c?.name??"Curriculum",kind:"curriculum"},{id:l?.id??"",name:l?.name??"Level",kind:"level"},{id:s.id,name:s.name,kind:"subject"}]);setSearch("");}
  function openNode(n: Node) {
    const s = n.subject_id
      ? subjects.find((x) => x.id === n.subject_id)
      : undefined;

    const l = s
      ? levels.find((x) => x.id === s.level_id)
      : undefined;

    const c = l
      ? curriculums.find((x) => x.id === l.curriculum_id)
      : undefined;

    const chain: Crumb[] = [
      {
        id: c?.id ?? "",
        name: c?.name ?? "Curriculum",
        kind: "curriculum",
      },
      {
        id: l?.id ?? "",
        name: l?.name ?? "Level",
        kind: "level",
      },
      {
        id: s?.id ?? "",
        name: s?.name ?? "Subject",
        kind: "subject",
      },
    ];

    const parents: Node[] = [];
    let x: Node | undefined = n;

    while (x) {
      parents.unshift(x);
      x = x.parent_id
        ? nodes.find((y) => y.id === x!.parent_id)
        : undefined;
    }

    parents.forEach((p) =>
      chain.push({
        id: p.id,
        name: p.name,
        kind: "node",
      })
    );

    setCrumbs(chain);
    setSearch("");
  }  
  
  
  
  
  function goCrumb(i:number){setCrumbs(crumbs.slice(0,i+1));}

  const title=currentNode?.name??currentSubject?.name??currentLevel?.name??selectedCurriculum?.name??"Question Bank";
  const emptyMessage=currentSubject?"No published Question Pages here yet.":"Nothing published here yet.";
  return <main className="min-h-[calc(100vh-72px)] bg-background">
    <section className="border-b border-border/60 bg-gradient-to-b from-primary/[0.07] via-background to-background"><div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:px-8"><div className="mx-auto max-w-3xl text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"><Sparkles className="h-5 w-5"/></div><p className="mt-5 text-xs font-extrabold uppercase tracking-[0.2em] text-primary">iSkole Question Bank</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Find a question. Start practising.</h1><p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground">Search everything or browse naturally by curriculum, level, subject and topic.</p>
      <div className="relative mx-auto mt-7 max-w-2xl"><Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"/><input autoComplete="off" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search questions, subjects, topics or papers..." className="h-14 w-full rounded-2xl border border-border bg-card pl-14 pr-12 text-sm font-medium shadow-lg shadow-black/[0.04] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"/>{search&&<button type="button" aria-label="Clear search" onClick={()=>setSearch("")} className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"><X className="h-4 w-4"/></button>}
        {search&&<div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 max-h-[440px] overflow-auto rounded-2xl border border-border bg-card p-2 text-left shadow-2xl">{searchResults.length?searchResults.map(r=>r.kind==="page"?<Link key={r.id} href={`/student/question/${r.pageId}`} className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileText className="h-4 w-4"/></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{r.title}</span><span className="block truncate text-xs text-muted-foreground">{r.meta}</span></span><ChevronRight className="h-4 w-4 text-muted-foreground"/></Link>:<button key={`${r.kind}-${r.id}`} type="button" onClick={()=>r.kind==="subject"?openSubject(subjects.find(s=>s.id===r.id)!):openNode(nodes.find(n=>n.id===r.id)!)} className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-muted"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><FolderTree className="h-4 w-4"/></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{r.title}</span><span className="block truncate text-xs text-muted-foreground">{r.meta}</span></span><ChevronRight className="h-4 w-4 text-muted-foreground"/></button>):<div className="p-8 text-center"><p className="font-semibold">No matches found</p><p className="mt-1 text-sm text-muted-foreground">Try a subject, topic, or Question Page title.</p></div>}</div>}</div>
    </div></div></section>
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{error&&<div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
      {crumbs.length>0&&<nav aria-label="Question Bank path" className="mb-6 flex items-center gap-1 overflow-x-auto whitespace-nowrap text-sm"><button type="button" onClick={()=>setCrumbs([])} className="font-bold text-primary hover:underline">All</button>{crumbs.map((c,i)=><span key={`${c.id}-${i}`} className="flex items-center gap-1"><ChevronRight className="h-4 w-4 text-muted-foreground/50"/><button type="button" onClick={()=>goCrumb(i)} className={`font-semibold ${i===crumbs.length-1?"text-foreground":"text-muted-foreground hover:text-foreground"}`}>{c.name}</button></span>)}</nav>}
      {loading?<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({length:8}).map((_,i)=><div key={i} className="h-44 animate-pulse rounded-2xl bg-muted"/>)}</div>:search?null:crumbs.length===0?<section><div className="mb-5"><p className="text-xs font-bold uppercase tracking-wider text-primary">Browse</p><h2 className="mt-1 text-2xl font-black">Choose your curriculum</h2><p className="mt-1 text-sm text-muted-foreground">Start broad, or use search above to jump straight to a Question Page.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{curriculums.map(c=><button key={c.id} type="button" onClick={()=>openCurriculum(c)} className="group rounded-2xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/[0.06]"><div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><BookOpen className="h-5 w-5"/></span><ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary"/></div><h3 className="mt-5 font-bold">{c.name}</h3>{c.description&&<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>}<p className="mt-4 text-xs font-semibold text-muted-foreground">{levels.filter(l=>l.curriculum_id===c.id).length} levels</p></button>)}</div></section>:selectedCurriculum&&!selectedLevel?<section><Header eyebrow={selectedCurriculum.name} title="Choose a level"/><Grid>{visibleLevels.map(l=><button key={l.id} type="button" onClick={()=>openLevel(l)} className="group rounded-2xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"><div className="flex items-center justify-between"><span className="text-lg font-black">{l.name}</span><ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary"/></div><p className="mt-3 text-sm text-muted-foreground">{subjects.filter(s=>s.level_id===l.id).length} subjects</p></button>)}</Grid></section>:selectedLevel&&!selectedSubject?<section><Header eyebrow={selectedLevel.name} title="Choose a subject"/><Grid>{visibleSubjects.map(s=><button key={s.id} type="button" onClick={()=>openSubject(s)} className="group rounded-2xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"><div className="flex items-center justify-between"><div><h3 className="font-bold">{s.name}</h3>{s.code&&<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.code}</p>}</div><ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary"/></div><p className="mt-4 text-xs font-semibold text-muted-foreground">{pages.filter(p=>p.subject_id===s.id).length} Question Pages</p></button>)}</Grid></section>:<section><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">{crumbs.slice(0,-1).map(c=>c.name).join(" · ")}</p><h2 className="mt-1 text-3xl font-black">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{currentNode?"Topics and Question Pages in this section.":"Choose a topic or open a Question Page directly."}</p></div><span className="rounded-full bg-muted px-3 py-1.5 text-xs font-bold">{visiblePages.length} Question Pages</span></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{childNodes.map(n=><button key={n.id} type="button" onClick={()=>openNode(n)} className="group rounded-2xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted"><FolderTree className="h-5 w-5"/></span><h3 className="mt-5 font-bold">{n.name}</h3>{n.description&&<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{n.description}</p>}<span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary">Open topic <ArrowRight className="h-3.5 w-3.5"/></span></button>)}{visiblePages.map(p=><Link key={p.id} href={`/student/question/${p.id}`} className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"><div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileText className="h-5 w-5"/></span><ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary"/></div><p className="mt-5 text-[11px] font-extrabold uppercase tracking-wider text-primary">{p.page_type}</p><h3 className="mt-1 line-clamp-2 font-bold">{p.title}</h3>{p.description&&<p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>}<span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-primary">View questions <ArrowRight className="h-4 w-4"/></span></Link>)}</div>{!childNodes.length&&!visiblePages.length&&<div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-12 text-center"><FolderTree className="mx-auto h-9 w-9 text-muted-foreground"/><p className="mt-4 font-bold">{emptyMessage}</p><p className="mt-1 text-sm text-muted-foreground">Try another topic or use search.</p></div>}</section>}
    </div></main>;
}

function Header({eyebrow,title}:{eyebrow:string;title:string}){return <div className="mb-5"><p className="text-xs font-bold uppercase tracking-wider text-primary">{eyebrow}</p><h2 className="mt-1 text-2xl font-black">{title}</h2></div>}
function Grid({children}:{children:React.ReactNode}){return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{children}</div>}
