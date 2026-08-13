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
  return { supabase, user };
}

async function hasSubjectAccess(supabase: SupabaseServerClient, userId: string, subjectId: string) {
  const { data: profile } = await supabase.from("profiles").select("role, is_active").eq("id", userId).maybeSingle();
  if (profile?.is_active && profile.role === "admin") return true;
  const { data } = await supabase.from("teacher_subjects").select("id").eq("teacher_id", userId).eq("subject_id", subjectId).eq("is_active", true).maybeSingle();
  return Boolean(data);
}

export async function saveTeacherStructuredAnswer(formData: FormData) {
  const { supabase, user } = await getTeacher();
  const questionId = String(formData.get("questionId") || "");
  const answerText = String(formData.get("answerText") || "").trim() || null;
  const existingImageUrl = String(formData.get("existingAnswerImageUrl") || "").trim() || null;
  const removeImage = String(formData.get("removeAnswerImage") || "") === "true";
  const answerImageFile = formData.get("answerImageFile");

  if (!questionId) throw new Error("Question is required.");

  const { data: question } = await supabase
    .from("questions")
    .select("id, question_type, question_page_id, question_pages(subject_id)")
    .eq("id", questionId)
    .maybeSingle();

  const relation = question?.question_pages as { subject_id: string } | { subject_id: string }[] | null;
  const subjectId = Array.isArray(relation) ? relation[0]?.subject_id : relation?.subject_id;
  if (!question || !subjectId || !(await hasSubjectAccess(supabase, user.id, subjectId))) throw new Error("You cannot modify this answer.");
  if (!["structured", "essay"].includes(question.question_type)) throw new Error("This action is only for structured or essay questions.");

  let answerImageUrl = removeImage ? null : existingImageUrl;
  if (answerImageFile instanceof File && answerImageFile.size > 0) {
    if (!answerImageFile.type.startsWith("image/")) throw new Error("Answer image must be an image file.");
    if (answerImageFile.size > 8 * 1024 * 1024) throw new Error("Answer image must be 8 MB or smaller.");
    const ext = answerImageFile.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const extension = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
    const path = `${user.id}/${question.question_page_id}/answers/${questionId}-${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("question-images").upload(path, answerImageFile, {
      contentType: answerImageFile.type,
      cacheControl: "31536000",
      upsert: false,
    });
    if (uploadError) throw new Error(uploadError.message);
    answerImageUrl = supabase.storage.from("question-images").getPublicUrl(path).data.publicUrl;
  }

  if (!answerText && !answerImageUrl) throw new Error("Add answer text or upload an answer image.");

  const { error } = await supabase.from("question_answers").upsert({
    question_id: questionId,
    answer_text: answerText,
    answer_image_url: answerImageUrl,
    correct_option: null,
  }, { onConflict: "question_id" });

  if (error) throw new Error(error.message);
  revalidatePath(`/teacher/question-pages/${question.question_page_id}`);
}
