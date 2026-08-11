import { createClient } from "@/lib/supabase/server";

export type QuestionBankAccess =
  | "free"
  | "subject"
  | "premium";

export interface QuestionBankAccessResult {
  access: QuestionBankAccess;
  hasAnswers: boolean;
  hasPractice: boolean;
  hasDiscussion: boolean;
}

export async function getQuestionBankAccess(
  subjectId: string
): Promise<QuestionBankAccessResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
   * -------------------------------------------------------
   * Not logged in
   * -------------------------------------------------------
   *
   * Public Question Bank content is still available,
   * but paid functionality is unavailable.
   */
  if (!user) {
    return {
      access: "free",
      hasAnswers: false,
      hasPractice: false,
      hasDiscussion: false,
    };
  }

  /*
   * -------------------------------------------------------
   * Ask PostgreSQL for the user's access level.
   * -------------------------------------------------------
   *
   * The database function checks:
   *
   * 1. Active Premium subscription
   * 2. Active purchase for this subject
   * 3. Otherwise Free
   */
  const { data, error } = await supabase.rpc(
    "get_question_bank_access",
    {
      p_user_id: user.id,
      p_subject_id: subjectId,
    }
  );

  if (error) {
    console.error(
      "Question Bank access check failed:",
      error
    );

    throw new Error(
      "Unable to determine Question Bank access."
    );
  }

  const access = data as QuestionBankAccess;

  /*
   * -------------------------------------------------------
   * Premium / Subject Access
   * -------------------------------------------------------
   *
   * Both have:
   * - Answers
   * - Practice
   * - Discussion videos
   */
  if (access === "premium" || access === "subject") {
    return {
      access,
      hasAnswers: true,
      hasPractice: true,
      hasDiscussion: true,
    };
  }

  /*
   * -------------------------------------------------------
   * Free Access
   * -------------------------------------------------------
   *
   * Free students can see questions only.
   */
  return {
    access: "free",
    hasAnswers: false,
    hasPractice: false,
    hasDiscussion: false,
  };
}