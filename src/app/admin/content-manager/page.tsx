import { AdminCard, SelectInput, SubmitButton } from "@/components/admin/AdminForms";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContentManagerExplorer } from "@/components/admin/ContentManagerExplorer";
import {
  createDiscussionVideo,
  createQuestion,
  createQuestionType,
  createSubTopic,
  createTopic,
  createUnit,
  deleteDiscussionVideo,
  deleteQuestion,
  deleteQuestionType,
  deleteSubTopic,
  deleteTopic,
  deleteUnit,
  updateDiscussionVideo,
  updateQuestion,
  updateQuestionType,
  updateSubTopic,
  updateTopic,
  updateUnit,
} from "@/lib/admin-actions";
import { getAdminRole, getAdminTeacherEmail } from "@/lib/admin-session";
import { getCatalog, subjectsForTeacher } from "@/lib/data";

type Props = { searchParams: Promise<{ subject?: string }> };

export default async function ContentManagerPage({ searchParams }: Props) {
  const query = await searchParams;
  const catalog = await getCatalog();
  const role = getAdminRole();
  const teacher = catalog.teachers.find((item) => item.email === getAdminTeacherEmail());
  const visibleSubjects = role === "admin" ? catalog.subjects : teacher ? subjectsForTeacher(catalog, teacher) : [];
  const subject = visibleSubjects.find((item) => item.id === query.subject) ?? visibleSubjects[0];
  const teacherOptions: [string, string][] = [["", "Unassigned"], ...catalog.teachers.map((item) => [item.id, item.name] as [string, string])];

  return (
    <AdminShell>
      <div className="grid gap-6">
        <AdminPageHeader title="Content Manager" description="Select one node in the tree to edit its details, children, questions, or discussion video." />
        <AdminCard title="Subject">
          <form className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <SelectInput label="Assigned Subject" name="subject" options={visibleSubjects.map((item) => [item.id, item.name])} defaultValue={subject?.id} />
            <div className="self-end"><SubmitButton>Open</SubmitButton></div>
          </form>
        </AdminCard>
        {subject ? (
          <ContentManagerExplorer
            catalog={catalog}
            subject={subject}
            teacherOptions={teacherOptions}
            actions={{
              createUnit,
              updateUnit,
              deleteUnit,
              createTopic,
              updateTopic,
              deleteTopic,
              createSubTopic,
              updateSubTopic,
              deleteSubTopic,
              createQuestionType,
              updateQuestionType,
              deleteQuestionType,
              createQuestion,
              updateQuestion,
              deleteQuestion,
              createDiscussionVideo,
              updateDiscussionVideo,
              deleteDiscussionVideo,
            }}
          />
        ) : (
          <AdminCard title="No assigned subjects"><p className="text-sm text-muted-foreground">Ask an admin to assign a subject before managing content.</p></AdminCard>
        )}
      </div>
    </AdminShell>
  );
}
