"use server";

import { createHmac, timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminRole, getAdminTeacherEmail, type AdminRole } from "@/lib/admin-session";
import { slugify } from "@/lib/slug";
import { getSupabaseAdminClient } from "@/lib/supabase";

const AUTH_COOKIE = "iskole_admin";
const FLASH_COOKIE = "iskole_admin_flash";

type TableName =
  | "curriculums"
  | "levels"
  | "subjects"
  | "teachers"
  | "teacher_subjects"
  | "units"
  | "topics"
  | "sub_topics"
  | "question_types"
  | "questions"
  | "discussion_videos";

type Session = { role: AdminRole; teacherEmail: string };

class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  const expected = adminToken();

  if (!token || !expected || token.length !== expected.length) return false;

  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export async function readAdminFlash() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(FLASH_COOKIE)?.value;
  if (!raw) return null;

  try {
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as { type: "success" | "error"; message: string };
  } catch {
    return null;
  }
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
  await mutate("Create curriculum", async () => {
    await requireRole("admin");
    const name = requiredValue(formData, "name", "Curriculum name is required.");
    await insert("curriculums", { name, slug: slugify(name), display_order: numberValue(formData, "display_order") });
  });
}

export async function updateCurriculum(formData: FormData) {
  await mutate("Update curriculum", async () => {
    await requireRole("admin");
    const name = requiredValue(formData, "name", "Curriculum name is required.");
    await update("curriculums", requiredValue(formData, "id", "Missing curriculum."), { name, slug: slugify(name), display_order: numberValue(formData, "display_order") });
  });
}

export async function deleteCurriculum(formData: FormData) {
  await mutate("Delete curriculum", async () => {
    await requireRole("admin");
    await softDelete("curriculums", requiredValue(formData, "id", "Missing curriculum."));
  });
}

export async function reorderCurriculums(formData: FormData) {
  await mutate("Reorder curriculums", async () => {
    await requireRole("admin");
    await reorder("curriculums", value(formData, "ordered_ids"));
  });
}

export async function createLevel(formData: FormData) {
  await mutate("Create level", async () => {
    await requireRole("admin");
    const name = requiredValue(formData, "name", "Level name is required.");
    await insert("levels", { curriculum_id: requiredValue(formData, "curriculum_id", "Missing curriculum."), name, slug: slugify(name), display_order: numberValue(formData, "display_order") });
  });
}

export async function updateLevel(formData: FormData) {
  await mutate("Update level", async () => {
    await requireRole("admin");
    const name = requiredValue(formData, "name", "Level name is required.");
    await update("levels", requiredValue(formData, "id", "Missing level."), { curriculum_id: requiredValue(formData, "curriculum_id", "Missing curriculum."), name, slug: slugify(name), display_order: numberValue(formData, "display_order") });
  });
}

export async function deleteLevel(formData: FormData) {
  await mutate("Delete level", async () => {
    await requireRole("admin");
    await softDelete("levels", requiredValue(formData, "id", "Missing level."));
  });
}

export async function reorderLevels(formData: FormData) {
  await mutate("Reorder levels", async () => {
    await requireRole("admin");
    await reorder("levels", value(formData, "ordered_ids"));
  });
}

export async function createSubject(formData: FormData) {
  await mutate("Create subject", async () => {
    await requireRole("admin");
    const name = requiredValue(formData, "name", "Subject name is required.");
    await insert("subjects", { level_id: requiredValue(formData, "level_id", "Missing level."), name, slug: slugify(name), display_order: numberValue(formData, "display_order") });
  });
}

export async function updateSubject(formData: FormData) {
  await mutate("Update subject", async () => {
    await requireRole("admin");
    const name = requiredValue(formData, "name", "Subject name is required.");
    await update("subjects", requiredValue(formData, "id", "Missing subject."), { level_id: requiredValue(formData, "level_id", "Missing level."), name, slug: slugify(name), display_order: numberValue(formData, "display_order") });
  });
}

