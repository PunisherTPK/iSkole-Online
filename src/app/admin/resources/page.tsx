import { redirect } from "next/navigation";
import { AdminCard, SelectInput, SubmitButton, Textarea, TextInput } from "@/components/admin/AdminForms";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { createMcqQuestion, createQuestionSet, deleteMcqQuestion, deleteQuestionSet, isAdminAuthenticated, updateMcqQuestion, updateQuestionSet } from "@/lib/admin-actions";
import { getCatalog, questionsForSet } from "@/lib/data";

export default async function McqAdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  const catalog = await getCatalog();
  const subTopicOptions = catalog.subTopics.map((item) => [item.id, item.name] as [string, string]);
  const teacherOptions: [string, string][] = [["", "Unassigned"], ...catalog.teachers.map((item) => [item.id, item.name] as [string, string])];
  const setOptions = catalog.questionSets.map((item) => [item.id, item.title] as [string, string]);

  return (
    <AdminShell>
      <div className="grid gap-6">
        <AdminPageHeader title="MCQ Questions" description="Manage topical question sets. Images must be PNG, JPG, or WEBP and 5 MB or smaller before upload." />

        <AdminCard title="Create Question Set">
          <form action={createQuestionSet} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_120px_auto]">
            <SelectInput label="Sub Topic" name="sub_topic_id" options={subTopicOptions} />
            <SelectInput label="Teacher" name="teacher_id" options={teacherOptions} />
            <TextInput label="Title" name="title" />
            <TextInput label="Order" name="display_order" type="number" defaultValue={catalog.questionSets.length + 1} />
            <div className="self-end"><SubmitButton>Create</SubmitButton></div>
            <div className="md:col-span-5"><Textarea label="Description" name="description" /></div>
          </form>
        </AdminCard>

        <AdminCard title="Add MCQ Question">
          <form action={createMcqQuestion} className="grid gap-3 md:grid-cols-[1fr_1fr_140px_120px_auto]">
            <SelectInput label="Question Set" name="question_set_id" options={setOptions} />
            <TextInput label="Question Image URL" name="question_image_url" placeholder="https://..." />
            <SelectInput label="Correct Answer" name="correct_answer" options={[["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"]]} />
            <TextInput label="Order" name="display_order" type="number" defaultValue={catalog.mcqQuestions.length + 1} />
            <div className="self-end"><SubmitButton>Add</SubmitButton></div>
            <div className="md:col-span-5"><Textarea label="Explanation" name="explanation" /></div>
          </form>
        </AdminCard>

        {catalog.questionSets.map((set) => (
          <AdminCard key={set.id} title={set.title} description={set.description}>
            <form action={updateQuestionSet} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_120px_auto]">
              <input type="hidden" name="id" value={set.id} />
              <SelectInput label="Sub Topic" name="sub_topic_id" options={subTopicOptions} defaultValue={set.sub_topic_id} />
              <SelectInput label="Teacher" name="teacher_id" options={teacherOptions} defaultValue={set.teacher_id ?? ""} />
              <TextInput label="Title" name="title" defaultValue={set.title} />
              <TextInput label="Order" name="display_order" type="number" defaultValue={set.display_order} />
              <div className="self-end"><SubmitButton>Save Set</SubmitButton></div>
              <div className="md:col-span-5"><Textarea label="Description" name="description" defaultValue={set.description} /></div>
            </form>
            <div className="mt-5 grid gap-3">
              {questionsForSet(catalog, set).map((question) => (
                <form key={question.id} action={updateMcqQuestion} className="rounded-xl border border-border bg-muted/5 p-4">
                  <input type="hidden" name="id" value={question.id} />
                  <input type="hidden" name="question_set_id" value={set.id} />
                  <div className="grid gap-3 md:grid-cols-[1fr_140px_120px_auto_auto]">
                    <TextInput label="Image URL" name="question_image_url" defaultValue={question.question_image_url} />
                    <SelectInput label="Correct" name="correct_answer" options={[["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"]]} defaultValue={question.correct_answer} />
                    <TextInput label="Order" name="display_order" type="number" defaultValue={question.display_order} />
                    <div className="self-end"><SubmitButton>Save</SubmitButton></div>
                    <button formAction={deleteMcqQuestion} className="self-end rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive" data-confirm="Delete this question?">Delete</button>
                  </div>
                  <Textarea label="Explanation" name="explanation" defaultValue={question.explanation} />
                </form>
              ))}
            </div>
            <form action={deleteQuestionSet} className="mt-4" data-confirm="Delete this question set?"><input type="hidden" name="id" value={set.id} /><SubmitButton tone="danger">Delete Set</SubmitButton></form>
          </AdminCard>
        ))}
      </div>
    </AdminShell>
  );
}
