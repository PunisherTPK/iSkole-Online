"use client";

import { useState } from "react";

type Option = "A" | "B" | "C" | "D";

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

export default function QuestionPageInteractive({ questions, pageType }: { questions: InteractiveQuestion[]; pageType: "mcq" | "structured" }) {
  const totalMarks = questions.reduce((sum, q) => sum + Number(q.marks || 0), 0);
  return <div className="space-y-8">
    {pageType === "mcq" && <div className="rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">Select an option and check each question individually. <span className="ml-2 font-semibold text-foreground">Total: {totalMarks} marks</span></div>}
    {questions.map(q => <BrowseCard key={q.id} question={q} pageType={pageType} />)}
  </div>;
}

function BrowseCard({ question, pageType }: { question: InteractiveQuestion; pageType: "mcq" | "structured" }) {
  const [selected, setSelected] = useState<Option | null>(null); const [checked, setChecked] = useState(false); const [showAnswer, setShowAnswer] = useState(false);
  const isMcq = pageType === "mcq" || question.question_type === "mcq"; const correct = selected !== null && selected === question.correct_option;
  return <article className={`overflow-hidden rounded-2xl border border-border bg-card ${!isMcq ? "min-h-[75vh]" : ""}`}><Header question={question} /><div className="p-5 sm:p-6">{isMcq ? <><QuestionImage question={question} /><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{(["A", "B", "C", "D"] as Option[]).map(option => <button key={option} type="button" onClick={() => { setSelected(option); setChecked(false); setShowAnswer(false); }} className={`rounded-xl border px-4 py-3 font-semibold transition ${checked && option === question.correct_option ? "border-emerald-500 bg-emerald-500/10" : checked && selected === option ? "border-destructive bg-destructive/10" : selected === option ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40 hover:bg-primary/5"}`}>{option}</button>)}</div><div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={!selected} onClick={() => { setChecked(true); setShowAnswer(true); }} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">Check Answer</button><button type="button" onClick={() => setShowAnswer(v => !v)} className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold">{showAnswer ? "Hide Answer" : "Show Correct Answer"}</button></div>{checked && selected && <div className={`mt-4 rounded-xl border p-4 ${correct ? "border-emerald-500/30 bg-emerald-500/10" : "border-destructive/30 bg-destructive/10"}`}><p className="font-semibold">{correct ? "Correct!" : "Incorrect."}</p><p className="mt-1 text-sm text-muted-foreground">You scored {correct ? question.marks : 0} / {question.marks} marks.</p></div>}{showAnswer && <AnswerPanel question={question} />}</> : <StructuredViewer question={question} />}</div></article>;
}

function StructuredViewer({ question }: { question: InteractiveQuestion }) { const [show, setShow] = useState(false); return <div className="min-h-[70vh]"><div className="mb-5 flex items-center justify-between gap-3"><p className="text-sm font-semibold">{question.question_type === "essay" ? "Essay Question" : "Structured Question"}</p><button type="button" onClick={() => setShow(v => !v)} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold">{show ? "Hide Answer" : "Show Answer"}</button></div>{show ? <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start"><QuestionImage question={question} /><div className="lg:sticky lg:top-6"><AnswerPanel question={question} /></div></div> : <QuestionImage question={question} />}</div>; }
function QuestionImage({ question }: { question: InteractiveQuestion }) { return question.question_image_url ? <div className="overflow-hidden rounded-xl border border-border bg-muted/20"><img src={question.question_image_url} alt={`Question ${question.question_number}`} className="block h-auto w-full" /></div> : <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">No question image has been uploaded yet.</div>; }
function AnswerPanel({ question }: { question: InteractiveQuestion }) { return <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">{question.correct_option && <><p className="text-xs font-semibold uppercase tracking-wide text-primary">Correct Answer</p><p className="mt-2 text-2xl font-bold">{question.correct_option}</p></>}{question.answer_text && <div className="mt-4"><p className="text-xs font-semibold uppercase tracking-wide text-primary">Answer / Explanation</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{question.answer_text}</p></div>}{question.answer_image_url && <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card"><img src={question.answer_image_url} alt={`Answer for question ${question.question_number}`} className="block h-auto w-full" /></div>}{!question.correct_option && !question.answer_text && !question.answer_image_url && <p className="text-sm text-muted-foreground">No answer has been added yet.</p>}</div>; }
function Header({ question }: { question: InteractiveQuestion }) { return <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6"><h2 className="font-bold">Question {question.question_number}</h2><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{question.marks} {question.marks === 1 ? "mark" : "marks"}</span></div>; }
