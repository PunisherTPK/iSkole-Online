"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function getTeacher() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");
  const { data: profile } = await supabase.from("profiles").select("role, is_active").eq("id", user.id).maybeSingle();
  if (!profile?.is_active || !["teacher", "admin"].includes(profile.role)) throw new Error("Teacher access required.");
  return { supabase, user, isAdmin: profile.role === "admin" };
}

export async function createTeacherContent(formData: FormData) {
  const { supabase, user } = await getTeacher();
  const subjectId = String(formData.get("subjectId") || "");
  const parentId = String(formData.get("parentId") || "") || null;
  const name = String(formData.get("name") || "").trim();
  if (!subjectId || !name) throw new Error("Subject and folder name are required.");
  if (!(await hasSubjectAccess(supabase, user.id, subjectId))) throw new Error("You are not assigned to this subject.");

  if (parentId) {
    const { data: parent } = await supabase.from("content_nodes").select("id, subject_id").eq("id", parentId).maybeSingle();
    if (!parent || parent.subject_id !== subjectId) throw new Error("Invalid parent folder.");
  }

  const { error } = await supabase.from("content_nodes").insert({
    subject_id: subjectId,
    parent_id: parentId,
    name,
    created_by: user.id,
    is_active: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/teacher/content");
}

export async function deleteTeacherContent(formData: FormData) {
  const { supabase, user } = await getTeacher();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Content folder is required.");
  const { data: node } = await supabase.from("content_nodes").select("id, subject_id").eq("id", id).maybeSingle();
  if (!node || !(await hasSubjectAccess(supabase, user.id, node.subject_id))) throw new Error("You cannot modify this content.");
  const { error } = await supabase.from("content_nodes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/teacher/content");
}

export async function createTeacherQuestionPage(formData: FormData) {
  const { supabase, user } = await getTeacher();
  const subjectId = String(formData.get("subjectId") || "");
  const rawContentNodeId = String(formData.get("contentNodeId") || "").trim();
  const contentNodeId = rawContentNodeId || null;
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const pageType = String(formData.get("pageType") || "");
  if (!subjectId || !title || !["mcq", "structured"].includes(pageType)) throw new Error("Invalid question page data.");
  if (!(await hasSubjectAccess(supabase, user.id, subjectId))) throw new Error("You are not assigned to this subject.");

  if (contentNodeId) {
    const { data: node } = await supabase.from("content_nodes").select("id, subject_id").eq("id", contentNodeId).maybeSingle();
    if (!node || node.subject_id !== subjectId) throw new Error("Invalid folder.");
  }

  const { data, error } = await supabase.from("question_pages").insert({
    subject_id: subjectId,
    content_node_id: contentNodeId,
    title,
    description,
    page_type: pageType,
    is_published: false,
    created_by: user.id,
  }).select("id").single();
  if (error) throw new Error(error.message);
  revalidatePath("/teacher/content");
  return data.id;
}

export async function createTeacherQuestion(formData: FormData) {
  const { supabase, user } = await getTeacher();
  const pageId = String(formData.get("pageId") || "");
  const questionImageUrl = String(formData.get("questionImageUrl") || "").trim() || null;
  const questionType = String(formData.get("questionType") || "");
  const marks = Number(formData.get("marks") || 1);
  if (!pageId || !["mcq", "structured", "essay"].includes(questionType)) throw new Error("Invalid question data.");
  if (!Number.isFinite(marks) || marks <= 0) throw new Error("Marks must be greater than zero.");
  const { data: page } = await supabase.from("question_pages").select("id, subject_id").eq("id", pageId).maybeSingle();
  if (!page || !(await hasSubjectAccess(supabase, user.id, page.subject_id))) throw new Error("You cannot modify this question page.");
  const { data: last } = await supabase.from("questions").select("question_number, order_index").eq("question_page_id", pageId).order("order_index", { ascending: false }).limit(1).maybeSingle();
  const nextNumber = (last?.question_number ?? 0) + 1;
  const nextOrder = (last?.order_index ?? 0) + 1;
  const { error } = await supabase.from("questions").insert({ question_page_id: pageId, question_number: nextNumber, question_type: questionType, marks, order_index: nextOrder, question_image_url: questionImageUrl });
  if (error) throw new Error(error.message);
  revalidatePath(`/teacher/question-pages/${pageId}`);
  revalidatePath("/teacher/content");
}

async function hasSubjectAccess(supabase: SupabaseServerClient, userId: string, subjectId: string) {
  const { data: profile } = await supabase.from("profiles").select("role, is_active").eq("id", userId).maybeSingle();
  if (profile?.is_active && profile.role === "admin") return true;
  const { data } = await supabase.from("teacher_subjects").select("id").eq("teacher_id", userId).eq("subject_id", subjectId).eq("is_active", true).maybeSingle();
  return Boolean(data);
}
