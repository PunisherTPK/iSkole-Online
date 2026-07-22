import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CurriculumCard, FeaturedCurriculumCard } from "@/components/ui/custom/CurriculumCard";
import { FadeIn } from "@/components/ui/custom/FadeIn";
import { SearchBar } from "@/components/ui/custom/SearchBar";
import { SectionHeader } from "@/components/ui/custom/SectionHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { getCatalog, levelsForCurriculum, pathForCurriculum } from "@/lib/data";
import { BookOpen, RefreshCw, Sparkles, UserRound } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  const catalog = await getCatalog();
  const featured = catalog.curriculums[0];

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-accent/5 dark:from-brand-primary/10 dark:to-brand-accent/10" />
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-brand-primary/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-brand-accent/10 blur-3xl" />

        <PageContainer className="relative py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <FadeIn>
              <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
                Educational Content Explorer
              </Badge>
              <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[56px] lg:leading-[1.1]">
                Learn Every Lesson,{" "}
                <span className="text-gradient">One Question at a Time</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                Choose a curriculum, level, and subject to attempt topical MCQs, watch discussion videos, and learn with trusted teachers.
              </p>
              <div className="mt-8">
                <SearchBar />
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  { icon: BookOpen, label: "Structured Learning" },
                  { icon: Sparkles, label: "Quality Content" },
                  { icon: RefreshCw, label: "Always Updated" },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-sm font-medium text-foreground shadow-brand backdrop-blur-sm"
                  >
                    <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                    {label}
                  </span>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              {featured ? (
                <FeaturedCurriculumCard
                  name={featured.name}
                  levelCount={levelsForCurriculum(catalog, featured).length}
                  href={pathForCurriculum(featured)}
                />
              ) : (
                <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
                  No curriculums available yet.
                </div>
              )}
              {catalog.curriculums.length > 1 ? (
                <div className="mt-4 grid gap-3">
                  {catalog.curriculums.slice(1, 3).map((curriculum) => (
                    <FeaturedCurriculumCard
                      key={curriculum.id}
                      name={curriculum.name}
                      levelCount={levelsForCurriculum(catalog, curriculum).length}
                      href={pathForCurriculum(curriculum)}
                      className="scale-95 opacity-90"
                    />
                  ))}
                </div>
              ) : null}
            </FadeIn>
          </div>
        </PageContainer>
      </section>

      <PageContainer>
        <FadeIn>
          <SectionHeader
            title="Featured Teachers"
            description="Meet the educators building topical question sets and discussion videos for iSkole Online."
          />
        </FadeIn>
        <div className="flex snap-x gap-5 overflow-x-auto pb-3">
          {catalog.teachers.slice(0, 6).map((teacher, index) => (
            <FadeIn key={teacher.id} delay={index * 0.05}>
              <article className="w-[300px] snap-start rounded-2xl border border-border bg-card p-5 shadow-brand transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-brand-lg">
                <div className="flex items-center gap-4">
                  {teacher.photo_url ? (
                    <img
                      src={teacher.photo_url}
                      alt={teacher.name}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <UserRound className="h-7 w-7" aria-hidden="true" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold text-foreground">{teacher.name}</h2>
                    <p className="truncate text-sm text-muted-foreground">{teacher.subjects.join(", ") || "Teacher"}</p>
                    <p className="truncate text-xs font-semibold text-primary">{teacher.curriculums.join(", ") || "Multiple curricula"}</p>
                  </div>
                </div>
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">{teacher.short_bio}</p>
                <Button asChild className="mt-5 w-full rounded-xl">
                  <Link href={`/teachers/${teacher.slug}`}>View Profile</Link>
                </Button>
              </article>
            </FadeIn>
          ))}
        </div>
      </PageContainer>

      <PageContainer>
        <FadeIn>
          <SectionHeader
            title="Select Curriculum"
            description="Menus are generated from database records, so future curricula work without code changes."
          />
        </FadeIn>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.curriculums.map((curriculum, index) => (
            <FadeIn key={curriculum.id} delay={index * 0.05}>
              <CurriculumCard
                title={curriculum.name}
                href={pathForCurriculum(curriculum)}
                description="Open levels and subjects."
                meta={`Order ${curriculum.display_order}`}
              />
            </FadeIn>
          ))}
        </div>
      </PageContainer>
    </>
  );
}
