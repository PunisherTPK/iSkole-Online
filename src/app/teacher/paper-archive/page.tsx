"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Archive, Check, Clipboard, Download, FileDown, FileText, Loader2, Plus, Search, Trash2, Upload } from "lucide-react";

type Part = { label: string; prompt: string; marks: number };
type ArchiveQuestion = {
  id: string; subject_code: string; paper_number: string; session: string; year: number; question_number: string;
  question_type: "mcq" | "structured"; marks: number; question_images: string[]; answer_images: string[];
  explanation_images: string[]; correct_option: string | null; marking_text: string | null; explanation_text: string | null;
  teacher_comment: string | null; parts: Part[]; tags: string[]; created_by: string;
};
type Tab = "upload" | "browse";
type ImageListProps = { label: string; files: File[]; setFiles: (files: File[]) => void; hint?: string };
const inputClass = "mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10";

function parsePaperCode(value: string) {
  const match = value.trim().toUpperCase().match(/^([A-Z0-9]{1,24})\/([A-Z0-9]{1,12})\/(M\/J|O\/N)\/(\d{2})$/);
  return match ? { subject_code: match[1], paper_number: match[2], session: match[3], year: Number(match[4]) } : null;
}

async function uploadImage(file: File, bucket: "question-images" | "answer-images") {
  const form = new FormData(); form.set("file", file); form.set("bucket", bucket);
  const response = await fetch("/api/teacher/image", { method: "POST", body: form });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Image upload failed.");
  return data.url as string;
}

function ImageList({ label, files, setFiles, hint }: ImageListProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  useEffect(() => { const urls = files.map((file) => URL.createObjectURL(file)); setPreviews(urls); return () => urls.forEach((url) => URL.revokeObjectURL(url)); }, [files]);
  function onPaste(event: React.ClipboardEvent<HTMLDivElement>) {
    const pasted = Array.from(event.clipboardData.items).filter((item) => item.type.startsWith("image/")).map((item) => item.getAsFile()).filter((file): file is File => Boolean(file));
    if (!pasted.length) return;
    event.preventDefault(); setFiles([...files, ...pasted]);
  }
  return <div tabIndex={0} onPaste={onPaste} className="rounded-2xl border border-dashed border-border p-4 outline-none focus-within:border-primary/40 focus:border-primary/40">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-sm font-bold">{label}</h3><p className="mt-1 text-xs text-muted-foreground">{hint ?? "Select several images or focus here and paste with Ctrl+V. Images are compressed when saved."}</p></div><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"><Upload className="h-4 w-4" /> Add images<input type="file" multiple accept="image/*" className="hidden" onChange={(event) => { setFiles([...files, ...Array.from(event.target.files ?? [])]); event.currentTarget.value = ""; }} /></label></div>
    {files.length > 0 ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{files.map((file, index) => <div key={`${file.name}-${file.size}-${index}`} className="flex items-center gap-3 rounded-lg bg-muted/40 p-2 text-xs"><img src={previews[index]} alt={`${label} ${index + 1}`} className="h-16 w-20 shrink-0 rounded-md border border-border bg-background object-contain" /><span className="min-w-0 flex-1 truncate">{index + 1}. {file.name}</span><button type="button" onClick={() => setFiles(files.filter((_, fileIndex) => fileIndex !== index))} className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 font-semibold text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /> Remove</button></div>)}</div> : <p className="mt-3 rounded-lg bg-muted/30 p-3 text-center text-xs text-muted-foreground">No images added. Paste images here or use Add images.</p>}
  </div>;
}

