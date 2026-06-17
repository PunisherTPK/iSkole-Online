"use server";

import { createHmac, timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/slug";
import { getSupabaseAdminClient } from "@/lib/supabase";

const AUTH_COOKIE = "iskole_admin";

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  const expected = adminToken();

  if (!token || !expected || token.length !== expected.length) return false;

  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export async function loginAdmin(formData: FormData) {
  const password = value(formData, "password");

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    redirect("/admin?error=invalid-password");
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, adminToken()!, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect("/admin");
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  redirect("/admin");
}

export async function createCurriculum(formData: FormData) {
  const name = value(formData, "name");
  await insert("curriculums", { name, slug: slugify(name), display_order: numberValue(formData, "display_order") });
}

export async function updateCurriculum(formData: FormData) {
  const name = value(formData, "name");
  await update("curriculums", value(formData, "id"), { name, slug: slugify(name), display_order: numberValue(formData, "display_order") });
}

export async function deleteCurriculum(formData: FormData) {
  await softDelete("curriculums", value(formData, "id"));
}

export async function reorderCurriculums(formData: FormData) {
  await reorder("curriculums", value(formData, "ordered_ids"));
}

export async function createLevel(formData: FormData) {
  const name = value(formData, "name");
  await insert("levels", {
    curriculum_id: value(formData, "curriculum_id"),
    name,
    slug: slugify(name),
    display_order: numberValue(formData, "display_order"),
  });
}

export async function updateLevel(formData: FormData) {
  const name = value(formData, "name");
  await update("levels", value(formData, "id"), {
    curriculum_id: value(formData, "curriculum_id"),
    name,
    slug: slugify(name),
    display_order: numberValue(formData, "display_order"),
  });
}

export async function deleteLevel(formData: FormData) {
  await softDelete("levels", value(formData, "id"));
}

export async function reorderLevels(formData: FormData) {
  await reorder("levels", value(formData, "ordered_ids"));
}

export async function createSubject(formData: FormData) {
  const name = value(formData, "name");
  await insert("subjects", {
    level_id: value(formData, "level_id"),
    name,
    slug: slugify(name),
    display_order: numberValue(formData, "display_order"),
  });
}

export async function updateSubject(formData: FormData) {
  const name = value(formData, "name");
  await update("subjects", value(formData, "id"), {
    level_id: value(formData, "level_id"),
    name,
    slug: slugify(name),
    display_order: numberValue(formData, "display_order"),
  });
}

export async function deleteSubject(formData: FormData) {
  await softDelete("subjects", value(formData, "id"));
}

export async function reorderSubjects(formData: FormData) {
  await reorder("subjects", value(formData, "ordered_ids"));
}

export async function createResource(formData: FormData) {
  await insert("resources", resourcePayload(formData));
}

export async function updateResource(formData: FormData) {
  await update("resources", value(formData, "id"), resourcePayload(formData));
}

export async function deleteResource(formData: FormData) {
  await softDelete("resources", value(formData, "id"));
}

export async function reorderResources(formData: FormData) {
  await reorder("resources", value(formData, "ordered_ids"));
}

export async function createPastPaper(formData: FormData) {
  await insert("past_papers", pastPaperPayload(formData));
}

export async function updatePastPaper(formData: FormData) {
  await update("past_papers", value(formData, "id"), pastPaperPayload(formData));
}

export async function deletePastPaper(formData: FormData) {
  await softDelete("past_papers", value(formData, "id"));
}

export async function reorderPastPapers(formData: FormData) {
  await reorder("past_papers", value(formData, "ordered_ids"));
}

export async function createTeacher(formData: FormData) {
  await insert("teachers", {
    name: value(formData, "name"),
    email: value(formData, "email"),
    role: value(formData, "role"),
  });
}

export async function updateTeacher(formData: FormData) {
  await update("teachers", value(formData, "id"), {
    name: value(formData, "name"),
    email: value(formData, "email"),
    role: value(formData, "role"),
  });
}

export async function deleteTeacher(formData: FormData) {
  await softDelete("teachers", value(formData, "id"));
}

export async function assignTeacherSubject(formData: FormData) {
  await insert("teacher_assignments", {
    teacher_id: value(formData, "teacher_id"),
    subject_id: value(formData, "subject_id"),
  });
}

export async function deleteTeacherAssignment(formData: FormData) {
  await hardDelete("teacher_assignments", value(formData, "id"));
}

async function insert(table: string, payload: Record<string, unknown>) {
  await requireAdmin();
  const { error } = await requireSupabase().from(table).insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

async function update(table: string, id: string, payload: Record<string, unknown>) {
  await requireAdmin();
  const { error } = await requireSupabase().from(table).update(payload).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

async function softDelete(table: string, id: string) {
  await update(table, id, { deleted_at: new Date().toISOString() });
}

async function reorder(table: string, orderedIds: string) {
  await requireAdmin();
  const supabase = requireSupabase();
  const ids = orderedIds.split(",").map((id) => id.trim()).filter(Boolean);
  const results = await Promise.all(ids.map((id, index) => supabase.from(table).update({ display_order: index + 1 }).eq("id", id)));
  const error = results.find((result) => result.error)?.error;
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

async function hardDelete(table: string, id: string) {
  await requireAdmin();
  const { error } = await requireSupabase().from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) redirect("/admin");
}

function requireSupabase() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) throw new Error("Supabase admin credentials are required for content management.");
  return supabase;
}

function resourcePayload(formData: FormData) {
  return {
    subject_id: value(formData, "subject_id"),
    resource_type_id: value(formData, "resource_type_id"),
    title: value(formData, "title"),
    description: value(formData, "description"),
    content: value(formData, "content"),
    file_url: optionalValue(formData, "file_url"),
    youtube_url: optionalValue(formData, "youtube_url"),
    display_order: numberValue(formData, "display_order"),
  };
}

function pastPaperPayload(formData: FormData) {
  return {
    subject_id: value(formData, "subject_id"),
    year: numberValue(formData, "year"),
    session: value(formData, "session"),
    paper_file_url: optionalValue(formData, "paper_file_url"),
    mark_scheme_file_url: optionalValue(formData, "mark_scheme_file_url"),
    display_order: numberValue(formData, "display_order"),
  };
}

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalValue(formData: FormData, key: string) {
  const current = value(formData, key);
  return current.length ? current : null;
}

function numberValue(formData: FormData, key: string) {
  return Number(value(formData, key) || "0");
}

function adminToken() {
  if (!process.env.ADMIN_PASSWORD) return null;
  return createHmac("sha256", process.env.ADMIN_PASSWORD).update("iskole-online-admin").digest("hex");
}
