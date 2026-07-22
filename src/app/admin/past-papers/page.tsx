import { redirect } from "next/navigation";
import { AdminCard, SelectInput, SubmitButton, Textarea, TextInput } from "@/components/admin/AdminForms";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { createDiscussionVideo, deleteDiscussionVideo, isAdminAuthenticated, updateDiscussionVideo } from "@/lib/admin-actions";
import { getCatalog } from "@/lib/data";

export default async function DiscussionVideosAdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  const catalog = await getCatalog();
  const subTopicOptions = catalog.subTopics.map((item) => [item.id, item.name] as [string, string]);
  const teacherOptions: [string, string][] = [["", "Unassigned"], ...catalog.teachers.map((item) => [item.id, item.name] as [string, string])];

  return (
    <AdminShell>
      <div className="grid gap-6">
        <AdminPageHeader title="Discussion Videos" description="Each sub topic supports one YouTube discussion video with description and resources." />
        <AdminCard title="Create Discussion Video">
          <form action={createDiscussionVideo} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
            <SelectInput label="Sub Topic" name="sub_topic_id" options={subTopicOptions} />
            <SelectInput label="Teacher" name="teacher_id" options={teacherOptions} />
            <TextInput label="Title" name="title" />
            <div className="self-end"><SubmitButton>Create</SubmitButton></div>
            <div className="md:col-span-2"><TextInput label="YouTube URL" name="youtube_url" placeholder="https://youtube.com/watch?v=..." /></div>
            <div className="md:col-span-2"><Textarea label="Description" name="description" /></div>
            <div className="md:col-span-4"><Textarea label="Resources" name="resources" /></div>
          </form>
        </AdminCard>

        {catalog.discussionVideos.map((video) => (
          <AdminCard key={video.id} title={video.title} description={`Video ID: ${video.youtube_video_id}`}>
            <form action={updateDiscussionVideo} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
              <input type="hidden" name="id" value={video.id} />
              <SelectInput label="Sub Topic" name="sub_topic_id" options={subTopicOptions} defaultValue={video.sub_topic_id} />
              <SelectInput label="Teacher" name="teacher_id" options={teacherOptions} defaultValue={video.teacher_id ?? ""} />
              <TextInput label="Title" name="title" defaultValue={video.title} />
              <div className="self-end"><SubmitButton>Save</SubmitButton></div>
              <div className="md:col-span-2"><TextInput label="YouTube URL" name="youtube_url" defaultValue={video.youtube_url} /></div>
              <div className="md:col-span-2"><Textarea label="Description" name="description" defaultValue={video.description} /></div>
              <div className="md:col-span-4"><Textarea label="Resources" name="resources" defaultValue={video.resources} /></div>
            </form>
            <form action={deleteDiscussionVideo} className="mt-3" data-confirm="Delete this discussion video?"><input type="hidden" name="id" value={video.id} /><SubmitButton tone="danger">Delete</SubmitButton></form>
          </AdminCard>
        ))}
      </div>
    </AdminShell>
  );
}
