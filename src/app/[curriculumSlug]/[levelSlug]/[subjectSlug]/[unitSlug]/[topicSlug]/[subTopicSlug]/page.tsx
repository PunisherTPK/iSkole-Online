import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { McqRunner } from "@/components/learning/McqRunner";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/custom/EmptyState";
import { SectionHeader } from "@/components/ui/custom/SectionHeader";
import {
  discussionVideoForSubTopic,
  getSubTopicBySlugs,
  pathForCurriculum,
  pathForLevel,
  pathForSubject,
  pathForTopic,
  pathForUnit,
  questionSetsForSubTopic,
  questionsForSet,
} from "@/lib/data";
import { Play } from "lucide-react";

type Props = { params: Promise<{ curriculumSlug: string; levelSlug: string; subjectSlug: string; unitSlug: string; topicSlug: string; subTopicSlug: string }> };

export default async function SubTopicPage({ params }: Props) {
  const route = await params;
  const { catalog, curriculum, level, subject, unit, topic, subTopic } = await getSubTopicBySlugs(route.curriculumSlug, route.levelSlug, route.subjectSlug, route.unitSlug, route.topicSlug, route.subTopicSlug);
  if (!curriculum || !level || !subject || !unit || !topic || !subTopic) notFound();

  const questionSet = questionSetsForSubTopic(catalog, subTopic)[0];
  const questions = questionSet ? questionsForSet(catalog, questionSet) : [];
  const video = discussionVideoForSubTopic(catalog, subTopic);

  return (
    <>
      <PageHeader eyebrow={topic.name} title={subTopic.name} description={subTopic.description || "Attempt the MCQ section, then review the discussion video."} />
      <PageContainer>
        <Breadcrumbs items={[{ label: curriculum.name, href: pathForCurriculum(curriculum) }, { label: level.name, href: pathForLevel(curriculum, level) }, { label: subject.name, href: pathForSubject(curriculum, level, subject) }, { label: unit.name, href: pathForUnit(curriculum, level, subject, unit) }, { label: topic.name, href: pathForTopic(curriculum, level, subject, unit, topic) }, { label: subTopic.name }]} />
        <div className="mt-8 grid gap-10">
          {questionSet ? <McqRunner questionSet={questionSet} questions={questions} /> : <EmptyState icon={Play} title="No MCQ section yet" description="The teacher has not uploaded questions for this sub topic." />}

          <section>
            <SectionHeader title="Discussion Video" description="One focused explanation for this sub topic." />
            {video ? (
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-brand">
                <div className="aspect-video bg-black">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${video.youtube_video_id}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="grid gap-3 p-5">
                  <h2 className="text-xl font-bold text-foreground">{video.title}</h2>
                  <p className="text-sm leading-6 text-muted-foreground">{video.description}</p>
                  {video.resources ? <p className="rounded-xl bg-muted/10 p-4 text-sm leading-6 text-foreground/80">{video.resources}</p> : null}
                </div>
              </div>
            ) : (
              <EmptyState icon={Play} title="No discussion video yet" description="A discussion video will appear here once the teacher adds a YouTube URL." />
            )}
          </section>
        </div>
      </PageContainer>
    </>
  );
}
