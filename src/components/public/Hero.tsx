import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Play,
  Sparkles,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[-8rem] top-[-8rem] h-[28rem] w-[28rem] rounded-full bg-violet-300/15 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-purple-200/20 blur-3xl" />
      </div>

      <div className="container-site relative">
        <div className="grid min-h-[calc(100vh-72px)] items-center gap-14 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:py-20">
          {/* Copy */}
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3.5 py-2 text-xs font-bold tracking-wide text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              ONLINE LEARNING PLATFORM
            </div>

            <h1 className="font-heading text-5xl font-extrabold leading-[1.04] tracking-[-0.045em] text-foreground sm:text-6xl lg:text-[4.5rem]">
              Learn.
              <br />
              Practice.
              <br />
              <span className="text-gradient">Succeed.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Learn from expert mentors, practice with quality questions, and
              build the confidence to achieve your academic goals.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/question-bank"
                className="button-primary h-11 min-w-[180px]"
              >
                Explore Question Bank
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/mentors"
                className="button-secondary h-11 min-w-[180px]"
              >
                Meet Our Mentors
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Quality learning content
              </span>

              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Expert mentors
              </span>
            </div>
          </div>

          {/* Visual */}
          <div className="relative mx-auto w-full max-w-[560px] lg:ml-auto">
            <div
              aria-hidden="true"
              className="absolute inset-8 rounded-[2rem] bg-primary/10 blur-3xl"
            />

            <div className="relative rounded-[2rem] border border-border bg-card p-3 shadow-soft sm:p-4">
              {/* Browser-style header */}
              <div className="flex items-center justify-between border-b border-border px-3 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
                </div>

                <div className="rounded-full bg-muted px-4 py-1 text-[10px] font-medium text-muted-foreground">
                  iskole.online
                </div>

                <div className="w-10" />
              </div>

              <div className="grid gap-4 p-3 sm:grid-cols-[0.72fr_1.28fr] sm:p-5">
                {/* Mini sidebar */}
                <div className="hidden rounded-2xl bg-muted/60 p-3 sm:block">
                  <div className="mb-5 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                      <GraduationCap className="h-4 w-4" />
                    </div>

                    <span className="text-xs font-extrabold text-foreground">
                      iSkole
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="rounded-lg bg-primary px-3 py-2 text-[10px] font-semibold text-white">
                      Dashboard
                    </div>

                    <div className="rounded-lg px-3 py-2 text-[10px] font-medium text-muted-foreground">
                      My Learning
                    </div>

                    <div className="rounded-lg px-3 py-2 text-[10px] font-medium text-muted-foreground">
                      Practice
                    </div>

                    <div className="rounded-lg px-3 py-2 text-[10px] font-medium text-muted-foreground">
                      Mentors
                    </div>
                  </div>
                </div>

                {/* Dashboard preview */}
                <div>
                  <div className="mb-4">
                    <p className="text-[10px] font-medium text-muted-foreground">
                      Good morning
                    </p>

                    <h2 className="mt-1 text-base font-extrabold tracking-tight text-foreground">
                      Ready to keep learning?
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-xl border border-border bg-background p-3">
                      <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <BookOpen className="h-3.5 w-3.5" />
                      </div>

                      <p className="text-[9px] text-muted-foreground">
                        Questions
                      </p>

                      <p className="mt-0.5 text-sm font-extrabold text-foreground">
                        Practice
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-background p-3">
                      <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                        <GraduationCap className="h-3.5 w-3.5" />
                      </div>

                      <p className="text-[9px] text-muted-foreground">
                        Learning
                      </p>

                      <p className="mt-0.5 text-sm font-extrabold text-foreground">
                        Continue
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border border-border bg-background p-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-medium text-muted-foreground">
                          Continue learning
                        </p>

                        <p className="mt-1 text-xs font-bold text-foreground">
                          Computer Fundamentals
                        </p>
                      </div>

                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                        <Play className="ml-0.5 h-3 w-3 fill-current" />
                      </div>
                    </div>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-[68%] rounded-full bg-primary" />
                    </div>

                    <p className="mt-1.5 text-[9px] font-medium text-muted-foreground">
                      68% complete
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-primary/5 p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>

                    <div>
                      <p className="text-[9px] font-bold text-foreground">
                        Learn with confidence
                      </p>

                      <p className="mt-0.5 text-[8px] text-muted-foreground">
                        Quality content. Expert guidance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating mentor card */}
            <div className="absolute -bottom-5 -left-3 hidden rounded-2xl border border-border bg-card p-3 shadow-soft sm:block lg:-left-8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <GraduationCap className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-[10px] font-bold text-foreground">
                    Expert mentors
                  </p>

                  <p className="text-[9px] text-muted-foreground">
                    Learn from the best
                  </p>
                </div>
              </div>
            </div>

            {/* Floating question card */}
            <div className="absolute -right-2 -top-5 hidden rounded-2xl border border-border bg-card p-3 shadow-soft sm:block lg:-right-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-[10px] font-bold text-foreground">
                    Practice smarter
                  </p>

                  <p className="text-[9px] text-muted-foreground">
                    Track your progress
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}