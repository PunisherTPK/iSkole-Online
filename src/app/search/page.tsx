import Link from "next/link";
import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/ui/custom/FadeIn";
import { SearchBar } from "@/components/ui/custom/SearchBar";
import { Badge } from "@/components/ui/badge";
import { getCatalog, searchCatalog } from "@/lib/data";

export const metadata: Metadata = {
  title: "Search",
  description: "Search iSkole Online by curriculum, level, subject, resource, and past paper.",
};

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const catalog = await getCatalog();
  const results = searchCatalog(catalog, q);

  return (
    <>
      <PageHeader title="Search" description="Find curriculums, levels, subjects, resources, and past papers across iSkole Online." />
      <PageContainer size="narrow">
        <SearchBar defaultValue={q} />
        <div className="mt-10">
          <p className="text-sm font-medium text-muted-foreground">
            {q ? `${results.length} result${results.length === 1 ? "" : "s"} for "${q}"` : "Enter a keyword to search."}
          </p>
          <div className="mt-6 grid gap-4">
            {results.map((result, index) => (
              <FadeIn key={`${result.type}-${result.href}`} delay={index * 0.03}>
                <Link
                  href={result.href}
                  className="group block rounded-3xl border border-border bg-card p-6 shadow-brand transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-brand-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Badge variant="outline" className="border-primary/20 text-primary">
                    {result.type}
                  </Badge>
                  <span className="mt-3 block text-lg font-semibold text-foreground group-hover:text-primary">{result.title}</span>
                  <span className="mt-2 block text-sm leading-6 text-muted-foreground">{result.description}</span>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </PageContainer>
    </>
  );
}
