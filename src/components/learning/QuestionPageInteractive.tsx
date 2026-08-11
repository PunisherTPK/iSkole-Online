"use client";

import { useMemo, useState } from "react";

export type InteractiveQuestion = {
  id: string;
  question_number: number;
  question_type: "mcq" | "structured" | "essay";
  marks: number;
  question_image_url: string | null;
  correct_option: "A" | "B" | "C" | "D" | null;
  answer_text: string | null;
  answer_image_url: string | null;
};

export default function QuestionPageInteractive({
  questions,
  pageType,
}: {
  questions: InteractiveQuestion[];
  pageType: "mcq" | "structured";
}) {
  const totalMarks = useMemo(
    () => questions.reduce((sum, question) => sum + Number(question.marks || 0), 0),
    [questions]
  );

  return (
    <div className="space-y-8">
      {pageType === "mcq" && (
        <div className="rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
          Select an option for each question, then check your answers.
          <span className="ml-2 font-semibold text-foreground">Total: {totalMarks} marks</span>
        </div>
      )}

      {questions.map((question) => (
        <InteractiveQuestionCard key={question.id} question={question} pageType={pageType} />
      ))}
    </div>
  );
}

function InteractiveQuestionCard({
  question,
  pageType,
}: {
  question: InteractiveQuestion;
  pageType: "mcq" | "structured";
}) {
  const [selected, setSelected] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [checked, setChecked] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const isMcq = pageType === "mcq" || question.question_type === "mcq";
  const isCorrect = selected !== null && selected === question.correct_option;
  const earnedMarks = isCorrect ? Number(question.marks) : 0;

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
        <h2 className="font-bold text-foreground">Question {question.question_number}</h2>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {question.marks} {question.marks === 1 ? "mark" : "marks"}
        </span>
      </div>

      <div className="p-5 sm:p-6">
        {question.question_image_url ? (
          <div className="overflow-hidden rounded-xl border border-border bg-muted/20">
            <img
              src={question.question_image_url}
              alt={`Question ${question.question_number}`}
              className="block h-auto w-full"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
            No question image has been uploaded yet.
          </div>
        )}

        {isMcq ? (
          <div className="mt-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(["A", "B", "C", "D"] as const).map((option) => {
                const selectedClass = selected === option
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5";

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSelected(option);
                      setChecked(false);
                    }}
                    className={`rounded-xl border px-4 py-3 text-left font-semibold transition ${selectedClass}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!selected}
                onClick={() => setChecked(true)}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                Check Answer
              </button>

              <button
                type="button"
                onClick={() => setShowAnswer((value) => !value)}
                className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
              >
                {showAnswer ? "Hide Answer" : "Show Correct Answer"}
              </button>
            </div>

            {checked && selected && (
              <div className={`mt-4 rounded-xl border p-4 ${isCorrect ? "border-emerald-500/30 bg-emerald-500/10" : "border-destructive/30 bg-destructive/10"}`}>
                <p className="font-semibold text-foreground">
                  {isCorrect ? "Correct!" : "Incorrect."}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  You scored {earnedMarks} / {question.marks} marks.
                </p>
              </div>
            )}

            {showAnswer && (
              <AnswerPanel question={question} />
            )}
          </div>
        ) : (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowAnswer((value) => !value)}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
            >
              {showAnswer ? "Hide Answer" : "Show Answer"}
            </button>

            {showAnswer && <div className="mt-4"><AnswerPanel question={question} /></div>}
          </div>
        )}
      </div>
    </article>
  );
}

function AnswerPanel({ question }: { question: InteractiveQuestion }) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Correct Answer</p>
          {question.correct_option && (
            <p className="mt-2 text-2xl font-bold text-foreground">{question.correct_option}</p>
          )}
          {question.answer_text && (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{question.answer_text}</p>
          )}
        </div>

        {question.answer_image_url && (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <img
              src={question.answer_image_url}
              alt={`Answer for question ${question.question_number}`}
              className="block h-auto w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
