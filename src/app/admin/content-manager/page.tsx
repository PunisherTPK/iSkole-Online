
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ContentManagerPage({
  searchParams,
}: {
  searchParams: Promise<{
    curriculum?: string;
    level?: string;
  }>;
}) {

    const params = await searchParams;
    const selectedCurriculumId = params.curriculum;
    const selectedLevelId = params.level;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin/content-manager");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_active || profile.role !== "admin") {
    redirect("/dashboard");
  }


  const { data: curriculums, error } = await supabase
    .from("curriculums")
    .select("id, name, description, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

    const { data: levels, error: levelsError } = selectedCurriculumId
        ? await supabase
            .from("levels")
            .select("id, curriculum_id, name, description, is_active")
            .eq("curriculum_id", selectedCurriculumId)
            .eq("is_active", true)
            .order("name", { ascending: true })
        : { data: [], error: null };

        if (levelsError) {
        throw new Error(levelsError.message);
    }
    const { data: subjects, error: subjectsError } = selectedLevelId
        ? await supabase
            .from("subjects")
            .select("id, level_id, name, code, description, is_active")
            .eq("level_id", selectedLevelId)
            .eq("is_active", true)
            .order("name", { ascending: true })
        : { data: [], error: null };

        if (subjectsError) {
        throw new Error(subjectsError.message);
    }

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            Content Manager
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Manage curriculum, levels and subjects.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-4">
            <input
              type="search"
              placeholder="Search curriculum, level or subject..."
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid min-h-[500px] md:grid-cols-3">
            <section className="border-b border-border md:border-b-0 md:border-r">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <h2 className="font-semibold text-foreground">
                    Curriculum
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Academic systems
                  </p>
                </div>

                <button
                  type="button"
                  className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                >
                  + Add
                </button>
              </div>

              <div className="p-2">
                {curriculums?.length ? (
                  curriculums.map((curriculum) => (

                    <Link
                    key={curriculum.id}
                    href={`/admin/content-manager?curriculum=${curriculum.id}`}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-muted ${
                        selectedCurriculumId === curriculum.id
                        ? "bg-primary/10 text-primary"
                        : ""
                    }`}
                    >

                      <span>
                        <span className="block text-sm font-medium text-foreground">
                          {curriculum.name}
                        </span>

                        <span className="block text-xs text-muted-foreground">
                        {curriculum.description || "No description"}
                        </span>
                      </span>

                      <span className="text-muted-foreground">→</span>
                    </Link>

                  ))
                ) : (
                  <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                    No curriculums found.
                  </p>
                )}
              </div>
            </section>

            <section className="border-b border-border md:border-b-0 md:border-r">
              <div className="border-b border-border px-4 py-3">
                <h2 className="font-semibold text-foreground">Levels</h2>
                <p className="text-xs text-muted-foreground">
                  Select a curriculum first
                </p>
              </div>

                <div className="p-2">
                {levels?.length ? (
                    levels.map((level) => (
                    <Link
                        key={level.id}
                        href={`/admin/content-manager?curriculum=${selectedCurriculumId}&level=${level.id}`}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-muted ${
                        selectedLevelId === level.id
                            ? "bg-primary/10 text-primary"
                            : ""
                        }`}
                    >
                        <span>
                        <span className="block text-sm font-medium text-foreground">
                            {level.name}
                        </span>

                        <span className="block text-xs text-muted-foreground">
                            {level.description || "No description"}
                        </span>
                        </span>

                        <span className="text-muted-foreground">→</span>
                    </Link>
                    ))
                ) : (
                    <div className="flex min-h-[400px] items-center justify-center p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        {selectedCurriculumId
                        ? "No levels found."
                        : "Select a curriculum to view its levels."}
                    </p>
                    </div>
                )}
                </div>
            </section>

            <section>

                <div className="p-2">
                {subjects?.length ? (
                    subjects.map((subject) => (
                    <div
                        key={subject.id}
                        className="rounded-xl px-3 py-3 transition hover:bg-muted"
                    >
                        <span className="block text-sm font-medium text-foreground">
                        {subject.name}
                        </span>

                        {subject.code && (
                        <span className="block text-xs text-muted-foreground">
                            {subject.code}
                        </span>
                        )}
                    </div>
                    ))
                ) : (
                    <div className="flex min-h-[400px] items-center justify-center p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        {selectedLevelId
                        ? "No subjects found."
                        : "Select a level to view its subjects."}
                    </p>
                    </div>
                )}
                </div>
              <div className="flex min-h-[400px] items-center justify-center p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Select a level to view its subjects.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}