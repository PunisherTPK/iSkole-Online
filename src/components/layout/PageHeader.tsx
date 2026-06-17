import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
};

export function PageHeader({ eyebrow, title, description, children, className }: PageHeaderProps) {
  return (
    <section className={cn("border-b border-border bg-card/50 backdrop-blur-sm", className)}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-14">
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
        ) : null}
        <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[36px]">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{description}</p>
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </section>
  );
}
