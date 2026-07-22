import { redirect } from "next/navigation";
import { AdminCard, SelectInput, SubmitButton, TextInput } from "@/components/admin/AdminForms";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  assignTeacherSubject,
  createTeacher,
  deleteTeacher,
  deleteTeacherAssignment,
  isAdminAuthenticated,
  updateTeacher,
} from "@/lib/admin-actions";
import { getAdminRole } from "@/lib/admin-session";
import { getCatalog } from "@/lib/data";

export default async function TeachersAdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin");

  const catalog = await getCatalog();
  const role = getAdminRole();

  return (
    <AdminShell>
      <div className="grid gap-6">
        <AdminPageHeader
          title={role === "teacher" ? "My Subjects" : "Teachers"}
          description="Assign subjects so teachers can focus on the folders they manage."
        />
        {role === "admin" ? (
          <AdminCard title="Create Teacher">
            <form action={createTeacher} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <TextInput label="Name" name="name" />
              <TextInput label="Email" name="email" type="email" />
              <div className="self-end"><SubmitButton>Create</SubmitButton></div>
            </form>
          </AdminCard>
        ) : null}
        <div className="grid gap-4">
          {catalog.teachers.map((teacher) => {
            const assignments = catalog.teacherAssignments.filter((item) => item.teacher_id === teacher.id);
            return (
              <AdminCard key={teacher.id} title={teacher.name} description={teacher.email}>
                {role === "admin" ? (
                  <>
                    <form action={updateTeacher} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                      <input type="hidden" name="id" value={teacher.id} />
                      <TextInput label="Name" name="name" defaultValue={teacher.name} />
                      <TextInput label="Email" name="email" type="email" defaultValue={teacher.email} />
                      <div className="self-end"><SubmitButton>Save</SubmitButton></div>
                    </form>
                    <form action={assignTeacherSubject} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                      <input type="hidden" name="teacher_id" value={teacher.id} />
                      <SelectInput label="Assign Subject" name="subject_id" options={catalog.subjects.map((subject) => [subject.id, subject.name])} />
                      <div className="self-end"><SubmitButton tone="secondary">Assign</SubmitButton></div>
                    </form>
                  </>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  {assignments.map((assignment) => {
                    const subject = catalog.subjects.find((item) => item.id === assignment.subject_id);
                    const level = subject ? catalog.levels.find((item) => item.id === subject.level_id) : undefined;
                    const curriculum = level ? catalog.curriculums.find((item) => item.id === level.curriculum_id) : undefined;
                    return (
                      <form key={assignment.id} action={deleteTeacherAssignment} className="rounded-xl border border-border bg-muted/5 p-3" data-confirm="Remove this subject assignment?">
                        <input type="hidden" name="id" value={assignment.id} />
                        <p className="text-sm font-semibold text-foreground">
                          {curriculum?.name} &gt; {level?.name} &gt; {subject?.name}
                        </p>
                        {role === "admin" ? (
                          <button className="mt-2 text-sm font-semibold text-destructive hover:underline" type="submit">
                            Remove
                          </button>
                        ) : null}
                      </form>
                    );
                  })}
                </div>
                {role === "admin" ? (
                  <form action={deleteTeacher} className="mt-4" data-confirm="Delete this teacher profile?">
                    <input type="hidden" name="id" value={teacher.id} />
                    <SubmitButton tone="danger">Delete Teacher</SubmitButton>
                  </form>
                ) : null}
              </AdminCard>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}

