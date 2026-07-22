import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { getCatalog, questionSetsForTeacher, teacherBySlug, videosForTeacher } from "@/lib/data";
import { ExternalLink, FileQuestion, Play, UserRound } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const teacher = teacherBySlug(catalog, slug);
  return teacher ? { title: teacher.name, description: teacher.short_bio } : {};
}

export default async function TeacherProfilePage({ params }: Props) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const teacher = teacherBySlug(catalog, slug);
  if (!teacher) notFound();

  const videos = videosForTeacher(catalog, teacher);
  const questionSets = questionSetsForTeacher(catalog, teacher);

  return (
    <section>
      <div className="relative h-72 overflow-hidden border-b border-border bg-muted">
        {teacher.cover_url ? <img src={teacher.cover_url} alt="" className="h-full w-full object-cover" /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>
      <PageContainer className="-mt-16">
        <div className="relative grid gap-8 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-2xl border border-border bg-card p-5 shadow-brand">
            {teacher.photo_url ? <img src={teacher.photo_url} alt={teacher.name} className="h-40 w-40 rounded-2xl object-cover" /> : <div className="grid h-40 w-40 place-items-center rounded-2xl bg-primary/10 text-primary"><UserRound className="h-16 w-16" /></div>}
            <h1 className="mt-5 text-3xl font-bold text-foreground">{teacher.name}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{teacher.short_bio}</p>
            <div className="mt-4 grid gap-2 text-sm">
              <p><span className="font-semibold text-foreground">Experience:</span> {teacher.experience_years} years</p>
              <p><span className="font-semibold text-foreground">Qualifications:</span> {teacher.qualifications}</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {Object.entries(teacher.social_links).map(([label, href]) => (
                <Button key={label} asChild variant="outline" size="sm" className="rounded-xl capitalize">
                  <a href={href} target="_blank" rel="noreferrer">{label}<ExternalLink className="ml-2 h-3 w-3" /></a>
                </Button>
              ))}
            </div>
          </aside>

          <div className="grid gap-6">
            <section className="rounded-2xl border border-border bg-card p-6 shadow-brand">
              <h2 className="text-xl font-bold text-foreground">Biography</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{teacher.biography}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <PillGroup label="Subjects" values={teacher.subjects} />
                <PillGroup label="Curriculums" values={teacher.curriculums} />
              </div>
            </section>

            <div className="grid gap-5 sm:grid-cols-2">
              <Metric icon={Play} label="Discussion Videos" value={videos.length} />
              <Metric icon={FileQuestion} label="Question Sets" value={questionSets.length} />
            </div>

            <section className="rounded-2xl border border-border bg-card p-6 shadow-brand">
              <h2 className="text-xl font-bold text-foreground">Created Content</h2>
              <div className="mt-4 grid gap-3">
                {[...videos.map((item) => ({ id: item.id, label: item.title, type: "Discussion Video" })), ...questionSets.map((item) => ({ id: item.id, label: item.title, type: "Question Set" }))].map((item) => (
                  <div key={item.id} className="rounded-xl border border-border bg-muted/5 p-4">
                    <Badge variant="outline">{item.type}</Badge>
                    <p className="mt-2 font-semibold text-foreground">{item.label}</p>
                  </div>
                ))}
                {!videos.length && !questionSets.length ? <p className="text-sm text-muted-foreground">No public content yet.</p> : null}
              </div>
            </section>
            <Button asChild variant="outline" className="w-fit rounded-xl"><Link href="/teachers">Back to Teachers</Link></Button>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

function PillGroup({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">{values.map((value) => <Badge key={value} variant="outline">{value}</Badge>)}</div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Play; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-brand">
      <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
      <p className="mt-3 text-3xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
