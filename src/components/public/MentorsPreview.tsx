import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  GraduationCap,
  Users,
} from "lucide-react";

const mentors = [
  {
    id: "mentor-1",
    name: "Your Mentor",
    role: "Subject Specialist",
    subjects: ["Physics", "Mathematics"],
    description:
      "Experienced educators helping students understand concepts and build confidence.",
  },
  {
    id: "mentor-2",
    name: "Your Mentor",
    role: "Subject Specialist",
    subjects: ["ICT", "Computer Science"],
    description:
      "Learn from educators who turn complex ideas into practical, understandable lessons.",
  },
  {
    id: "mentor-3",
    name: "Your Mentor",
    role: "Subject Specialist",
    subjects: ["Chemistry", "Science"],
    description:
      "Focused guidance and structured learning to help students reach their goals.",
  },
];

export default function MentorsPreview() {
  return (
    <section className="section-padding bg-background">
      <div className="container-site">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Meet our mentors
            </span>

            <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Learn from people who{" "}
              <span className="text-gradient">know the way.</span>
            </h2>

            <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
              Discover the teachers behind iSkole and find mentors who match
              the subjects you want to learn.
            </p>
          </div>

          <Link
            href="/mentors"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary transition hover:gap-3"
          >
            Meet all mentors
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {mentors.map((mentor) => (
            <article
              key={mentor.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition duration-200 hover:-translate-y-1 hover:border-primary/20 hover:shadow-soft"
            >
              {/* Profile visual */}
              <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-violet-100/40">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-primary/10 text-primary shadow-lg">
                  <GraduationCap className="h-10 w-10" />
                </div>

                <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-bold text-foreground shadow-sm backdrop-blur">
                  <Award className="h-3.5 w-3.5 text-primary" />
                  Expert Mentor
                </div>
              </div>

              <div className="p-5">
                <p className="text-xs font-semibold text-primary">
                  {mentor.role}
                </p>

                <h3 className="mt-1 text-lg font-extrabold text-foreground">
                  {mentor.name}
                </h3>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {mentor.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {mentor.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground"
                    >
                      {subject}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-4 border-t border-border pt-4 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    Subject focused
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    Student focused
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-primary/10 bg-primary/[0.035] p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Looking for a specific subject?
            </h3>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Browse the mentor directory and explore each teacher&apos;s
              profile, qualifications, and subjects.
            </p>
          </div>

          <Link
            href="/mentors"
            className="button-secondary mt-4 h-11 min-w-[150px] sm:mt-0"
          >
            Browse Mentors
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}