export async function deleteSubject(formData: FormData) {
  await mutate("Delete subject", async () => {
    await requireRole("admin");
    await softDelete("subjects", requiredValue(formData, "id", "Missing subject."));
  });
}

export async function reorderSubjects(formData: FormData) {
  await mutate("Reorder subjects", async () => {
    await requireRole("admin");
    await reorder("subjects", value(formData, "ordered_ids"));
  });
}

export async function createUnit(formData: FormData) {
  await mutate("Create unit", async () => {
    const subjectId = requiredValue(formData, "subject_id", "Missing subject.");
    await requireSubjectAccess(subjectId);
    const name = requiredValue(formData, "name", "Unit name is required.");
    await insert("units", { subject_id: subjectId, name, slug: slugify(name), description: value(formData, "description"), display_order: numberValue(formData, "display_order") });
  });
}

export async function updateUnit(formData: FormData) {
  await mutate("Update unit", async () => {
    const id = requiredValue(formData, "id", "Missing unit.");
    await requireUnitAccess(id);
    const subjectId = requiredValue(formData, "subject_id", "Missing subject.");
    await requireSubjectAccess(subjectId);
    const name = requiredValue(formData, "name", "Unit name is required.");
    await update("units", id, { subject_id: subjectId, name, slug: slugify(name), description: value(formData, "description"), display_order: numberValue(formData, "display_order") });
  });
}

export async function deleteUnit(formData: FormData) {
  await mutate("Delete unit", async () => {
    const id = requiredValue(formData, "id", "Missing unit.");
    await requireUnitAccess(id);
    await softDelete("units", id);
  });
}

export async function createTopic(formData: FormData) {
  await mutate("Create topic", async () => {
    const unitId = requiredValue(formData, "unit_id", "Missing unit.");
    await requireUnitAccess(unitId);
    const name = requiredValue(formData, "name", "Topic name is required.");
    await insert("topics", { unit_id: unitId, name, slug: slugify(name), description: value(formData, "description"), display_order: numberValue(formData, "display_order") });
  });
}

export async function updateTopic(formData: FormData) {
  await mutate("Update topic", async () => {
    const id = requiredValue(formData, "id", "Missing topic.");
    await requireTopicAccess(id);
    const unitId = requiredValue(formData, "unit_id", "Missing unit.");
    await requireUnitAccess(unitId);
    const name = requiredValue(formData, "name", "Topic name is required.");
    await update("topics", id, { unit_id: unitId, name, slug: slugify(name), description: value(formData, "description"), display_order: numberValue(formData, "display_order") });
  });
}

export async function deleteTopic(formData: FormData) {
  await mutate("Delete topic", async () => {
    const id = requiredValue(formData, "id", "Missing topic.");
    await requireTopicAccess(id);
    await softDelete("topics", id);
  });
}

export async function createSubTopic(formData: FormData) {
  await mutate("Create sub topic", async () => {
    const topicId = requiredValue(formData, "topic_id", "Missing topic.");
    await requireTopicAccess(topicId);
    const name = requiredValue(formData, "name", "Sub topic name is required.");
    await insert("sub_topics", { topic_id: topicId, name, slug: slugify(name), description: value(formData, "description"), display_order: numberValue(formData, "display_order") });
  });
}

export async function updateSubTopic(formData: FormData) {
  await mutate("Update sub topic", async () => {
    const id = requiredValue(formData, "id", "Missing sub topic.");
    await requireSubTopicAccess(id);
    const topicId = requiredValue(formData, "topic_id", "Missing topic.");
    await requireTopicAccess(topicId);
    const name = requiredValue(formData, "name", "Sub topic name is required.");
    await update("sub_topics", id, { topic_id: topicId, name, slug: slugify(name), description: value(formData, "description"), display_order: numberValue(formData, "display_order") });
  });
}

export async function deleteSubTopic(formData: FormData) {
  await mutate("Delete sub topic", async () => {
    const id = requiredValue(formData, "id", "Missing sub topic.");
    await requireSubTopicAccess(id);
    await softDelete("sub_topics", id);
  });
}

