"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, GraduationCap, Loader2, Search, TrendingUp, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Student = { user_id: string; full_name: string | null; avatar_url: string | null; subject_id: string; subject_name: string; practice_count: number; answered: number; correct: number; earned_marks: number; total_marks: number; access_type: string; access_status: string };

type RpcRow = { user_id: string; full_name: string | null; avatar_url: string | null; subject_id: string; subject_name: string; practice_count: number; answered: number; correct: number; earned_marks: number; total_marks: number; access_type: string; access_status: string };

function initials(name: string) { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "U"; }
function percentage(answered: number, correct: number) { return answered > 0 ? Math.round((correct / answered) * 100) : 0; }

export default function TeacherStudentsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true); setError("");
      const { data, error: rpcError } = await supabase.rpc("get_teacher_student_overview");
      if (!active) return;
      if (rpcError) setError(rpcError.message);
      else setStudents((data ?? []) as RpcRow[]);
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [supabase]);

  const subjects = Array.from(new Map(students.map((student) => [student.subject_id, student.subject_name])).entries());
  const query = search.trim().toLowerCase();
  const filtered = students.filter((student) => (!query || `${student.full_name ?? ""} ${student.subject_name}`.toLowerCase().includes(query)) && (subjectFilter === "all" || student.subject_id === subjectFilter));
  const uniqueStudents = new Set(filtered.map((student) => student.user_id)).size;
  const average = filtered.length ? Math.round(filtered.reduce((sum, student) => sum + percentage(student.answered, student.correct), 0) / filtered.length) : 0;
  const totalPractices = filtered.reduce((sum, student) => sum + Number(student.practice_count || 0), 0);

  return <div className="space-y-7">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-sm font-semibold text-primary">Teacher</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight">Students</h1><p className="mt-2 text-sm text-muted-foreground">Students with access to your assigned subjects and their Question Bank progress.</p></div><div className="flex flex-col gap-2 sm:flex-row"><div className="flex h-10 items-center gap-2 rounded-xl border border-input bg-card px-3 sm:w-72"><Search className="h-4 w-4 shrink-0 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60" /></div><select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)} className="h-10 rounded-xl border border-input bg-card px-3 text-sm outline-none focus:border-primary"><option value="all">All subjects</option>{subjects.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></div></div>
    {error && <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
    <section className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-border bg-card p-5"><Users className="h-5 w-5 text-primary" /><p className="mt-4 text-2xl font-black">{uniqueStudents}</p><p className="mt-1 text-xs font-semibold text-muted-foreground">Students</p></div><div className="rounded-2xl border border-border bg-card p-5"><BookOpen className="h-5 w-5 text-primary" /><p className="mt-4 text-2xl font-black">{totalPractices}</p><p className="mt-1 text-xs font-semibold text-muted-foreground">Practice sessions</p></div><div className="rounded-2xl border border-border bg-card p-5"><TrendingUp className="h-5 w-5 text-primary" /><p className="mt-4 text-2xl font-black">{average}%</p><p className="mt-1 text-xs font-semibold text-muted-foreground">Average accuracy</p></div></section>
    <section className="overflow-hidden rounded-2xl border border-border bg-card"><div className="border-b border-border px-5 py-4"><h2 className="font-bold">Student progress</h2><p className="mt-1 text-xs text-muted-foreground">{filtered.length} subject record{filtered.length === 1 ? "" : "s"} shown</p></div>{loading ? <div className="flex items-center justify-center py-16 text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading students...</div> : !filtered.length ? <div className="py-16 text-center text-sm text-muted-foreground">{query || subjectFilter !== "all" ? "No students match the selected filters." : "No students currently have access to your assigned subjects."}</div> : <div className="divide-y divide-border">{filtered.map((student) => { const name = student.full_name || "Student"; const accuracy = percentage(Number(student.answered || 0), Number(student.correct || 0)); return <div key={`${student.user_id}-${student.subject_id}`} className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between"><div className="flex min-w-0 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-extrabold text-primary">{student.avatar_url ? <img src={student.avatar_url} alt="" className="h-full w-full object-cover" /> : initials(name)}</div><div className="min-w-0"><p className="truncate text-sm font-bold">{name}</p><p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground"><GraduationCap className="h-3.5 w-3.5 shrink-0" />{student.subject_name}</p></div></div><div className="grid grid-cols-3 gap-5 sm:min-w-[430px]"><div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Practice</p><p className="mt-1 text-sm font-black">{student.practice_count}</p></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Accuracy</p><p className="mt-1 text-sm font-black">{accuracy}%</p></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Access</p><p className="mt-1 text-xs font-bold capitalize">{student.access_type === "premium" ? "Premium" : "Subject"}</p></div></div></div>; })}</div>}</section>
  </div>;
}
