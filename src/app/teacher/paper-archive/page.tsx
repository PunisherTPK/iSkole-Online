"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Archive, Check, Clipboard, Download, FileDown, FileText, Loader2, Search, Upload } from "lucide-react";

type ArchiveQuestion = {
  id: string; subject_code: string; paper_number: string; session: string; year: number; question_number: string;
  question_images: string[]; answer_images: string[]; tags: string[]; created_by: string;
};
type Tab = "upload" | "browse";
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

export default function PaperArchivePage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("upload");
  const [userId, setUserId] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [paperCode, setPaperCode] = useState("");
  const [questionNumber, setQuestionNumber] = useState("");
  const [tags, setTags] = useState("");
  const [questionFiles, setQuestionFiles] = useState<File[]>([]);
  const [answerFiles, setAnswerFiles] = useState<File[]>([]);
  const [items, setItems] = useState<ArchiveQuestion[]>([]);
  const [codeSearch, setCodeSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [printing, setPrinting] = useState(false);
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

  const loadArchive = useCallback(async () => {
    setError("");
    const { data, error: queryError } = await supabase.from("paper_archive_questions")
      .select("id,subject_code,paper_number,session,year,question_number,question_images,answer_images,tags,created_by")
      .order("subject_code").order("year", { ascending: false }).order("question_number").limit(2000);
    if (queryError) setError(queryError.message);
    else setItems((data ?? []) as ArchiveQuestion[]);
  }, [supabase]);
  useEffect(() => { if (authorized) void loadArchive(); }, [authorized, loadArchive]);

  useEffect(() => { if (printing) { const timer = window.setTimeout(() => { window.print(); setPrinting(false); }, 250); return () => window.clearTimeout(timer); } }, [printing]);

  const visible = items.filter((item) => {
    const code = `${item.subject_code}/${item.paper_number}/${item.session}/${String(item.year).padStart(2, "0")} ${item.question_number}`.toLowerCase();
    return (!codeSearch.trim() || code.includes(codeSearch.trim().toLowerCase())) &&
      (!tagSearch.trim() || item.tags.some((tag) => tag.toLowerCase().includes(tagSearch.trim().toLowerCase())));
  });
  const chosenItems = visible.filter((item) => selected.has(item.id));

  async function saveQuestion(event: React.FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    const parsed = parsePaperCode(paperCode);
    if (!parsed) { setError("Use a paper code like 5054/11/M/J/26."); return; }
    if (!questionNumber.trim()) { setError("Enter the question number in the paper."); return; }
    if (!questionFiles.length && !answerFiles.length) { setError("Upload at least one question or marking-scheme image."); return; }
    setBusy(true);
    try {
      const questionImages = await Promise.all(questionFiles.map((file) => uploadImage(file, "question-images")));
      const answerImages = await Promise.all(answerFiles.map((file) => uploadImage(file, "answer-images")));
      const row = { ...parsed, question_number: questionNumber.trim(), question_images: questionImages, answer_images: answerImages,
        tags: [...new Set(tags.split(",").map((tag) => tag.trim()).filter(Boolean))], created_by: userId };
      const { error: insertError } = await supabase.from("paper_archive_questions").upsert(row, { onConflict: "subject_code,paper_number,session,year,question_number" });
      if (insertError) throw new Error(insertError.message);
      setMessage("Question saved in Paper Archive."); setQuestionNumber(""); setTags(""); setQuestionFiles([]); setAnswerFiles([]);
      const questionInput = document.getElementById("archive-question-images") as HTMLInputElement | null;
      const answerInput = document.getElementById("archive-answer-images") as HTMLInputElement | null;
      if (questionInput) questionInput.value = ""; if (answerInput) answerInput.value = "";
      await loadArchive();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Unable to save this archive question."); }
    finally { setBusy(false); }
  }

  async function copyImage(url: string) {
    try {
      const response = await fetch(url); const blob = await response.blob();
      const image = await createImageBitmap(blob); const canvas = document.createElement("canvas");
      canvas.width = image.width; canvas.height = image.height; canvas.getContext("2d")?.drawImage(image, 0, 0);
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
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => setTab("upload")} className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold ${tab === "upload" ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}><Upload className="h-4 w-4" /> Upload papers</button>
      <button type="button" onClick={() => { setTab("browse"); void loadArchive(); }} className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold ${tab === "browse" ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}><Search className="h-4 w-4" /> Browse papers</button>
      <button type="button" onClick={() => router.push("/teacher/studio")} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted"><FileText className="h-4 w-4" /> Create Q Page</button>
    </div>
    {error && <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
    {message && <div className="rounded-xl border border-emerald-600/20 bg-emerald-600/5 px-4 py-3 text-sm text-emerald-700">{message}</div>}

    {tab === "upload" ? <form onSubmit={(event) => void saveQuestion(event)} className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-7">
      <div><h2 className="text-lg font-bold">Add one paper question</h2><p className="mt-1 text-sm text-muted-foreground">Use the paper identifier once for each question. Reuploading the same identifier updates that archive entry.</p></div>
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Paper code<input value={paperCode} onChange={(event) => setPaperCode(event.target.value)} className={inputClass} placeholder="5054/11/M/J/26" /></label><label className="text-sm font-semibold">Question number<input value={questionNumber} onChange={(event) => setQuestionNumber(event.target.value)} className={inputClass} placeholder="10 or 10(a)" /></label></div>
      <label className="block text-sm font-semibold">Optional tags<input value={tags} onChange={(event) => setTags(event.target.value)} className={inputClass} placeholder="mechanics, forces, revision" /><span className="mt-1 block text-xs font-normal text-muted-foreground">Separate tags with commas.</span></label>
      <div className="grid gap-4 lg:grid-cols-2"><FilePicker id="archive-question-images" label="Question images" files={questionFiles} onChange={setQuestionFiles} /><FilePicker id="archive-answer-images" label="Marking-scheme images" files={answerFiles} onChange={setAnswerFiles} /></div>
      <div className="flex justify-end"><button type="submit" disabled={busy} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground disabled:opacity-50">{busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Compressing and saving...</> : <><Archive className="h-4 w-4" /> Save archive question</>}</button></div>
    </form> : <section className="space-y-4">
      <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[1fr_1fr_auto]"><label className="text-xs font-semibold text-muted-foreground">Search paper code<input value={codeSearch} onChange={(event) => setCodeSearch(event.target.value)} className={inputClass} placeholder="5054/11/M/J/26 or 5054" /></label><label className="text-xs font-semibold text-muted-foreground">Search tag<input value={tagSearch} onChange={(event) => setTagSearch(event.target.value)} className={inputClass} placeholder="mechanics" /></label><div className="flex items-end"><button type="button" onClick={() => setPrinting(true)} disabled={!chosenItems.length} className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted disabled:opacity-50"><FileDown className="h-4 w-4" /> Export PDF ({chosenItems.length})</button></div></div>
      <p className="text-xs text-muted-foreground">{visible.length} question{visible.length === 1 ? "" : "s"} found. Select questions to export a printable PDF.</p>
      {visible.length ? visible.map((item) => <article key={item.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5"><div className="mb-4 flex flex-wrap items-start justify-between gap-3"><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelected(item.id)} className="h-4 w-4 accent-primary" />{item.subject_code}/{item.paper_number}/{item.session}/{String(item.year).padStart(2, "0")} – {item.question_number}</label><div className="flex flex-wrap gap-1.5">{item.tags.map((tag) => <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold">{tag}</span>)}</div></div><div className="grid gap-4 lg:grid-cols-2"><ImageSet label="Question" urls={item.question_images} onCopy={copyImage} onDownload={(url, index) => downloadImage(url, `question-${item.question_number}-${index + 1}.webp`)} copied={copied} /><ImageSet label="Answer / marking scheme" urls={item.answer_images} onCopy={copyImage} onDownload={(url, index) => downloadImage(url, `answer-${item.question_number}-${index + 1}.webp`)} copied={copied} /></div></article>) : <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">No archive questions match this search.</div>}
    </section>}
    {printing && <div className="print-only fixed inset-0 z-[100] overflow-auto bg-white p-8 text-black"><h1 className="mb-6 text-2xl font-bold">iSkole Paper Archive</h1>{chosenItems.map((item) => <article key={item.id} className="mb-8 break-inside-avoid"><h2 className="mb-3 text-lg font-bold">{item.subject_code}/{item.paper_number}/{item.session}/{String(item.year).padStart(2, "0")} – Question {item.question_number}</h2><div className="grid grid-cols-2 gap-5"><div><h3 className="mb-2 font-semibold">Question</h3>{item.question_images.map((url) => <img key={url} src={url} alt="Question" className="mb-3 max-h-[650px] w-full object-contain" />)}</div><div><h3 className="mb-2 font-semibold">Answer / marking scheme</h3>{item.answer_images.map((url) => <img key={url} src={url} alt="Answer" className="mb-3 max-h-[650px] w-full object-contain" />)}</div></div></article>)}<button type="button" onClick={() => setPrinting(false)} className="no-print rounded-lg border px-4 py-2">Close print view</button><style jsx global>{`@media screen {.print-only{display:none}} @media print {body * {visibility:hidden !important}.print-only,.print-only * {visibility:visible !important}.print-only{display:block !important;position:absolute;inset:0;overflow:visible!important;padding:12mm!important}.no-print{display:none!important}@page{margin:12mm}}`}</style></div>}
  </div>;
}

function FilePicker({ id, label, files, onChange }: { id: string; label: string; files: File[]; onChange: (files: File[]) => void }) {
  return <label className="block rounded-2xl border border-dashed border-border p-4 text-sm font-semibold">{label}<span className="mt-1 block text-xs font-normal text-muted-foreground">Choose multiple images. Each one is compressed on upload.</span><input id={id} type="file" multiple accept="image/*" className="mt-3 block w-full text-xs" onChange={(event) => onChange(Array.from(event.target.files ?? []))} /><span className="mt-2 block text-xs font-normal text-muted-foreground">{files.length ? `${files.length} image${files.length === 1 ? "" : "s"} selected` : "No images selected"}</span></label>;
}

function ImageSet({ label, urls, onCopy, onDownload, copied }: { label: string; urls: string[]; onCopy: (url: string) => void; onDownload: (url: string, index: number) => void; copied: string }) {
  return <div className="rounded-xl border border-border p-3"><h3 className="mb-3 text-sm font-bold">{label}</h3>{urls.length ? urls.map((url, index) => <div key={url} className="relative mb-3"><img src={url} alt={`${label} ${index + 1}`} className="max-h-[440px] w-full rounded-lg border border-border object-contain" /><div className="absolute right-2 top-2 flex gap-1"><button type="button" onClick={() => onCopy(url)} title="Copy image" className="rounded-lg bg-background/90 p-2 shadow">{copied === url ? <Check className="h-4 w-4 text-emerald-600" /> : <Clipboard className="h-4 w-4" />}</button><button type="button" onClick={() => onDownload(url, index)} title="Download image" className="rounded-lg bg-background/90 p-2 shadow"><Download className="h-4 w-4" /></button></div></div>) : <p className="rounded-lg bg-muted/40 p-5 text-center text-xs text-muted-foreground">No images uploaded</p>}</div>;
}