export default function PaperArchivePage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("upload");
  const [userId, setUserId] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [paperCode, setPaperCode] = useState("");
  const [questionNumber, setQuestionNumber] = useState("");
  const [questionType, setQuestionType] = useState<"mcq" | "structured">("structured");
  const [marks, setMarks] = useState("1");
  const [correctOption, setCorrectOption] = useState("");
  const [markingText, setMarkingText] = useState("");
  const [explanationText, setExplanationText] = useState("");
  const [teacherComment, setTeacherComment] = useState("");
  const [parts, setParts] = useState<Part[]>([]);
  const [tags, setTags] = useState("");
  const [questionFiles, setQuestionFiles] = useState<File[]>([]);
  const [answerFiles, setAnswerFiles] = useState<File[]>([]);
  const [explanationFiles, setExplanationFiles] = useState<File[]>([]);
  const [items, setItems] = useState<ArchiveQuestion[]>([]);
  const [codeSearch, setCodeSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [printing, setPrinting] = useState(false);
  const [showPaperCodes, setShowPaperCodes] = useState(true);
  const [showMarkingScheme, setShowMarkingScheme] = useState(true);
  const [showExplanations, setShowExplanations] = useState(true);
  const [showTeacherComments, setShowTeacherComments] = useState(false);
  const [showMarks, setShowMarks] = useState(true);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      const { data: profile, error: profileError } = await supabase.from("profiles").select("role,is_active").eq("id", user.id).maybeSingle();
      if (profileError) setError(profileError.message);
      if (!profile?.is_active || (profile.role !== "teacher" && profile.role !== "admin")) { router.replace("/"); return; }
      setUserId(user.id); setAuthorized(true); setLoading(false);
    }
    void checkAccess();
  }, [router, supabase]);

  const searchArchive = useCallback(async () => {
    const code = codeSearch.trim().toUpperCase(); const tag = tagSearch.trim().toLowerCase();
    if (!code && !tag) { setError("Enter a paper code or tag to search the archive."); return; }
    setSearching(true); setError(""); setHasSearched(true);
    let query = supabase.from("paper_archive_questions").select("id,subject_code,paper_number,session,year,question_number,question_type,marks,question_images,answer_images,explanation_images,correct_option,marking_text,explanation_text,parts,tags,created_by").order("subject_code").order("year", { ascending: false }).order("question_number").limit(500);
    if (code) {
      const exact = parsePaperCode(code);
      if (exact) query = query.eq("subject_code", exact.subject_code).eq("paper_number", exact.paper_number).eq("session", exact.session).eq("year", exact.year);
      else {
        const partial = code.match(/^([A-Z0-9]{1,24})(?:\/([A-Z0-9]{1,12}))?(?:\/(M\/J|O\/N))?(?:\/(\d{2}))?$/);
        if (!partial) { setSearching(false); setError("Enter a full paper code like 5054/11/M/J/26, or a partial code such as 5054/11."); return; }
        query = query.eq("subject_code", partial[1]);
        if (partial[2]) query = query.eq("paper_number", partial[2]);
        if (partial[3]) query = query.eq("session", partial[3]);
        if (partial[4]) query = query.eq("year", Number(partial[4]));
      }
    }
    if (tag) query = query.contains("tags", [tag]);
    const { data, error: queryError } = await query;
    if (queryError) setError(queryError.message);
    else {
      const rows = (data ?? []) as ArchiveQuestion[];
      const ids = rows.map((row) => row.id);
      let noteRows: Array<{ paper_archive_question_id: string; comment: string }> = [];
      if (ids.length) {
        const { data: notes, error: noteError } = await supabase.from("paper_archive_teacher_comments").select("paper_archive_question_id,comment").eq("teacher_id", userId).in("paper_archive_question_id", ids);
        if (noteError) setError(noteError.message);
        noteRows = (notes ?? []) as Array<{ paper_archive_question_id: string; comment: string }>;
      }
      const noteById = new Map(noteRows.map((note) => [note.paper_archive_question_id, note.comment]));
      setItems(rows.map((row) => ({ ...row, teacher_comment: noteById.get(row.id) ?? null }))); setSelected(new Set());
    }
    setSearching(false);
  }, [codeSearch, supabase, tagSearch, userId]);

  useEffect(() => { if (printing) { const timer = window.setTimeout(() => { window.print(); setPrinting(false); }, 250); return () => window.clearTimeout(timer); } }, [printing]);
  const chosenItems = items.filter((item) => selected.has(item.id));

  async function saveQuestion(event: React.FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    const parsed = parsePaperCode(paperCode);
    if (!parsed) { setError("Use a paper code like 5054/11/M/J/26."); return; }
    if (!questionNumber.trim()) { setError("Enter the question number in the paper."); return; }
    if (!questionFiles.length) { setError("Add at least one question image."); return; }
    if (questionType === "mcq" && !correctOption) { setError("Choose the correct MCQ option."); return; }
    setBusy(true);
    try {
      const questionImages = await Promise.all(questionFiles.map((file) => uploadImage(file, "question-images")));
      const answerImages = questionType === "mcq" ? [] : await Promise.all(answerFiles.map((file) => uploadImage(file, "answer-images")));
      const explanationImages = await Promise.all(explanationFiles.map((file) => uploadImage(file, "answer-images")));
      const row = { ...parsed, question_number: questionNumber.trim(), question_type: questionType, marks: Number(marks),
        correct_option: questionType === "mcq" ? correctOption : null, question_images: questionImages, answer_images: answerImages,
        marking_text: questionType === "structured" ? markingText.trim() || null : null, explanation_text: explanationText.trim() || null,
        explanation_images: explanationImages,
        parts: questionType === "structured" ? parts.filter((part) => part.label.trim() || part.prompt.trim()).map((part) => ({ ...part, label: part.label.trim(), prompt: part.prompt.trim(), marks: Number(part.marks) || 0 })) : [],
        tags: [...new Set(tags.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean))], created_by: userId };
      const { data: savedQuestion, error: insertError } = await supabase.from("paper_archive_questions").upsert(row, { onConflict: "subject_code,paper_number,session,year,question_number" }).select("id").single();
      if (insertError) throw new Error(insertError.message);
      const comment = teacherComment.trim();
      const commentResult = comment
        ? await supabase.from("paper_archive_teacher_comments").upsert({ paper_archive_question_id: savedQuestion.id, teacher_id: userId, comment }, { onConflict: "paper_archive_question_id,teacher_id" })
        : await supabase.from("paper_archive_teacher_comments").delete().eq("paper_archive_question_id", savedQuestion.id).eq("teacher_id", userId);
      if (commentResult.error) throw new Error(`Question saved, but the private teacher comment could not be saved: ${commentResult.error.message}`);
      setMessage("Question saved in Paper Archive."); setQuestionNumber(""); setMarks("1"); setCorrectOption(""); setMarkingText(""); setExplanationText(""); setTeacherComment(""); setParts([]); setTags(""); setQuestionFiles([]); setAnswerFiles([]); setExplanationFiles([]);
      if (hasSearched) await searchArchive();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Unable to save this archive question."); }
    finally { setBusy(false); }
  }

  async function copyImage(url: string) {
    try {
      const response = await fetch(url); const blob = await response.blob();
      const image = await createImageBitmap(blob); const canvas = document.createElement("canvas"); canvas.width = image.width; canvas.height = image.height; canvas.getContext("2d")?.drawImage(image, 0, 0);
      const png = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Image conversion failed.")), "image/png"));
      await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]); setCopied(url); window.setTimeout(() => setCopied(""), 1500);
    } catch { setError("Copying images requires clipboard permission in this browser. Use Download image instead."); }
  }
  function downloadImage(url: string, name: string) { const link = document.createElement("a"); link.href = url; link.download = name; link.target = "_blank"; link.rel = "noreferrer"; link.click(); }
  function toggleSelected(id: string) { setSelected((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }

  if (loading) return <div className="flex min-h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!authorized) return null;
  return <div className="space-y-6">
    <header><p className="text-sm font-semibold text-primary">Teacher Workspace</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight">Paper Archive</h1><p className="mt-2 text-sm text-muted-foreground">Store past-paper questions separately so they can be reused in Question Pages.</p></header>
    <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setTab("upload")} className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold ${tab === "upload" ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}><Upload className="h-4 w-4" /> Upload papers</button><button type="button" onClick={() => setTab("browse")} className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold ${tab === "browse" ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}><Search className="h-4 w-4" /> Browse papers</button><button type="button" onClick={() => router.push("/teacher/studio")} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted"><FileText className="h-4 w-4" /> Create Q Page</button></div>
    {error && <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}{message && <div className="rounded-xl border border-emerald-600/20 bg-emerald-600/5 px-4 py-3 text-sm text-emerald-700">{message}</div>}

    {tab === "upload" ? <form onSubmit={(event) => void saveQuestion(event)} className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-7">
      <div><h2 className="text-lg font-bold">Add one paper question</h2><p className="mt-1 text-sm text-muted-foreground">Build an archive question using the same core question details as Teacher Studio.</p></div>
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Question category<select value={questionType} onChange={(event) => setQuestionType(event.target.value as "mcq" | "structured")} className={inputClass}><option value="mcq">MCQ</option><option value="structured">Structured / Essay</option></select></label><label className="text-sm font-semibold">Paper code<input value={paperCode} onChange={(event) => setPaperCode(event.target.value)} className={inputClass} placeholder="5054/11/M/J/26" /></label><label className="text-sm font-semibold">Question number in paper<input value={questionNumber} onChange={(event) => setQuestionNumber(event.target.value)} className={inputClass} placeholder="10 or 10(a)" /></label><label className="text-sm font-semibold">Marks<input type="number" min="0" step="0.5" value={marks} onChange={(event) => setMarks(event.target.value)} className={inputClass} /></label></div>
      <ImageList label="Question images" files={questionFiles} setFiles={setQuestionFiles} />
      {questionType === "mcq" ? <label className="block text-sm font-semibold">Correct option<select value={correctOption} onChange={(event) => setCorrectOption(event.target.value)} className={inputClass}><option value="">Select correct option</option>{["A", "B", "C", "D"].map((option) => <option key={option} value={option}>{option}</option>)}</select></label> : <>
        <ImageList label="Answer / marking-scheme images" files={answerFiles} setFiles={setAnswerFiles} />
        <label className="block text-sm font-semibold">Marking guidance<textarea value={markingText} onChange={(event) => setMarkingText(event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-primary" placeholder="Optional answer text or marking guidance" /></label>
        <div className="space-y-3 rounded-xl border border-border p-4"><div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-bold">Question parts</h3><p className="mt-1 text-xs text-muted-foreground">Add parts such as (a), (b), and their marks or prompt.</p></div><button type="button" onClick={() => setParts([...parts, { label: `(${String.fromCharCode(97 + parts.length)})`, prompt: "", marks: 0 }])} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"><Plus className="h-3.5 w-3.5" /> Add part</button></div>
          {parts.map((part, index) => <div key={index} className="grid gap-3 rounded-lg bg-muted/30 p-3 sm:grid-cols-[100px_1fr_100px_auto]"><label className="text-xs font-semibold">Part<input value={part.label} onChange={(event) => setParts(parts.map((entry, i) => i === index ? { ...entry, label: event.target.value } : entry))} className={inputClass} /></label><label className="text-xs font-semibold">Prompt / instruction<input value={part.prompt} onChange={(event) => setParts(parts.map((entry, i) => i === index ? { ...entry, prompt: event.target.value } : entry))} className={inputClass} placeholder="Optional part wording" /></label><label className="text-xs font-semibold">Marks<input type="number" min="0" step="0.5" value={part.marks} onChange={(event) => setParts(parts.map((entry, i) => i === index ? { ...entry, marks: Number(event.target.value) } : entry))} className={inputClass} /></label><button type="button" onClick={() => setParts(parts.filter((_, i) => i !== index))} className="mt-6 rounded-lg p-2 text-destructive hover:bg-destructive/10" aria-label="Remove part"><Trash2 className="h-4 w-4" /></button></div>)}
        </div>
      </>}
      <ImageList label="Explanation images" files={explanationFiles} setFiles={setExplanationFiles} />
      <label className="block text-sm font-semibold">Explanation text<textarea value={explanationText} onChange={(event) => setExplanationText(event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-primary" placeholder="Optional explanation" /></label>
      <label className="block text-sm font-semibold">Teacher comment<textarea value={teacherComment} onChange={(event) => setTeacherComment(event.target.value)} maxLength={5000} className="mt-2 min-h-20 w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-primary" placeholder="Private note for teachers" /></label>
      <label className="block text-sm font-semibold">Optional tags<input value={tags} onChange={(event) => setTags(event.target.value)} className={inputClass} placeholder="mechanics, forces, revision" /><span className="mt-1 block text-xs font-normal text-muted-foreground">Separate tags with commas.</span></label>
      <div className="flex justify-end"><button type="submit" disabled={busy} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground disabled:opacity-50">{busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Compressing and saving...</> : <><Archive className="h-4 w-4" /> Save archive question</>}</button></div>
    </form> : <section className="space-y-4">
      <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[1fr_1fr_auto]"><label className="text-xs font-semibold text-muted-foreground">Search paper code<input value={codeSearch} onChange={(event) => setCodeSearch(event.target.value)} className={inputClass} placeholder="5054/11/M/J/26 or 5054/11" /></label><label className="text-xs font-semibold text-muted-foreground">Search tag<input value={tagSearch} onChange={(event) => setTagSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void searchArchive(); } }} className={inputClass} placeholder="mechanics" /></label><div className="flex items-end"><button type="button" onClick={() => void searchArchive()} disabled={searching} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">{searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Search</button></div></div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 rounded-xl border border-border bg-card p-3 text-xs"><span className="font-bold">PDF contents:</span><Toggle label="Paper codes" checked={showPaperCodes} onChange={setShowPaperCodes} /><Toggle label="Marking scheme" checked={showMarkingScheme} onChange={setShowMarkingScheme} /><Toggle label="Explanations" checked={showExplanations} onChange={setShowExplanations} /><Toggle label="Teacher comments" checked={showTeacherComments} onChange={setShowTeacherComments} /><Toggle label="Marks" checked={showMarks} onChange={setShowMarks} /></div>
      {hasSearched && <><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted-foreground">{items.length} matching question{items.length === 1 ? "" : "s"}. Select questions to prepare a PDF.</p><button type="button" onClick={() => setPrinting(true)} disabled={!chosenItems.length} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted disabled:opacity-50"><FileDown className="h-4 w-4" /> Export PDF ({chosenItems.length})</button></div>
        {items.length ? items.map((item) => <article key={item.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5"><div className="mb-4 flex flex-wrap items-start justify-between gap-3"><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelected(item.id)} className="h-4 w-4 accent-primary" />{paperCodeFor(item)} – Q{item.question_number} · {item.question_type === "mcq" ? "MCQ" : "Structured"}</label><div className="flex flex-wrap gap-1.5">{item.tags.map((tag) => <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold">{tag}</span>)}</div></div><div className="grid gap-4 lg:grid-cols-2"><ImageSet label="Question" urls={item.question_images} onCopy={copyImage} onDownload={(url, index) => downloadImage(url, `question-${item.question_number}-${index + 1}.webp`)} copied={copied} /><div className="space-y-3">{item.question_type === "mcq" && <p className="rounded-lg bg-muted/40 p-3 text-sm font-semibold">Correct option: {item.correct_option ?? "Not set"}</p>}{item.marking_text && <p className="rounded-lg bg-muted/40 p-3 text-sm">{item.marking_text}</p>}<ImageSet label="Answer / marking scheme" urls={item.answer_images} onCopy={copyImage} onDownload={(url, index) => downloadImage(url, `answer-${item.question_number}-${index + 1}.webp`)} copied={copied} /><ImageSet label="Explanation" urls={item.explanation_images} onCopy={copyImage} onDownload={(url, index) => downloadImage(url, `explanation-${item.question_number}-${index + 1}.webp`)} copied={copied} />{item.explanation_text && <p className="rounded-lg bg-muted/40 p-3 text-sm">{item.explanation_text}</p>}</div></div>{item.parts?.length > 0 && <div className="mt-4 rounded-lg bg-muted/30 p-3 text-sm"><strong>Parts:</strong> {item.parts.map((part) => `${part.label}${part.marks ? ` (${part.marks} marks)` : ""}`).join(" · ")}</div>}</article>) : <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">No archive questions match those search terms.</div>}
      </>}{!hasSearched && <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">Search by paper code or tag to see archive questions.</div>}
    </section>}

    {printing && <div className="print-only fixed inset-0 z-[100] overflow-auto bg-white p-8 text-black"><h1 className="mb-6 text-2xl font-bold">iSkole Paper Archive</h1><section><h2 className="mb-4 border-b pb-2 text-xl font-bold">Questions</h2>{chosenItems.map((item, index) => <article key={item.id} className="mb-8 break-inside-avoid">{showPaperCodes && <p className="text-xs font-semibold uppercase tracking-wide">{paperCodeFor(item)}</p>}<h3 className="my-2 text-lg font-bold">Question {item.question_number}{showMarks ? ` · ${item.marks} marks` : ""}</h3>{item.question_images.map((url, imageIndex) => <img key={url} src={url} alt={`Question ${imageIndex + 1}`} className="mb-3 max-h-[650px] w-full object-contain" />)}{item.parts?.length > 0 && <ol className="mt-4 space-y-2">{item.parts.map((part, partIndex) => <li key={partIndex}><strong>{part.label}</strong> {part.prompt}{showMarks && part.marks ? ` [${part.marks} marks]` : ""}</li>)}</ol>}</article>)}</section>
      {showMarkingScheme && <section className="mt-8 break-before-page"><h2 className="mb-4 border-b pb-2 text-xl font-bold">Answer key and marking scheme</h2>{chosenItems.some((item) => item.question_type === "mcq") && <table className="mb-8 w-full border-collapse text-left text-sm"><thead><tr><th className="border px-3 py-2">Question</th><th className="border px-3 py-2">Correct option</th></tr></thead><tbody>{chosenItems.filter((item) => item.question_type === "mcq").map((item) => <tr key={item.id}><td className="border px-3 py-2">{showPaperCodes ? `${paperCodeFor(item)} · ` : ""}Q{item.question_number}{showMarks ? ` · ${item.marks} marks` : ""}</td><td className="border px-3 py-2 font-bold">{item.correct_option ?? "—"}</td></tr>)}</tbody></table>}{chosenItems.filter((item) => item.question_type === "structured").map((item) => <article key={item.id} className="mb-8 break-inside-avoid"><h3 className="mb-2 font-bold">{showPaperCodes ? `${paperCodeFor(item)} · ` : ""}Question {item.question_number}{showMarks ? ` · ${item.marks} marks` : ""}</h3>{item.marking_text && <p className="mb-3 whitespace-pre-wrap">{item.marking_text}</p>}{item.answer_images.map((url, imageIndex) => <img key={url} src={url} alt={`Marking scheme ${imageIndex + 1}`} className="mb-3 max-h-[650px] w-full object-contain" />)}</article>)}</section>}
      {showExplanations && chosenItems.some((item) => item.explanation_text || item.explanation_images.length) && <section className="mt-8 break-before-page"><h2 className="mb-4 border-b pb-2 text-xl font-bold">Explanations</h2>{chosenItems.filter((item) => item.explanation_text || item.explanation_images.length).map((item) => <article key={item.id} className="mb-8 break-inside-avoid"><h3 className="mb-2 font-bold">{showPaperCodes ? `${paperCodeFor(item)} · ` : ""}Question {item.question_number}</h3>{item.explanation_text && <p className="mb-3 whitespace-pre-wrap">{item.explanation_text}</p>}{item.explanation_images.map((url, imageIndex) => <img key={url} src={url} alt={`Explanation ${imageIndex + 1}`} className="mb-3 max-h-[650px] w-full object-contain" />)}</article>)}</section>}
      {showTeacherComments && chosenItems.some((item) => item.teacher_comment) && <section className="mt-8"><h2 className="mb-4 border-b pb-2 text-xl font-bold">Teacher comments</h2>{chosenItems.filter((item) => item.teacher_comment).map((item) => <p key={item.id} className="mb-3"><strong>{showPaperCodes ? `${paperCodeFor(item)} · ` : ""}Q{item.question_number}:</strong> {item.teacher_comment}</p>)}</section>}
      <button type="button" onClick={() => setPrinting(false)} className="no-print mt-8 rounded-lg border px-4 py-2">Close print view</button><style jsx global>{`@media screen {.print-only{display:none}} @media print {body * {visibility:hidden !important}.print-only,.print-only * {visibility:visible !important}.print-only{display:block !important;position:absolute;inset:0;overflow:visible!important;padding:12mm!important}.no-print{display:none!important}.break-before-page{break-before:page}@page{margin:12mm}}`}</style></div>}
  </div>;
}

function paperCodeFor(item: ArchiveQuestion) { return `${item.subject_code}/${item.paper_number}/${item.session}/${String(item.year).padStart(2, "0")}`; }

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="inline-flex items-center gap-2"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-primary" />{label}</label>;
}

function ImageSet({ label, urls, onCopy, onDownload, copied }: { label: string; urls: string[]; onCopy: (url: string) => void; onDownload: (url: string, index: number) => void; copied: string }) {
  return <div className="rounded-xl border border-border p-3"><h3 className="mb-3 text-sm font-bold">{label}</h3>{urls.length ? urls.map((url, index) => <div key={url} className="relative mb-3"><img src={url} alt={`${label} ${index + 1}`} className="max-h-[440px] w-full rounded-lg border border-border object-contain" /><div className="absolute right-2 top-2 flex gap-1"><button type="button" onClick={() => onCopy(url)} title="Copy image" className="rounded-lg bg-background/90 p-2 shadow">{copied === url ? <Check className="h-4 w-4 text-emerald-600" /> : <Clipboard className="h-4 w-4" />}</button><button type="button" onClick={() => onDownload(url, index)} title="Download image" className="rounded-lg bg-background/90 p-2 shadow"><Download className="h-4 w-4" /></button></div></div>) : <p className="rounded-lg bg-muted/40 p-5 text-center text-xs text-muted-foreground">No images added</p>}</div>;
}
