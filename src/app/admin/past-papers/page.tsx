import { redirect } from "next/navigation";
import { AdminCard, SelectInput, SubmitButton, TextInput } from "@/components/admin/AdminForms";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { ReorderList } from "@/components/admin/ReorderList";
import { Card } from "@/components/ui/card";
import { createPastPaper, deletePastPaper, isAdminAuthenticated, reorderPastPapers, updatePastPaper } from "@/lib/admin-actions";
import { getCatalog, levelsForCurriculum, pastPapersForSubject, subjectsForLevel } from "@/lib/data";

type Props = { searchParams: Promise<{ curriculum?: string; level?: string; subject?: string }> };

export default async function PastPapersAdminPage({ searchParams }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin");

  const query = await searchParams;
  const catalog = await getCatalog();
  const curriculum = catalog.curriculums.find((item) => item.id === query.curriculum) ?? catalog.curriculums[0];
  const levels = curriculum ? levelsForCurriculum(catalog, curriculum) : [];
  const level = levels.find((item) => item.id === query.level) ?? levels[0];
  const subjects = level ? subjectsForLevel(catalog, level) : [];
  const subject = subjects.find((item) => item.id === query.subject) ?? subjects[0];
  const papers = subject ? pastPapersForSubject(catalog, subject) : [];

  return (
    <AdminShell>
      <div className="grid gap-6">
        <AdminPageHeader title="Past Papers" description="Past papers are managed separately from notes, videos, and topical questions." />
        <Card className="p-5">
          <form className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
            <SelectInput name="curriculum" label="Curriculum" options={catalog.curriculums.map((item) => [item.id, item.name])} defaultValue={curriculum?.id} />
            <SelectInput name="level" label="Level" options={levels.map((item) => [item.id, item.name])} defaultValue={level?.id} />
            <SelectInput name="subject" label="Subject" options={subjects.map((item) => [item.id, item.name])} defaultValue={subject?.id} />
            <div className="self-end"><SubmitButton>Open</SubmitButton></div>
          </form>
        </Card>
        {subject ? (
          <AdminCard title={`Upload Paper for ${subject.name}`}>
            <PaperForm action={createPastPaper} subjectId={subject.id} order={papers.length + 1} />
          </AdminCard>
        ) : null}
        <ReorderList action={reorderPastPapers} items={papers.map((item) => ({ id: item.id, label: `${item.year} ${item.session}`, description: subject?.name }))} />
        <div className="grid gap-4 md:grid-cols-2">
          {papers.map((paper) => (
            <AdminCard key={paper.id} title={`${paper.year} ${paper.session}`}>
              <PaperForm action={updatePastPaper} id={paper.id} subjectId={paper.subject_id} order={paper.display_order} paper={paper} />
              <form action={deletePastPaper} className="mt-3" data-confirm="Delete this past paper?">
                <input type="hidden" name="id" value={paper.id} />
                <SubmitButton tone="danger">Delete</SubmitButton>
              </form>
            </AdminCard>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

function PaperForm({ action, id, subjectId, order, paper }: { action: (formData: FormData) => Promise<void>; id?: string; subjectId: string; order: number; paper?: { year: number; session: string; paper_file_url: string | null; mark_scheme_file_url: string | null; display_order: number } }) {
  return (
    <form action={action} className="grid gap-3">
      {id ? <input type="hidden" name="id" value={id} /> : null}
      <input type="hidden" name="subject_id" value={subjectId} />
      <div className="grid gap-3 md:grid-cols-3">
        <TextInput label="Year" name="year" type="number" defaultValue={paper?.year} />
        <TextInput label="Session" name="session" defaultValue={paper?.session} placeholder="Session" />
        <TextInput label="Order" name="display_order" type="number" defaultValue={paper?.display_order ?? order} />
      </div>
      <TextInput label="Paper File URL" name="paper_file_url" defaultValue={paper?.paper_file_url} required={false} />
      <TextInput label="Mark Scheme File URL" name="mark_scheme_file_url" defaultValue={paper?.mark_scheme_file_url} required={false} />
      <div><SubmitButton>{id ? "Save Paper" : "Upload Paper"}</SubmitButton></div>
    </form>
  );
}
