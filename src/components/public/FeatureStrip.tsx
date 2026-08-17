import {
  BookOpenCheck,
  GraduationCap,
  Layers3,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: BookOpenCheck,
    title: "Quality Practice",
    description: "Practice with carefully organized questions and learning material.",
  },
  {
    icon: GraduationCap,
    title: "Expert Mentors",
    description: "Learn from teachers who know their subjects and understand students.",
  },
  {
    icon: Layers3,
    title: "Structured Learning",
    description: "Find content through a clear curriculum, level, subject, and topic structure.",
  },
  {
    icon: Sparkles,
    title: "Learn Your Way",
    description: "Study, practice, and track your progress from one simple platform.",
  },
];

export default function FeatureStrip() {
  return (
    <section className="border-b border-border bg-card">
      <div className="container-site py-8 sm:py-10">
        <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group flex gap-4 px-0 py-5 first:pt-0 sm:px-6 sm:py-3 first:sm:pl-0 lg:py-2 lg:first:pl-0"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-200 group-hover:-translate-y-0.5">
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {feature.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}