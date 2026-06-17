import { GradeCard } from "@/components/Cards";
import { SearchBar } from "@/components/SearchBar";
import { getCatalog, levelsForCurriculum, pathForCurriculum } from "@/lib/data";

export default async function HomePage() {
  const catalog = await getCatalog();

  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-blue-600">Educational content explorer</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Learn Every Lesson, One Question at a Time
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Choose a curriculum, level, and subject to find notes, videos, topical questions, and past papers.
            </p>
            <div className="mt-8">
              <SearchBar />
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-soft">
            <div className="grid gap-3">
              {catalog.curriculums.slice(0, 3).map((curriculum) => (
                <div key={curriculum.id} className="rounded-lg bg-white p-4">
                  <p className="font-bold text-slate-950">{curriculum.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{levelsForCurriculum(catalog, curriculum).length} level groups available</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-950">Select Curriculum</h2>
          <p className="mt-2 text-slate-600">Menus are generated from database records, so future curricula work without code changes.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.curriculums.map((curriculum) => (
            <GradeCard
              key={curriculum.id}
              title={curriculum.name}
              href={pathForCurriculum(curriculum)}
              description="Open levels and subjects."
              meta={`Order ${curriculum.display_order}`}
            />
          ))}
        </div>
      </section>
    </>
  );
}
