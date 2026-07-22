import { redirect } from "next/navigation";
import { AdminCard, SelectInput, SubmitButton, TextInput } from "@/components/admin/AdminForms";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { ReorderList } from "@/components/admin/ReorderList";
import { Card } from "@/components/ui/card";
import { createLevel, deleteLevel, isAdminAuthenticated, reorderLevels, updateLevel } from "@/lib/admin-actions";
import { getAdminRole } from "@/lib/admin-session";
import { getCatalog, levelsForCurriculum } from "@/lib/data";

type Props = { searchParams: Promise<{ curriculum?: string }> };

export default async function LevelsAdminPage({ searchParams }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  if (getAdminRole() === "teacher") redirect("/admin/content-manager");

  const { curriculum: selectedId } = await searchParams;
  const catalog = await getCatalog();
  const selected = catalog.curriculums.find((item) => item.id === selectedId) ?? catalog.curriculums[0];
  const levels = selected ? levelsForCurriculum(catalog, selected) : [];
  const curriculumOptions = catalog.curriculums.map((item) => [item.id, item.name] as [string, string]);

  return (
    <AdminShell>
      <div className="grid gap-6">
        <AdminPageHeader title="Levels" description="Select a curriculum, then manage level folders under it." />
        <Card className="p-5">
          <form className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <SelectInput name="curriculum" label="Select Curriculum" options={curriculumOptions} defaultValue={selected?.id} />
            <div className="self-end"><SubmitButton>Open</SubmitButton></div>
          </form>
        </Card>
        {selected ? (
          <AdminCard title={`Create Level in ${selected.name}`}>
            <form action={createLevel} className="grid gap-3 sm:grid-cols-[1fr_140px_auto]">
              <input type="hidden" name="curriculum_id" value={selected.id} />
              <TextInput label="Name" name="name" placeholder="Level name" />
              <TextInput label="Order" name="display_order" type="number" defaultValue={levels.length + 1} />
              <div className="self-end"><SubmitButton>Create</SubmitButton></div>
            </form>
          </AdminCard>
        ) : null}
        <ReorderList action={reorderLevels} items={levels.map((item) => ({ id: item.id, label: item.name, description: selected?.name }))} />
        <div className="grid gap-4">
          {levels.map((level) => (
            <AdminCard key={level.id} title={level.name} description={selected?.name}>
              <div draggable className="cursor-grab rounded-xl border border-dashed border-border bg-muted/5 p-4">
                <form action={updateLevel} className="grid gap-3 lg:grid-cols-[1fr_140px_auto]">
                  <input type="hidden" name="id" value={level.id} />
                  <input type="hidden" name="curriculum_id" value={level.curriculum_id} />
                  <TextInput label="Name" name="name" defaultValue={level.name} />
                  <TextInput label="Order" name="display_order" type="number" defaultValue={level.display_order} />
                  <div className="self-end"><SubmitButton>Save</SubmitButton></div>
                </form>
                <form action={deleteLevel} className="mt-3" data-confirm="Delete this level and hide it from public navigation?">
                  <input type="hidden" name="id" value={level.id} />
                  <SubmitButton tone="danger">Delete</SubmitButton>
                </form>
              </div>
            </AdminCard>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
