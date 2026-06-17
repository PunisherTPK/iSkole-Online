import Link from "next/link";
import type { BreadcrumbItem } from "@/lib/types";

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-2">
          {index > 0 ? <span aria-hidden="true">&gt;</span> : null}
          {item.href ? (
            <Link className="font-medium text-slate-600 hover:text-blue-600" href={item.href}>
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-slate-900">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
