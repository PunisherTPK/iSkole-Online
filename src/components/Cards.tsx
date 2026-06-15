import Link from "next/link";

type CardProps = {
  title: string;
  description?: string;
  href: string;
  meta?: string;
};

export function GradeCard(props: CardProps) {
  return <BaseCard {...props} accent="bg-blue-600" />;
}

export function SubjectCard(props: CardProps) {
  return <BaseCard {...props} accent="bg-cyan-600" />;
}

export function LessonCard(props: CardProps) {
  return <BaseCard {...props} accent="bg-emerald-600" />;
}

function BaseCard({ title, description, href, meta, accent }: CardProps & { accent: string }) {
  return (
    <Link
      href={href}
      className="group flex min-h-36 flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-soft"
    >
      <span className={`mb-5 h-2 w-14 rounded-full ${accent}`} />
      <span>
        {meta ? <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">{meta}</span> : null}
        <span className="block text-xl font-bold text-slate-900 group-hover:text-blue-600">{title}</span>
        {description ? <span className="mt-3 block text-sm leading-6 text-slate-600">{description}</span> : null}
      </span>
    </Link>
  );
}
