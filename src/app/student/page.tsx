"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Loader2, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Page = { id: string; title: string; description: string | null; page_type: string; subject_id: string };
type Subject = { id: string; name: string; code: string | null };
type Subscription = { subject_id: string | null; status: string; starts_at: string; ends_at: string | null; plan_type: string };
type Practice = { question_page_id: string; total_questions: number; answered_questions: number; correct_questions: number; earned_marks: number; total_marks: number; completed_at: string };

export default function StudentPage() {
  const supabase = useMemo(() => createClient(), []);
  const [pages, setPages] = useState<Page[]>([]);
  const [subjects, setSubjects] = useState<Record<string, Subject>>({});
  const [practice, setPractice] = useState<Record<string, Practice>>({});
  const [allPractice, setAllPractice] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true); setError("");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Please sign in to view your learning dashboard."); setLoading(false); return; }
      const now = new Date().toISOString();
      const { data: subscriptionData, error: subscriptionError } = await supabase.from("student_subscriptions").select("subject_id,status,starts_at,ends_at,plan_type").eq("user_id", user.id).eq("status", "active").lte("starts_at", now).or(`ends_at.is.null,ends_at.gt.${now}`);
      if (subscriptionError) { setError(subscriptionError.message); setLoading(false); return; }
      const subscriptions = (subscriptionData ?? []) as Subscription[];
      const hasAllSubjectsSubscription = subscriptions.some((subscription) => subscription.plan_type === "premium" || subscription.subject_id === null);
      const subscribedSubjectIds = new Set(subscriptions.map((subscription) => subscription.subject_id).filter((id): id is string => Boolean(id)));
      if (!hasAllSubjectsSubscription && subscribedSubjectIds.size === 0) { setPages([]); setSubjects({}); setPractice({}); setAllPractice([]); setLoading(false); return; }
      let pageQuery = supabase.from("question_pages").select("id,title,description,page_type,subject_id").eq("is_published", true).order("created_at", { ascending: false }).limit(50);
      if (!hasAllSubjectsSubscription) pageQuery = pageQuery.in("subject_id", [...subscribedSubjectIds]);
      const { data: pageData, error: pageError } = await pageQuery;
      if (pageError) { setError(pageError.message); setLoading(false); return; }
      const pageRows = (pageData ?? []) as Page[];
      const subjectIds = [...new Set(pageRows.map((page) => page.subject_id))];
      if (subjectIds.length) {
        const { data: subjectData, error: subjectError } = await supabase.from("subjects").select("id,name,code").in("id", subjectIds);
        if (subjectError) { setError(subjectError.message); setLoading(false); return; }
        setSubjects(Object.fromEntries(((subjectData ?? []) as Subject[]).map((subject) => [subject.id, subject])));
      } else setSubjects({});

      const pageIds = pageRows.map((page) => page.id);
      const { data: practiceData, error: practiceError } = await supabase.from("practice_sessions").select("question_page_id,total_questions,answered_questions,correct_questions,earned_marks,total_marks,completed_at").eq("user_id", user.id).in("question_page_id", pageIds).order("completed_at", { ascending: false });
      if (practiceError) { setError(practiceError.message); setLoading(false); return; }
      const practiceRows = (practiceData ?? []) as Practice[];
      const latestByPage: Record<string, Practice> = {};
      for (const row of practiceRows) if (!latestByPage[row.question_page_id]) latestByPage[row.question_page_id] = row;
      setAllPractice(practiceRows); setPractice(latestByPage); setPages(pageRows); setLoading(false);
    }
    void load();
  }, [supabase]);

  // Dashboard cards are based on every recorded attempt, while each Q Page card
  // shows the student's latest attempt for that page.
  const attemptedPages = new Set(allPractice.map((item) => item.question_page_id)).size;
  const totalAttempts = allPractice.length;
  const totalCorrect = allPractice.reduce((sum, item) => sum + Number(item.correct_questions), 0);
  const totalAnswered = allPractice.reduce((sum, item) => sum + Number(item.answered_questions), 0);
  const overallAccuracy = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return <div className="space-y-8">
    <div><p className="text-sm font-semibold text-primary">Student</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">Dashboard</h1><p className="mt-2 text-sm text-muted-foreground">Continue your learning journey.</p></div>
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl border border-border bg-card p-5"><BookOpen className="h-5 w-5 text-primary" /><p className="mt-4 text-2xl font-black">{pages.length}</p><p className="mt-1 text-sm text-muted-foreground">Available Question Pages</p></div>
      <div className="rounded-2xl border border-border bg-card p-5"><FileText className="h-5 w-5 text-primary" /><p className="mt-4 text-2xl font-black">{new Set(pages.map((page) => page.subject_id)).size}</p><p className="mt-1 text-sm text-muted-foreground">Subscribed Subjects</p></div>
      <div className="rounded-2xl border border-border bg-card p-5"><Trophy className="h-5 w-5 text-primary" /><p className="mt-4 text-2xl font-black">{attemptedPages}</p><p className="mt-1 text-sm text-muted-foreground">Pages Practised</p><p className="mt-1 text-[11px] text-muted-foreground">{totalAttempts} total attempt{totalAttempts === 1 ? "" : "s"}</p></div>
      <div className="rounded-2xl border border-border bg-card p-5"><Trophy className="h-5 w-5 text-primary" /><p className="mt-4 text-2xl font-black">{overallAccuracy}%</p><p className="mt-1 text-sm text-muted-foreground">Overall Accuracy</p><p className="mt-1 text-[11px] text-muted-foreground">{totalCorrect} correct / {totalAnswered} answered</p></div>
    </section>
    <section><div><h2 className="text-xl font-bold">Your Practice</h2><p className="mt-1 text-sm text-muted-foreground">Question Pages included with your active subscriptions.</p></div>{error && <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}{loading ? <div className="mt-5 flex items-center justify-center rounded-2xl border border-border bg-card py-16 text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading your practice pages...</div> : !pages.length ? <div className="mt-5 rounded-2xl border border-dashed border-border bg-card py-16 text-center text-sm text-muted-foreground">You do not have any active subscriptions with available Question Pages yet.</div> : <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{pages.map((page) => { const subject = subjects[page.subject_id]; const attempt = practice[page.id]; const accuracy = attempt && Number(attempt.answered_questions) ? Math.round((Number(attempt.correct_questions) / Number(attempt.answered_questions)) * 100) : 0; return <Link key={page.id} href={`/student/question/${page.id}`} className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"><div className="flex items-start justify-between gap-3"><span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">{page.page_type}</span><ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" /></div><h3 className="mt-4 text-base font-bold">{page.title}</h3><p className="mt-1 text-xs font-semibold text-muted-foreground">{subject?.name ?? "Subject"}</p>{page.description && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{page.description}</p>}{attempt ? <div className="mt-4 rounded-xl bg-muted/50 p-3"><div className="flex items-center justify-between text-xs font-semibold"><span>Latest score</span><span>{attempt.earned_marks} / {attempt.total_marks}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${accuracy}%` }} /></div><div className="mt-2 flex justify-between text-[11px] text-muted-foreground"><span>{accuracy}% accuracy</span><span>{new Date(attempt.completed_at).toLocaleDateString()}</span></div></div> : <p className="mt-4 text-xs font-semibold text-muted-foreground">Not attempted yet</p>}<span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">{attempt ? "Practise again" : "Start practice"} <ArrowRight className="h-4 w-4" /></span></Link>; })}</div>}</section>
  </div>;
}
