"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronDown,
  Edit3,
  Layers3,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Curriculum = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
};

type Level = {
  id: string;
  curriculum_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
};

type Subject = {
  id: string;
  level_id: string;
  name: string;
  code: string | null;
  description: string | null;
  is_active: boolean;
};

type ContentNode = {
  id: string;
  subject_id: string | null;
  parent_id: string | null;
  name: string;
  description: string | null;
};

type SearchResult = {
  id: string;
  type: "curriculum" | "level" | "subject" | "content_node";
  name: string;
  description: string | null;
  path: string;
  curriculumId?: string;
  levelId?: string;
  subjectId?: string;
};

type EntityType = "curriculum" | "level" | "subject";

type ModalState = {
  type: EntityType;
  mode: "create" | "edit";
  id?: string;
} | null;

export default function ContentManagerPage() {
  const supabase = useMemo(() => createClient(), []);

  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [selectedCurriculumId, setSelectedCurriculumId] = useState("");
  const [selectedLevelId, setSelectedLevelId] = useState("");

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const [loadingCurriculums, setLoadingCurriculums] = useState(true);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [modal, setModal] = useState<ModalState>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCurriculums();
  }, []);

  useEffect(() => {
    setSelectedLevelId("");
    setLevels([]);
    setSubjects([]);

    if (selectedCurriculumId) loadLevels(selectedCurriculumId);
  }, [selectedCurriculumId]);

  useEffect(() => {
    setSubjects([]);
    if (selectedLevelId) loadSubjects(selectedLevelId);
  }, [selectedLevelId]);

  useEffect(() => {
    const term = search.trim();

    if (!term) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    const timer = window.setTimeout(() => {
      performGlobalSearch(term);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search]);

  async function loadCurriculums() {
    setLoadingCurriculums(true);
    const { data, error } = await supabase
      .from("curriculums")
      .select("id, name, description, is_active")
      .eq("is_active", true)
      .order("name");

    if (error) setError(error.message);
    else setCurriculums(data ?? []);
    setLoadingCurriculums(false);
  }

  async function loadLevels(curriculumId: string) {
    setLoadingLevels(true);
    const { data, error } = await supabase
      .from("levels")
      .select("id, curriculum_id, name, description, is_active")
      .eq("curriculum_id", curriculumId)
      .eq("is_active", true)
      .order("name");

    if (error) setError(error.message);
    else setLevels(data ?? []);
    setLoadingLevels(false);
  }

  async function loadSubjects(levelId: string) {
    setLoadingSubjects(true);
    const { data, error } = await supabase
      .from("subjects")
      .select("id, level_id, name, code, description, is_active")
      .eq("level_id", levelId)
      .eq("is_active", true)
      .order("name");

    if (error) setError(error.message);
    else setSubjects(data ?? []);
    setLoadingSubjects(false);
  }

  async function performGlobalSearch(term: string) {
    setSearching(true);
    setError("");

    const pattern = `%${term}%`;

    const [curriculumQuery, levelQuery, subjectQuery, nodeQuery] =
      await Promise.all([
        supabase
          .from("curriculums")
          .select("id, name, description")
          .eq("is_active", true)
          .or(`name.ilike.${pattern},description.ilike.${pattern}`),
        supabase
          .from("levels")
          .select("id, curriculum_id, name, description")
          .eq("is_active", true)
          .or(`name.ilike.${pattern},description.ilike.${pattern}`),
        supabase
          .from("subjects")
          .select("id, level_id, name, code, description")
          .eq("is_active", true)
          .or(`name.ilike.${pattern},code.ilike.${pattern},description.ilike.${pattern}`),
        supabase
          .from("content_nodes")
          .select("id, subject_id, parent_id, name, description")
          .eq("is_active", true)
          .or(`name.ilike.${pattern},description.ilike.${pattern}`),
      ]);

    const firstError =
      curriculumQuery.error ??
      levelQuery.error ??
      subjectQuery.error ??
      nodeQuery.error;

    if (firstError) {
      setError(firstError.message);
      setSearchResults([]);
      setSearching(false);
      return;
    }

    const curriculumData = curriculumQuery.data ?? [];
    const levelData = levelQuery.data ?? [];
    const subjectData = subjectQuery.data ?? [];
    const nodeData = nodeQuery.data ?? [];

    const curriculumMap = new Map(curriculumData.map((x) => [x.id, x]));
    const levelMap = new Map(levelData.map((x) => [x.id, x]));
    const subjectMap = new Map(subjectData.map((x) => [x.id, x]));

    const results: SearchResult[] = [];

    curriculumData.forEach((item) => {
      results.push({
        id: item.id,
        type: "curriculum",
        name: item.name,
        description: item.description,
        path: item.name,
      });
    });

    levelData.forEach((item) => {
      const curriculum = curriculumMap.get(item.curriculum_id);
      results.push({
        id: item.id,
        type: "level",
        name: item.name,
        description: item.description,
        curriculumId: item.curriculum_id,
        path: [curriculum?.name, item.name].filter(Boolean).join(" → "),
      });
    });

    subjectData.forEach((item) => {
      const level = levelMap.get(item.level_id);
      const curriculum = level ? curriculumMap.get(level.curriculum_id) : undefined;
      results.push({
        id: item.id,
        type: "subject",
        name: item.name,
        description: item.description,
        curriculumId: level?.curriculum_id,
        levelId: item.level_id,
        path: [curriculum?.name, level?.name, item.name]
          .filter(Boolean)
          .join(" → "),
      });
    });

    nodeData.forEach((item: ContentNode) => {
      const subject = item.subject_id ? subjectMap.get(item.subject_id) : undefined;
      const level = subject ? levelMap.get(subject.level_id) : undefined;
      const curriculum = level ? curriculumMap.get(level.curriculum_id) : undefined;

      results.push({
        id: item.id,
        type: "content_node",
        name: item.name,
        description: item.description,
        curriculumId: level?.curriculum_id,
        levelId: subject?.level_id,
        subjectId: item.subject_id ?? undefined,
        path: [curriculum?.name, level?.name, subject?.name, item.name]
          .filter(Boolean)
          .join(" → "),
      });
    });

    setSearchResults(results);
    setSearching(false);
  }

  function openCreate(type: EntityType) {
    setError("");
    setModal({ type, mode: "create" });
  }

  function openEdit(type: EntityType, id: string) {
    setError("");
    setModal({ type, mode: "edit", id });
  }

  async function saveEntity(values: { name: string; description: string; code?: string }) {
    if (!modal) return;
    setSaving(true);
    setError("");

    try {
      if (modal.type === "curriculum") {
        const query = modal.mode === "create"
          ? supabase.from("curriculums").insert({ name: values.name, description: values.description || null, is_active: true })
          : supabase.from("curriculums").update({ name: values.name, description: values.description || null }).eq("id", modal.id!);
        const { error } = await query;
        if (error) throw new Error(error.message);
        await loadCurriculums();
      }

      if (modal.type === "level") {
        if (!selectedCurriculumId) throw new Error("Select a curriculum first.");
        const query = modal.mode === "create"
          ? supabase.from("levels").insert({ curriculum_id: selectedCurriculumId, name: values.name, description: values.description || null, is_active: true })
          : supabase.from("levels").update({ name: values.name, description: values.description || null }).eq("id", modal.id!);
        const { error } = await query;
        if (error) throw new Error(error.message);
        await loadLevels(selectedCurriculumId);
      }

      if (modal.type === "subject") {
        if (!selectedLevelId) throw new Error("Select a level first.");
        const query = modal.mode === "create"
          ? supabase.from("subjects").insert({ level_id: selectedLevelId, name: values.name, code: values.code?.trim() || null, description: values.description || null, is_active: true })
          : supabase.from("subjects").update({ name: values.name, code: values.code?.trim() || null, description: values.description || null }).eq("id", modal.id!);
        const { error } = await query;
        if (error) throw new Error(error.message);
        await loadSubjects(selectedLevelId);
      }

      setModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntity(type: EntityType, id: string) {
    const label = type === "curriculum" ? "curriculum" : type === "level" ? "level" : "subject";
    if (!window.confirm(`Deactivate this ${label}? It will no longer appear in the active list.`)) return;

    setDeletingId(id);
    setError("");

    try {
      const table = type === "curriculum" ? "curriculums" : type === "level" ? "levels" : "subjects";
      const { error } = await supabase.from(table).update({ is_active: false }).eq("id", id);
      if (error) throw new Error(error.message);

      if (type === "curriculum") {
        if (selectedCurriculumId === id) setSelectedCurriculumId("");
        await loadCurriculums();
      } else if (type === "level") {
        if (selectedLevelId === id) setSelectedLevelId("");
        if (selectedCurriculumId) await loadLevels(selectedCurriculumId);
      } else if (selectedLevelId) {
        await loadSubjects(selectedLevelId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to deactivate item.");
    } finally {
      setDeletingId(null);
    }
  }

  function openSearchResult(result: SearchResult) {
    if (result.type === "curriculum") {
      setSelectedCurriculumId(result.id);
      setSelectedLevelId("");
    } else if (result.type === "level") {
      setSelectedCurriculumId(result.curriculumId ?? "");
      setSelectedLevelId(result.id);
    } else {
      setSelectedCurriculumId(result.curriculumId ?? "");
      setSelectedLevelId(result.levelId ?? "");
    }

    setSearch("");
    setSearchResults([]);
  }

  const filteredCurriculums = curriculums.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  const filteredLevels = levels.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  const filteredSubjects = subjects.filter((item) => {
    const query = search.toLowerCase();
    return item.name.toLowerCase().includes(query) || !!item.code?.toLowerCase().includes(query);
  });

  const selectedCurriculum = curriculums.find((item) => item.id === selectedCurriculumId);
  const selectedLevel = levels.find((item) => item.id === selectedLevelId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Administration</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">Content Manager</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage curricula, levels, and subjects.</p>
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search all content..."
            autoComplete="off"
            className="h-10 w-full rounded-xl border border-input bg-card pl-9 pr-4 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} aria-label="Dismiss error"><X className="h-4 w-4" /></button>
        </div>
      )}

      {search.trim() ? (
        <GlobalSearchResults results={searchResults} searching={searching} onSelect={openSearchResult} onClear={() => { setSearch(""); setSearchResults([]); }} />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <ContentColumn title="Curriculums" description="Choose a curriculum" icon={BookOpen} onAdd={() => openCreate("curriculum")}>
              {loadingCurriculums ? <LoadingState /> : filteredCurriculums.length === 0 ? <EmptyState label="No curriculums" onAdd={() => openCreate("curriculum")} /> : filteredCurriculums.map((curriculum) => (
                <ListItem key={curriculum.id} name={curriculum.name} description={curriculum.description} selected={selectedCurriculumId === curriculum.id} onClick={() => setSelectedCurriculumId(curriculum.id)} onEdit={() => openEdit("curriculum", curriculum.id)} onDelete={() => deleteEntity("curriculum", curriculum.id)} deleting={deletingId === curriculum.id} />
              ))}
            </ContentColumn>

            <ContentColumn title="Levels" description={selectedCurriculum ? `Within ${selectedCurriculum.name}` : "Select a curriculum first"} icon={Layers3} onAdd={() => openCreate("level")} disabled={!selectedCurriculumId}>
              {!selectedCurriculumId ? <SelectParentState label="Select a curriculum" /> : loadingLevels ? <LoadingState /> : filteredLevels.length === 0 ? <EmptyState label="No levels" onAdd={() => openCreate("level")} /> : filteredLevels.map((level) => (
                <ListItem key={level.id} name={level.name} description={level.description} selected={selectedLevelId === level.id} onClick={() => setSelectedLevelId(level.id)} onEdit={() => openEdit("level", level.id)} onDelete={() => deleteEntity("level", level.id)} deleting={deletingId === level.id} />
              ))}
            </ContentColumn>

            <ContentColumn title="Subjects" description={selectedLevel ? `Within ${selectedLevel.name}` : "Select a level first"} icon={BookOpen} onAdd={() => openCreate("subject")} disabled={!selectedLevelId}>
              {!selectedLevelId ? <SelectParentState label="Select a level" /> : loadingSubjects ? <LoadingState /> : filteredSubjects.length === 0 ? <EmptyState label="No subjects" onAdd={() => openCreate("subject")} /> : filteredSubjects.map((subject) => (
                <ListItem key={subject.id} name={subject.name} description={subject.code ? `${subject.code}${subject.description ? ` · ${subject.description}` : ""}` : subject.description} selected={false} onClick={() => {}} onEdit={() => openEdit("subject", subject.id)} onDelete={() => deleteEntity("subject", subject.id)} deleting={deletingId === subject.id} />
              ))}
            </ContentColumn>
          </div>

          {(selectedCurriculum || selectedLevel) && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Structure:</span>
              {selectedCurriculum && <><span>{selectedCurriculum.name}</span>{selectedLevel && <ChevronDown className="h-3 w-3 -rotate-90" />}</>}
              {selectedLevel && <span className="font-semibold text-foreground">{selectedLevel.name}</span>}
            </div>
          )}
        </>
      )}

      {modal && <EntityModal modal={modal} curriculums={curriculums} levels={levels} subjects={subjects} saving={saving} onClose={() => setModal(null)} onSave={saveEntity} />}
    </div>
  );
}

function GlobalSearchResults({ results, searching, onSelect, onClear }: { results: SearchResult[]; searching: boolean; onSelect: (result: SearchResult) => void; onClear: () => void }) {
  if (searching) {
    return <section className="rounded-2xl border border-border bg-card"><div className="flex min-h-[300px] flex-col items-center justify-center text-center"><Search className="h-5 w-5 animate-pulse text-primary" /><p className="mt-3 text-sm font-semibold text-foreground">Searching all content...</p><p className="mt-1 text-xs text-muted-foreground">Searching curricula, levels, subjects, and content nodes.</p></div></section>;
  }

  if (!results.length) {
    return <section className="rounded-2xl border border-border bg-card"><div className="flex min-h-[300px] flex-col items-center justify-center text-center"><Search className="h-6 w-6 text-muted-foreground" /><p className="mt-3 text-sm font-bold text-foreground">No results found</p><p className="mt-1 text-xs text-muted-foreground">Try another search term.</p><button type="button" onClick={onClear} className="mt-4 text-xs font-bold text-primary hover:underline">Clear search</button></div></section>;
  }

  return <section className="overflow-hidden rounded-2xl border border-border bg-card">
    <div className="border-b border-border px-5 py-4"><p className="text-sm font-bold text-foreground">Global search results</p><p className="mt-1 text-xs text-muted-foreground">{results.length} result{results.length === 1 ? "" : "s"} across the entire content structure.</p></div>
    <div className="divide-y divide-border">
      {results.map((result) => (
        <button key={`${result.type}-${result.id}`} type="button" onClick={() => onSelect(result)} className="group flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-muted/40">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">{result.type === "level" || result.type === "content_node" ? <Layers3 className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}</div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-bold text-foreground">{result.name}</p><span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{result.type.replace("_", " ")}</span></div>
            <p className="mt-1 truncate text-xs text-muted-foreground">{result.path}</p>
            {result.description && <p className="mt-1 truncate text-[11px] text-muted-foreground/70">{result.description}</p>}
          </div>
          <span className="text-xs font-semibold text-primary opacity-0 transition group-hover:opacity-100">Open</span>
        </button>
      ))}
    </div>
  </section>;
}

function ContentColumn({ title, description, icon: Icon, onAdd, disabled = false, children }: { title: string; description: string; icon: React.ComponentType<{ className?: string }>; onAdd: () => void; disabled?: boolean; children: React.ReactNode }) {
  return <section className="flex min-h-[480px] flex-col overflow-hidden rounded-2xl border border-border bg-card">
    <div className="flex items-start justify-between border-b border-border p-5"><div className="flex min-w-0 items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div><div className="min-w-0"><h2 className="text-sm font-bold text-foreground">{title}</h2><p className="mt-1 truncate text-xs text-muted-foreground">{description}</p></div></div><button type="button" onClick={onAdd} disabled={disabled} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-30" aria-label={`Add ${title}`}><Plus className="h-4 w-4" /></button></div>
    <div className="flex-1 overflow-y-auto p-3">{children}</div>
  </section>;
}

function ListItem({ name, description, selected, onClick, onEdit, onDelete, deleting }: { name: string; description?: string | null; selected: boolean; onClick: () => void; onEdit: () => void; onDelete: () => void; deleting: boolean }) {
  return <div className={["group mb-1 flex items-center gap-2 rounded-xl border px-3 py-2.5 transition", selected ? "border-primary/20 bg-primary/5" : "border-transparent hover:border-border hover:bg-muted/50"].join(" ")}>
    <button type="button" onClick={onClick} className="min-w-0 flex-1 text-left"><p className="truncate text-sm font-semibold text-foreground">{name}</p>{description && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{description}</p>}</button>
    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover:opacity-100"><button type="button" onClick={onEdit} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-background hover:text-primary" aria-label={`Edit ${name}`}><Edit3 className="h-3.5 w-3.5" /></button><button type="button" onClick={onDelete} disabled={deleting} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/5 hover:text-destructive disabled:opacity-50" aria-label={`Delete ${name}`}><Trash2 className="h-3.5 w-3.5" /></button></div>
    {selected && <Check className="h-4 w-4 shrink-0 text-primary" />}
  </div>;
}

function LoadingState() {
  return <div className="space-y-2 p-1">{[1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-muted" />)}</div>;
}

function EmptyState({ label, onAdd }: { label: string; onAdd: () => void }) {
  return <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground"><BookOpen className="h-4 w-4" /></div><p className="mt-3 text-sm font-semibold text-foreground">{label}</p><button type="button" onClick={onAdd} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"><Plus className="h-3.5 w-3.5" />Add one</button></div>;
}

function SelectParentState({ label }: { label: string }) {
  return <div className="flex h-full min-h-[300px] items-center justify-center text-center"><div><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground"><ChevronDown className="h-4 w-4" /></div><p className="mt-3 text-xs font-semibold text-muted-foreground">{label}</p></div></div>;
}

function EntityModal({ modal, curriculums, levels, subjects, saving, onClose, onSave }: { modal: NonNullable<ModalState>; curriculums: Curriculum[]; levels: Level[]; subjects: Subject[]; saving: boolean; onClose: () => void; onSave: (values: { name: string; description: string; code?: string }) => Promise<void> }) {
  const existing = modal.mode === "edit" ? modal.type === "curriculum" ? curriculums.find((item) => item.id === modal.id) : modal.type === "level" ? levels.find((item) => item.id === modal.id) : subjects.find((item) => item.id === modal.id) : undefined;
  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [code, setCode] = useState<string>(modal.type === "subject" && existing && "code" in existing ? String(existing.code ?? "") : "");
  const label = modal.type === "curriculum" ? "Curriculum" : modal.type === "level" ? "Level" : "Subject";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    await onSave({ name: name.trim(), description: description.trim(), ...(modal.type === "subject" ? { code: code.trim() } : {}) });
  }

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
    <div className="flex items-center justify-between border-b border-border px-5 py-4"><div><h2 className="text-base font-bold text-foreground">{modal.mode === "create" ? `Add ${label}` : `Edit ${label}`}</h2><p className="mt-1 text-xs text-muted-foreground">{modal.mode === "create" ? "Add a new item to the academic structure." : "Update the selected item."}</p></div><button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Close"><X className="h-4 w-4" /></button></div>
    <form onSubmit={handleSubmit} className="space-y-4 p-5">
      <div><label htmlFor="entity-name" className="mb-1.5 block text-xs font-bold text-foreground">Name</label><input id="entity-name" value={name} onChange={(event) => setName(event.target.value)} placeholder={`Enter ${modal.type} name`} autoFocus required className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-4 focus:ring-primary/10" /></div>
      {modal.type === "subject" && <div><label htmlFor="entity-code" className="mb-1.5 block text-xs font-bold text-foreground">Code <span className="ml-1 font-normal text-muted-foreground">(optional)</span></label><input id="entity-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="e.g. PHY" className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-4 focus:ring-primary/10" /></div>}
      <div><label htmlFor="entity-description" className="mb-1.5 block text-xs font-bold text-foreground">Description <span className="ml-1 font-normal text-muted-foreground">(optional)</span></label><textarea id="entity-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add a short description..." rows={3} className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-4 focus:ring-primary/10" /></div>
      <div className="flex justify-end gap-2 border-t border-border pt-4"><button type="button" onClick={onClose} disabled={saving} className="button-secondary h-10 px-4">Cancel</button><button type="submit" disabled={saving || !name.trim()} className="button-primary h-10 px-4 disabled:pointer-events-none disabled:opacity-50">{saving ? "Saving..." : modal.mode === "create" ? "Create" : "Save changes"}</button></div>
    </form>
  </div></div>;
}
