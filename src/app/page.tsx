import { GradeCard } from "@/components/Cards";
import { SearchBar } from "@/components/SearchBar";
import { getCatalog, pathForGrade } from "@/lib/data";

export default async function HomePage() {
  const catalog = await getCatalog();

  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-blue-600">Sri Lankan question bank By Gome</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Learn Every Lesson, One Question at a Time
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Find past papers, lesson-based questions, answers, and explanations for Sri Lankan students from Grade 6 to A/L.
            </p>
            <div className="mt-8">
              <SearchBar />
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-soft">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {["Past Papers", "Answers", "Explanations", "Lesson Practice"].map((item) => (
                <div key={item} className="rounded-lg bg-white p-4 font-semibold text-slate-800">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg bg-blue-600 p-5 text-white">
              <p className="text-sm font-semibold text-blue-100">Fast path</p>
              <p className="mt-2 text-2xl font-bold">Choose a grade and start practicing.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Select Your Grade</h2>
            <p className="mt-2 text-slate-600">Browse subjects and papers by school level.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {catalog.grades.map((grade) => (
            <GradeCard key={grade.id} title={grade.name} href={pathForGrade(grade)} description="View available subjects and papers." />
          ))}
        </div>
      </section>
    </>
  );
}
