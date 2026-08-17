import Navbar from "@/components/public/Navbar";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        <section className="container-site flex min-h-[calc(100vh-72px)] items-center py-20">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-primary">
              Online Learning Platform
            </p>

            <h1 className="font-heading text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              Learn. Practice.{" "}
              <span className="text-gradient">Succeed.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Learn from expert mentors, practice with quality questions, and
              build the confidence to achieve your academic goals.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/question-bank" className="button-primary">
                Explore Question Bank
              </Link>

              <Link href="/register" className="button-secondary">
                Get Started
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}