"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Eye, FileImage, Loader2, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type QuestionPage = {
  id: string;
  subject_id: string;
  content_node_id: string | null;
  title: string;
  description: string | null;
  page_type: string;
  is_published: boolean;
};

type Question = {
  id: string;
  question_page_id: string;
  question_number: number | null;
  question_type: string;
  marks: number;
  order_index: number;
  question_image_url: string | null;
  paper_code: string | null;
  paper_question_number: string | null;
};

type Answer = {
  id: string | null;
  question_id: string;
  answer_image_url: string | null;
  answer_text: string | null;
  correct_option: string | null;
};

const inputClass = "mt-2 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10";

export default function QuestionPageEditor() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const pageId = params.id;

  const [page, setPage] = useState<QuestionPage | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [discussionUrl, setDiscussionUrl] = useState("");
  const [savedDiscussionUrl, setSavedDiscussionUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [videoSaving, setVideoSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState<"question" | "answer" | null>(null);
  const [deletingPage, setDeletingPage] = useState(false);

  async function load() {
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "teacher" && profile?.role !== "admin") {
      router.replace("/");
      return;
    }

    if (!pageId) {
      setError("Question Page ID is missing.");
      setLoading(false);
      return;
    }

    const { data: pageData, error: pageError } = await supabase
      .from("question_pages")
      .select("id, subject_id, content_node_id, title, description, page_type, is_published")
      .eq("id", pageId)
      .maybeSingle();

    if (pageError || !pageData) {
      setError(pageError?.message ?? "Question Page not found.");
      setLoading(false);
      return;
    }

    const { data: discussionData, error: discussionError } = await supabase
      .from("question_page_discussions")
      .select("id, youtube_url")
      .eq("question_page_id", pageId)
      .maybeSingle();

    if (discussionError) {
      setError(discussionError.message);
      setLoading(false);
      return;
    }

    const existingDiscussionUrl = discussionData?.youtube_url ?? "";
    setDiscussionUrl(existingDiscussionUrl);
    setSavedDiscussionUrl(existingDiscussionUrl);

    const { data: questionData, error: questionError } = await supabase
      .from("questions")
      .select("id, question_page_id, question_number, question_type, marks, order_index, question_image_url, paper_code, paper_question_number")
      .eq("question_page_id", pageId)
      .order("order_index", { ascending: true });

    if (questionError) {
      setError(questionError.message);
      setLoading(false);
      return;
    }

    const questionRows = (questionData ?? []) as Question[];
    const ids = questionRows.map((question) => question.id);
    let answerRows: Answer[] = [];

    if (ids.length) {
      const { data, error: answerError } = await supabase
        .from("question_answers")
        .select("id, question_id, answer_image_url, answer_text, correct_option")
        .in("question_id", ids);

      if (answerError) {
        setError(answerError.message);
        setLoading(false);
        return;
      }

      answerRows = (data ?? []) as Answer[];
    }

    setPage(pageData as QuestionPage);
    setQuestions(questionRows);
    setAnswers(Object.fromEntries(answerRows.map((answer) => [answer.question_id, answer])));
    setSelectedId((current) => current && ids.includes(current) ? current : ids[0] ?? null);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [pageId]);

  async function uploadImage(file: File, folder: "questions" | "answers") {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${folder}/${crypto.randomUUID()}.${extension}`;
    const bucket = folder === "questions" ? "question-images" : "answer-images";

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: false, contentType: file.type });

    if (uploadError) throw new Error(uploadError.message);

    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  async function addQuestion() {
    if (!page) return;
    setSaving(true);
    setError("");

    try {
      const nextOrder = questions.length ? Math.max(...questions.map((question) => question.order_index)) + 1 : 0;
      const nextNumber = questions.length ? Math.max(...questions.map((question) => question.question_number ?? 0)) + 1 : 1;

      const { data, error: insertError } = await supabase
        .from("questions")
        .insert({ question_page_id: page.id, question_number: nextNumber, question_type: page.page_type, marks: 1, order_index: nextOrder })
        .select("id, question_page_id, question_number, question_type, marks, order_index, question_image_url, paper_code, paper_question_number")
        .single();

      if (insertError) throw new Error(insertError.message);
      const question = data as Question;
      setQuestions((current) => [...current, question]);
      setSelectedId(question.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add question.");
    } finally {
      setSaving(false);
    }
  }

  async function saveQuestion(question: Question) {
    setSaving(true);
    setError("");

    try {
      const { error: updateError } = await supabase.from("questions").update({
        question_number: question.question_number,
        marks: question.marks,
        paper_code: question.paper_code?.trim() || null,
        paper_question_number: question.paper_question_number?.trim() || null,
      }).eq("id", question.id);

      if (updateError) throw new Error(updateError.message);
      const answer = answers[question.id];

      if (answer) {
        const payload = {
          question_id: question.id,
          answer_text: answer.answer_text?.trim() || null,
          correct_option: answer.correct_option || null,
          answer_image_url: answer.answer_image_url || null,
        };

        if (answer.id) {
          const { error: answerError } = await supabase.from("question_answers").update(payload).eq("id", answer.id);
          if (answerError) throw new Error(answerError.message);
        } else {
          const { data: insertedAnswer, error: answerError } = await supabase.from("question_answers").insert(payload).select("id, question_id, answer_image_url, answer_text, correct_option").single();
          if (answerError) throw new Error(answerError.message);
          setAnswers((current) => ({ ...current, [question.id]: insertedAnswer as Answer }));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save question.");
    } finally {
      setSaving(false);
    }
  }

  async function saveDiscussionVideo() {
    if (!page) return;
    const url = discussionUrl.trim();
    setVideoSaving(true);
    setError("");

    try {
      if (!url) {
        const { error: deleteError } = await supabase.from("question_page_discussions").delete().eq("question_page_id", page.id);
        if (deleteError) throw new Error(deleteError.message);
        setSavedDiscussionUrl("");
        return;
      }

      const { data: existing, error: findError } = await supabase.from("question_page_discussions").select("id").eq("question_page_id", page.id).maybeSingle();
      if (findError) throw new Error(findError.message);

      if (existing?.id) {
        const { error: updateError } = await supabase.from("question_page_discussions").update({ youtube_url: url }).eq("id", existing.id);
        if (updateError) throw new Error(updateError.message);
      } else {
        const { error: insertError } = await supabase.from("question_page_discussions").insert({ question_page_id: page.id, youtube_url: url });
        if (insertError) throw new Error(insertError.message);
      }
      setSavedDiscussionUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save discussion video.");
    } finally {
      setVideoSaving(false);
    }
  }

  async function removeQuestion(id: string) {
    if (!confirm("Delete this question?")) return;
    setSaving(true);
    setError("");
    const { error: deleteError } = await supabase.from("questions").delete().eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setQuestions((current) => current.filter((question) => question.id !== id));
      setAnswers((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      setSelectedId((current) => current === id ? null : current);
    }
    setSaving(false);
  }

  async function deleteQuestionPage() {
    if (!page || deletingPage) return;
    const confirmed = window.confirm(`Delete "${page.title}"? This will permanently delete the Question Page, its questions, answers, and discussion video. This cannot be undone.`);
    if (!confirmed) return;

    setDeletingPage(true);
    setError("");
    try {
      const { error: deleteError } = await supabase.from("question_pages").delete().eq("id", page.id);
      if (deleteError) throw new Error(deleteError.message);
      router.replace("/teacher/studio");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete Question Page.");
      setDeletingPage(false);
    }
  }

  async function togglePublished() {
    if (!page) return;
    if (!page.is_published) {
      if (questions.length === 0) {
        setError("Add at least one question before publishing.");
        return;
      }
      for (const question of questions) {
        if (!question.question_number || question.marks <= 0) {
          setError(`Question ${question.question_number ?? "?"} needs a valid number and marks.`);
          return;
        }
        if (page.page_type === "mcq" && !answers[question.id]?.correct_option) {
          setError(`Question ${question.question_number} needs a correct MCQ option.`);
          return;
        }
      }
    }

    setPublishing(true);
    setError("");
    try {
      const { error: updateError } = await supabase.from("question_pages").update({ is_published: !page.is_published }).eq("id", page.id);
      if (updateError) throw new Error(updateError.message);
      setPage((current) => current ? { ...current, is_published: !current.is_published } : current);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update publication status.");
    } finally {
      setPublishing(false);
    }
  }

  async function handleQuestionImage(question: Question, file: File) {
    setUploading("question");
    setError("");
    try {
      const url = await uploadImage(file, "questions");
      const { error: updateError } = await supabase.from("questions").update({ question_image_url: url }).eq("id", question.id);
      if (updateError) throw new Error(updateError.message);
      setQuestions((current) => current.map((item) => item.id === question.id ? { ...item, question_image_url: url } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload question image.");
    } finally {
      setUploading(null);
    }
  }

  async function handleAnswerImage(question: Question, file: File) {
    setUploading("answer");
    setError("");
    try {
      const url = await uploadImage(file, "answers");
      const existing = answers[question.id];
      if (existing?.id) {
        const { error: updateError } = await supabase.from("question_answers").update({ answer_image_url: url }).eq("id", existing.id);
        if (updateError) throw new Error(updateError.message);
        setAnswers((current) => ({ ...current, [question.id]: { ...existing, answer_image_url: url } }));
      } else {
        const { data, error: insertError } = await supabase.from("question_answers").insert({ question_id: question.id, answer_image_url: url }).select("id, question_id, answer_image_url, answer_text, correct_option").single();
        if (insertError) throw new Error(insertError.message);
        setAnswers((current) => ({ ...current, [question.id]: data as Answer }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload answer image.");
    } finally {
      setUploading(null);
    }
  }

  function updateQuestion(id: string, patch: Partial<Question>) {
    setQuestions((current) => current.map((question) => question.id === id ? { ...question, ...patch } : question));
  }

  function updateAnswer(id: string, patch: Partial<Answer>) {
    setAnswers((current) => ({ ...current, [id]: { ...(current[id] ?? { id: null, question_id: id, answer_image_url: null, answer_text: null, correct_option: null }), ...patch } }));
  }

  function getYouTubeEmbedUrl(url: string) {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes("youtu.be")) {
        const id = parsed.pathname.slice(1);
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (parsed.hostname.includes("youtube.com")) {
        const id = parsed.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      return null;
    } catch {
      return null;
    }
  }

  if (loading) return <div className="space-y-5"><div className="h-20 animate-pulse rounded-2xl bg-muted" /><div className="h-[500px] animate-pulse rounded-2xl bg-muted" /></div>;

  if (!page) return <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">{error || "Question Page not found."}</div>;

  const selected = questions.find((question) => question.id === selectedId) ?? null;
  const selectedAnswer = selected ? answers[selected.id] : undefined;
  const videoEmbedUrl = getYouTubeEmbedUrl(savedDiscussionUrl);

  if (previewMode) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Preview</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight">{page.title}</h1>{page.description && <p className="mt-1 text-sm text-muted-foreground">{page.description}</p>}</div>
          <button type="button" onClick={() => setPreviewMode(false)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted"><X className="h-4 w-4" /> Exit Preview</button>
        </div>
        <section className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-7">
          {questions.length === 0 ? <div className="py-16 text-center text-sm text-muted-foreground">No questions have been added yet.</div> : questions.map((question, index) => {
            const answer = answers[question.id];
            return <article key={question.id} className="rounded-2xl border border-border p-4 sm:p-6"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">Question {question.question_number ?? index + 1}</h2><span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{question.marks} mark{Number(question.marks) === 1 ? "" : "s"}</span></div>{question.question_image_url && <img src={question.question_image_url} alt={`Question ${question.question_number ?? index + 1}`} className="mt-4 max-h-[650px] w-full rounded-xl border border-border object-contain" />}{page.page_type === "mcq" && <div className="mt-5 grid gap-2 sm:grid-cols-2"><div className="rounded-xl border border-border px-4 py-3">A</div><div className="rounded-xl border border-border px-4 py-3">B</div><div className="rounded-xl border border-border px-4 py-3">C</div><div className="rounded-xl border border-border px-4 py-3">D</div></div>}{answer?.answer_text && <div className="mt-5 rounded-xl bg-muted/50 p-4 text-sm"><p className="font-semibold">Answer / Explanation</p><p className="mt-2 whitespace-pre-wrap text-muted-foreground">{answer.answer_text}</p></div>}</article>;
          })}
        </section>
        {videoEmbedUrl && <section className="rounded-2xl border border-border bg-card p-5 sm:p-7"><h2 className="text-lg font-bold">Discussion Video</h2><div className="mt-4 aspect-video overflow-hidden rounded-2xl bg-black"><iframe src={videoEmbedUrl} title="Discussion video" className="h-full w-full" allowFullScreen /></div></section>}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button type="button" onClick={() => router.push("/teacher/studio")} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Teacher Studio</button>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Question Page · {page.page_type.toUpperCase()}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3"><h1 className="text-2xl font-extrabold tracking-tight">{page.title}</h1><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${page.is_published ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>{page.is_published ? "Published" : "Draft"}</span></div>
          {page.description && <p className="mt-1 text-sm text-muted-foreground">{page.description}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void togglePublished()} disabled={publishing || deletingPage} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">{publishing ? "Updating..." : page.is_published ? "Unpublish" : "Publish"}</button>
          <button type="button" onClick={() => setPreviewMode(true)} disabled={deletingPage} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted disabled:opacity-50"><Eye className="h-4 w-4" /> Preview</button>
          <button type="button" onClick={() => void addQuestion()} disabled={saving || deletingPage} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted disabled:opacity-50"><Plus className="h-4 w-4" /> Add Question</button>
          <button type="button" onClick={() => void deleteQuestionPage()} disabled={deletingPage} className="inline-flex h-10 items-center gap-2 rounded-xl border border-destructive/20 px-4 text-sm font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"><Trash2 className="h-4 w-4" /> {deletingPage ? "Deleting..." : "Delete Q Page"}</button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-border bg-card p-3">
          <div className="px-2 py-2"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Questions</p><p className="mt-1 text-xs text-muted-foreground">{questions.length} question{questions.length === 1 ? "" : "s"}</p></div>
          <div className="mt-2 space-y-1">{questions.map((question, index) => <button key={question.id} type="button" onClick={() => setSelectedId(question.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left ${selectedId === question.id ? "bg-primary/10 text-primary" : "hover:bg-muted/50"}`}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold">{question.question_number ?? index + 1}</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Question {question.question_number ?? index + 1}</span><span className="block text-[11px] text-muted-foreground">{question.marks} mark{Number(question.marks) === 1 ? "" : "s"}</span></span></button>)}</div>
          {!questions.length && <div className="px-2 py-10 text-center text-xs text-muted-foreground">No questions yet.<br />Add your first question.</div>}
        </aside>

        <main className="min-w-0 rounded-2xl border border-border bg-card p-5">
          {!selected ? <div className="flex min-h-[420px] flex-col items-center justify-center text-center"><FileImage className="h-8 w-8 text-muted-foreground" /><h2 className="mt-4 text-lg font-bold">Start building this Question Page</h2><p className="mt-2 max-w-sm text-sm text-muted-foreground">Add questions and upload question images, answers, marks and correct options here.</p></div> : (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold text-primary">iSkole Question {selected.question_number ?? 1}</p><h2 className="mt-1 text-lg font-bold">{page.page_type === "mcq" ? "Multiple Choice Question" : "Structured Question"}</h2></div><button type="button" onClick={() => void removeQuestion(selected.id)} disabled={saving || uploading !== null || deletingPage} className="rounded-xl p-2 text-destructive hover:bg-destructive/10 disabled:opacity-50" aria-label="Delete question"><Trash2 className="h-4 w-4" /></button></div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="text-sm font-semibold">iSkole Question No.<input type="number" min="1" value={selected.question_number ?? ""} onChange={(e) => updateQuestion(selected.id, { question_number: e.target.value ? Number(e.target.value) : null })} className={inputClass} placeholder="Shown to students" /></label>
                <label className="text-sm font-semibold">Original Paper Q No.<input value={selected.paper_question_number ?? ""} onChange={(e) => updateQuestion(selected.id, { paper_question_number: e.target.value })} className={inputClass} placeholder="Teacher reference" /></label>
                <label className="text-sm font-semibold">Paper Code<input value={selected.paper_code ?? ""} onChange={(e) => updateQuestion(selected.id, { paper_code: e.target.value })} className={inputClass} placeholder="Optional" /></label>
                <label className="text-sm font-semibold">Marks<input type="number" min="0" step="0.5" value={selected.marks} onChange={(e) => updateQuestion(selected.id, { marks: Number(e.target.value) })} className={inputClass} /></label>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-bold">Question Image</h3><p className="mt-1 text-xs text-muted-foreground">Upload the complete question, including choices if it is an MCQ.</p></div><label className={`inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold ${uploading ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-muted"}`}><Upload className="h-4 w-4" /> {uploading === "question" ? "Uploading..." : "Upload"}<input type="file" accept="image/*" disabled={uploading !== null || deletingPage} className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void handleQuestionImage(selected, file); e.currentTarget.value = ""; }} /></label></div>
                {uploading === "question" && <div className="mt-4 rounded-xl bg-muted/50 p-3"><div className="flex items-center gap-3 text-xs font-semibold"><Loader2 className="h-4 w-4 animate-spin text-primary" /> Uploading question image...</div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full w-1/2 animate-pulse rounded-full bg-primary" /></div></div>}
                {selected.question_image_url ? <img src={selected.question_image_url} alt={`Question ${selected.question_number ?? 1}`} className="mt-4 max-h-[560px] w-full rounded-xl border border-border object-contain" /> : !uploading && <div className="mt-4 flex h-36 items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">No question image uploaded</div>}
              </div>
              <div className="rounded-2xl border border-border p-4">
                <h3 className="text-sm font-bold">Answer / Marking</h3><p className="mt-1 text-xs text-muted-foreground">Store the answer or marking guidance for this question.</p>
                {page.page_type === "mcq" && <label className="mt-4 block text-sm font-semibold">Correct Option<select value={selectedAnswer?.correct_option ?? ""} onChange={(e) => updateAnswer(selected.id, { correct_option: e.target.value || null })} className={inputClass}><option value="">Select correct option</option><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option></select></label>}
                <label className="mt-4 block text-sm font-semibold">Answer / Explanation<textarea value={selectedAnswer?.answer_text ?? ""} onChange={(e) => updateAnswer(selected.id, { answer_text: e.target.value })} className="mt-2 min-h-28 w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder={page.page_type === "mcq" ? "Optional explanation" : "Enter the answer or marking guidance"} /></label>
                <div className="mt-4 flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Answer Image</p><p className="mt-1 text-xs text-muted-foreground">Optional solution/reference image.</p></div><label className={`inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold ${uploading ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-muted"}`}><Upload className="h-4 w-4" /> {uploading === "answer" ? "Uploading..." : "Upload"}<input type="file" accept="image/*" disabled={uploading !== null || deletingPage} className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void handleAnswerImage(selected, file); e.currentTarget.value = ""; }} /></label></div>
                {uploading === "answer" && <div className="mt-4 rounded-xl bg-muted/50 p-3"><div className="flex items-center gap-3 text-xs font-semibold"><Loader2 className="h-4 w-4 animate-spin text-primary" /> Uploading answer image...</div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full w-1/2 animate-pulse rounded-full bg-primary" /></div></div>}
                {selectedAnswer?.answer_image_url && <img src={selectedAnswer.answer_image_url} alt="Answer" className="mt-4 max-h-80 w-full rounded-xl border border-border object-contain" />}
              </div>
              <div className="flex justify-end"><button type="button" onClick={() => void saveQuestion(selected)} disabled={saving || uploading !== null || deletingPage} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Question</button></div>
            </div>
          )}
        </main>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Discussion Video</p><h2 className="mt-1 text-lg font-bold">Video explanation</h2><p className="mt-1 text-sm text-muted-foreground">Add one YouTube discussion video for this Question Page.</p></div>{videoEmbedUrl && <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">Video saved</span>}</div>
        <label className="mt-5 block text-sm font-semibold">YouTube URL<input value={discussionUrl} onChange={(e) => setDiscussionUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className={inputClass} /></label>
        <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => void saveDiscussionVideo()} disabled={videoSaving || deletingPage} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">{videoSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {videoSaving ? "Saving..." : "Save Video"}</button>{savedDiscussionUrl && <button type="button" onClick={() => { setDiscussionUrl(""); void saveDiscussionVideo(); }} disabled={videoSaving || deletingPage} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted disabled:opacity-50">Remove</button>}</div>
        {videoEmbedUrl ? <div className="mt-5 aspect-video overflow-hidden rounded-2xl bg-black"><iframe src={videoEmbedUrl} title="Discussion video" className="h-full w-full" allowFullScreen /></div> : <div className="mt-5 flex h-36 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">No discussion video added.</div>}
      </section>
    </div>
  );
}
