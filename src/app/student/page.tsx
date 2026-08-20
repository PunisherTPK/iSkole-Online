"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Page = {
  id: string;
  title: string;
  description: string | null;
  page_type: string;
  subject_id: string;
};

type Subject = { id: string; name: string; code: string | null };

export default function StudentPage() {
  const supabase = useMemo(() => createClient(), []);
  const [pages, setPages] = useState<Page[]>([]);
  const [subjects, setSubjects] = useState<Record<string, Subject>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Please sign in to view your learning dashboard.");
        setLoading(false);
        return;
      }

      const { data, error: pageError } = await supabase
        .from("question_pages")
        .select("id, title, description, page_type, subject_id")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(12);

      if (pageError) {
        setError(pageError.message);
        setLoading(false);
        return;
      }

      const pageRows = (data ?? []) as Page[];
      const subjectIds = [...new Set(pageRows.map((page) => page.subject_id))];

      if (subjectIds.length) {
        const { data: subjectData, error: subjectError } = await supabase
          .from("subjects")
          .select("id, name, code")
          .in("id", subjectIds);

        if (subjectError) {
          setError(subjectError.message);
          setLoading(false);
          return;
        }

        setSubjects(Object.fromEntries(((subjectData ?? []) as Subject[]).map((subject) => [subject.id, subject])));
      }

      setPages(pageRows);
      setLoading(false);
    }

    void load();
  }, [supabase]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-primary">Student</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">Continue your learning journey.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5"><BookOpen className="h-5 w-5 text-primary" /><p className="mt-4 text-2xl font-black">{pages.length}</p><p className="mt-1 text-sm text-muted-foreground">Published Question Pages</p></div>
        <div className="rounded-2xl border border-border bg-card p-5"><FileText className="h-5 w-5 text-primary" /><p className="mt-4 text-2xl font-black">{new Set(pages.map((page) => page.subject_id)).size}</p><p className="mt-1 text-sm text-muted-foreground">Subjects</p></div>
        <div className="rounded-2xl border border-border bg-card p-5"><ArrowRight className="h-5 w-5 text-primary" /><p className="mt-4 text-sm font-bold">Ready to practise?</p><p className="mt-1 text-sm text-muted-foreground">Open a published Question Page below.</p></div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4"><div><h2 className="text-xl font-bold">Available Practice</h2><p className="mt-1 text-sm text-muted-foreground">Published Question Pages available to you.</p></div></div>

        {error && <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
        {loading ? <div className="mt-5 flex items-center justify-center rounded-2xl border border-border bg-card py-16 text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading practice pages...</div> : !pages.length ? <div className="mt-5 rounded-2xl border border-dashed border-border bg-card py-16 text-center text-sm text-muted-foreground">No published Question Pages are available yet.</div> : <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{pages.map((page) => { const subject = subjects[page.subject_id]; return <Link key={page.id} href={`/student/question/${page.id}`} className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"><div className="flex items-start justify-between gap-3"><span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">{page.page_type}</span><ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" /></div><h3 className="mt-4 text-base font-bold">{page.title}</h3><p className="mt-1 text-xs font-semibold text-muted-foreground">{subject?.name ?? "Subject"}</p>{page.description && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{page.description}</p>}<span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">Start practice <ArrowRight className="h-4 w-4" /></span></Link>; })}</div>}
      </section>
    </div>
  );
}
