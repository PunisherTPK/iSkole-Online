import Link from "next/link";

function Logo() {
  return (
    <Link
      href="/"
      aria-label="iSkole home"
      className="group inline-flex items-center gap-2"
    >
      <span className="text-2xl font-extrabold tracking-tight text-primary">
        iSkole
      </span>
    </Link>
  );
}

const links = [
  { label: "Home", href: "/" },
  { label: "Question Bank", href: "/question-bank" },
  { label: "Mentors", href: "/mentors" },
  { label: "Pricing", href: "/pricing" },
  { label: "About Us", href: "/about" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-white/90 backdrop-blur-xl">
      <div className="container-site">
        <div className="flex h-[72px] items-center justify-between">
          <Logo />

          {/* Desktop navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-7 lg:flex"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-2 text-sm font-semibold transition-colors duration-150 ${
                  link.href === "/"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}

                {link.href === "/" && (
                  <span className="absolute inset-x-0 -bottom-[17px] mx-auto h-0.5 w-8 rounded-full bg-primary" />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2.5 sm:flex">
            <Link
              href="/login"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-white px-4 text-sm font-bold text-foreground transition hover:border-primary/30 hover:bg-primary-light hover:text-primary"
            >
              Login
            </Link>

            <Link href="/register" className="button-primary min-h-10 px-5">
              Get Started
            </Link>
          </div>

          {/* Mobile navigation */}
          <details className="relative sm:hidden">
            <summary
              aria-label="Open navigation menu"
              className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-border bg-white text-foreground [&::-webkit-details-marker]:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </summary>

            <div className="absolute right-0 top-12 w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-border bg-white p-2 shadow-xl shadow-black/10">
              <nav aria-label="Mobile navigation" className="space-y-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-xl px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-primary-light hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="my-2 border-t border-border" />

                <Link
                  href="/login"
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="block rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-primary-dark"
                >
                  Get Started
                </Link>
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}