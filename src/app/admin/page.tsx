import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  addGrade,
  addLesson,
  addPaper,
  addQuestion,
  addSubject,
  deleteQuestion,
  isAdminAuthenticated,
  loginAdmin,
  logoutAdmin,
  updateQuestion,
} from "@/lib/admin-actions";
import { getCatalog } from "@/lib/data";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return (
      <section className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">Admin</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">Sign in</h1>
          <form action={loginAdmin} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Password
              <input
                name="password"
                type="password"
                className="min-h-11 rounded-lg border border-slate-300 px-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                required
              />
            </label>
            {error ? <p className="text-sm font-semibold text-red-600">Invalid password.</p> : null}
            <button className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white" type="submit">
              Sign in
            </button>
          </form>
        </div>
      </section>
    );
  }

  const catalog = await getCatalog();
  const adminReady = Boolean(getSupabaseAdminClient());

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">Admin</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Content Manager</h1>
          <p className="mt-2 text-slate-600">Add core content and maintain question bank entries.</p>
        </div>
        <form action={logoutAdmin}>
          <button className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700" type="submit">
            Sign out
          </button>
        </form>
      </div>

      {!adminReady ? (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Supabase admin writes require <code>SUPABASE_SERVICE_ROLE_KEY</code>. The public site still works with sample data.
        </div>
      ) : null}

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <AdminPanel title="Add Grade">
          <form action={addGrade} className="grid gap-3">
            <TextInput name="name" label="Grade name" placeholder="Grade 10" />
            <SubmitButton>Add Grade</SubmitButton>
          </form>
        </AdminPanel>

        <AdminPanel title="Add Subject">
          <form action={addSubject} className="grid gap-3">
            <Select name="grade_id" label="Grade" options={catalog.grades.map((grade) => [grade.id, grade.name])} />
            <TextInput name="name" label="Subject name" placeholder="Science" />
            <SubmitButton>Add Subject</SubmitButton>
          </form>
        </AdminPanel>

        <AdminPanel title="Add Lesson">
          <form action={addLesson} className="grid gap-3">
            <Select name="subject_id" label="Subject" options={catalog.subjects.map((subject) => [subject.id, subject.name])} />
            <TextInput name="name" label="Lesson name" placeholder="Electricity" />
            <Textarea name="description" label="Description" placeholder="Short lesson description" />
            <SubmitButton>Add Lesson</SubmitButton>
          </form>
        </AdminPanel>

        <AdminPanel title="Add Paper">
          <form action={addPaper} className="grid gap-3">
            <Select name="lesson_id" label="Lesson" options={catalog.lessons.map((lesson) => [lesson.id, lesson.name])} />
            <TextInput name="year" label="Year" placeholder="2024" type="number" />
            <TextInput name="title" label="Title" placeholder="2024 Past Paper" />
            <SubmitButton>Add Paper</SubmitButton>
          </form>
        </AdminPanel>

        <AdminPanel title="Add Question">
          <form action={addQuestion} className="grid gap-3">
            <Select name="paper_id" label="Paper" options={catalog.papers.map((paper) => [paper.id, paper.title])} />
            <Textarea name="question_text" label="Question" />
            <Textarea name="answer_text" label="Answer" />
            <Textarea name="explanation_text" label="Explanation" />
            <SubmitButton>Add Question</SubmitButton>
          </form>
        </AdminPanel>
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-slate-950">Edit Questions</h2>
        <div className="mt-5 grid gap-4">
          {catalog.questions.map((question) => (
            <div key={question.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <form action={updateQuestion} className="grid gap-3">
                <input type="hidden" name="id" value={question.id} />
                <Textarea name="question_text" label="Question" defaultValue={question.question_text} />
                <Textarea name="answer_text" label="Answer" defaultValue={question.answer_text} />
                <Textarea name="explanation_text" label="Explanation" defaultValue={question.explanation_text} />
                <div className="flex flex-wrap gap-3">
                  <SubmitButton>Save Question</SubmitButton>
                </div>
              </form>
              <form action={deleteQuestion} className="mt-3">
                <input type="hidden" name="id" value={question.id} />
                <button className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700" type="submit">
                  Delete Question
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

function AdminPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function TextInput({ label, name, placeholder, type = "text" }: { label: string; name: string; placeholder?: string; type?: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <input
        name={name}
        placeholder={placeholder}
        type={type}
        className="min-h-11 rounded-lg border border-slate-300 px-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
        required
      />
    </label>
  );
}

function Textarea({ label, name, placeholder, defaultValue }: { label: string; name: string; placeholder?: string; defaultValue?: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <textarea
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="min-h-28 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
        required
      />
    </label>
  );
}

function Select({ label, name, options }: { label: string; name: string; options: Array<[string, string]> }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <select
        name={name}
        className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
        required
      >
        {options.map(([value, labelText]) => (
          <option key={value} value={value}>
            {labelText}
          </option>
        ))}
      </select>
    </label>
  );
}

function SubmitButton({ children }: { children: ReactNode }) {
  return (
    <button className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white" type="submit">
      {children}
    </button>
  );
}
