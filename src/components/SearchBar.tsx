type SearchBarProps = {
  compact?: boolean;
  defaultValue?: string;
};

export function SearchBar({ compact = false, defaultValue = "" }: SearchBarProps) {
  return (
    <form action="/search" className={`flex w-full gap-2 ${compact ? "sm:w-80" : "mx-auto max-w-2xl"}`}>
      <label className="sr-only" htmlFor={compact ? "nav-search" : "global-search"}>
        Search past papers and question bank
      </label>
      <input
        id={compact ? "nav-search" : "global-search"}
        name="q"
        defaultValue={defaultValue}
        placeholder="Search grade, subject, lesson, question..."
        className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
      />
      <button
        className="min-h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
        type="submit"
      >
        Search
      </button>
    </form>
  );
}