export async function createQuestionType(formData: FormData) {
  await mutate("Create question type", async () => {
    const subTopicId = requiredValue(formData, "sub_topic_id", "Missing sub topic.");
    await requireSubTopicAccess(subTopicId);
    await insert("question_types", questionTypePayload(formData));
  });
}

export async function updateQuestionType(formData: FormData) {
  await mutate("Update question type", async () => {
    const id = requiredValue(formData, "id", "Missing question type.");
    await requireQuestionTypeAccess(id);
    await requireSubTopicAccess(requiredValue(formData, "sub_topic_id", "Missing sub topic."));
    await update("question_types", id, questionTypePayload(formData));
  });
}

export async function deleteQuestionType(formData: FormData) {
  await mutate("Delete question type", async () => {
    const id = requiredValue(formData, "id", "Missing question type.");
    await requireQuestionTypeAccess(id);
    await softDelete("question_types", id);
  });
}

export async function createQuestion(formData: FormData) {
  await mutate("Create question", async () => {
    await requireQuestionTypeAccess(requiredValue(formData, "question_type_id", "Missing question type."));
    await insert("questions", questionPayload(formData));
  });
}

export async function updateQuestion(formData: FormData) {
  await mutate("Update question", async () => {
    const id = requiredValue(formData, "id", "Missing question.");
    await requireQuestionAccess(id);
    await requireQuestionTypeAccess(requiredValue(formData, "question_type_id", "Missing question type."));
    await update("questions", id, questionPayload(formData));
  });
}

export async function deleteQuestion(formData: FormData) {
  await mutate("Delete question", async () => {
    const id = requiredValue(formData, "id", "Missing question.");
    await requireQuestionAccess(id);
    await softDelete("questions", id);
  });
}

export async function createDiscussionVideo(formData: FormData) {
  await mutate("Create discussion video", async () => {
    await requireQuestionTypeAccess(requiredValue(formData, "question_type_id", "Missing question type."));
    await insert("discussion_videos", discussionVideoPayload(formData));
  });
}

export async function updateDiscussionVideo(formData: FormData) {
  await mutate("Update discussion video", async () => {
    const id = requiredValue(formData, "id", "Missing discussion video.");
    await requireDiscussionVideoAccess(id);
    await requireQuestionTypeAccess(requiredValue(formData, "question_type_id", "Missing question type."));
    await update("discussion_videos", id, discussionVideoPayload(formData));
  });
}

export async function deleteDiscussionVideo(formData: FormData) {
  await mutate("Delete discussion video", async () => {
    const id = requiredValue(formData, "id", "Missing discussion video.");
    await requireDiscussionVideoAccess(id);
    await softDelete("discussion_videos", id);
  });
}

export async function createTeacher(formData: FormData) {
  await mutate("Create teacher", async () => {
    await requireRole("admin");
    const name = requiredValue(formData, "name", "Teacher name is required.");
    await insert("teachers", { name, slug: slugify(name), email: requiredValue(formData, "email", "Teacher email is required."), subjects: [], curriculums: [] });
  });
}

export async function updateTeacher(formData: FormData) {
  await mutate("Update teacher", async () => {
    await requireRole("admin");
    const name = requiredValue(formData, "name", "Teacher name is required.");
    await update("teachers", requiredValue(formData, "id", "Missing teacher."), { name, slug: slugify(name), email: requiredValue(formData, "email", "Teacher email is required.") });
  });
}

export async function deleteTeacher(formData: FormData) {
  await mutate("Delete teacher", async () => {
    await requireRole("admin");
    await softDelete("teachers", requiredValue(formData, "id", "Missing teacher."));
  });
}

export async function assignTeacherSubject(formData: FormData) {
  await mutate("Assign teacher", async () => {
    await requireRole("admin");
    await insert("teacher_subjects", { teacher_id: requiredValue(formData, "teacher_id", "Missing teacher."), subject_id: requiredValue(formData, "subject_id", "Missing subject.") });
  });
}

