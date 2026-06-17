import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Image src="/iskole-logo.png" alt="" width={32} height={32} className="h-8 w-auto opacity-80" aria-hidden="true" />
          <p>&copy; {new Date().getFullYear()} iSkole Online. Built for Sri Lankan learners.</p>
        </div>
        <div className="flex items-center gap-6">
          <Link className="transition-colors hover:text-primary" href="/sitemap.xml">
            Sitemap
          </Link>
          <Link className="transition-colors hover:text-primary" href="/robots.txt">
            Robots
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
