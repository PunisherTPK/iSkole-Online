import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminCard({ title, description, children, className }: { title: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function TextInput({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
  required = true,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      {label}
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        type={type}
        className="min-h-11 rounded-xl border border-input bg-background px-4 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        required={required}
      />
    </label>
  );
}

export function Textarea({
  label,
  name,
  defaultValue,
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      {label}
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="min-h-28 rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        required={required}
      />
    </label>
  );
}

export function SelectInput({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: Array<[string, string]>;
  defaultValue?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="min-h-11 rounded-xl border border-input bg-background px-4 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        required
      >
        {options.map(([value, labelText]) => (
          <option key={value} value={value}>
            {labelText}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SubmitButton({ children, tone = "primary" }: { children: ReactNode; tone?: "primary" | "danger" | "secondary" }) {
  const classes = {
    primary: "bg-brand-gradient text-white shadow-brand hover:shadow-brand-lg active:scale-[0.98]",
    danger: "border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 active:scale-[0.98]",
    secondary: "border border-border bg-background text-foreground hover:bg-muted/10 active:scale-[0.98]",
  };

  return (
    <button className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${classes[tone]}`} type="submit">
      {children}
    </button>
  );
}
