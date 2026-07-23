import Link from "next/link";
import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatsCard } from "@/components/ui/custom/StatsCard";
import { FadeIn } from "@/components/ui/custom/FadeIn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminRole } from "@/lib/admin-session";
import { getCatalog } from "@/lib/data";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { BookOpen, CirclePlay, FileQuestion, FolderTree, GraduationCap, Plus, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const catalog = await getCatalog();
  const role = getAdminRole();
  const adminReady = Boolean(getSupabaseAdminClient());
  const recentQuestionTypes = [...catalog.questionTypes].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, 5);

  return (
    <AdminShell>
      <div className="grid gap-8">
        <AdminPageHeader title={role === "teacher" ? "Teacher Dashboard" : "Admin Dashboard"} description="Manage the v2 learning hierarchy, topical MCQs, discussion videos, teachers, and students." eyebrow="Dashboard" />

        {!adminReady ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm leading-6 text-amber-900 dark:text-amber-200">
            Supabase admin writes require <code className="rounded bg-amber-500/10 px-1">SUPABASE_SERVICE_ROLE_KEY</code>. Public pages are using sample data.
          </div>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <FadeIn><StatsCard label="Curriculums" value={catalog.curriculums.length} icon={BookOpen} /></FadeIn>
          <FadeIn delay={0.05}><StatsCard label="Subjects" value={catalog.subjects.length} icon={GraduationCap} /></FadeIn>
          <FadeIn delay={0.1}><StatsCard label="Sub Topics" value={catalog.subTopics.length} icon={FolderTree} /></FadeIn>
          <FadeIn delay={0.15}><StatsCard label="Questions" value={catalog.questions.length} icon={FileQuestion} /></FadeIn>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <FadeIn delay={0.2}>
            <Card>
              <CardHeader><CardTitle className="text-lg">Recent Question Types</CardTitle></CardHeader>
              <CardContent className="grid gap-3">
                {recentQuestionTypes.map((set) => (
                  <div key={set.id} className="rounded-xl border border-border bg-muted/5 p-4">
                    <p className="font-semibold text-foreground">{set.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{set.description || "No description"}</p>
                  </div>
                ))}
                {!recentQuestionTypes.length ? <p className="text-sm text-muted-foreground">No question types uploaded yet.</p> : null}
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.25}>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Plus className="h-5 w-5 text-primary" /> Quick Actions</CardTitle></CardHeader>
              <CardContent className="grid gap-2">
                {[
                  { label: "Manage Teachers", href: "/admin/teachers", icon: Users },
                  { label: "Content Manager", href: "/admin/content-manager", icon: FileQuestion },
                  { label: "Manage Videos", href: "/admin/content-manager", icon: CirclePlay },
                  { label: "Manage Subjects", href: "/admin/subjects", icon: GraduationCap },
                ].filter((action) => role === "admin" || !action.href.includes("subjects")).map((action) => (
                  <Button key={action.href} variant="outline" asChild className="h-11 justify-start rounded-xl">
                    <Link href={action.href}>{action.label}</Link>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </AdminShell>
  );
}
