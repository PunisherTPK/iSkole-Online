"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
  if (!subjectId || !name) throw new Error("Subject and name are required.");
  if (!(await hasSubjectAccess(supabase, user.id, subjectId))) throw new Error("You are not assigned to this subject.");

  const { error } = await supabase.from("content_nodes").insert({ subject_id: subjectId, parent_id: parentId, name, created_by: user.id, is_active: true });
  if (error) throw new Error(error.message);
  revalidatePath("/teacher/content");
}

export async function deleteTeacherContent(formData: FormData) {
  const { supabase, user } = await getTeacher();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Content node is required.");
  const { data: node } = await supabase.from("content_nodes").select("id, subject_id").eq("id", id).maybeSingle();
  if (!node || !(await hasSubjectAccess(supabase, user.id, node.subject_id))) throw new Error("You cannot modify this content.");
  const { error } = await supabase.from("content_nodes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/teacher/content");
}

export async function createTeacherQuestionPage(formData: FormData) {
  const { supabase, user } = await getTeacher();
  const subjectId = String(formData.get("subjectId") || "");
  const contentNodeId = String(formData.get("contentNodeId") || "") || null;
  const title = String(formData.get("title") || "").trim();
  const pageType = String(formData.get("pageType") || "structured");
  if (!subjectId || !contentNodeId || !title) throw new Error("Subject, content node and title are required.");
  if (!(await hasSubjectAccess(supabase, user.id, subjectId))) throw new Error("You are not assigned to this subject.");
  if (!['mcq', 'structured'].includes(pageType)) throw new Error("Invalid question page type.");

  const { data: node } = await supabase.from("content_nodes").select("id, subject_id").eq("id", contentNodeId).eq("subject_id", subjectId).maybeSingle();
  if (!node) throw new Error("Content node not found.");

  const { error } = await supabase.from("question_pages").insert({
    subject_id: subjectId,
    content_node_id: contentNodeId,
    title,
    page_type: pageType,
    created_by: user.id,
    is_published: false,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/teacher/content");
}

async function hasSubjectAccess(supabase: any, userId: string, subjectId: string) {
  const { data } = await supabase.from("teacher_subjects").select("id").eq("teacher_id", userId).eq("subject_id", subjectId).eq("is_active", true).maybeSingle();
  if (data) return true;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  return profile?.role === "admin";
}
