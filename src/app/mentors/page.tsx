"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, GraduationCap, Loader2, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Mentor = { id: string; full_name: string | null; avatar_url: string | null; bio: string | null; subjects: { id: string; name: string }[] };
type TeacherRow = { id: string; full_name: string | null; avatar_url: string | null; bio: string | null };
type AssignmentRow = { teacher_id: string; subject_id: string };
type SubjectRow = { id: string; name: string };

export default function MentorsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: teachers, error: teacherError } = await supabase.from("profiles").select("id, full_name, avatar_url, bio").eq("role", "teacher").eq("is_active", true).order("full_name");
      if (teacherError) { if (active) { setError(teacherError.message); setLoading(false); } return; }
      const rows = (teachers ?? []) as TeacherRow[];
      if (!rows.length) { if (active) { setMentors([]); setLoading(false); } return; }
      const ids = rows.map((t: TeacherRow) => t.id);
      const { data: assignments, error: assignmentError } = await supabase.from("teacher_subjects").select("teacher_id, subject_id").in("teacher_id", ids).eq("is_active", true);
      if (assignmentError) { if (active) { setError(assignmentError.message); setLoading(false); } return; }
      const assignmentRows = (assignments ?? []) as AssignmentRow[];
      const subjectIds = [...new Set(assignmentRows.map((a: AssignmentRow) => a.subject_id))];
      const { data: subjects } = subjectIds.length ? await supabase.from("subjects").select("id, name").in("id", subjectIds).eq("is_active", true) : { data: [] as SubjectRow[] };
      const subjectMap = new Map(((subjects ?? []) as SubjectRow[]).map((s: SubjectRow) => [s.id, s]));
      const mentorData: Mentor[] = rows.map((t: TeacherRow) => ({ ...t, subjects: assignmentRows.filter((a: AssignmentRow) => a.teacher_id === t.id).map((a: AssignmentRow) => subjectMap.get(a.subject_id)).filter((s): s is SubjectRow => Boolean(s)) }));
      if (active) { setMentors(mentorData); setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [supabase]);

  const filtered = mentors.filter((mentor) => { const q = search.trim().toLowerCase(); return !q || (mentor.full_name ?? "").toLowerCase().includes(q) || mentor.subjects.some((s) => s.name.toLowerCase().includes(q)); });

  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14"><section className="mx-auto max-w-3xl text-center"><p className="text-sm font-bold uppercase tracking-wider text-primary">Learn with iSkole</p><h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">Meet your mentors.</h1><p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Explore the teachers behind iSkole and find the subjects they teach.</p><div className="mx-auto mt-7 flex h-12 max-w-xl items-center gap-3 rounded-2xl border border-border bg-card px-4 shadow-sm"><Search className="h-4 w-4 shrink-0 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search mentors or subjects..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></div></section>{error && <div className="mx-auto mt-8 max-w-4xl rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}{loading ? <div className="flex min-h-[320px] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : filtered.length === 0 ? <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-dashed border-border bg-card p-10 text-center"><GraduationCap className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 font-bold">No mentors found</p><p className="mt-1 text-sm text-muted-foreground">Try a different name or subject.</p></div> : <section className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((mentor) => <Link key={mentor.id} href={`/mentors/${mentor.id}`} className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:border-primary/25 hover:shadow-soft"><div className="flex items-center gap-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-lg font-extrabold text-primary">{mentor.avatar_url ? <img src={mentor.avatar_url} alt="" className="h-full w-full object-cover" /> : (mentor.full_name ?? "M").charAt(0).toUpperCase()}</div><div className="min-w-0"><h2 className="truncate font-bold">{mentor.full_name || "iSkole Mentor"}</h2><p className="mt-1 text-xs text-muted-foreground">{mentor.subjects.length} subject{mentor.subjects.length === 1 ? "" : "s"}</p></div></div><p className="mt-5 line-clamp-3 min-h-14 text-sm leading-5 text-muted-foreground">{mentor.bio || "Helping students learn with clear explanations, focused practice, and structured guidance."}</p><div className="mt-5 flex flex-wrap gap-2">{mentor.subjects.slice(0, 3).map((subject) => <span key={subject.id} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold"><BookOpen className="h-3 w-3" />{subject.name}</span>)}{mentor.subjects.length > 3 && <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">+{mentor.subjects.length - 3}</span>}</div><div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs font-bold text-primary"><span>View mentor profile</span><ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></div></Link>)}</section>}</main>;
}
