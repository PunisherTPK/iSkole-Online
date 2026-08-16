import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCatalog } from "@/lib/data";
import { UserRound } from "lucide-react";

export const metadata = {
  title: "Teachers",
  description: "Browse iSkole Online teacher profiles, subjects, qualifications, and discussion videos.",
};

export default async function TeachersPage() {
  const catalog = await getCatalog();

  return (
    <>
      <PageHeader eyebrow="Teachers" title="Teacher Profiles" description="Find the educators behind topical MCQs and discussion videos." />
      <PageContainer>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {catalog.teachers.map((teacher) => (
            <article key={teacher.id} className="rounded-2xl border border-border bg-card p-5 shadow-brand">
              <div className="flex items-start gap-4">
                {teacher.photo_url ? <img src={teacher.photo_url} alt={teacher.name} className="h-20 w-20 rounded-2xl object-cover" /> : <div className="grid h-20 w-20 place-items-center rounded-2xl bg-primary/10 text-primary"><UserRound className="h-8 w-8" /></div>}
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-foreground">{teacher.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{teacher.qualifications}</p>
                  <p className="mt-1 text-sm font-semibold text-primary">{teacher.experience_years} years experience</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {teacher.subjects.map((subject) => <Badge key={subject} variant="outline">{subject}</Badge>)}
              </div>
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">{teacher.short_bio}</p>
              <Button asChild className="mt-5 rounded-xl">
                <Link href={`/teachers/${teacher.slug}`}>Profile</Link>
              </Button>
            </article>
          ))}
        </div>
      </PageContainer>
    </>
  );
}
