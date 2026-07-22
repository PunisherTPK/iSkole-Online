import { redirect } from "next/navigation";
import { AdminCard, SelectInput, SubmitButton, Textarea, TextInput } from "@/components/admin/AdminForms";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { createTopic, deleteTopic, isAdminAuthenticated, updateTopic } from "@/lib/admin-actions";
import { getCatalog } from "@/lib/data";

export default async function TopicsAdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  const catalog = await getCatalog();
  const unitOptions = catalog.units.map((unit) => [unit.id, unit.name] as [string, string]);

  return (
    <AdminShell>
      <div className="grid gap-6">
        <AdminPageHeader title="Topics" description="Create topic branches inside units." />
        <AdminCard title="Create Topic">
          <form action={createTopic} className="grid gap-3 md:grid-cols-[1fr_1fr_120px_auto]">
            <SelectInput label="Unit" name="unit_id" options={unitOptions} />
            <TextInput label="Name" name="name" />
            <TextInput label="Order" name="display_order" type="number" defaultValue={catalog.topics.length + 1} />
            <div className="self-end"><SubmitButton>Create</SubmitButton></div>
            <div className="md:col-span-4"><Textarea label="Description" name="description" /></div>
          </form>
        </AdminCard>
        {catalog.topics.map((topic) => (
          <AdminCard key={topic.id} title={topic.name}>
            <form action={updateTopic} className="grid gap-3 md:grid-cols-[1fr_1fr_120px_auto]">
              <input type="hidden" name="id" value={topic.id} />
              <SelectInput label="Unit" name="unit_id" options={unitOptions} defaultValue={topic.unit_id} />
              <TextInput label="Name" name="name" defaultValue={topic.name} />
              <TextInput label="Order" name="display_order" type="number" defaultValue={topic.display_order} />
              <div className="self-end"><SubmitButton>Save</SubmitButton></div>
              <div className="md:col-span-4"><Textarea label="Description" name="description" defaultValue={topic.description} /></div>
            </form>
            <form action={deleteTopic} className="mt-3" data-confirm="Delete this topic?"><input type="hidden" name="id" value={topic.id} /><SubmitButton tone="danger">Delete</SubmitButton></form>
          </AdminCard>
        ))}
      </div>
    </AdminShell>
  );
}
