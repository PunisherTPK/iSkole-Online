import Link from "next/link";
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { isAdminAuthenticated, loginAdmin } from "@/lib/admin-actions";
import { getAdminRole, getAdminTeacherEmail } from "@/lib/admin-session";
import { getCatalog, pathForSubject } from "@/lib/data";
import { getSupabaseAdminClient } from "@/lib/supabase";

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
      <div className="grid gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Content Overview</h1>
          <p className="mt-2 text-slate-600">Manage the content structure as curriculum folders, subject folders, and resources.</p>
        </div>

        {!adminReady ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Supabase admin writes require <code>SUPABASE_SERVICE_ROLE_KEY</code>. Public pages are using sample data.
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Curriculums" value={catalog.curriculums.length} />
          <MetricCard label="Total Levels" value={catalog.levels.length} />
          <MetricCard label="Total Subjects" value={catalog.subjects.length} />
          <MetricCard label="Total Resources" value={catalog.resources.length + catalog.pastPapers.length} />
        </div>

        {role === "teacher" ? (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">My Subjects</h2>
            <div className="mt-4 grid gap-3">
              {catalog.subjects
                .filter((subject) => assignedSubjectIds.includes(subject.id))
                .map((subject) => {
                  const level = catalog.levels.find((item) => item.id === subject.level_id);
                  const curriculum = level ? catalog.curriculums.find((item) => item.id === level.curriculum_id) : undefined;
                  if (!level || !curriculum) return null;
                  return (
                    <Link key={subject.id} className="rounded-lg border border-slate-200 p-4 hover:border-blue-200" href={pathForSubject(curriculum, level, subject)}>
                      <span className="block font-bold text-slate-950">{subject.name}</span>
                      <span className="mt-1 block text-sm text-slate-500">
                        {curriculum.name} &gt; {level.name}
                      </span>
                    </Link>
                  );
                })}
              {!assignedSubjectIds.length ? <p className="text-sm text-slate-600">No assigned subjects found for this teacher profile.</p> : null}
            </div>
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Recent Uploads</h2>
          <div className="mt-4 grid gap-3">
            {recentResources.map((resource) => (
              <div key={resource.id} className="rounded-lg border border-slate-200 p-4">
                <p className="font-bold text-slate-950">{resource.title}</p>
                <p className="mt-1 text-sm text-slate-500">{resource.description || "No description"}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function AdminLogin({ error }: { error?: string }) {
  return (
    <section className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-blue-600">Admin</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">Sign in</h1>
        <form action={loginAdmin} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Password
            <input
              name="password"
              type="password"
              className="min-h-11 rounded-lg border border-slate-300 px-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              required
            />
          </label>
          {error ? <p className="text-sm font-semibold text-red-600">Invalid password.</p> : null}
          <button className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white" type="submit">
            Sign in
          </button>
        </form>
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
    </div>
  );
}
