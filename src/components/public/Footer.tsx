import Link from "next/link";

const platformLinks = [
  { label: "Question Bank", href: "/question-bank" },
  { label: "Mentors", href: "/mentors" },
  { label: "Pricing", href: "/pricing" },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container-site">
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="text-2xl font-extrabold tracking-tight text-primary"
            >
              iSkole
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
              A modern learning platform helping students learn, practice, and
              grow with confidence.
            </p>

            <div className="mt-5 flex items-center gap-2">
                <a
                    href="#"
                    aria-label="Instagram"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-xs font-bold text-muted-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                >
                    IG
                </a>

                <a
                    href="#"
                    aria-label="YouTube"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-xs font-bold text-muted-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                >
                    YT
                </a>

                <a
                    href="mailto:hello@iskole.online"
                    aria-label="Email iSkole"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-xs font-bold text-muted-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                >
                    @
                </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-bold text-foreground">Platform</h3>

            <ul className="mt-4 space-y-3">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-bold text-foreground">Company</h3>

            <ul className="mt-4 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold text-foreground">Legal</h3>

            <ul className="mt-4 space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} iSkole. All rights reserved.</p>

          <p>Learn. Practice. Succeed.</p>
        </div>
      </div>
    </footer>
  );
}