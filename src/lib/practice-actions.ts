"use server";

import { createClient } from "@/lib/supabase/server";

export type PracticeSubmission = {
  questionPageId: string;
  pageType: "mcq" | "structured";
  totalQuestions: number;
  answeredQuestions: number;
  correctQuestions: number;
  earnedMarks: number;
  totalMarks: number;
  attempts: Array<{
    questionId: string;
    selectedOption: "A" | "B" | "C" | "D" | null;
    isCorrect: boolean | null;
    earnedMarks: number;
  }>;
};

export async function savePracticeResult(submission: PracticeSubmission) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("You must be logged in to save practice results.");
  if (!submission.questionPageId) throw new Error("Question Page is required.");

  const { data: session, error: sessionError } = await supabase
    .from("practice_sessions")
    .insert({
      user_id: user.id,
      question_page_id: submission.questionPageId,
      page_type: submission.pageType,
      total_questions: submission.totalQuestions,
      answered_questions: submission.answeredQuestions,
      correct_questions: submission.correctQuestions,
      earned_marks: submission.earnedMarks,
      total_marks: submission.totalMarks,
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (sessionError || !session) throw new Error(sessionError?.message ?? "Could not save practice session.");

  if (submission.attempts.length > 0) {
    const { error: attemptsError } = await supabase.from("practice_attempts").insert(
      submission.attempts.map((attempt) => ({
        session_id: session.id,
        question_id: attempt.questionId,
        selected_option: attempt.selectedOption,
        is_correct: attempt.isCorrect,
        earned_marks: attempt.earnedMarks,
      }))
    );

    if (attemptsError) throw new Error(attemptsError.message);
  }

  return { sessionId: session.id };
}
