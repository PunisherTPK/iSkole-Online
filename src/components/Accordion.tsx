import type { ReactNode } from "react";

type AccordionProps = {
  title: string;
  children: ReactNode;
};

export function Accordion({ title, children }: AccordionProps) {
  return (
    <details className="group rounded-lg border border-slate-200 bg-slate-50">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-semibold text-slate-900">
        {title}
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-blue-600 transition group-open:rotate-45">+</span>
      </summary>
      <div className="border-t border-slate-200 px-4 py-4 text-sm leading-6 text-slate-700">{children}</div>
    </details>
  );
}
