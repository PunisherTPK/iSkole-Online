import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Heart,
  Lightbulb,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.08] via-background to-background" />

          <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-24">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20">
                <Sparkles className="h-6 w-6" />
              </div>

              <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
                About iSkole
              </p>

              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Learning should be
                <span className="block text-primary">
                  simple, focused and accessible.
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                iSkole is an online learning platform built to make
                practising, revising and improving easier for students
                while giving teachers a better way to share their
                knowledge.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/question-bank"
                  className="button-primary inline-flex items-center justify-center gap-2"
                >
                  Explore Question Bank
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/mentors"
                  className="button-secondary inline-flex items-center justify-center gap-2"
                >
                  Meet our teachers
                  <Users className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* INTRO */}
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
                Why iSkole exists
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Built around the way students actually learn.
              </h2>

              <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">
                Finding good learning material should not mean jumping
                between countless websites, folders and documents.
                iSkole brings structured learning content and
                question-based practice together in one place.
              </p>

              <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                Whether you are revising a difficult topic, preparing
                for an examination or simply trying to practise more,
                iSkole is designed to keep the experience focused on
                learning.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FeatureCard
                icon={<BookOpen className="h-5 w-5" />}
                title="Structured learning"
                text="Find content naturally through curriculum, level, subject and topic."
              />

              <FeatureCard
                icon={<Target className="h-5 w-5" />}
                title="Focused practice"
                text="Practise questions without unnecessary distractions."
              />

              <FeatureCard
                icon={<GraduationCap className="h-5 w-5" />}
                title="Teacher-led"
                text="Learn from teachers who understand the subjects they teach."
              />

              <FeatureCard
                icon={<Heart className="h-5 w-5" />}
                title="Made for students"
                text="A clean experience designed around real student needs."
              />
            </div>
          </div>
        </section>

        {/* MISSION */}
        <section className="border-y border-border bg-primary/[0.035]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Lightbulb className="h-5 w-5" />
              </div>

              <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
                Our mission
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Make better learning easier to access.
              </h2>

              <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">
                We believe students should spend less time searching
                for resources and more time actually learning. iSkole
                aims to provide a reliable, organised and enjoyable
                environment where students can practise consistently
                and teachers can contribute meaningful educational
                content.
              </p>
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
              What matters to us
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Simple principles behind iSkole.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <ValueCard
              number="01"
              title="Clarity"
              text="Learning resources should be easy to find, understand and use."
            />

            <ValueCard
              number="02"
              title="Quality"
              text="Useful educational content matters more than filling a platform with noise."
            />

            <ValueCard
              number="03"
              title="Progress"
              text="Every practice session should help students move forward."
            />
          </div>
        </section>

        {/* TEACHERS */}
        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-20">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
              <div className="p-7 sm:p-10">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>

                <h2 className="mt-6 text-2xl font-black tracking-tight sm:text-3xl">
                  Learning is better with the right teachers.
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                  iSkole connects students with teachers and mentors
                  who can help make difficult subjects easier to
                  understand. Teachers can share structured learning
                  material and question-based practice with their
                  students.
                </p>

                <Link
                  href="/mentors"
                  className="button-secondary mt-7 inline-flex items-center gap-2"
                >
                  Explore mentors
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="border-t border-border bg-muted/30 p-7 lg:border-l lg:border-t-0 sm:p-10">
                <p className="text-sm font-bold">
                  The iSkole approach
                </p>

                <div className="mt-5 space-y-4">
                  <CheckItem text="Structured subject content" />
                  <CheckItem text="Teacher-created questions" />
                  <CheckItem text="Focused examination practice" />
                  <CheckItem text="A clean learning experience" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-5 py-16 text-center sm:px-8 sm:py-20">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
              Start learning
            </p>

            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
              Ready to make your next study session count?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
              Explore the Question Bank, find your subject and start
              practising.
            </p>

            <Link
              href="/question-bank"
              className="button-primary mt-7 inline-flex items-center gap-2"
            >
              Start practising
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="group rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.05]">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105">
        {icon}
      </div>

      <h3 className="mt-4 font-bold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {text}
      </p>
    </article>
  );
}

function ValueCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-6">
      <span className="text-xs font-black tracking-[0.15em] text-primary">
        {number}
      </span>

      <h3 className="mt-5 text-xl font-extrabold">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {text}
      </p>
    </article>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
        <CheckCircle2 className="h-4 w-4" />
      </div>

      <span className="text-sm font-semibold">{text}</span>
    </div>
  );
}