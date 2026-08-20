"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Search, ChevronRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type QuestionPage = {
  id: string;
  title: string;
  description: string | null;
  page_type: string;
};

export default function QuestionBankPage() {
  const supabase = useMemo(() => createClient(), []);
  const [pages, setPages] = useState<QuestionPage[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      const { data, error: queryError } = await supabase
        .from("question_pages")
        .select("id, title, description, page_type")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (queryError) {
        setError(queryError.message);
        setPages([]);
      } else {
        setPages((data ?? []) as QuestionPage[]);
      }

      setLoading(false);
    }

    void load();
  }, [supabase]);

  const filtered = pages.filter((page) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return `${page.title} ${page.description ?? ""} ${page.page_type}`.toLowerCase().includes(term);
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Question Bank</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Practice Questions</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Browse published Question Pages freely. Log in when you are ready to practice.
        </p>
      </div>

      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search Question Pages..."
          className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm outline-none transition focus:border-primary"
        />
      </div>

      {error && <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-44 animate-pulse rounded-2xl bg-muted" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 font-bold">No Question Pages found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a different search.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((page) => (
            <Link
              key={page.id}
              href={`/student/question/${page.id}`}
              className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-0.5" />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-primary">{page.page_type}</p>
              <h2 className="mt-1 line-clamp-2 font-bold">{page.title}</h2>
              {page.description && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{page.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
