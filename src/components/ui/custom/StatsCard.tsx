import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatsCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  className?: string;
};

export function StatsCard({ label, value, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card p-6 shadow-brand",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          {trend ? <p className="mt-1 text-xs text-muted-foreground">{trend}</p> : null}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-brand">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
