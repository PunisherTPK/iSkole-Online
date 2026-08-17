import Link from "next/link";
import {
  ArrowRight,
  Atom,
  Calculator,
  Code2,
  FlaskConical,
  Globe2,
  Languages,
  Monitor,
  Sigma,
} from "lucide-react";

const subjects = [
  {
    name: "Physics",
    description: "Understand concepts and sharpen problem-solving skills.",
    icon: Atom,
  },
  {
    name: "Mathematics",
    description: "Build confidence through structured practice.",
    icon: Calculator,
  },
  {
    name: "ICT",
    description: "Learn computing concepts, programming, and technology.",
    icon: Monitor,
  },
  {
    name: "Chemistry",
    description: "Master theory through focused learning and practice.",
    icon: FlaskConical,
  },
  {
    name: "Combined Mathematics",
    description: "Develop analytical and mathematical thinking.",
    icon: Sigma,
  },
  {
    name: "Languages",
    description: "Strengthen language knowledge and communication.",
    icon: Languages,
  },
];

export default function SubjectsPreview() {
  return (
    <section className="section-padding bg-card">
      <div className="container-site">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Explore learning
            </span>

            <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Find your{" "}
              <span className="text-gradient">subject.</span>
            </h2>

            <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
              Explore learning content organized around the subjects you care
              about.
            </p>
          </div>

          <Link
            href="/question-bank"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary transition hover:gap-3"
          >
            Explore Question Bank
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => {
            const Icon = subject.icon;

            return (
              <Link
                key={subject.name}
                href={`/question-bank?subject=${encodeURIComponent(
                  subject.name,
                )}`}
                className="group rounded-2xl border border-border bg-background p-5 transition duration-200 hover:-translate-y-1 hover:border-primary/20 hover:shadow-soft"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition duration-200 group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>

                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition duration-200 group-hover:translate-x-1 group-hover:text-primary" />
                </div>

                <h3 className="mt-5 text-base font-extrabold text-foreground">
                  {subject.name}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {subject.description}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-dashed border-primary/20 bg-primary/[0.025] p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Globe2 className="h-4 w-4" />
          </div>

          <p className="text-xs leading-5 text-muted-foreground sm:text-sm">
            More subjects and curriculum-specific content will become
            available as our learning library grows.
          </p>
        </div>
      </div>
    </section>
  );
}