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

type Mode = "browse" | "practice";

type PracticeAnswer = "A" | "B" | "C" | "D" | null;

export default function QuestionPageInteractive({
  questions,
  pageType,
}: {
  questions: InteractiveQuestion[];
  pageType: "mcq" | "structured";
}) {
  const [mode, setMode] = useState<Mode>("browse");
  const isMcqPage = pageType === "mcq";
  const totalMarks = useMemo(
    () => questions.reduce((sum, question) => sum + Number(question.marks || 0), 0),
    [questions]
  );

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-card p-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("browse")}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              mode === "browse"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Browse Questions
          </button>
          <button
            type="button"
            onClick={() => setMode("practice")}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              mode === "practice"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Practice
          </button>
        </div>
      </div>

      {mode === "browse" ? (
        <BrowseMode questions={questions} pageType={pageType} totalMarks={totalMarks} />
      ) : isMcqPage ? (
        <McqPracticeMode questions={questions} totalMarks={totalMarks} />
      ) : (
        <StructuredPracticeMode questions={questions} />
      )}
    </div>
  );
}

function BrowseMode({
  questions,
  pageType,
  totalMarks,
}: {
  questions: InteractiveQuestion[];
  pageType: "mcq" | "structured";
  totalMarks: number;
}) {
  return (
    <div className="space-y-8">
      {pageType === "mcq" && (
        <div className="rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
          Select an option and check each question individually.
          <span className="ml-2 font-semibold text-foreground">Total: {totalMarks} marks</span>
        </div>
      )}
      {questions.map((question) => (
        <BrowseQuestionCard key={question.id} question={question} pageType={pageType} />
      ))}
    </div>
  );
}

function BrowseQuestionCard({
  question,
  pageType,
}: {
  question: InteractiveQuestion;
  pageType: "mcq" | "structured";
}) {
  const [selected, setSelected] = useState<PracticeAnswer>(null);
  const [checked, setChecked] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const isMcq = pageType === "mcq" || question.question_type === "mcq";
  const isCorrect = selected !== null && selected === question.correct_option;
  const earnedMarks = isCorrect ? Number(question.marks) : 0;

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <QuestionHeader question={question} />
      <div className="p-5 sm:p-6">
        {isMcq ? (
          <>
            <QuestionImage question={question} />
            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold text-foreground">Choose your answer</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(["A", "B", "C", "D"] as const).map((option) => {
                  const correct = checked && option === question.correct_option;
                  const wrong = checked && selected === option && !correct;
                  const cls = correct
                    ? "border-emerald-500 bg-emerald-500/10 text-foreground"
                    : wrong
                      ? "border-destructive bg-destructive/10 text-foreground"
                      : selected === option
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5";
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setSelected(option);
                        setChecked(false);
                        setShowAnswer(false);
                      }}
                      className={`rounded-xl border px-4 py-3 text-left font-semibold transition ${cls}`}
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
                  onClick={() => {
                    setChecked(true);
                    setShowAnswer(true);
                  }}
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
                <div
                  className={`mt-4 rounded-xl border p-4 ${
                    isCorrect
                      ? "border-emerald-500/30 bg-emerald-500/10"
                      : "border-destructive/30 bg-destructive/10"
                  }`}
                >
                  <p className="font-semibold text-foreground">{isCorrect ? "Correct!" : "Incorrect."}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You scored {earnedMarks} / {question.marks} marks.
                  </p>
                  {question.correct_option && (
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      Correct answer: {question.correct_option}
                    </p>
                  )}
                </div>
              )}
              {showAnswer && <AnswerPanel question={question} />}
            </div>
          </>
        ) : (
          <StructuredQuestionViewer question={question} />
        )}
      </div>
    </article>
  );
}

