import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">404</p>
      <h1 className="mt-3 text-3xl font-bold text-foreground">Page not found</h1>
      <p className="mt-4 text-muted-foreground">The paper or lesson you are looking for is not available yet.</p>
      <Button asChild className="mt-8 rounded-xl">
        <Link href="/">Back to Home</Link>
      </Button>
    </section>
  );
}
