import type { ReactNode } from "react";

export function AdminCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {children}
    </section>
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
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        type={type}
        className="min-h-11 rounded-lg border border-slate-300 px-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
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
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="min-h-28 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
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
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
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
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    danger: "border border-red-200 bg-red-50 text-red-700",
    secondary: "border border-slate-300 bg-white text-slate-700",
  };

  return (
    <button className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${classes[tone]}`} type="submit">
      {children}
    </button>
  );
}
