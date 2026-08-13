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

function normalizeYoutubeUrl(raw: string) {
  const value = raw.trim();
  if (!value) return null;
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("Enter a valid YouTube URL."); }
  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  const validHost = hostname === "youtube.com" || hostname === "youtu.be" || hostname.endsWith(".youtube.com");
  if (!validHost) throw new Error("Discussion video must be a YouTube URL.");
  if (hostname === "youtu.be" && !url.pathname.slice(1)) throw new Error("Enter a valid YouTube video URL.");
  if (hostname.endsWith("youtube.com") && !url.searchParams.get("v") && !url.pathname.startsWith("/embed/") && !url.pathname.startsWith("/shorts/")) throw new Error("Enter a valid YouTube video URL.");
  return value;
}

export async function saveTeacherDiscussion(formData: FormData) {
  const { supabase, user } = await getTeacher();
  const pageId = String(formData.get("pageId") || "");
  const youtubeUrl = normalizeYoutubeUrl(String(formData.get("youtubeUrl") || ""));
  if (!pageId) throw new Error("Question page is required.");
  const { data: page } = await supabase.from("question_pages").select("id, subject_id").eq("id", pageId).maybeSingle();
  if (!page || !(await hasSubjectAccess(supabase, user.id, page.subject_id))) throw new Error("You cannot modify this discussion.");
  if (!youtubeUrl) {
    const { error } = await supabase.from("question_page_discussions").delete().eq("question_page_id", pageId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("question_page_discussions").upsert({ question_page_id: pageId, youtube_url: youtubeUrl }, { onConflict: "question_page_id" });
    if (error) throw new Error(error.message);
  }
  revalidatePath(`/teacher/question-pages/${pageId}`);
  revalidatePath(`/question-bank/page/${pageId}`);
}
