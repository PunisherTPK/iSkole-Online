import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Search,
  UserRound,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Find what you need",
    description:
      "Explore subjects, topics, questions, and learning resources organized around your curriculum.",
  },
  {
    number: "02",
    icon: UserRound,
    title: "Learn with guidance",
    description:
      "Discover experienced mentors and learn from content created around the needs of students.",
  },
  {
    number: "03",
    icon: BookOpen,
    title: "Practice and improve",
    description:
      "Practice questions, check your answers, and build confidence through consistent learning.",
  },
];

export default function HowItWorks() {
  return (
    <section className="section-padding bg-background">
      <div className="container-site">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Simple by design
          </span>

          <h2 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Everything you need to{" "}
            <span className="text-gradient">learn better.</span>
          </h2>

          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
            iSkole brings learning, practice, and expert guidance together in
            one straightforward experience.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-14">
          {/* Connector */}
          <div
            aria-hidden="true"
            className="absolute left-[16.66%] right-[16.66%] top-12 hidden border-t border-dashed border-primary/20 lg:block"
          />

          <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.number}
                  className="relative text-center"
                >
                  <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-primary/15 bg-card shadow-sm">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                      <Icon className="h-6 w-6" />
                    </div>

                    <span className="absolute -right-2 -top-2 flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-card bg-foreground px-1.5 text-[10px] font-extrabold text-white">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-extrabold text-foreground">
                    {step.title}
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>

        {/* Bottom callout */}
        <div className="mt-14 flex flex-col items-center justify-between gap-5 rounded-2xl border border-primary/10 bg-primary/[0.035] p-5 sm:flex-row sm:p-6">
          <div>
            <p className="text-sm font-bold text-foreground">
              Ready to start learning?
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Explore the question bank and find your next topic.
            </p>
          </div>

          <a
            href="/question-bank"
            className="button-primary h-11 min-w-[150px]"
          >
            Start Exploring
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}