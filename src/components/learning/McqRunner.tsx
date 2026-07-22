"use client";

import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { McqQuestion, QuestionSet } from "@/lib/types";
import { cn } from "@/lib/utils";

const answers = ["A", "B", "C", "D"] as const;

export function McqRunner({ questionSet, questions }: { questionSet: QuestionSet; questions: McqQuestion[] }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [submitted, setSubmitted] = useState(false);
  const question = questions[index];

  const score = useMemo(() => {
    const correct = questions.filter((item) => selected[item.id] === item.correct_answer).length;
    const incorrect = questions.length - correct;
    const percentage = questions.length ? Math.round((correct / questions.length) * 100) : 0;
    return { correct, incorrect, percentage };
  }, [questions, selected]);

  if (!question) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
        No questions have been uploaded for this section yet.
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-brand">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">MCQ Section</p>
          <h2 className="mt-1 text-2xl font-bold text-foreground">{questionSet.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">Question {index + 1} of {questions.length}</p>
        </div>
        {submitted ? (
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-background p-3 text-sm sm:grid-cols-4">
            <Score label="Total" value={questions.length} />
            <Score label="Correct" value={score.correct} />
            <Score label="Incorrect" value={score.incorrect} />
            <Score label="Score" value={`${score.percentage}%`} />
          </div>
        ) : null}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white dark:bg-black">
        <img
          src={question.question_image_url}
          alt={`Question ${index + 1}`}
          className="h-auto w-full object-contain dark:invert"
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {answers.map((answer) => {
          const isSelected = selected[question.id] === answer;
          const isCorrect = question.correct_answer === answer;
          return (
            <button
              key={answer}
              type="button"
              disabled={submitted}
              onClick={() => setSelected((current) => ({ ...current, [question.id]: answer }))}
              className={cn(
                "flex min-h-12 items-center justify-center rounded-xl border border-border bg-background text-base font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected && !submitted && "border-primary bg-primary/10 text-primary",
                submitted && isCorrect && "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                submitted && isSelected && !isCorrect && "border-destructive bg-destructive/10 text-destructive",
              )}
            >
              {answer}
              {submitted && isCorrect ? <Check className="ml-2 h-4 w-4" aria-hidden="true" /> : null}
              {submitted && isSelected && !isCorrect ? <X className="ml-2 h-4 w-4" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>

      {submitted ? (
        <p className="mt-4 rounded-xl bg-muted/10 p-4 text-sm leading-6 text-muted-foreground">
          Correct answer: <span className="font-bold text-foreground">{question.correct_answer}</span>
          {selected[question.id] ? <>. Your answer: <span className="font-bold text-foreground">{selected[question.id]}</span>.</> : ". You did not answer this question."}
          {question.explanation ? <> {question.explanation}</> : null}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" className="rounded-xl" disabled={index === 0} onClick={() => setIndex((current) => Math.max(0, current - 1))}>
          <ChevronLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Previous
        </Button>
        <div className="flex gap-2">
          {!submitted ? (
            <Button className="rounded-xl" onClick={() => setSubmitted(true)}>Submit Section</Button>
          ) : null}
          <Button variant="outline" className="rounded-xl" disabled={index === questions.length - 1} onClick={() => setIndex((current) => Math.min(questions.length - 1, current + 1))}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}

function Score({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-muted/10 px-3 py-2 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-bold text-foreground">{value}</p>
    </div>
  );
}