function McqPracticeMode({
  questions,
  totalMarks,
}: {
  questions: InteractiveQuestion[];
  totalMarks: number;
}) {
  const [answers, setAnswers] = useState<Record<string, PracticeAnswer>>({});
  const [submitted, setSubmitted] = useState(false);

  const answered = questions.filter((question) => answers[question.id]).length;
  const correct = questions.filter(
    (question) => answers[question.id] && answers[question.id] === question.correct_option
  ).length;
  const earnedMarks = questions.reduce(
    (sum, question) =>
      answers[question.id] && answers[question.id] === question.correct_option
        ? sum + Number(question.marks || 0)
        : sum,
    0
  );
  const percentage = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;

  if (submitted) {
    return (
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Practice Complete</p>
          <h2 className="mt-3 text-4xl font-bold text-foreground">{percentage}%</h2>
          <p className="mt-2 text-lg font-semibold text-foreground">
            {earnedMarks} / {totalMarks} marks
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <ResultStat label="Questions" value={`${questions.length}`} />
            <ResultStat label="Correct" value={`${correct}`} />
            <ResultStat label="Unanswered" value={`${questions.length - answered}`} />
          </div>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-7 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
          >
            Review Answers
          </button>
        </section>

        <div className="space-y-6">
          {questions.map((question) => (
            <PracticeReviewCard
              key={question.id}
              question={question}
              selected={answers[question.id] ?? null}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground">Practice mode</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Answer all questions first. Your answers and marks are revealed after submission.
            </p>
          </div>
          <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            {answered} / {questions.length} answered
          </span>
        </div>
      </section>

      {questions.map((question) => (
        <article key={question.id} className="overflow-hidden rounded-2xl border border-border bg-card">
          <QuestionHeader question={question} />
          <div className="p-5 sm:p-6">
            <QuestionImage question={question} />
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(["A", "B", "C", "D"] as const).map((option) => {
                const selected = answers[question.id] === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                    className={`rounded-xl border px-4 py-3 text-left font-semibold transition ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </article>
      ))}

      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur">
        <p className="text-sm font-semibold text-foreground">
          {answered} of {questions.length} answered
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(true)}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          Submit Practice
        </button>
      </div>
    </div>
  );
}

function StructuredPracticeMode({ questions }: { questions: InteractiveQuestion[] }) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card px-5 py-4">
        <p className="font-semibold text-foreground">Practice mode</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Attempt each structured or essay question first, then reveal the answer to self-check. These questions are not automatically graded.
        </p>
      </section>

      {questions.map((question) => {
        const showAnswer = Boolean(revealed[question.id]);
        return (
          <article key={question.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            <QuestionHeader question={question} />
            <div className="p-5 sm:p-6">
              {showAnswer ? (
                <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                  <div className="min-w-0">
                    <QuestionImage question={question} />
                  </div>
                  <div className="min-w-0 lg:sticky lg:top-6">
                    <AnswerPanel question={question} />
                  </div>
                </div>
              ) : (
                <QuestionImage question={question} />
              )}
              <button
                type="button"
                onClick={() => setRevealed((current) => ({ ...current, [question.id]: !showAnswer }))}
                className="mt-5 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
              >
                {showAnswer ? "Hide Answer" : "Reveal Answer"}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function PracticeReviewCard({
  question,
  selected,
}: {
  question: InteractiveQuestion;
  selected: PracticeAnswer;
}) {
  const isCorrect = selected !== null && selected === question.correct_option;
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <QuestionHeader question={question} />
      <div className="p-5 sm:p-6">
        <QuestionImage question={question} />
        <div className="mt-5 rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-sm text-muted-foreground">
            Your answer: <span className="font-semibold text-foreground">{selected ?? "Unanswered"}</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Correct answer: <span className="font-semibold text-foreground">{question.correct_option ?? "Not available"}</span>
          </p>
          <p className={`mt-2 text-sm font-semibold ${isCorrect ? "text-emerald-600" : "text-destructive"}`}>
            {selected === null ? "Not answered" : isCorrect ? "Correct" : "Incorrect"}
          </p>
        </div>
        <AnswerPanel question={question} />
      </div>
    </article>
  );
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function QuestionHeader({ question }: { question: InteractiveQuestion }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
      <h2 className="font-bold text-foreground">Question {question.question_number}</h2>
      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
        {question.marks} {question.marks === 1 ? "mark" : "marks"}
      </span>
    </div>
  );
}

function StructuredQuestionViewer({ question }: { question: InteractiveQuestion }) {
  const [showAnswer, setShowAnswer] = useState(false);
  return (
    <div className="min-h-[70vh]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">
          {question.question_type === "essay" ? "Essay Question" : "Structured Question"}
        </p>
        <button
          type="button"
          onClick={() => setShowAnswer((value) => !value)}
          className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
        >
          {showAnswer ? "Hide Answer" : "Show Answer"}
        </button>
      </div>
      {showAnswer ? (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <div className="min-w-0"><QuestionImage question={question} /></div>
          <div className="min-w-0 lg:sticky lg:top-6"><AnswerPanel question={question} /></div>
        </div>
      ) : (
        <QuestionImage question={question} />
      )}
    </div>
  );
}

function QuestionImage({ question }: { question: InteractiveQuestion }) {
  return question.question_image_url ? (
    <div className="overflow-hidden rounded-xl border border-border bg-muted/20">
      <img src={question.question_image_url} alt={`Question ${question.question_number}`} className="block h-auto w-full" />
    </div>
  ) : (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
      No question image has been uploaded yet.
    </div>
  );
}

function AnswerPanel({ question }: { question: InteractiveQuestion }) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
      {question.correct_option && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Correct Answer</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{question.correct_option}</p>
        </div>
      )}
      {question.answer_text && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Explanation</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{question.answer_text}</p>
        </div>
      )}
      {question.answer_image_url && (
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
          <img src={question.answer_image_url} alt={`Answer for question ${question.question_number}`} className="block h-auto w-full" />
        </div>
      )}
      {!question.correct_option && !question.answer_text && !question.answer_image_url && (
        <p className="text-sm text-muted-foreground">No answer has been added yet.</p>
      )}
    </div>
  );
}
