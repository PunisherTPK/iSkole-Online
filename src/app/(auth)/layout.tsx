import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container-site flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-xl font-extrabold tracking-tight text-primary"
          >
            iSkole
          </Link>

          <Link
            href="/"
            className="text-sm font-semibold text-muted-foreground transition hover:text-foreground"
          >
            Back to website
          </Link>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}