import { createClient } from "@/lib/supabase/server";
import { createTeacherContent, deleteTeacherContent } from "@/lib/teacher-actions";

export default async function TeacherContentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="app-page"><div className="app-page-content"><h1>Sign in required</h1><p>Please sign in as a teacher.</p></div></div>;

  const { data: profile } = await supabase.from("profiles").select("role, is_active, full_name").eq("id", user.id).maybeSingle();
  if (!profile?.is_active || !["teacher", "admin"].includes(profile.role)) return <div className="app-page"><div className="app-page-content"><h1>Teacher access</h1><p>Your account is not assigned teacher access.</p></div></div>;

  const { data: assignments } = profile.role === "admin"
    ? await supabase.from("subjects").select("id, name, code, levels(name, curriculums(name))").order("name")
    : await supabase.from("teacher_subjects").select("subject_id, subjects(id, name, code, levels(name, curriculums(name)))").eq("teacher_id", user.id).eq("is_active", true);

  const subjects = (assignments ?? []).map((row: any) => profile.role === "admin" ? row : row.subjects).filter(Boolean);
  const subjectIds = subjects.map((s: any) => s.id);
  const { data: nodes } = subjectIds.length ? await supabase.from("content_nodes").select("id, subject_id, parent_id, name, description, is_active, created_at").in("subject_id", subjectIds).order("name") : { data: [] };

  return <div className="app-page"><div className="app-page-content max-w-7xl">
    <p className="app-eyebrow">Teacher Studio</p>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h1>Content Manager</h1><p className="mt-2">Build Units, Topics and Sub Topics for the subjects you teach.</p></div><span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">{profile.role === "admin" ? "Admin" : "Teacher"}</span></div>

    <div className="mt-8 space-y-6">
      {subjects.map((subject: any) => {
        const subjectNodes = (nodes ?? []).filter((n: any) => n.subject_id === subject.id);
        const roots = subjectNodes.filter((n: any) => !n.parent_id);
        return <section key={subject.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{subject.levels?.curriculums?.name ?? "Curriculum"} · {subject.levels?.name ?? "Level"}</p><h2 className="mt-1 text-xl font-semibold">{subject.name}</h2>{subject.code && <p className="text-sm text-muted-foreground">{subject.code}</p>}</div><form action={createTeacherContent} className="flex flex-wrap gap-2"><input type="hidden" name="subjectId" value={subject.id}/><input name="name" required placeholder="New Unit" className="rounded-xl border border-border bg-background px-3 py-2 text-sm"/><button className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Add Unit</button></form></div>
          <div className="mt-6 space-y-3">{roots.map((unit: any) => <div key={unit.id} className="rounded-xl border border-border bg-muted/20 p-4"><div className="flex items-center justify-between gap-3"><div><span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Unit</span><h3 className="font-semibold">{unit.name}</h3></div><form action={deleteTeacherContent}><input type="hidden" name="id" value={unit.id}/><button className="text-xs font-semibold text-destructive">Delete</button></form></div><div className="mt-3 pl-4">{subjectNodes.filter((n: any) => n.parent_id === unit.id).map((topic: any) => <div key={topic.id} className="mb-3 rounded-lg border border-border bg-background p-3"><div className="flex items-center justify-between"><div><span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Topic</span><p className="font-medium">{topic.name}</p></div><form action={deleteTeacherContent}><input type="hidden" name="id" value={topic.id}/><button className="text-xs text-destructive">Delete</button></form></div><div className="mt-2 pl-4 space-y-2">{subjectNodes.filter((n: any) => n.parent_id === topic.id).map((sub: any) => <div key={sub.id} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-sm"><span><span className="mr-2 text-xs text-muted-foreground">Sub Topic</span>{sub.name}</span><form action={deleteTeacherContent}><input type="hidden" name="id" value={sub.id}/><button className="text-xs text-destructive">Delete</button></form></div>)}</div><form action={createTeacherContent} className="mt-3 flex gap-2"><input type="hidden" name="subjectId" value={subject.id}/><input type="hidden" name="parentId" value={topic.id}/><input name="name" required placeholder="Add Sub Topic" className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs"/><button className="rounded-lg border border-border px-3 py-2 text-xs font-semibold">Add Sub Topic</button></form></div>)}</div><form action={createTeacherContent} className="mt-3 flex gap-2"><input type="hidden" name="subjectId" value={subject.id}/><input type="hidden" name="parentId" value={unit.id}/><input name="name" required placeholder="Add Topic" className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs"/><button className="rounded-lg border border-border px-3 py-2 text-xs font-semibold">Add Topic</button></form></div>)}{!roots.length && <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No Units yet. Add the first Unit above.</p>}</div>
        </section>;
      })}
      {!subjects.length && <div className="rounded-2xl border border-dashed border-border p-10 text-center"><h2 className="font-semibold">No subjects assigned</h2><p className="mt-1 text-sm text-muted-foreground">Ask an administrator to assign a subject to your teacher account.</p></div>}
    </div>
  </div></div>;
}
