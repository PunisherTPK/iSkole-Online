import { redirect } from "next/navigation";
import { AdminCard, SelectInput, SubmitButton, Textarea, TextInput } from "@/components/admin/AdminForms";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { createUnit, deleteUnit, isAdminAuthenticated, updateUnit } from "@/lib/admin-actions";
import { getCatalog } from "@/lib/data";

export default async function UnitsAdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  const catalog = await getCatalog();
  const subjectOptions = catalog.subjects.map((subject) => [subject.id, subject.name] as [string, string]);

  return (
    <AdminShell>
      <div className="grid gap-6">
        <AdminPageHeader title="Units" description="Create and organize subject units." />
        <AdminCard title="Create Unit">
          <form action={createUnit} className="grid gap-3 md:grid-cols-[1fr_1fr_120px_auto]">
            <SelectInput label="Subject" name="subject_id" options={subjectOptions} />
            <TextInput label="Name" name="name" />
            <TextInput label="Order" name="display_order" type="number" defaultValue={catalog.units.length + 1} />
            <div className="self-end"><SubmitButton>Create</SubmitButton></div>
            <div className="md:col-span-4"><Textarea label="Description" name="description" /></div>
          </form>
        </AdminCard>
        {catalog.units.map((unit) => (
          <AdminCard key={unit.id} title={unit.name}>
            <form action={updateUnit} className="grid gap-3 md:grid-cols-[1fr_1fr_120px_auto]">
              <input type="hidden" name="id" value={unit.id} />
              <SelectInput label="Subject" name="subject_id" options={subjectOptions} defaultValue={unit.subject_id} />
              <TextInput label="Name" name="name" defaultValue={unit.name} />
              <TextInput label="Order" name="display_order" type="number" defaultValue={unit.display_order} />
              <div className="self-end"><SubmitButton>Save</SubmitButton></div>
              <div className="md:col-span-4"><Textarea label="Description" name="description" defaultValue={unit.description} /></div>
            </form>
            <form action={deleteUnit} className="mt-3" data-confirm="Delete this unit?"><input type="hidden" name="id" value={unit.id} /><SubmitButton tone="danger">Delete</SubmitButton></form>
          </AdminCard>
        ))}
      </div>
    </AdminShell>
  );
}
