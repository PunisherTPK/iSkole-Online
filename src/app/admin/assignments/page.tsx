import { redirect } from "next/navigation";
import { AdminCard, SelectInput, SubmitButton } from "@/components/admin/AdminForms";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { assignTeacherSubject, deleteTeacherAssignment } from "@/lib/admin-actions";
import { getAdminRole } from "@/lib/admin-session";
import { getCatalog } from "@/lib/data";

export default async function AssignmentsAdminPage() {
  if (getAdminRole() === "teacher") redirect("/admin/content-manager");

  const catalog = await getCatalog();

  return (
    <AdminShell>
      <div className="grid gap-6">
        <AdminPageHeader title="Assignments" description="Assign one or more teachers to each subject." />
        <AdminCard title="Assign Teacher to Subject">
          <form action={assignTeacherSubject} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <SelectInput label="Teacher" name="teacher_id" options={catalog.teachers.map((teacher) => [teacher.id, teacher.name])} required />
            <SelectInput label="Subject" name="subject_id" options={catalog.subjects.map((subject) => [subject.id, subject.name])} required />
            <div className="self-end"><SubmitButton>Assign</SubmitButton></div>
          </form>
        </AdminCard>
        <AdminCard title="Current Assignments">
          <div className="grid gap-3">
            {catalog.teacherSubjects.map((assignment) => {
              const teacher = catalog.teachers.find((item) => item.id === assignment.teacher_id);
              const subject = catalog.subjects.find((item) => item.id === assignment.subject_id);
              return (
                <form key={assignment.id} action={deleteTeacherAssignment} data-confirm="Remove this teacher assignment?" data-confirm-name={`${teacher?.name ?? "Teacher"} -> ${subject?.name ?? "Subject"}`} className="rounded-xl border border-border bg-muted/5 p-4">
                  <input type="hidden" name="id" value={assignment.id} />
                  <p className="font-semibold text-foreground">{teacher?.name ?? "Unknown teacher"}</p>
                  <p className="text-sm text-muted-foreground">{subject?.name ?? "Unknown subject"}</p>
                  <button className="mt-3 text-sm font-semibold text-destructive hover:underline" type="submit">Remove</button>
                </form>
              );
            })}
            {!catalog.teacherSubjects.length ? <p className="text-sm text-muted-foreground">No assignments found.</p> : null}
          </div>
        </AdminCard>
      </div>
    </AdminShell>
  );
}