export async function deleteTeacherAssignment(formData: FormData) {
  await mutate("Remove teacher assignment", async () => {
    await requireRole("admin");
    await hardDelete("teacher_subjects", requiredValue(formData, "id", "Missing assignment."));
  });
}

async function mutate(label: string, operation: () => Promise<void>) {
  try {
    await operation();
    revalidatePath("/", "layout");
    await setFlash("success", `${label} completed.`);
  } catch (error) {
    console.error(`[admin-action] ${label} failed`, error);
    await setFlash("error", friendlyError(error));
  }
}

async function insert(table: TableName, payload: Record<string, unknown>) {
  const { error } = await requireSupabase().from(table).insert(payload);
  if (error) throw new ActionError(toFriendlyDatabaseError(error.message));
}

async function update(table: TableName, id: string, payload: Record<string, unknown>) {
  const { data, error } = await requireSupabase().from(table).update(payload).eq("id", id).select("id").maybeSingle();
  if (error) throw new ActionError(toFriendlyDatabaseError(error.message));
  if (!data) throw new ActionError("The item could not be found or was already removed.");
}

async function softDelete(table: TableName, id: string) {
  await update(table, id, { deleted_at: new Date().toISOString() });
}

async function reorder(table: TableName, orderedIds: string) {
  const ids = orderedIds.split(",").map((id) => id.trim()).filter(Boolean);
  if (!ids.length) throw new ActionError("Nothing was selected to reorder.");
  const supabase = requireSupabase();
  const results = await Promise.all(ids.map((id, index) => supabase.from(table).update({ display_order: index + 1 }).eq("id", id)));
  const error = results.find((result) => result.error)?.error;
  if (error) throw new ActionError(toFriendlyDatabaseError(error.message));
}

async function hardDelete(table: TableName, id: string) {
  const { error } = await requireSupabase().from(table).delete().eq("id", id);
  if (error) throw new ActionError(toFriendlyDatabaseError(error.message));
}

async function requireAuthenticated(): Promise<Session> {
  if (!(await isAdminAuthenticated())) throw new ActionError("Please sign in before making changes.");
  const role = getAdminRole();
  if (role !== "admin" && role !== "teacher") throw new ActionError("You do not have permission to make changes.");
  return { role, teacherEmail: getAdminTeacherEmail() };
}

async function requireRole(role: AdminRole) {
  const session = await requireAuthenticated();
  if (session.role !== role) throw new ActionError("You do not have permission to perform this action.");
  return session;
}

async function requireSubjectAccess(subjectId: string) {
  const session = await requireAuthenticated();
  if (session.role === "admin") return;
  if (!session.teacherEmail) throw new ActionError("Your teacher account is not linked to this dashboard session.");

  const supabase = requireSupabase();
  const { data: teacher, error: teacherError } = await supabase.from("teachers").select("id").eq("email", session.teacherEmail).is("deleted_at", null).maybeSingle();
  if (teacherError) throw new ActionError("Unable to verify your teacher profile.");
  if (!teacher) throw new ActionError("Your teacher profile could not be found.");

  const { data: assignment, error } = await supabase.from("teacher_subjects").select("id").eq("teacher_id", teacher.id).eq("subject_id", subjectId).maybeSingle();
  if (error) throw new ActionError("Unable to verify your subject assignment.");
  if (!assignment) throw new ActionError("You can only edit subjects assigned to you.");
}

async function requireUnitAccess(unitId: string) {
  const unit = await findById<{ subject_id: string }>("units", unitId, "Unit not found.");
  await requireSubjectAccess(unit.subject_id);
}

async function requireTopicAccess(topicId: string) {
  const topic = await findById<{ unit_id: string }>("topics", topicId, "Topic not found.");
  await requireUnitAccess(topic.unit_id);
}

async function requireSubTopicAccess(subTopicId: string) {
  const subTopic = await findById<{ topic_id: string }>("sub_topics", subTopicId, "Sub topic not found.");
  await requireTopicAccess(subTopic.topic_id);
}

