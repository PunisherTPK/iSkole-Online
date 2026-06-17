"use client";

import { ArrowRight, BookOpen, GraduationCap, Layers } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type NavCardProps = {
  title: string;
  description?: string;
  href: string;
  meta?: string;
  icon?: "curriculum" | "level" | "subject";
};

const icons = {
  curriculum: BookOpen,
  level: Layers,
  subject: GraduationCap,
};

function NavCard({ title, description, href, meta, icon = "curriculum" }: NavCardProps) {
  const Icon = icons[icon];

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
      <Link
        href={href}
        className="group flex min-h-40 flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-brand transition-all duration-300 hover:border-primary/30 hover:shadow-brand-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-brand">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" />
        </div>
        <div className="mt-5">
          {meta ? <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{meta}</span> : null}
          <span className="block text-lg font-semibold text-foreground group-hover:text-primary">{title}</span>
          {description ? <span className="mt-2 block text-sm leading-6 text-muted-foreground">{description}</span> : null}
        </div>
      </Link>
    </motion.div>
  );
}

export function CurriculumCard(props: Omit<NavCardProps, "icon">) {
  return <NavCard {...props} icon="curriculum" />;
}

export function LevelCard(props: Omit<NavCardProps, "icon">) {
  return <NavCard {...props} icon="level" />;
}

export function SubjectCard(props: Omit<NavCardProps, "icon">) {
  return <NavCard {...props} icon="subject" />;
}

/** @deprecated Use CurriculumCard instead */
export function GradeCard(props: Omit<NavCardProps, "icon">) {
  return <CurriculumCard {...props} />;
}

/** @deprecated Use SubjectCard instead */
export function LessonCard(props: Omit<NavCardProps, "icon">) {
  return <SubjectCard {...props} />;
}

export function FeaturedCurriculumCard({
  name,
  levelCount,
  href,
  className,
}: {
  name: string;
  levelCount: number;
  href: string;
  className?: string;
}) {
  return (
    <motion.div
      className={cn("relative overflow-hidden rounded-3xl border border-white/20 p-6 shadow-brand-lg", className)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-brand-accent/10 to-transparent dark:from-brand-primary/30 dark:via-brand-accent/20" />
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-accent/20 blur-2xl" />
      <div className="relative glass rounded-2xl p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-brand">
          <BookOpen className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-primary">Featured Curriculum</p>
        <h3 className="mt-2 text-2xl font-bold text-foreground">{name}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{levelCount} level groups available</p>
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          Explore curriculum
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
}
