import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 sm:px-6 md:flex-row md:items-center md:justify-between">
        <p>&copy; {new Date().getFullYear()} iSkole Online. Built for Sri Lankan learners.</p>
        <div className="flex gap-4">
          <Link className="hover:text-blue-600" href="/sitemap.xml">
            Sitemap
          </Link>
          <Link className="hover:text-blue-600" href="/robots.txt">
            Robots
          </Link>
        </div>
      </div>
    </footer>
  );
}
