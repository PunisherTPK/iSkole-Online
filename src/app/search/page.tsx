import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
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
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <SearchBar defaultValue={q} />
        <div className="mt-8">
          <p className="text-sm font-semibold text-slate-600">
            {q ? `${results.length} result${results.length === 1 ? "" : "s"} for "${q}"` : "Enter a keyword to search."}
          </p>
          <div className="mt-4 grid gap-3">
            {results.map((result) => (
              <Link key={`${result.type}-${result.href}`} href={result.href} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-soft">
                <span className="text-xs font-bold uppercase tracking-wide text-blue-600">{result.type}</span>
                <span className="mt-2 block text-lg font-bold text-slate-900">{result.title}</span>
                <span className="mt-2 block text-sm leading-6 text-slate-600">{result.description}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
