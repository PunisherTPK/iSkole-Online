import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { McqRunner } from "@/components/learning/McqRunner";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/custom/EmptyState";
import { SectionHeader } from "@/components/ui/custom/SectionHeader";
import {
  discussionVideoForQuestionType,
  getSubTopicBySlugs,
  pathForCurriculum,
  pathForLevel,
  pathForSubject,
  pathForTopic,
  pathForUnit,
  questionsForType,
  questionTypesForSubTopic,
} from "@/lib/data";
import { FileQuestion, Play } from "lucide-react";

type Props = { params: Promise<{ curriculumSlug: string; levelSlug: string; subjectSlug: string; unitSlug: string; topicSlug: string; subTopicSlug: string }> };

export default async function SubTopicPage({ params }: Props) {
  const route = await params;
  const { catalog, curriculum, level, subject, unit, topic, subTopic } = await getSubTopicBySlugs(route.curriculumSlug, route.levelSlug, route.subjectSlug, route.unitSlug, route.topicSlug, route.subTopicSlug);
  if (!curriculum || !level || !subject || !unit || !topic || !subTopic) notFound();

  const questionTypes = questionTypesForSubTopic(catalog, subTopic);

  return (
    <>
      <PageHeader eyebrow={topic.name} title={subTopic.name} description={subTopic.description || "Choose a question type, attempt questions, then review the discussion video."} />
      <PageContainer>
        <Breadcrumbs items={[{ label: curriculum.name, href: pathForCurriculum(curriculum) }, { label: level.name, href: pathForLevel(curriculum, level) }, { label: subject.name, href: pathForSubject(curriculum, level, subject) }, { label: unit.name, href: pathForUnit(curriculum, level, subject, unit) }, { label: topic.name, href: pathForTopic(curriculum, level, subject, unit, topic) }, { label: subTopic.name }]} />
        <div className="mt-8 grid gap-10">
          {questionTypes.map((questionType) => {
            const questions = questionsForType(catalog, questionType);
            const video = discussionVideoForQuestionType(catalog, questionType);

            return (
              <section key={questionType.id} className="grid gap-6">
                <SectionHeader title={questionType.title} description={questionType.description || `${questionType.type.toUpperCase()} practice for this sub topic.`} />
                {questionType.type === "mcq" ? (
                  <McqRunner questionType={questionType} questions={questions} />
                ) : (
                  <div className="grid gap-4">
                    {questions.map((question) => (
                      <article key={question.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-brand">
                        <div className="border-b border-border bg-muted/5 p-4">
                          <Badge variant="outline" className="capitalize">{question.difficulty}</Badge>
                        </div>
                        <img src={question.question_image_url} alt="Structured question" className="h-auto w-full bg-white object-contain dark:invert" />
                        <div className="grid gap-3 p-5 text-sm leading-6">
                          <p><span className="font-semibold text-foreground">Marking scheme:</span> <span className="text-muted-foreground">{question.marking_scheme || "Coming soon."}</span></p>
                          <p><span className="font-semibold text-foreground">Explanation:</span> <span className="text-muted-foreground">{question.explanation || "Coming soon."}</span></p>
                        </div>
                      </article>
                    ))}
                    {!questions.length ? <EmptyState icon={FileQuestion} title="No structured questions yet" description="The teacher has not uploaded questions for this type." /> : null}
                  </div>
                )}

                {video ? (
                  <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-brand">
                    <div className="aspect-video bg-black">
                      <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${video.youtube_video_id}`} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
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
            );
          })}

          {!questionTypes.length ? <EmptyState icon={FileQuestion} title="No question types yet" description="MCQ and Structured practice will appear here once a teacher adds them." /> : null}
        </div>
      </PageContainer>
    </>
  );
}
