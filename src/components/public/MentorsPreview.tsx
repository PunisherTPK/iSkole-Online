"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Award, BookOpen, GraduationCap, Loader2, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Mentor = { id: string; full_name: string | null; avatar_url: string | null; bio: string | null; subjects: { id: string; name: string }[] };
type Assignment = { teacher_id: string; subject_id: string };
type Subject = { id: string; name: string };

export default function MentorsPreview() {
  const supabase = useMemo(() => createClient(), []);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: teachers, error } = await supabase.from("profiles").select("id, full_name, avatar_url, bio").eq("role", "teacher").eq("is_active", true).order("full_name").limit(3);
      if (error) { if (active) setLoading(false); return; }
      const rows = (teachers ?? []) as Omit<Mentor, "subjects">[];
      if (!rows.length) { if (active) { setMentors([]); setLoading(false); } return; }
      const ids = rows.map((teacher) => teacher.id);
      const { data: assignments } = await supabase.from("teacher_subjects").select("teacher_id, subject_id").in("teacher_id", ids).eq("is_active", true);
      const assignmentRows = (assignments ?? []) as Assignment[];
      const subjectIds = [...new Set(assignmentRows.map((assignment) => assignment.subject_id))];
      const { data: subjects } = subjectIds.length ? await supabase.from("subjects").select("id, name").in("id", subjectIds).eq("is_active", true) : { data: [] as Subject[] };
      const subjectMap = new Map(((subjects ?? []) as Subject[]).map((subject) => [subject.id, subject]));
      const result = rows.map((teacher) => ({ ...teacher, subjects: assignmentRows.filter((assignment) => assignment.teacher_id === teacher.id).map((assignment) => subjectMap.get(assignment.subject_id)).filter((subject): subject is Subject => Boolean(subject)) }));
      if (active) { setMentors(result); setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [supabase]);

  return <section className="section-padding bg-background"><div className="container-site"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div className="max-w-2xl"><span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Meet our mentors</span><h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Learn from people who <span className="text-gradient">know the way.</span></h2><p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">Discover the teachers behind iSkole and find mentors who match the subjects you want to learn.</p></div><Link href="/mentors" className="inline-flex items-center gap-2 text-sm font-bold text-primary transition hover:gap-3">Meet all mentors<ArrowRight className="h-4 w-4" /></Link></div>
    {loading ? <div className="mt-10 flex h-72 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : mentors.length === 0 ? <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-10 text-center"><GraduationCap className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 text-sm font-bold">Our mentors are coming soon.</p><p className="mt-1 text-xs text-muted-foreground">Check back soon to meet the teachers behind iSkole.</p></div> : <div className="mt-10 grid gap-5 md:grid-cols-3">{mentors.map((mentor) => <article key={mentor.id} className="group overflow-hidden rounded-2xl border border-border bg-card transition duration-200 hover:-translate-y-1 hover:border-primary/20 hover:shadow-soft"><div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-violet-100/40"><div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />{mentor.avatar_url ? <img src={mentor.avatar_url} alt={mentor.full_name || "iSkole mentor"} className="relative h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg" /> : <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-primary/10 text-primary shadow-lg"><GraduationCap className="h-10 w-10" /></div>}<div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-bold text-foreground shadow-sm backdrop-blur"><Award className="h-3.5 w-3.5 text-primary" />Expert Mentor</div></div><div className="p-5"><p className="text-xs font-semibold text-primary">Subject Specialist</p><h3 className="mt-1 truncate text-lg font-extrabold text-foreground">{mentor.full_name || "iSkole Mentor"}</h3><p className="mt-3 line-clamp-3 min-h-[72px] text-sm leading-6 text-muted-foreground">{mentor.bio || "Helping students learn with clear explanations, focused practice, and structured guidance."}</p><div className="mt-4 flex min-h-7 flex-wrap gap-1.5">{mentor.subjects.slice(0, 3).map((subject) => <span key={subject.id} className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">{subject.name}</span>)}{mentor.subjects.length > 3 && <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">+{mentor.subjects.length - 3}</span>}</div><div className="mt-5 flex items-center gap-4 border-t border-border pt-4 text-[11px] text-muted-foreground"><span className="inline-flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />{mentor.subjects.length} subject{mentor.subjects.length === 1 ? "" : "s"}</span><span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />Student focused</span></div></div></article>)}</div>}
    <div className="mt-8 rounded-2xl border border-primary/10 bg-primary/[0.035] p-5 sm:flex sm:items-center sm:justify-between sm:gap-6"><div><h3 className="text-sm font-bold text-foreground">Looking for a specific subject?</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Browse the mentor directory and discover teachers and the subjects they teach.</p></div><Link href="/mentors" className="button-secondary mt-4 h-11 min-w-[150px] sm:mt-0">Browse Mentors<ArrowRight className="h-4 w-4" /></Link></div>
  </div></section>;
}
