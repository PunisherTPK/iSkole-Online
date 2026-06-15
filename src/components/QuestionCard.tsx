import { Accordion } from "@/components/Accordion";
import type { Question } from "@/lib/types";

type QuestionCardProps = {
  question: Question;
  index: number;
};

export function QuestionCard({ question, index }: QuestionCardProps) {
  return (
    <article id={question.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm scroll-mt-28">
      <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Question {index + 1}</p>
      <h2 className="mt-3 text-lg font-semibold leading-7 text-slate-900">{question.question_text}</h2>
      <div className="mt-5 grid gap-3">
        <Accordion title="Show Answer">{question.answer_text}</Accordion>
        <Accordion title="Show Explanation">{question.explanation_text}</Accordion>
      </div>
    </article>
  );
}
