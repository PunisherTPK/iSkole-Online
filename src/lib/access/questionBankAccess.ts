import { createClient } from "@/lib/supabase/server";

export type QuestionBankAccess = "free" | "subject" | "premium";

export interface QuestionBankAccessResult {
  access: QuestionBankAccess;
  hasAnswers: boolean;
  hasDiscussion: boolean;
}

export async function getQuestionBankAccess(subjectId: string): Promise<QuestionBankAccessResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { access: "free", hasAnswers: false, hasDiscussion: false };

  const { data: profile } = await supabase.from("profiles").select("role, is_active").eq("id", user.id).maybeSingle();
  if (profile?.is_active && profile.role === "admin") {
    return { access: "premium", hasAnswers: true, hasDiscussion: true };
  }

  const { data, error } = await supabase.rpc("get_question_bank_access", {
    p_user_id: user.id,
    p_subject_id: subjectId,
  });

  if (error) {
    console.error("Question Bank access check failed:", error);
    throw new Error("Unable to determine Question Bank access.");
  }

  const access = data as QuestionBankAccess;
  const paid = access === "premium" || access === "subject";
  return { access, hasAnswers: paid, hasDiscussion: paid };
}
