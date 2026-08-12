import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createTeacherQuestion, deleteTeacherQuestion, deleteTeacherQuestionPage, reorderTeacherQuestion, saveTeacherAnswer } from "@/lib/teacher-actions";

type Question = { id: string; question_type: string; marks: number; order_index: number; question_image_url: string | null; paper_code: string; paper_question_number: string };
type Answer = { question_id: string; answer_text: string | null; answer_image_url: string | null; correct_option: string | null };
type Subject = { name: string; code: string | null; levels: { name: string; curriculums: { name: string } | null } | null };
type Node = { id: string; name: string; parent_id: string | null };

export default async function TeacherQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="app-page"><div className="app-page-content"><h1>Sign in required</h1></div></div>;

  const { data: profile } = await supabase.from("profiles").select("role, is_active").eq("id", user.id).maybeSingle();
  if (!profile?.is_active || !["teacher", "admin"].includes(profile.role)) return <div className="app-page"><div className="app-page-content"><h1>Teacher access</h1></div></div>;

  const { data: page } = await supabase.from("question_pages").select("id, subject_id, content_node_id, title, description, page_type, is_published").eq("id", id).maybeSingle();
  if (!page) notFound();

  const { data: assignment } = profile.role === "admin" ? { data: { id: "admin" } } : await supabase.from("teacher_subjects").select("id").eq("teacher_id", user.id).eq("subject_id", page.subject_id).eq("is_active", true).maybeSingle();
  if (!assignment) return <div className="app-page"><div className="app-page-content"><h1>Access denied</h1><p>You are not assigned to this subject.</p></div></div>;

  const [{ data: rawSubject }, { data: rawNode }, { data: rawQuestions }] = await Promise.all([
    supabase.from("subjects").select("name, code, levels(name, curriculums(name))").eq("id", page.subject_id).maybeSingle(),
    page.content_node_id ? supabase.from("content_nodes").select("id, name, parent_id").eq("id", page.content_node_id).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from("questions").select("id, question_type, marks, order_index, question_image_url, paper_code, paper_question_number").eq("question_page_id", id).order("order_index", { ascending: true }),
  ]);
  const subject = rawSubject as unknown as Subject | null;
  const node = rawNode as Node | null;
  const questions = (rawQuestions ?? []) as Question[];
  const questionIds = questions.map((question) => question.id);
  const { data: rawAnswers } = questionIds.length ? await supabase.from("question_answers").select("question_id, answer_text, answer_image_url, correct_option").in("question_id", questionIds) : { data: [] as Answer[] };
  const answers = (rawAnswers ?? []) as Answer[];
  const answerByQuestion = new Map(answers.map((answer) => [answer.question_id, answer]));

  return <div className="app-page"><div className="app-page-content max-w-6xl">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <Link href="/teacher/content" className="text-sm font-semibold text-primary hover:underline">← Back to Content Manager</Link>
        <p className="app-eyebrow mt-5">Question Page · {page.page_type.toUpperCase()}</p>
        <h1>{page.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{subject?.name ?? "Subject"}{node ? ` · ${node.name}` : ""}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold">{page.is_published ? "Published" : "Draft"}</span>
        <form action={deleteTeacherQuestionPage}>
          <input type="hidden" name="pageId" value={page.id}/>
          <button className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive">Delete Page</button>
        </form>
      </div>
    </div>

    <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div><h2 className="text-lg font-semibold">Add Question</h2><p className="mt-1 text-sm text-muted-foreground">The number shown beside each question is generated from its order. You only enter the original paper reference.</p></div>
      <form action={createTeacherQuestion} encType="multipart/form-data" className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.1fr_1.3fr_120px_110px_auto]">
        <input type="hidden" name="pageId" value={page.id}/>
        <input name="paperCode" required placeholder="Paper code e.g. 2024 May" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm"/>
        <input name="paperQuestionNumber" required placeholder="Paper Q e.g. 12(a)(ii)" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm"/>
        <input name="questionImageFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm"/>
        <select name="questionType" defaultValue={page.page_type === "mcq" ? "mcq" : "structured"} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm"><option value="structured">Structured</option><option value="essay">Essay</option><option value="mcq">MCQ</option></select>
        <input name="marks" type="number" min="0.5" step="0.5" defaultValue="1" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm"/>
        <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Add Question</button>
        <input name="questionImageUrl" placeholder="Or paste question image URL" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm lg:col-span-2"/>
      </form>
    </section>

    <section className="mt-6 space-y-5">
      {questions.map((question, index) => {
        const answer = answerByQuestion.get(question.id);
        const isFirst = index === 0;
        const isLast = index === questions.length - 1;
        return <article key={question.id} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border bg-muted/30 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">{index + 1}</div>
              <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Question {index + 1}</p><h2 className="mt-1 font-semibold">{question.question_type}</h2><p className="mt-1 text-sm text-muted-foreground">Paper: <span className="font-medium text-foreground">{question.paper_code}</span> · Paper Q: <span className="font-medium text-foreground">{question.paper_question_number}</span> · {question.marks} marks</p></div>
            </div>
            <div className="flex items-center gap-2">
              <form action={reorderTeacherQuestion}><input type="hidden" name="questionId" value={question.id}/><input type="hidden" name="direction" value="up"/><button disabled={isFirst} title="Move up" className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40">↑</button></form>
              <form action={reorderTeacherQuestion}><input type="hidden" name="questionId" value={question.id}/><input type="hidden" name="direction" value="down"/><button disabled={isLast} title="Move down" className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40">↓</button></form>
              <form action={deleteTeacherQuestion}><input type="hidden" name="questionId" value={question.id}/><button className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">Delete</button></form>
            </div>
          </div>

          <div className="p-5">
            {question.question_image_url ? <img src={question.question_image_url} alt={`Question ${index + 1}`} className="max-h-[500px] w-full rounded-xl border border-border object-contain"/> : <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No question image added yet.</div>}

            <form action={saveTeacherAnswer} encType="multipart/form-data" className="mt-5 rounded-xl border border-border bg-background p-4">
              <input type="hidden" name="questionId" value={question.id}/>
              <div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold">{question.question_type === "mcq" ? "Correct Answer" : "Answer"}</h3><p className="text-xs text-muted-foreground">{question.question_type === "mcq" ? "Select the correct option shown in the question image." : "Add the model answer as text, an image, or both."}</p></div>{answer && <span className="text-xs font-semibold text-emerald-600">Saved</span>}</div>
              {question.question_type === "mcq" ? <div className="mt-3 grid grid-cols-4 gap-2"><label className="cursor-pointer rounded-lg border border-border p-3 text-center text-sm"><input type="radio" name="correctOption" value="A" defaultChecked={answer?.correct_option === "A"}/> A</label><label className="cursor-pointer rounded-lg border border-border p-3 text-center text-sm"><input type="radio" name="correctOption" value="B" defaultChecked={answer?.correct_option === "B"}/> B</label><label className="cursor-pointer rounded-lg border border-border p-3 text-center text-sm"><input type="radio" name="correctOption" value="C" defaultChecked={answer?.correct_option === "C"}/> C</label><label className="cursor-pointer rounded-lg border border-border p-3 text-center text-sm"><input type="radio" name="correctOption" value="D" defaultChecked={answer?.correct_option === "D"}/> D</label></div> : <div className="mt-3 grid gap-3 md:grid-cols-2"><textarea name="answerText" defaultValue={answer?.answer_text ?? ""} rows={5} placeholder="Write the model answer..." className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm"/><input name="answerImageFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm"/></div>}
              <button className="mt-3 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold">Save {question.question_type === "mcq" ? "Correct Answer" : "Answer"}</button>
            </form>
          </div>
        </article>;
      })}
      {questions.length === 0 && <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No questions yet. Add the first question above.</div>}
    </section>
  </div></div>;
}
