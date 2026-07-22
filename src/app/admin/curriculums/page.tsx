import { redirect } from "next/navigation";
import { AdminCard, SubmitButton, TextInput } from "@/components/admin/AdminForms";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { ReorderList } from "@/components/admin/ReorderList";
import { createCurriculum, deleteCurriculum, isAdminAuthenticated, reorderCurriculums, updateCurriculum } from "@/lib/admin-actions";
import { getAdminRole } from "@/lib/admin-session";
import { getCatalog } from "@/lib/data";

export default async function CurriculumsAdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  if (getAdminRole() === "teacher") redirect("/admin/content-manager");

  const catalog = await getCatalog();

  return (
    <AdminShell>
      <div className="grid gap-6">
        <AdminPageHeader title="Curriculums" description="Create, edit, delete, and reorder top-level curriculum folders." />
        <AdminCard title="Create Curriculum">
          <form action={createCurriculum} className="grid gap-3 sm:grid-cols-[1fr_140px_auto]">
            <TextInput label="Name" name="name" placeholder="Curriculum name" />
            <TextInput label="Order" name="display_order" type="number" defaultValue={catalog.curriculums.length + 1} />
            <div className="self-end"><SubmitButton>Create</SubmitButton></div>
          </form>
        </AdminCard>
        <ReorderList action={reorderCurriculums} items={catalog.curriculums.map((item) => ({ id: item.id, label: item.name }))} />
        <div className="grid gap-4">
          {catalog.curriculums.map((curriculum) => (
            <AdminCard key={curriculum.id} title={curriculum.name} description="Drag this card in your planning order, then update its order number.">
              <div draggable className="cursor-grab rounded-xl border border-dashed border-border bg-muted/5 p-4">
                <form action={updateCurriculum} className="grid gap-3 lg:grid-cols-[1fr_140px_auto]">
                  <input type="hidden" name="id" value={curriculum.id} />
                  <TextInput label="Name" name="name" defaultValue={curriculum.name} />
                  <TextInput label="Order" name="display_order" type="number" defaultValue={curriculum.display_order} />
                  <div className="self-end"><SubmitButton>Save</SubmitButton></div>
                </form>
                <form action={deleteCurriculum} className="mt-3" data-confirm="Delete this curriculum and hide it from public navigation?">
                  <input type="hidden" name="id" value={curriculum.id} />
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
