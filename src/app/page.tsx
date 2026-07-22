import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CurriculumCard } from "@/components/ui/custom/CurriculumCard";
import { FadeIn } from "@/components/ui/custom/FadeIn";
import { SearchBar } from "@/components/ui/custom/SearchBar";
import { SectionHeader } from "@/components/ui/custom/SectionHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { getCatalog, pathForCurriculum } from "@/lib/data";
import { BookOpen, RefreshCw, Sparkles, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function HomePage() {
  const catalog = await getCatalog();

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-accent/5 dark:from-brand-primary/10 dark:to-brand-accent/10" />
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-brand-primary/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-brand-accent/10 blur-3xl" />

        <PageContainer className="relative py-16 lg:py-24">
          <FadeIn className="mx-auto max-w-5xl">
            <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:items-center lg:text-left">
              <div className="relative shrink-0">
                <div className="absolute inset-6 rounded-full bg-primary/10 blur-3xl dark:bg-primary/25" />
                <Image src="/iskole-logo.png" alt="iSkole Online" width={320} height={320} className="relative h-auto w-[220px] object-contain drop-shadow-2xl dark:drop-shadow-[0_0_32px_rgba(168,85,247,0.35)] sm:w-[260px] lg:w-[300px]" priority />
              </div>
              <div className="min-w-0">
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
              </div>
            </div>
            <div className="mx-auto mt-8 max-w-2xl">
              <SearchBar />
            </div>
              <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
                <Button asChild className="rounded-xl"><Link href="/teachers">Find Mentors</Link></Button>
                <Button asChild variant="outline" className="rounded-xl"><Link href="/search">Browse Content</Link></Button>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
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

          <FadeIn delay={0.15} className="mt-10">
              <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-brand-lg backdrop-blur">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary">Featured Mentors</p>
                    <h2 className="text-2xl font-bold text-foreground">Learn with specialists</h2>
                  </div>
                  <Button asChild variant="outline" className="rounded-xl"><Link href="/teachers">All</Link></Button>
                </div>
                <div className="flex snap-x gap-4 overflow-x-auto pb-2">
                  {catalog.teachers.slice(0, 5).map((teacher) => (
                    <article key={teacher.id} className="w-[260px] shrink-0 snap-start rounded-2xl border border-border bg-background p-4">
                      <div className="flex items-center gap-3">
                        {teacher.photo_url ? <img src={teacher.photo_url} alt={teacher.name} className="h-14 w-14 rounded-xl object-cover" /> : <div className="grid h-14 w-14 place-items-center rounded-xl bg-primary/10 text-primary"><UserRound className="h-6 w-6" /></div>}
                        <div className="min-w-0">
                          <h3 className="truncate font-bold text-foreground">{teacher.name}</h3>
                          <p className="truncate text-xs text-muted-foreground">{teacher.subjects.join(", ") || "Subject mentor"}</p>
                          <p className="truncate text-xs font-semibold text-primary">{teacher.curriculums.join(", ") || "Multiple curricula"}</p>
                        </div>
                      </div>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{teacher.short_bio}</p>
                      <Button asChild size="sm" className="mt-4 w-full rounded-xl"><Link href={`/teachers/${teacher.slug}`}>View Profile</Link></Button>
                    </article>
                  ))}
                </div>
              </div>
          </FadeIn>
        </PageContainer>
      </section>

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
