"use server";

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
  const password = String(formData.get("password") ?? "");

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

export async function addGrade(formData: FormData) {
  await requireAdmin();
  const supabase = requireSupabase();
  await supabase.from("grades").insert({ name: text(formData, "name") });
  revalidatePath("/", "layout");
}

export async function addSubject(formData: FormData) {
  await requireAdmin();
  const supabase = requireSupabase();
  await supabase.from("subjects").insert({
    grade_id: text(formData, "grade_id"),
    name: text(formData, "name"),
  });
  revalidatePath("/", "layout");
}

export async function addLesson(formData: FormData) {
  await requireAdmin();
  const supabase = requireSupabase();
  await supabase.from("lessons").insert({
    subject_id: text(formData, "subject_id"),
    name: text(formData, "name"),
    description: text(formData, "description"),
  });
  revalidatePath("/", "layout");
}

export async function addPaper(formData: FormData) {
  await requireAdmin();
  const supabase = requireSupabase();
  await supabase.from("papers").insert({
    lesson_id: text(formData, "lesson_id"),
    year: Number(text(formData, "year")),
    title: text(formData, "title"),
  });
  revalidatePath("/", "layout");
}

export async function addQuestion(formData: FormData) {
  await requireAdmin();
  const supabase = requireSupabase();
  await supabase.from("questions").insert({
    paper_id: text(formData, "paper_id"),
    question_text: text(formData, "question_text"),
    answer_text: text(formData, "answer_text"),
    explanation_text: text(formData, "explanation_text"),
  });
  revalidatePath("/", "layout");
}

export async function updateQuestion(formData: FormData) {
  await requireAdmin();
  const supabase = requireSupabase();
  await supabase
    .from("questions")
    .update({
      question_text: text(formData, "question_text"),
      answer_text: text(formData, "answer_text"),
      explanation_text: text(formData, "explanation_text"),
    })
    .eq("id", text(formData, "id"));
  revalidatePath("/", "layout");
}

export async function deleteQuestion(formData: FormData) {
  await requireAdmin();
  const supabase = requireSupabase();
  await supabase.from("questions").delete().eq("id", text(formData, "id"));
  revalidatePath("/", "layout");
}

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }
}

function requireSupabase() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Supabase admin credentials are required for content management.");
  }
  return supabase;
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function adminToken() {
  if (!process.env.ADMIN_PASSWORD) return null;
  return createHmac("sha256", process.env.ADMIN_PASSWORD).update("iskole-online-admin").digest("hex");
}
