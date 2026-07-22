import { redirect } from "next/navigation";
import { AdminCard, SelectInput, SubmitButton, TextInput } from "@/components/admin/AdminForms";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { ReorderList } from "@/components/admin/ReorderList";
import { Card } from "@/components/ui/card";
import { createSubject, deleteSubject, isAdminAuthenticated, reorderSubjects, updateSubject } from "@/lib/admin-actions";
import { getAdminRole } from "@/lib/admin-session";
import { getCatalog, levelsForCurriculum, subjectsForLevel } from "@/lib/data";

type Props = { searchParams: Promise<{ curriculum?: string; level?: string }> };

export default async function SubjectsAdminPage({ searchParams }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  if (getAdminRole() === "teacher") redirect("/admin/content-manager");

  const query = await searchParams;
  const catalog = await getCatalog();
  const curriculum = catalog.curriculums.find((item) => item.id === query.curriculum) ?? catalog.curriculums[0];
  const levels = curriculum ? levelsForCurriculum(catalog, curriculum) : [];
  const level = levels.find((item) => item.id === query.level) ?? levels[0];
  const subjects = level ? subjectsForLevel(catalog, level) : [];

  return (
    <AdminShell>
      <div className="grid gap-6">
        <AdminPageHeader title="Subjects" description="Select a curriculum and level, then manage subject folders." />
        <Card className="p-5">
          <form className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <SelectInput name="curriculum" label="Curriculum" options={catalog.curriculums.map((item) => [item.id, item.name])} defaultValue={curriculum?.id} />
            <SelectInput name="level" label="Level" options={levels.map((item) => [item.id, item.name])} defaultValue={level?.id} />
            <div className="self-end"><SubmitButton>Open</SubmitButton></div>
          </form>
        </Card>
        {level ? (
          <AdminCard title={`Create Subject in ${level.name}`}>
            <form action={createSubject} className="grid gap-3 sm:grid-cols-[1fr_140px_auto]">
              <input type="hidden" name="level_id" value={level.id} />
              <TextInput label="Name" name="name" placeholder="Subject name" />
              <TextInput label="Order" name="display_order" type="number" defaultValue={subjects.length + 1} />
              <div className="self-end"><SubmitButton>Create</SubmitButton></div>
            </form>
          </AdminCard>
        ) : null}
        <ReorderList action={reorderSubjects} items={subjects.map((item) => ({ id: item.id, label: item.name, description: `${curriculum?.name ?? ""} > ${level?.name ?? ""}` }))} />
        <div className="grid gap-4">
          {subjects.map((subject) => (
            <AdminCard key={subject.id} title={subject.name} description={`${curriculum?.name ?? ""} > ${level?.name ?? ""}`}>
              <form action={updateSubject} className="grid gap-3 lg:grid-cols-[1fr_140px_auto]">
                <input type="hidden" name="id" value={subject.id} />
                <input type="hidden" name="level_id" value={subject.level_id} />
                <TextInput label="Name" name="name" defaultValue={subject.name} />
                <TextInput label="Order" name="display_order" type="number" defaultValue={subject.display_order} />
                <div className="self-end"><SubmitButton>Save</SubmitButton></div>
              </form>
              <form action={deleteSubject} className="mt-3" data-confirm="Delete this subject and hide it from public navigation?">
                <input type="hidden" name="id" value={subject.id} />
                <SubmitButton tone="danger">Delete</SubmitButton>
              </form>
            </AdminCard>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
