import Link from "next/link";
import {
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";

const benefits = [
  "Access structured learning content",
  "Practice questions and track progress",
  "Learn from expert mentors",
];

export default function SubscriptionCTA() {
  return (
    <section className="section-padding bg-card">
      <div className="container-site">
        <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-10 text-white shadow-brand-lg sm:px-10 sm:py-12 lg:px-14">
          {/* Decorative shapes */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-violet-300/10 blur-3xl"
          />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                START YOUR JOURNEY
              </div>

              <h2 className="mt-5 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
                Ready to take your learning to the next level?
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
                Join iSkole and get access to structured learning, quality
                practice, and expert guidance designed to help you move
                forward with confidence.
              </p>

              <div className="mt-6 space-y-2.5">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-2.5 text-sm text-white/90"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
                      <Check className="h-3 w-3" />
                    </span>

                    {benefit}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/register"
                className="inline-flex h-11 min-w-[170px] items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-primary shadow-lg transition hover:-translate-y-0.5 hover:bg-white/95"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/pricing"
                className="inline-flex h-11 min-w-[170px] items-center justify-center rounded-xl border border-white/25 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/15"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}