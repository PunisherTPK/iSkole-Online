import Link from "next/link";
import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatsCard } from "@/components/ui/custom/StatsCard";
import { FadeIn } from "@/components/ui/custom/FadeIn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdminAuthenticated, loginAdmin } from "@/lib/admin-actions";
import { getAdminRole, getAdminTeacherEmail } from "@/lib/admin-session";
import { getCatalog, pathForSubject } from "@/lib/data";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { BookOpen, FileText, FolderTree, GraduationCap, Plus, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminPage({ searchParams }: Props) {
  const { error } = await searchParams;

  if (!(await isAdminAuthenticated())) {
    return <AdminLogin error={error} />;
  }

  const catalog = await getCatalog();
  const role = getAdminRole();
  const teacherEmail = getAdminTeacherEmail();
  const adminReady = Boolean(getSupabaseAdminClient());
  const recentResources = [...catalog.resources].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, 5);
  const assignedTeacher = catalog.teachers.find((teacher) => teacher.email === teacherEmail);
  const assignedSubjectIds = assignedTeacher
    ? catalog.teacherAssignments.filter((item) => item.teacher_id === assignedTeacher.id).map((item) => item.subject_id)
    : [];

  return (
    <AdminShell>
      <div className="grid gap-8">
        <AdminPageHeader
          title="Content Overview"
          description="Manage the content structure as curriculum folders, subject folders, and resources."
          eyebrow="Dashboard"
        />

        {!adminReady ? (
          <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm leading-6 text-amber-900 dark:text-amber-200">
            Supabase admin writes require <code className="rounded bg-amber-500/10 px-1">SUPABASE_SERVICE_ROLE_KEY</code>. Public pages are using sample data.
          </div>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <FadeIn><StatsCard label="Total Curriculums" value={catalog.curriculums.length} icon={BookOpen} /></FadeIn>
          <FadeIn delay={0.05}><StatsCard label="Total Levels" value={catalog.levels.length} icon={FolderTree} /></FadeIn>
          <FadeIn delay={0.1}><StatsCard label="Total Subjects" value={catalog.subjects.length} icon={GraduationCap} /></FadeIn>
          <FadeIn delay={0.15}><StatsCard label="Total Resources" value={catalog.resources.length + catalog.pastPapers.length} icon={FileText} /></FadeIn>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <FadeIn delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Upload className="h-5 w-5 text-primary" aria-hidden="true" />
                  Recent Uploads
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {recentResources.length ? (
                  recentResources.map((resource) => (
                    <div key={resource.id} className="rounded-xl border border-border bg-muted/5 p-4 transition-colors hover:border-primary/20">
                      <p className="font-semibold text-foreground">{resource.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{resource.description || "No description"}</p>
                      {resource.created_at ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Date(resource.created_at).toLocaleDateString()}
                        </p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No resources uploaded yet.</p>
                )}
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.25}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="h-5 w-5 text-primary" aria-hidden="true" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                {[
                  { label: "Add Resource", href: "/admin/resources" },
                  { label: "Upload Past Paper", href: "/admin/past-papers" },
                  { label: "Manage Curriculums", href: "/admin/curriculums" },
                  { label: "Manage Subjects", href: "/admin/subjects" },
                ]
                  .filter((action) => role === "super_admin" || !action.href.includes("curriculums") && !action.href.includes("subjects"))
                  .map((action) => (
                    <Button key={action.href} variant="outline" asChild className="h-11 justify-start rounded-xl">
                      <Link href={action.href}>{action.label}</Link>
                    </Button>
                  ))}
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {role === "teacher" ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">My Subjects</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {catalog.subjects
                .filter((subject) => assignedSubjectIds.includes(subject.id))
                .map((subject) => {
                  const level = catalog.levels.find((item) => item.id === subject.level_id);
                  const curriculum = level ? catalog.curriculums.find((item) => item.id === level.curriculum_id) : undefined;
                  if (!level || !curriculum) return null;
                  return (
                    <Link
                      key={subject.id}
                      className="rounded-xl border border-border p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-brand"
                      href={pathForSubject(curriculum, level, subject)}
                    >
                      <span className="block font-semibold text-foreground">{subject.name}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {curriculum.name} &gt; {level.name}
                      </span>
                    </Link>
                  );
                })}
              {!assignedSubjectIds.length ? (
                <p className="text-sm text-muted-foreground">No assigned subjects found for this teacher profile.</p>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AdminShell>
  );
}

function AdminLogin({ error }: { error?: string }) {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16 sm:px-6">
      <div className="w-full rounded-3xl border border-border bg-card p-8 shadow-brand-lg">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Admin</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter your admin password to access the dashboard.</p>
        <form action={loginAdmin} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-foreground">
            Password
            <Input name="password" type="password" required className="h-11 rounded-xl" />
          </label>
          {error ? <p className="text-sm font-semibold text-destructive">Invalid password.</p> : null}
          <Button type="submit" className="h-11 rounded-xl">
            Sign in
          </Button>
        </form>
      </div>
    </section>
  );
}
