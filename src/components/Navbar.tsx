import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="iSkole Online home">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 font-bold text-white">iS</span>
          <span>
            <span className="block text-lg font-bold text-slate-900">iSkole Online</span>
            <span className="block text-xs text-slate-500">Learn Every Lesson, One Question at a Time</span>
          </span>
        </Link>
        <nav className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar compact />
          <Link className="text-sm font-semibold text-slate-600 transition hover:text-blue-600" href="/admin">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
