import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createTeacherQuestionPage } from "@/lib/teacher-actions";

export default async function NewQuestionPage({ searchParams }: { searchParams: Promise<{ nodeId?: string; subjectId?: string }> }) {
  const params = await searchParams;
  const nodeId = params.nodeId ?? "";
  const subjectId = params.subjectId ?? "";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="app-page"><div className="app-page-content"><h1>Sign in required</h1></div></div>;

  const { data: profile } = await supabase.from("profiles").select("role, is_active").eq("id", user.id).maybeSingle();
  if (!profile?.is_active || !["teacher", "admin"].includes(profile.role)) return <div className="app-page"><div className="app-page-content"><h1>Teacher access</h1></div></div>;

  const { data: subject } = await supabase.from("subjects").select("id, name").eq("id", subjectId).maybeSingle();
  if (!subject) return <div className="app-page"><div className="app-page-content"><h1>Subject not found</h1><Link href="/teacher/content" className="text-primary">Back to Question Bank</Link></div></div>;

  let locationName = subject.name;
  if (nodeId) {
    const { data: node } = await supabase.from("content_nodes").select("id, subject_id, name").eq("id", nodeId).eq("subject_id", subjectId).maybeSingle();
    if (!node) return <div className="app-page"><div className="app-page-content"><h1>Folder not found</h1><Link href={`/teacher/content?subjectId=${subjectId}`} className="text-primary">Back to Question Bank</Link></div></div>;
    locationName = node.name;
  }

  async function submit(formData: FormData) {
    "use server";
    const id = await createTeacherQuestionPage(formData);
    redirect(`/teacher/question-pages/${id}`);
  }

  return <div className="app-page"><div className="app-page-content max-w-3xl">
    <Link href={`/teacher/content?subjectId=${subjectId}${nodeId ? `&nodeId=${nodeId}` : ""}`} className="text-sm font-semibold text-primary">← Back to Question Bank</Link>
    <p className="app-eyebrow mt-6">Teacher Studio</p>
    <h1>Create Question Page</h1>
    <p className="mt-2 text-muted-foreground">Create this page inside <strong>{locationName}</strong>. Question pages can live directly in a subject or inside any folder.</p>
    <form action={submit} className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <input type="hidden" name="subjectId" value={subjectId}/><input type="hidden" name="contentNodeId" value={nodeId}/>
      <div><label className="text-sm font-medium" htmlFor="title">Page title</label><input id="title" name="title" required placeholder="e.g. Mechanics - MCQ Practice" className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"/></div>
      <div><label className="text-sm font-medium" htmlFor="description">Description</label><textarea id="description" name="description" rows={3} placeholder="Optional description" className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"/></div>
      <div><label className="text-sm font-medium" htmlFor="pageType">Page type</label><select id="pageType" name="pageType" defaultValue="mcq" className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"><option value="mcq">MCQ</option><option value="structured">Structured</option></select></div>
      <button className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Create Question Page</button>
    </form>
  </div></div>;
}
