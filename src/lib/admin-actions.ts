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

export async function createUnit(formData: FormData) {
  const name = value(formData, "name");
  await insert("units", {
    subject_id: value(formData, "subject_id"),
    name,
    slug: slugify(name),
    description: value(formData, "description"),
    display_order: numberValue(formData, "display_order"),
  });
}

export async function updateUnit(formData: FormData) {
  const name = value(formData, "name");
  await update("units", value(formData, "id"), {
    subject_id: value(formData, "subject_id"),
    name,
    slug: slugify(name),
    description: value(formData, "description"),
    display_order: numberValue(formData, "display_order"),
  });
}

export async function deleteUnit(formData: FormData) {
  await softDelete("units", value(formData, "id"));
}

export async function createTopic(formData: FormData) {
  const name = value(formData, "name");
  await insert("topics", {
    unit_id: value(formData, "unit_id"),
    name,
    slug: slugify(name),
    description: value(formData, "description"),
    display_order: numberValue(formData, "display_order"),
  });
}

export async function updateTopic(formData: FormData) {
  const name = value(formData, "name");
  await update("topics", value(formData, "id"), {
    unit_id: value(formData, "unit_id"),
    name,
    slug: slugify(name),
    description: value(formData, "description"),
    display_order: numberValue(formData, "display_order"),
  });
}

export async function deleteTopic(formData: FormData) {
  await softDelete("topics", value(formData, "id"));
}

export async function createSubTopic(formData: FormData) {
  const name = value(formData, "name");
  await insert("sub_topics", {
    topic_id: value(formData, "topic_id"),
    name,
    slug: slugify(name),
    description: value(formData, "description"),
    display_order: numberValue(formData, "display_order"),
  });
}

export async function updateSubTopic(formData: FormData) {
  const name = value(formData, "name");
  await update("sub_topics", value(formData, "id"), {
    topic_id: value(formData, "topic_id"),
    name,
    slug: slugify(name),
    description: value(formData, "description"),
    display_order: numberValue(formData, "display_order"),
  });
}

export async function deleteSubTopic(formData: FormData) {
  await softDelete("sub_topics", value(formData, "id"));
}

export async function createQuestionType(formData: FormData) {
  await insert("question_types", questionTypePayload(formData));
}

export async function updateQuestionType(formData: FormData) {
  await update("question_types", value(formData, "id"), questionTypePayload(formData));
}

export async function deleteQuestionType(formData: FormData) {
  await softDelete("question_types", value(formData, "id"));
}

export async function createQuestion(formData: FormData) {
  await insert("questions", questionPayload(formData));
}

export async function updateQuestion(formData: FormData) {
  await update("questions", value(formData, "id"), questionPayload(formData));
}

export async function deleteQuestion(formData: FormData) {
  await softDelete("questions", value(formData, "id"));
}

export async function createDiscussionVideo(formData: FormData) {
  await insert("discussion_videos", discussionVideoPayload(formData));
}

export async function updateDiscussionVideo(formData: FormData) {
  await update("discussion_videos", value(formData, "id"), discussionVideoPayload(formData));
}

export async function deleteDiscussionVideo(formData: FormData) {
  await softDelete("discussion_videos", value(formData, "id"));
}

export async function createTeacher(formData: FormData) {
  await insert("teachers", {
    name: value(formData, "name"),
    slug: slugify(value(formData, "name")),
    email: value(formData, "email"),
    subjects: [],
    curriculums: [],
  });
}

export async function updateTeacher(formData: FormData) {
  await update("teachers", value(formData, "id"), {
    name: value(formData, "name"),
    slug: slugify(value(formData, "name")),
    email: value(formData, "email"),
  });
}

export async function deleteTeacher(formData: FormData) {
  await softDelete("teachers", value(formData, "id"));
}

export async function assignTeacherSubject(formData: FormData) {
  await insert("teacher_subjects", {
    teacher_id: value(formData, "teacher_id"),
    subject_id: value(formData, "subject_id"),
  });
}

export async function deleteTeacherAssignment(formData: FormData) {
  await hardDelete("teacher_subjects", value(formData, "id"));
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

function questionTypePayload(formData: FormData) {
  return {
    sub_topic_id: value(formData, "sub_topic_id"),
    teacher_id: optionalValue(formData, "teacher_id"),
    type: value(formData, "type"),
    title: value(formData, "title"),
    description: value(formData, "description"),
    display_order: numberValue(formData, "display_order"),
  };
}

function questionPayload(formData: FormData) {
  return {
    question_type_id: value(formData, "question_type_id"),
    question_image_url: value(formData, "question_image_url"),
    correct_answer: optionalValue(formData, "correct_answer"),
    marking_scheme: value(formData, "marking_scheme"),
    explanation: value(formData, "explanation"),
    difficulty: value(formData, "difficulty") || "medium",
    display_order: numberValue(formData, "display_order"),
  };
}

function discussionVideoPayload(formData: FormData) {
  const youtubeUrl = value(formData, "youtube_url");
  return {
    question_type_id: value(formData, "question_type_id"),
    teacher_id: optionalValue(formData, "teacher_id"),
    title: value(formData, "title"),
    youtube_url: youtubeUrl,
    youtube_video_id: extractYouTubeId(youtubeUrl),
    description: value(formData, "description"),
    resources: value(formData, "resources"),
  };
}

function extractYouTubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return match?.[1] ?? url;
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