async function requireQuestionTypeAccess(questionTypeId: string) {
  const questionType = await findById<{ sub_topic_id: string }>("question_types", questionTypeId, "Question type not found.");
  await requireSubTopicAccess(questionType.sub_topic_id);
}

async function requireQuestionAccess(questionId: string) {
  const question = await findById<{ question_type_id: string }>("questions", questionId, "Question not found.");
  await requireQuestionTypeAccess(question.question_type_id);
}

async function requireDiscussionVideoAccess(videoId: string) {
  const video = await findById<{ question_type_id: string }>("discussion_videos", videoId, "Discussion video not found.");
  await requireQuestionTypeAccess(video.question_type_id);
}

async function findById<T>(table: TableName, id: string, missingMessage: string): Promise<T> {
  const { data, error } = await requireSupabase().from(table).select("*").eq("id", id).maybeSingle();
  if (error) throw new ActionError("Unable to verify this item.");
  if (!data) throw new ActionError(missingMessage);
  return data as T;
}

function requireSupabase() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) throw new ActionError("Content management is not configured for database writes.");
  return supabase;
}

function questionTypePayload(formData: FormData) {
  const type = requiredValue(formData, "type", "Question type is required.");
  if (type !== "mcq" && type !== "structured") throw new ActionError("Question type must be MCQ or Structured.");
  return {
    sub_topic_id: requiredValue(formData, "sub_topic_id", "Missing sub topic."),
    teacher_id: optionalValue(formData, "teacher_id"),
    type,
    title: requiredValue(formData, "title", "Question type title is required."),
    description: value(formData, "description"),
    display_order: numberValue(formData, "display_order"),
  };
}

function questionPayload(formData: FormData) {
  const difficulty = value(formData, "difficulty") || "medium";
  if (!["easy", "medium", "hard"].includes(difficulty)) throw new ActionError("Difficulty must be easy, medium, or hard.");
  return {
    question_type_id: requiredValue(formData, "question_type_id", "Missing question type."),
    question_image_url: requiredValue(formData, "question_image_url", "Question image URL is required."),
    correct_answer: optionalValue(formData, "correct_answer"),
    marking_scheme: value(formData, "marking_scheme"),
    explanation: value(formData, "explanation"),
    difficulty,
    display_order: numberValue(formData, "display_order"),
  };
}

function discussionVideoPayload(formData: FormData) {
  const youtubeUrl = requiredValue(formData, "youtube_url", "YouTube URL is required.");
  return {
    question_type_id: requiredValue(formData, "question_type_id", "Missing question type."),
    teacher_id: optionalValue(formData, "teacher_id"),
    title: requiredValue(formData, "title", "Video title is required."),
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

function requiredValue(formData: FormData, key: string, message: string) {
  const current = value(formData, key);
  if (!current) throw new ActionError(message);
  return current;
}

function optionalValue(formData: FormData, key: string) {
  const current = value(formData, key);
  return current.length ? current : null;
}

function numberValue(formData: FormData, key: string) {
  return Number(value(formData, key) || "0");
}

async function setFlash(type: "success" | "error", message: string) {
  const cookieStore = await cookies();
  cookieStore.set(FLASH_COOKIE, Buffer.from(JSON.stringify({ type, message })).toString("base64url"), {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 30,
  });
}

function friendlyError(error: unknown) {
  if (error instanceof ActionError) return error.message;
  return "Something went wrong while saving. Please review your input and try again.";
}

function toFriendlyDatabaseError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("duplicate") || normalized.includes("unique")) return "A matching item already exists.";
  if (normalized.includes("foreign key")) return "The selected parent item could not be found.";
  if (normalized.includes("violates check")) return "One of the selected values is not allowed.";
  if (normalized.includes("network")) return "The database connection failed. Please try again.";
  return "The database could not save this change.";
}

function adminToken() {
  if (!process.env.ADMIN_PASSWORD) return null;
  return createHmac("sha256", process.env.ADMIN_PASSWORD).update("iskole-online-admin").digest("hex");
}
