import { redirect } from "next/navigation";
import { AdminCard, SelectInput, SubmitButton, Textarea, TextInput } from "@/components/admin/AdminForms";
import { AdminShell } from "@/components/admin/AdminShell";
import { ReorderList } from "@/components/admin/ReorderList";
import { createResource, deleteResource, isAdminAuthenticated, reorderResources, updateResource } from "@/lib/admin-actions";
import { getAdminRole, getAdminTeacherEmail } from "@/lib/admin-session";
import { getCatalog, levelsForCurriculum, resourcesForSubject, subjectsForLevel } from "@/lib/data";
import type { Catalog } from "@/lib/types";

type Props = { searchParams: Promise<{ curriculum?: string; level?: string; subject?: string; type?: string; page?: string }> };

export default async function ResourcesAdminPage({ searchParams }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin");

  const query = await searchParams;
  const catalog = await getCatalog();
  const allowedSubjectIds = allowedSubjects(catalog, getAdminRole(), getAdminTeacherEmail());
  const curriculums = catalog.curriculums.filter((curriculum) =>
    getAdminRole() === "super_admin" || catalog.levels.some((level) => level.curriculum_id === curriculum.id && catalog.subjects.some((subject) => subject.level_id === level.id && allowedSubjectIds.includes(subject.id))),
  );
  const curriculum = curriculums.find((item) => item.id === query.curriculum) ?? curriculums[0];
  const levels = curriculum ? levelsForCurriculum(catalog, curriculum) : [];
  const level = levels.find((item) => item.id === query.level) ?? levels[0];
  const subjects = level ? subjectsForLevel(catalog, level).filter((subject) => getAdminRole() === "super_admin" || allowedSubjectIds.includes(subject.id)) : [];
  const subject = subjects.find((item) => item.id === query.subject) ?? subjects[0];
  const regularTypes = catalog.resourceTypes.filter((item) => item.name !== "Past Papers");
  const selectedType = regularTypes.find((item) => item.id === query.type) ?? regularTypes[0];
  const allResources = subject && selectedType ? resourcesForSubject(catalog, subject, selectedType.id) : [];
  const page = Number(query.page ?? "1");
  const pageSize = 6;
  const resources = allResources.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(allResources.length / pageSize));

  return (
    <AdminShell>
      <div className="grid gap-6">
        <Header title="Resources" description="Select a subject folder, then manage notes, videos, and topical questions as cards." />
        <ExplorerFilters curriculums={curriculums} levels={levels} subjects={subjects} curriculum={curriculum?.id} level={level?.id} subject={subject?.id} />
        {subject && selectedType ? (
          <>
            <div className="flex flex-wrap gap-2">
              {regularTypes.map((type) => (
                <a key={type.id} className={`rounded-lg px-4 py-2 text-sm font-semibold ${type.id === selectedType.id ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-700"}`} href={`?curriculum=${curriculum?.id}&level=${level?.id}&subject=${subject.id}&type=${type.id}`}>
                  {type.name}
                </a>
              ))}
            </div>
            <AdminCard title={`Create ${selectedType.name}`}>
              <ResourceForm action={createResource} subjectId={subject.id} resourceTypeId={selectedType.id} order={allResources.length + 1} />
            </AdminCard>
            <ReorderList action={reorderResources} items={allResources.map((item) => ({ id: item.id, label: item.title, description: selectedType.name }))} />
            <div className="grid gap-4">
              {resources.map((resource) => (
                <AdminCard key={resource.id} title={resource.title} description={selectedType.name}>
                  <ResourceForm action={updateResource} id={resource.id} subjectId={resource.subject_id} resourceTypeId={resource.resource_type_id} order={resource.display_order} resource={resource} />
                  <form action={deleteResource} className="mt-3" data-confirm="Delete this resource?"><input type="hidden" name="id" value={resource.id} /><SubmitButton tone="danger">Delete</SubmitButton></form>
                </AdminCard>
              ))}
            </div>
            <Pagination current={page} total={totalPages} base={`?curriculum=${curriculum?.id}&level=${level?.id}&subject=${subject.id}&type=${selectedType.id}`} />
          </>
        ) : (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">Select a subject to manage resources.</p>
        )}
      </div>
    </AdminShell>
  );
}

function ResourceForm({ action, id, subjectId, resourceTypeId, order, resource }: { action: (formData: FormData) => Promise<void>; id?: string; subjectId: string; resourceTypeId: string; order: number; resource?: { title: string; description: string; content: string; file_url: string | null; youtube_url: string | null; display_order: number } }) {
  return (
    <form action={action} className="grid gap-3">
      {id ? <input type="hidden" name="id" value={id} /> : null}
      <input type="hidden" name="subject_id" value={subjectId} />
      <input type="hidden" name="resource_type_id" value={resourceTypeId} />
      <div className="grid gap-3 md:grid-cols-[1fr_140px]">
        <TextInput label="Title" name="title" defaultValue={resource?.title} />
        <TextInput label="Order" name="display_order" type="number" defaultValue={resource?.display_order ?? order} />
      </div>
      <Textarea label="Description" name="description" defaultValue={resource?.description} />
      <Textarea label="Content" name="content" defaultValue={resource?.content} />
      <div className="grid gap-3 md:grid-cols-2">
        <TextInput label="File URL" name="file_url" defaultValue={resource?.file_url} required={false} />
        <TextInput label="YouTube URL" name="youtube_url" defaultValue={resource?.youtube_url} required={false} />
      </div>
      <div><SubmitButton>{id ? "Save Resource" : "Create Resource"}</SubmitButton></div>
    </form>
  );
}

function ExplorerFilters({
  curriculums,
  levels,
  subjects,
  curriculum,
  level,
  subject,
}: {
  curriculums: Catalog["curriculums"];
  levels: Catalog["levels"];
  subjects: Catalog["subjects"];
  curriculum?: string;
  level?: string;
  subject?: string;
}) {
  return (
    <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr_1fr_1fr_auto]">
      <SelectInput name="curriculum" label="Curriculum" options={curriculums.map((item) => [item.id, item.name])} defaultValue={curriculum} />
      <SelectInput name="level" label="Level" options={levels.map((item) => [item.id, item.name])} defaultValue={level} />
      <SelectInput name="subject" label="Subject" options={subjects.map((item) => [item.id, item.name])} defaultValue={subject} />
      <button className="self-end rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white" type="submit">Open</button>
    </form>
  );
}

function allowedSubjects(catalog: Awaited<ReturnType<typeof getCatalog>>, role: string, teacherEmail: string) {
  if (role === "super_admin") return catalog.subjects.map((subject) => subject.id);
  const teacher = catalog.teachers.find((item) => item.email === teacherEmail);
  return teacher ? catalog.teacherAssignments.filter((item) => item.teacher_id === teacher.id).map((item) => item.subject_id) : [];
}

function Header({ title, description }: { title: string; description: string }) {
  return <div><p className="text-sm font-bold uppercase tracking-wide text-blue-600">Admin</p><h1 className="mt-2 text-3xl font-bold text-slate-950">{title}</h1><p className="mt-2 text-slate-600">{description}</p></div>;
}

function Pagination({ current, total, base }: { current: number; total: number; base: string }) {
  return <div className="flex gap-2">{Array.from({ length: total }, (_, index) => index + 1).map((page) => <a key={page} className={`rounded-lg px-3 py-2 text-sm font-semibold ${page === current ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`} href={`${base}&page=${page}`}>{page}</a>)}</div>;
}
