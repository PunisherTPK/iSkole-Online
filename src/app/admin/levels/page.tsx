import { redirect } from "next/navigation";
import { AdminCard, SelectInput, SubmitButton, TextInput } from "@/components/admin/AdminForms";
import { AdminShell } from "@/components/admin/AdminShell";
import { ReorderList } from "@/components/admin/ReorderList";
import { createLevel, deleteLevel, isAdminAuthenticated, reorderLevels, updateLevel } from "@/lib/admin-actions";
import { getAdminRole } from "@/lib/admin-session";
import { getCatalog, levelsForCurriculum } from "@/lib/data";

type Props = { searchParams: Promise<{ curriculum?: string }> };

export default async function LevelsAdminPage({ searchParams }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  if (getAdminRole() === "teacher") redirect("/admin/resources");

  const { curriculum: selectedId } = await searchParams;
  const catalog = await getCatalog();
  const selected = catalog.curriculums.find((item) => item.id === selectedId) ?? catalog.curriculums[0];
  const levels = selected ? levelsForCurriculum(catalog, selected) : [];
  const curriculumOptions = catalog.curriculums.map((item) => [item.id, item.name] as [string, string]);

  return (
    <AdminShell>
      <div className="grid gap-6">
        <Header title="Levels" description="Select a curriculum, then manage level folders under it." />
        <FilterSelect name="curriculum" label="Select Curriculum" options={curriculumOptions} value={selected?.id} />
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
        <div className="grid gap-3">
          {levels.map((level) => (
            <AdminCard key={level.id} title={level.name} description={selected?.name}>
              <div draggable className="cursor-grab rounded-lg border border-dashed border-slate-300 p-3">
                <form action={updateLevel} className="grid gap-3 lg:grid-cols-[1fr_140px_auto_auto]">
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

function Header({ title, description }: { title: string; description: string }) {
  return <div><p className="text-sm font-bold uppercase tracking-wide text-blue-600">Admin</p><h1 className="mt-2 text-3xl font-bold text-slate-950">{title}</h1><p className="mt-2 text-slate-600">{description}</p></div>;
}

function FilterSelect({ name, label, options, value }: { name: string; label: string; options: Array<[string, string]>; value?: string }) {
  return (
    <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <SelectInput name={name} label={label} options={options} defaultValue={value} />
      <button className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white" type="submit">Open</button>
    </form>
  );
}
