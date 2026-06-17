import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, actionLabel, actionHref, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/5 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-brand">
        <Icon className="h-8 w-8" aria-hidden="true" />
      </div>
      <h3 className="mt-6 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ?? (actionLabel && actionHref ? (
        <Button asChild className="mt-6">
          <a href={actionHref}>{actionLabel}</a>
        </Button>
      ) : null)}
    </div>
  );
}
