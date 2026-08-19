"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, FileText, Layers3, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Subject = { id: string; name: string; code: string | null };
type Profile = { full_name: string | null };

export default function TeacherPage() {
  const supabase = useMemo(() => createClient(), []);
  const [name, setName] = useState("Teacher");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [contentCount, setContentCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profile }, { data: assignments, error: assignmentError }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
        supabase.from("teacher_subjects").select("subject_id").eq("teacher_id", user.id).eq("is_active", true),
      ]);

      if (assignmentError) {
        if (active) { setError(assignmentError.message); setLoading(false); }
        return;
      }

      const subjectIds = (assignments ?? []).map((row) => row.subject_id as string);
      if (!active) return;
      setName((profile as Profile | null)?.full_name || "Teacher");

      if (!subjectIds.length) {
        setSubjects([]); setContentCount(0); setPageCount(0); setDraftCount(0); setPublishedCount(0); setLoading(false); return;
      }

      const [{ data: subjectData, error: subjectError }, { count: nodeCount, error: nodeError }, { data: pages, error: pageError }] = await Promise.all([
        supabase.from("subjects").select("id, name, code").in("id", subjectIds).eq("is_active", true).order("name"),
        supabase.from("content_nodes").select("id", { count: "exact", head: true }).in("subject_id", subjectIds).eq("is_active", true),
        supabase.from("question_pages").select("id, is_published").in("subject_id", subjectIds),
      ]);

      if (subjectError || nodeError || pageError) {
        if (active) { setError(subjectError?.message || nodeError?.message || pageError?.message || "Unable to load dashboard."); setLoading(false); }
        return;
      }

      if (!active) return;
      const pageRows = pages ?? [];
      setSubjects((subjectData ?? []) as Subject[]);
      setContentCount(nodeCount ?? 0);
      setPageCount(pageRows.length);
      setDraftCount(pageRows.filter((page) => !page.is_published).length);
      setPublishedCount(pageRows.filter((page) => page.is_published).length);
      setLoading(false);
    }

    void load();
    return () => { active = false; };
  }, [supabase]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-primary">Teacher</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">Welcome back, {name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Manage your assigned subjects, learning content, and Question Pages.</p>
      </div>

      {error && <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}

      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-border bg-card"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={BookOpen} label="Assigned subjects" value={subjects.length} />
            <StatCard icon={Layers3} label="Content nodes" value={contentCount} />
            <StatCard icon={FileText} label="Question Pages" value={pageCount} />
            <StatCard icon={FileText} label="Published / Draft" value={`${publishedCount} / ${draftCount}`} />
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">My Subjects</h2>
                <p className="mt-1 text-xs text-muted-foreground">Subjects assigned to you by an administrator.</p>
              </div>
              <Link href="/teacher/studio" className="hidden items-center gap-1.5 text-xs font-bold text-primary sm:flex">Open Studio <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>

            {subjects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                <BookOpen className="mx-auto h-7 w-7 text-muted-foreground" />
                <p className="mt-3 text-sm font-bold text-foreground">No subjects assigned yet</p>
                <p className="mt-1 text-xs text-muted-foreground">An administrator needs to assign a subject before you can create content.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.map((subject) => (
                  <Link key={subject.id} href="/teacher/studio" className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-soft">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><BookOpen className="h-5 w-5" /></div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    <h3 className="mt-5 text-sm font-bold text-foreground">{subject.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{subject.code || "Assigned subject"}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number | string }) {
  return <div className="rounded-2xl border border-border bg-card p-5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div><p className="mt-5 text-2xl font-extrabold tracking-tight text-foreground">{value}</p><p className="mt-1 text-xs font-semibold text-muted-foreground">{label}</p></div>;
}
