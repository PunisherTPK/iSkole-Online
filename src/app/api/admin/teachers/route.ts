import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase server credentials are not configured.");
  }

  return createSupabaseAdminClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function requireAdmin() {
  const sessionClient = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: profile, error } = await sessionClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user };
}

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    const admin = getAdminClient();

    const [{ data: teachers, error: teacherError }, { data: assignments, error: assignmentError }, { data: subjects, error: subjectError }] =
      await Promise.all([
        admin
          .from("profiles")
          .select("id, full_name, avatar_url, is_active, created_at, updated_at")
          .eq("role", "teacher")
          .order("full_name"),
        admin
          .from("teacher_subjects")
          .select("id, teacher_id, subject_id, is_active"),
        admin
          .from("subjects")
          .select("id, level_id, name, code, description, is_active")
          .order("name"),
      ]);

    if (teacherError || assignmentError || subjectError) {
      throw new Error(
        teacherError?.message ?? assignmentError?.message ?? subjectError?.message,
      );
    }

    const teachersWithAvatarUrls = (teachers ?? []).map((teacher) => ({
      ...teacher,
      avatar_url: teacher.avatar_url
        ? `/api/public/avatar/${teacher.id}?v=${encodeURIComponent(teacher.avatar_url)}`
        : null,
    }));

    const levelIds = [...new Set((subjects ?? []).map((subject) => subject.level_id))];
    const { data: levels, error: levelError } = levelIds.length
      ? await admin
          .from("levels")
          .select("id, curriculum_id, name")
          .in("id", levelIds)
      : { data: [], error: null };

    if (levelError) throw new Error(levelError.message);

    const curriculumIds = [...new Set((levels ?? []).map((level) => level.curriculum_id))];
    const { data: curriculums, error: curriculumError } = curriculumIds.length
      ? await admin
          .from("curriculums")
          .select("id, name")
          .in("id", curriculumIds)
      : { data: [], error: null };

    if (curriculumError) throw new Error(curriculumError.message);

    return NextResponse.json({
      teachers: teachersWithAvatarUrls,
      assignments: assignments ?? [],
      subjects: subjects ?? [],
      levels: levels ?? [],
      curriculums: curriculums ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load teachers." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    const body = await request.json();
    const action = body?.action;
    const admin = getAdminClient();

    if (action === "create") {
      const fullName = String(body.fullName ?? "").trim();
      const email = String(body.email ?? "").trim().toLowerCase();
      const password = String(body.password ?? "");

      if (!fullName || !email || password.length < 8) {
        return NextResponse.json(
          { error: "Name, email, and a password of at least 8 characters are required." },
          { status: 400 },
        );
      }

      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (createError || !created.user) {
        return NextResponse.json(
          { error: createError?.message ?? "Unable to create teacher account." },
          { status: 400 },
        );
      }

      const teacherId = created.user.id;
      const { error: profileError } = await admin.from("profiles").upsert({
        id: teacherId,
        full_name: fullName,
        role: "teacher",
        is_active: true,
      });

      if (profileError) {
        await admin.auth.admin.deleteUser(teacherId);
        return NextResponse.json({ error: profileError.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, teacherId });
    }

    if (action === "update") {
      const teacherId = String(body.teacherId ?? "");
      const fullName = String(body.fullName ?? "").trim();
      const isActive = Boolean(body.isActive);

      if (!teacherId || !fullName) {
        return NextResponse.json({ error: "Teacher and name are required." }, { status: 400 });
      }

      const { error } = await admin
        .from("profiles")
        .update({ full_name: fullName, is_active: isActive, updated_at: new Date().toISOString() })
        .eq("id", teacherId)
        .eq("role", "teacher");

      if (error) throw new Error(error.message);

      return NextResponse.json({ success: true });
    }

    if (action === "assign") {
      const teacherId = String(body.teacherId ?? "");
      const subjectIds = Array.isArray(body.subjectIds)
        ? body.subjectIds.map((id: unknown) => String(id)).filter(Boolean)
        : [];

      if (!teacherId) {
        return NextResponse.json({ error: "Teacher is required." }, { status: 400 });
      }

      const { error: deleteError } = await admin
        .from("teacher_subjects")
        .delete()
        .eq("teacher_id", teacherId);

      if (deleteError) throw new Error(deleteError.message);

      if (subjectIds.length > 0) {
        const rows = subjectIds.map((subjectId: string) => ({
          teacher_id: teacherId,
          subject_id: subjectId,
          assigned_by: auth.user.id,
          is_active: true,
        }));

        const { error: insertError } = await admin
          .from("teacher_subjects")
          .insert(rows);

        if (insertError) throw new Error(insertError.message);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update teacher." },
      { status: 500 },
    );
  }
}
