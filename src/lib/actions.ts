"use server";

/**
 * ALL server-side logic for iSkole Online lives in this one file:
 * - session/auth (login, logout, "who am I")
 * - catalog read (used for initial load AND refresh-after-mutation)
 * - every create/update/delete/reorder action
 *
 * Why this can't be merged into the client App.tsx:
 * "use server" files compile into private server endpoints. Secrets
 * (SUPABASE_SERVICE_ROLE_KEY, ADMIN_PASSWORD) are only safe to read here.
 * If this logic lived in the "use client" file, those secrets would ship
 * to the browser bundle.
 */

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import type { Catalog, UserRole } from "./types";
import { sampleCatalog } from "./sample-data";

const AUTH_COOKIE = "iskole_admin";

// ---------- Supabase ----------

function adminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

function requireSupabase() {
  const supabase = adminClient();
  if (!supabase) throw new Error("Supabase admin credentials are not configured.");
  return supabase;
}

// ---------- Session / role (server-only source of truth) ----------

export type Session = {
  authenticated: boolean;
  role: UserRole | null;
  teacherEmail: string | null;
};

function adminToken() {
  if (!process.env.ADMIN_PASSWORD) return null;
  return createHmac("sha256", process.env.ADMIN_PASSWORD).update("iskole-online-admin").digest("hex");
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  const expected = adminToken();
  if (!token || !expected || token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

function currentRole(): "admin" | "teacher" {
  return process.env.ADMIN_ROLE === "teacher" ? "teacher" : "admin";
}

export async function getSession(): Promise<Session> {
  const authenticated = await isAuthenticated();
  if (!authenticated) return { authenticated: false, role: null, teacherEmail: null };
  return {
    authenticated: true,
    role: currentRole(),
    teacherEmail: process.env.ADMIN_TEACHER_EMAIL ?? null,
  };
}

export async function login(formData: FormData): Promise<{ error?: string }> {
  const password = String(formData.get("password") ?? "");
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return { error: "Invalid password." };
  }
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, adminToken()!, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return {};
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}

/** Every mutating action calls this first. Throws if not logged in. */
async function requireAuth() {
  if (!(await isAuthenticated())) throw new Error("Not authenticated.");
}

/**
 * Server-side authorization: a "teacher" session may only touch subjects
 * they are assigned to (via teacher_subjects). "admin" may touch anything.
 * This is what was MISSING before the restructure — role was only checked
 * on page routes, never inside the actions themselves.
 */
async function assertSubjectAccess(subjectId: string) {
  const role = currentRole();
  if (role === "admin") return;

  const teacherEmail = process.env.ADMIN_TEACHER_EMAIL ?? "";
  const supabase = requireSupabase();
  const { data: teacher } = await supabase.from("teachers").select("id").eq("email", teacherEmail).maybeSingle();
  if (!teacher) throw new Error("No teacher profile matches this session.");

  const { data: assignment } = await supabase
    .from("teacher_subjects")
    .select("id")
    .eq("teacher_id", teacher.id)
    .eq("subject_id", subjectId)
    .maybeSingle();

  if (!assignment) throw new Error("You are not assigned to this subject.");
}

/** Walks a child row up to its owning subject_id, for scope-checking deep edits. */
async function subjectIdFor(table: "units" | "topics" | "sub_topics" | "question_types" | "questions" | "discussion_videos", id: string): Promise<string> {
  const supabase = requireSupabase();
  switch (table) {
    case "units": {
      const { data } = await supabase.from("units").select("subject_id").eq("id", id).single();
      return data!.subject_id as string;
    }
    case "topics": {
      const { data } = await supabase.from("topics").select("unit_id").eq("id", id).single();
      return subjectIdFor("units", data!.unit_id as string);
    }
    case "sub_topics": {
      const { data } = await supabase.from("sub_topics").select("topic_id").eq("id", id).single();
      return subjectIdFor("topics", data!.topic_id as string);
    }
    case "question_types": {
      const { data } = await supabase.from("question_types").select("sub_topic_id").eq("id", id).single();
      return subjectIdFor("sub_topics", data!.sub_topic_id as string);
    }
    case "questions": {
      const { data } = await supabase.from("questions").select("question_type_id").eq("id", id).single();
      return subjectIdFor("question_types", data!.question_type_id as string);
    }
    case "discussion_videos": {
      const { data } = await supabase.from("discussion_videos").select("question_type_id").eq("id", id).single();
      return subjectIdFor("question_types", data!.question_type_id as string);
    }
  }
}

// ---------- Catalog read (initial load + post-mutation refresh) ----------

export async function getCatalog(): Promise<Catalog> {
  const supabase = adminClient();
  if (!supabase) return sampleCatalog;

  const tables = [
    supabase.from("profiles").select("*"),
    supabase.from("curriculums").select("*").is("deleted_at", null).order("display_order"),
    supabase.from("levels").select("*").is("deleted_at", null).order("display_order"),
    supabase.from("subjects").select("*").is("deleted_at", null).order("display_order"),
    supabase.from("units").select("*").is("deleted_at", null).order("display_order"),
    supabase.from("topics").select("*").is("deleted_at", null).order("display_order"),
    supabase.from("sub_topics").select("*").is("deleted_at", null).order("display_order"),
    supabase.from("teachers").select("*").is("deleted_at", null).order("name"),
    supabase.from("teacher_subjects").select("*"),
    supabase.from("question_types").select("*").is("deleted_at", null).order("display_order"),
    supabase.from("questions").select("*").is("deleted_at", null).order("display_order"),
    supabase.from("discussion_videos").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
  ];

  const [profiles, curriculums, levels, subjects, units, topics, subTopics, teachers, teacherSubjects, questionTypes, questions, discussionVideos] =
    await Promise.all(tables);

  if ([profiles, curriculums, levels, subjects, units, topics, subTopics, teachers, teacherSubjects, questionTypes, questions, discussionVideos].some((r) => r.error)) {
    return sampleCatalog;
  }

  return {
    profiles: (profiles.data ?? []) as Catalog["profiles"],
    curriculums: (curriculums.data ?? []) as Catalog["curriculums"],
    levels: (levels.data ?? []) as Catalog["levels"],
    subjects: (subjects.data ?? []) as Catalog["subjects"],
    units: (units.data ?? []) as Catalog["units"],
    topics: (topics.data ?? []) as Catalog["topics"],
    subTopics: (subTopics.data ?? []) as Catalog["subTopics"],
    teachers: ((teachers.data ?? []) as Catalog["teachers"]).map((t) => ({
      ...t,
      subjects: Array.isArray(t.subjects) ? t.subjects : [],
      curriculums: Array.isArray(t.curriculums) ? t.curriculums : [],
      social_links: t.social_links ?? {},
    })),
    teacherSubjects: (teacherSubjects.data ?? []) as Catalog["teacherSubjects"],
    questionTypes: (questionTypes.data ?? []) as Catalog["questionTypes"],
    questions: (questions.data ?? []) as Catalog["questions"],
    discussionVideos: (discussionVideos.data ?? []) as Catalog["discussionVideos"],
  };
}

// ---------- Shared mutation helpers ----------

type Result = { error?: string };

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function str(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}
function num(fd: FormData, key: string) {
  return Number(str(fd, key) || "0");
}
function opt(fd: FormData, key: string) {
  const v = str(fd, key);
  return v.length ? v : null;
}

async function safeInsert(table: string, payload: Record<string, unknown>): Promise<Result> {
  try {
    await requireAuth();
    const { error } = await requireSupabase().from(table).insert(payload);
    if (error) return { error: error.message.includes("duplicate") ? "That name/slug already exists here." : error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

async function safeUpdate(table: string, id: string, payload: Record<string, unknown>): Promise<Result> {
  try {
    await requireAuth();
    const { error } = await requireSupabase().from(table).update(payload).eq("id", id);
    if (error) return { error: error.message.includes("duplicate") ? "That name/slug already exists here." : error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

async function safeSoftDelete(table: string, id: string): Promise<Result> {
  return safeUpdate(table, id, { deleted_at: new Date().toISOString() });
}

async function safeHardDelete(table: string, id: string): Promise<Result> {
  try {
    await requireAuth();
    const { error } = await requireSupabase().from(table).delete().eq("id", id);
    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

/** Reorder that reports partial failure instead of leaving silent inconsistency. */
async function safeReorder(table: string, orderedIds: string): Promise<Result> {
  try {
    await requireAuth();
    const supabase = requireSupabase();
    const ids = orderedIds.split(",").map((s) => s.trim()).filter(Boolean);
    const results = await Promise.all(ids.map((id, index) => supabase.from(table).update({ display_order: index + 1 }).eq("id", id)));
    const failed = results.filter((r) => r.error);
    if (failed.length) return { error: `${failed.length} of ${ids.length} items failed to reorder. Please retry.` };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

// ---------- Curriculums / Levels / Subjects (admin-only) ----------

export async function createCurriculum(fd: FormData) {
  await requireAuth();
  if (currentRole() !== "admin") return { error: "Only admins can manage curriculums." };
  const name = str(fd, "name");
  return safeInsert("curriculums", { name, slug: slugify(name), display_order: num(fd, "display_order") });
}
export async function updateCurriculum(fd: FormData) {
  await requireAuth();
  if (currentRole() !== "admin") return { error: "Only admins can manage curriculums." };
  const name = str(fd, "name");
  return safeUpdate("curriculums", str(fd, "id"), { name, slug: slugify(name), display_order: num(fd, "display_order") });
}
export async function deleteCurriculum(id: string) {
  await requireAuth();
  if (currentRole() !== "admin") return { error: "Only admins can manage curriculums." };
  return safeSoftDelete("curriculums", id);
}
export async function reorderCurriculums(orderedIds: string) {
  await requireAuth();
  if (currentRole() !== "admin") return { error: "Only admins can manage curriculums." };
  return safeReorder("curriculums", orderedIds);
}

export async function createLevel(fd: FormData) {
  await requireAuth();
  if (currentRole() !== "admin") return { error: "Only admins can manage levels." };
  const name = str(fd, "name");
  return safeInsert("levels", { curriculum_id: str(fd, "curriculum_id"), name, slug: slugify(name), display_order: num(fd, "display_order") });
}
export async function updateLevel(fd: FormData) {
  await requireAuth();
  if (currentRole() !== "admin") return { error: "Only admins can manage levels." };
  const name = str(fd, "name");
  return safeUpdate("levels", str(fd, "id"), { curriculum_id: str(fd, "curriculum_id"), name, slug: slugify(name), display_order: num(fd, "display_order") });
}
export async function deleteLevel(id: string) {
  await requireAuth();
  if (currentRole() !== "admin") return { error: "Only admins can manage levels." };
  return safeSoftDelete("levels", id);
}
export async function reorderLevels(orderedIds: string) {
  await requireAuth();
  if (currentRole() !== "admin") return { error: "Only admins can manage levels." };
  return safeReorder("levels", orderedIds);
}

export async function createSubject(fd: FormData) {
  await requireAuth();
  if (currentRole() !== "admin") return { error: "Only admins can manage subjects." };
  const name = str(fd, "name");
  return safeInsert("subjects", { level_id: str(fd, "level_id"), name, slug: slugify(name), display_order: num(fd, "display_order") });
}
export async function updateSubject(fd: FormData) {
  await requireAuth();
  if (currentRole() !== "admin") return { error: "Only admins can manage subjects." };
  const name = str(fd, "name");
  return safeUpdate("subjects", str(fd, "id"), { level_id: str(fd, "level_id"), name, slug: slugify(name), display_order: num(fd, "display_order") });
}
export async function deleteSubject(id: string) {
  await requireAuth();
  if (currentRole() !== "admin") return { error: "Only admins can manage subjects." };
  return safeSoftDelete("subjects", id);
}
export async function reorderSubjects(orderedIds: string) {
  await requireAuth();
  if (currentRole() !== "admin") return { error: "Only admins can manage subjects." };
  return safeReorder("subjects", orderedIds);
}

// ---------- Teachers & assignments (admin-only) ----------

export async function createTeacher(fd: FormData) {
  await requireAuth();
  if (currentRole() !== "admin") return { error: "Only admins can manage teachers." };
  const name = str(fd, "name");
  return safeInsert("teachers", { name, slug: slugify(name), email: str(fd, "email"), subjects: [], curriculums: [] });
}
export async function updateTeacher(fd: FormData) {
  await requireAuth();
  if (currentRole() !== "admin") return { error: "Only admins can manage teachers." };
  const name = str(fd, "name");
  return safeUpdate("teachers", str(fd, "id"), { name, slug: slugify(name), email: str(fd, "email") });
}
export async function deleteTeacher(id: string) {
  await requireAuth();
  if (currentRole() !== "admin") return { error: "Only admins can manage teachers." };
  return safeSoftDelete("teachers", id);
}
export async function assignTeacherSubject(fd: FormData) {
  await requireAuth();
  if (currentRole() !== "admin") return { error: "Only admins can manage assignments." };
  return safeInsert("teacher_subjects", { teacher_id: str(fd, "teacher_id"), subject_id: str(fd, "subject_id") });
}
export async function deleteTeacherAssignment(id: string) {
  await requireAuth();
  if (currentRole() !== "admin") return { error: "Only admins can manage assignments." };
  return safeHardDelete("teacher_subjects", id);
}

// ---------- Content tree (subject-scoped: admin OR the assigned teacher) ----------

export async function createUnit(fd: FormData) {
  await requireAuth();
  const subjectId = str(fd, "subject_id");
  await assertSubjectAccess(subjectId);
  const name = str(fd, "name");
  return safeInsert("units", { subject_id: subjectId, name, slug: slugify(name), description: str(fd, "description"), display_order: num(fd, "display_order") });
}
export async function updateUnit(fd: FormData) {
  await requireAuth();
  const subjectId = str(fd, "subject_id");
  await assertSubjectAccess(subjectId);
  const name = str(fd, "name");
  return safeUpdate("units", str(fd, "id"), { subject_id: subjectId, name, slug: slugify(name), description: str(fd, "description"), display_order: num(fd, "display_order") });
}
export async function deleteUnit(id: string) {
  await requireAuth();
  await assertSubjectAccess(await subjectIdFor("units", id));
  return safeSoftDelete("units", id);
}

export async function createTopic(fd: FormData) {
  await requireAuth();
  const unitId = str(fd, "unit_id");
  await assertSubjectAccess(await subjectIdFor("units", unitId));
  const name = str(fd, "name");
  return safeInsert("topics", { unit_id: unitId, name, slug: slugify(name), description: str(fd, "description"), display_order: num(fd, "display_order") });
}
export async function updateTopic(fd: FormData) {
  await requireAuth();
  const unitId = str(fd, "unit_id");
  await assertSubjectAccess(await subjectIdFor("units", unitId));
  const name = str(fd, "name");
  return safeUpdate("topics", str(fd, "id"), { unit_id: unitId, name, slug: slugify(name), description: str(fd, "description"), display_order: num(fd, "display_order") });
}
export async function deleteTopic(id: string) {
  await requireAuth();
  await assertSubjectAccess(await subjectIdFor("topics", id));
  return safeSoftDelete("topics", id);
}

export async function createSubTopic(fd: FormData) {
  await requireAuth();
  const topicId = str(fd, "topic_id");
  await assertSubjectAccess(await subjectIdFor("topics", topicId));
  const name = str(fd, "name");
  return safeInsert("sub_topics", { topic_id: topicId, name, slug: slugify(name), description: str(fd, "description"), display_order: num(fd, "display_order") });
}
export async function updateSubTopic(fd: FormData) {
  await requireAuth();
  const topicId = str(fd, "topic_id");
  await assertSubjectAccess(await subjectIdFor("topics", topicId));
  const name = str(fd, "name");
  return safeUpdate("sub_topics", str(fd, "id"), { topic_id: topicId, name, slug: slugify(name), description: str(fd, "description"), display_order: num(fd, "display_order") });
}
export async function deleteSubTopic(id: string) {
  await requireAuth();
  await assertSubjectAccess(await subjectIdFor("sub_topics", id));
  return safeSoftDelete("sub_topics", id);
}

export async function createQuestionType(fd: FormData) {
  await requireAuth();
  const subTopicId = str(fd, "sub_topic_id");
  await assertSubjectAccess(await subjectIdFor("sub_topics", subTopicId));
  return safeInsert("question_types", {
    sub_topic_id: subTopicId,
    teacher_id: opt(fd, "teacher_id"),
    type: str(fd, "type"),
    title: str(fd, "title"),
    description: str(fd, "description"),
    display_order: num(fd, "display_order"),
  });
}
export async function updateQuestionType(fd: FormData) {
  await requireAuth();
  const subTopicId = str(fd, "sub_topic_id");
  await assertSubjectAccess(await subjectIdFor("sub_topics", subTopicId));
  return safeUpdate("question_types", str(fd, "id"), {
    sub_topic_id: subTopicId,
    teacher_id: opt(fd, "teacher_id"),
    type: str(fd, "type"),
    title: str(fd, "title"),
    description: str(fd, "description"),
    display_order: num(fd, "display_order"),
  });
}
export async function deleteQuestionType(id: string) {
  await requireAuth();
  await assertSubjectAccess(await subjectIdFor("question_types", id));
  return safeSoftDelete("question_types", id);
}

function questionPayload(fd: FormData) {
  return {
    question_type_id: str(fd, "question_type_id"),
    question_image_url: str(fd, "question_image_url"),
    correct_answer: opt(fd, "correct_answer"),
    marking_scheme: str(fd, "marking_scheme"),
    explanation: str(fd, "explanation"),
    difficulty: str(fd, "difficulty") || "medium",
    display_order: num(fd, "display_order"),
  };
}
export async function createQuestion(fd: FormData) {
  await requireAuth();
  const payload = questionPayload(fd);
  await assertSubjectAccess(await subjectIdFor("question_types", payload.question_type_id));
  if (!payload.correct_answer) {
    const { data } = await requireSupabase().from("question_types").select("type").eq("id", payload.question_type_id).single();
    if (data?.type === "mcq") return { error: "MCQ questions must have a correct answer selected." };
  }
  return safeInsert("questions", payload);
}
export async function updateQuestion(fd: FormData) {
  await requireAuth();
  const payload = questionPayload(fd);
  await assertSubjectAccess(await subjectIdFor("question_types", payload.question_type_id));
  return safeUpdate("questions", str(fd, "id"), payload);
}
export async function deleteQuestion(id: string) {
  await requireAuth();
  await assertSubjectAccess(await subjectIdFor("questions", id));
  return safeSoftDelete("questions", id);
}

function extractYouTubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return match?.[1] ?? url;
}
export async function createDiscussionVideo(fd: FormData) {
  await requireAuth();
  const questionTypeId = str(fd, "question_type_id");
  await assertSubjectAccess(await subjectIdFor("question_types", questionTypeId));
  const youtubeUrl = str(fd, "youtube_url");
  return safeInsert("discussion_videos", {
    question_type_id: questionTypeId,
    teacher_id: opt(fd, "teacher_id"),
    title: str(fd, "title"),
    youtube_url: youtubeUrl,
    youtube_video_id: extractYouTubeId(youtubeUrl),
    description: str(fd, "description"),
    resources: str(fd, "resources"),
  });
}
export async function updateDiscussionVideo(fd: FormData) {
  await requireAuth();
  const questionTypeId = str(fd, "question_type_id");
  await assertSubjectAccess(await subjectIdFor("question_types", questionTypeId));
  const youtubeUrl = str(fd, "youtube_url");
  return safeUpdate("discussion_videos", str(fd, "id"), {
    question_type_id: questionTypeId,
    teacher_id: opt(fd, "teacher_id"),
    title: str(fd, "title"),
    youtube_url: youtubeUrl,
    youtube_video_id: extractYouTubeId(youtubeUrl),
    description: str(fd, "description"),
    resources: str(fd, "resources"),
  });
}
export async function deleteDiscussionVideo(id: string) {
  await requireAuth();
  await assertSubjectAccess(await subjectIdFor("discussion_videos", id));
  return safeSoftDelete("discussion_videos", id);
}
