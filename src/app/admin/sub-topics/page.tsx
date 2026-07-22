import { redirect } from "next/navigation";
import { AdminCard, SelectInput, SubmitButton, Textarea, TextInput } from "@/components/admin/AdminForms";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { createSubTopic, deleteSubTopic, isAdminAuthenticated, updateSubTopic } from "@/lib/admin-actions";
import { getCatalog } from "@/lib/data";

export default async function SubTopicsAdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  const catalog = await getCatalog();
  const topicOptions = catalog.topics.map((topic) => [topic.id, topic.name] as [string, string]);

  return (
    <AdminShell>
      <div className="grid gap-6">
        <AdminPageHeader title="Sub Topics" description="Create the final learning nodes that hold one MCQ section and one discussion video." />
        <AdminCard title="Create Sub Topic">
          <form action={createSubTopic} className="grid gap-3 md:grid-cols-[1fr_1fr_120px_auto]">
            <SelectInput label="Topic" name="topic_id" options={topicOptions} />
            <TextInput label="Name" name="name" />
            <TextInput label="Order" name="display_order" type="number" defaultValue={catalog.subTopics.length + 1} />
            <div className="self-end"><SubmitButton>Create</SubmitButton></div>
            <div className="md:col-span-4"><Textarea label="Description" name="description" /></div>
          </form>
        </AdminCard>
        {catalog.subTopics.map((subTopic) => (
          <AdminCard key={subTopic.id} title={subTopic.name}>
            <form action={updateSubTopic} className="grid gap-3 md:grid-cols-[1fr_1fr_120px_auto]">
              <input type="hidden" name="id" value={subTopic.id} />
              <SelectInput label="Topic" name="topic_id" options={topicOptions} defaultValue={subTopic.topic_id} />
              <TextInput label="Name" name="name" defaultValue={subTopic.name} />
              <TextInput label="Order" name="display_order" type="number" defaultValue={subTopic.display_order} />
              <div className="self-end"><SubmitButton>Save</SubmitButton></div>
              <div className="md:col-span-4"><Textarea label="Description" name="description" defaultValue={subTopic.description} /></div>
            </form>
            <form action={deleteSubTopic} className="mt-3" data-confirm="Delete this sub topic?"><input type="hidden" name="id" value={subTopic.id} /><SubmitButton tone="danger">Delete</SubmitButton></form>
          </AdminCard>
        ))}
      </div>
    </AdminShell>
  );
}
