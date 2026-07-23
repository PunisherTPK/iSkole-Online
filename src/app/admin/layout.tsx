import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isAdminAuthenticated, loginAdmin } from "@/lib/admin-actions";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!(await isAdminAuthenticated())) return <AdminLogin />;
  return children;
}

function AdminLogin() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16 sm:px-6">
      <div className="w-full rounded-2xl border border-border bg-card p-8 shadow-brand-lg">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Login</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">Use your dashboard credentials to continue.</p>
        <form action={loginAdmin} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-foreground">
            Email
            <Input name="email" type="email" className="h-11 rounded-xl" placeholder="teacher@example.com" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-foreground">
            Password
            <Input name="password" type="password" required className="h-11 rounded-xl" />
          </label>
          <Button type="submit" className="h-11 rounded-xl">Sign in</Button>
        </form>
      </div>
    </section>
  );
}
