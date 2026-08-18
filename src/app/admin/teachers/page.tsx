"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Edit3,
  GraduationCap,
  Loader2,
  Plus,
  Search,
  UserRound,
  X,
} from "lucide-react";

type Teacher = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
};

type Subject = {
  id: string;
  level_id: string;
  name: string;
  code: string | null;
  description: string | null;
  is_active: boolean;
};

type Level = {
  id: string;
  curriculum_id: string;
  name: string;
};

type Curriculum = {
  id: string;
  name: string;
};

type Assignment = {
  id: string;
  teacher_id: string;
  subject_id: string;
  is_active: boolean;
};

type Modal =
  | { type: "create" }
  | { type: "edit"; teacher: Teacher }
  | { type: "subjects"; teacher: Teacher }
  | null;

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const [saving, setSaving] = useState(false);

  async function loadTeachers() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/teachers", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to load teachers.");
      }

      setTeachers(data.teachers ?? []);
      setAssignments(data.assignments ?? []);
      setSubjects(data.subjects ?? []);
      setLevels(data.levels ?? []);
      setCurriculums(data.curriculums ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load teachers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTeachers();
  }, []);

  const filteredTeachers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return teachers;

    return teachers.filter((teacher) =>
      (teacher.full_name ?? "").toLowerCase().includes(term),
    );
  }, [teachers, search]);

  const activeTeachers = teachers.filter((teacher) => teacher.is_active).length;
  const inactiveTeachers = teachers.length - activeTeachers;

  async function submitTeacher(payload: Record<string, unknown>) {
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to save teacher.");

      setModal(null);
      await loadTeachers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save teacher.");
    } finally {
      setSaving(false);
    }
  }

  const assignmentCount = (teacherId: string) =>
    assignments.filter((assignment) => assignment.teacher_id === teacherId && assignment.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Administration</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
            Teachers
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage teacher accounts and the subjects they are responsible for.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search teachers..."
              autoComplete="off"
              className="h-10 w-full rounded-xl border border-input bg-card pl-9 pr-4 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10 sm:w-64"
            />
          </div>
          <button
            type="button"
            onClick={() => setModal({ type: "create" })}
            className="button-primary h-10 gap-2 px-4"
          >
            <Plus className="h-4 w-4" />
            Add Teacher
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total teachers" value={teachers.length} />
        <StatCard label="Active" value={activeTeachers} />
        <StatCard label="Inactive" value={inactiveTeachers} />
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">All Teachers</h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
              {filteredTeachers.length}
            </span>
          </div>
          <span className="hidden text-xs text-muted-foreground sm:block">
            {assignments.filter((assignment) => assignment.is_active).length} active assignments
          </span>
        </div>

        {loading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-16 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <UserRound className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-bold text-foreground">No teachers found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {search ? "Try a different search." : "Add your first teacher to get started."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredTeachers.map((teacher) => {
              const count = assignmentCount(teacher.id);

              return (
                <div key={teacher.id} className="flex flex-wrap items-center gap-4 px-5 py-4 transition hover:bg-muted/30">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                    {teacher.avatar_url ? (
                      <img src={teacher.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <UserRound className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-bold text-foreground">
                        {teacher.full_name || "Unnamed teacher"}
                      </p>
                      <span className={teacher.is_active ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600" : "rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground"}>
                        {teacher.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {count} assigned subject{count === 1 ? "" : "s"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setModal({ type: "subjects", teacher })}
                    className="flex h-9 items-center gap-2 rounded-xl border border-border px-3 text-xs font-bold text-muted-foreground transition hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
                  >
                    <GraduationCap className="h-3.5 w-3.5" />
                    Subjects
                  </button>

                  <button
                    type="button"
                    onClick={() => setModal({ type: "edit", teacher })}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label={`Edit ${teacher.full_name ?? "teacher"}`}
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {modal?.type === "create" && (
        <CreateTeacherModal
          saving={saving}
          onClose={() => setModal(null)}
          onSubmit={(payload) => void submitTeacher({ action: "create", ...payload })}
        />
      )}

      {modal?.type === "edit" && (
        <EditTeacherModal
          teacher={modal.teacher}
          saving={saving}
          onClose={() => setModal(null)}
          onSubmit={(payload) => void submitTeacher({ action: "update", teacherId: modal.teacher.id, ...payload })}
        />
      )}

      {modal?.type === "subjects" && (
        <SubjectAssignmentModal
          teacher={modal.teacher}
          subjects={subjects}
          levels={levels}
          curriculums={curriculums}
          assignments={assignments}
          saving={saving}
          onClose={() => setModal(null)}
          onSubmit={(subjectIds) => void submitTeacher({ action: "assign", teacherId: modal.teacher.id, subjectIds })}
        />
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-4">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">{value}</p>
    </div>
  );
}

function ModalShell({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-foreground">{title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CreateTeacherModal({
  saving,
  onClose,
  onSubmit,
}: {
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: { fullName: string; email: string; password: string }) => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <ModalShell title="Add Teacher" description="Create a teacher login and profile." onClose={onClose}>
      <form
        className="space-y-4 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({ fullName: fullName.trim(), email: email.trim(), password });
        }}
      >
        <Field label="Full name">
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} required placeholder="e.g. Mr. John Silva" className="input-field" />
        </Field>
        <Field label="Email">
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="teacher@example.com" className="input-field" />
        </Field>
        <Field label="Temporary password">
          <input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="At least 8 characters" className="input-field" />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="button-secondary h-10 px-4">Cancel</button>
          <button type="submit" disabled={saving} className="button-primary h-10 gap-2 px-4">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Teacher
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function EditTeacherModal({
  teacher,
  saving,
  onClose,
  onSubmit,
}: {
  teacher: Teacher;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: { fullName: string; isActive: boolean }) => void;
}) {
  const [fullName, setFullName] = useState(teacher.full_name ?? "");
  const [isActive, setIsActive] = useState(teacher.is_active);

  return (
    <ModalShell title="Edit Teacher" description="Update the teacher profile and account status." onClose={onClose}>
      <form
        className="space-y-4 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({ fullName: fullName.trim(), isActive });
        }}
      >
        <Field label="Full name">
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} required className="input-field" />
        </Field>
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Active account</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Inactive teachers cannot be used for active assignments.</p>
          </div>
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-4 w-4 accent-primary" />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="button-secondary h-10 px-4">Cancel</button>
          <button type="submit" disabled={saving} className="button-primary h-10 gap-2 px-4">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function SubjectAssignmentModal({
  teacher,
  subjects,
  levels,
  curriculums,
  assignments,
  saving,
  onClose,
  onSubmit,
}: {
  teacher: Teacher;
  subjects: Subject[];
  levels: Level[];
  curriculums: Curriculum[];
  assignments: Assignment[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (subjectIds: string[]) => void;
}) {
  const initial = assignments
    .filter((assignment) => assignment.teacher_id === teacher.id && assignment.is_active)
    .map((assignment) => assignment.subject_id);
  const [selected, setSelected] = useState<string[]>(initial);
  const [search, setSearch] = useState("");
  const [openCurriculums, setOpenCurriculums] = useState<string[]>([]);

  const curriculumMap = useMemo(() => new Map(curriculums.map((item) => [item.id, item])), [curriculums]);
  const levelMap = useMemo(() => new Map(levels.map((item) => [item.id, item])), [levels]);

  const grouped = useMemo(() => {
    const term = search.trim().toLowerCase();
    const result = new Map<string, { curriculum: Curriculum; levels: Map<string, { level: Level; subjects: Subject[] }> }>();

    for (const subject of subjects) {
      if (!subject.is_active) continue;
      if (term && !`${subject.name} ${subject.code ?? ""}`.toLowerCase().includes(term)) continue;

      const level = levelMap.get(subject.level_id);
      const curriculum = level ? curriculumMap.get(level.curriculum_id) : undefined;
      if (!level || !curriculum) continue;

      if (!result.has(curriculum.id)) result.set(curriculum.id, { curriculum, levels: new Map() });
      const curriculumGroup = result.get(curriculum.id)!;
      if (!curriculumGroup.levels.has(level.id)) curriculumGroup.levels.set(level.id, { level, subjects: [] });
      curriculumGroup.levels.get(level.id)!.subjects.push(subject);
    }

    return [...result.values()];
  }, [subjects, levels, curriculums, search, levelMap, curriculumMap]);

  const toggle = (subjectId: string) => {
    setSelected((current) => current.includes(subjectId) ? current.filter((id) => id !== subjectId) : [...current, subjectId]);
  };

  return (
    <ModalShell title="Assign Subjects" description={`Choose the exact subjects ${teacher.full_name || "this teacher"} can manage.`} onClose={onClose}>
      <div className="p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search subjects..." className="input-field pl-9" />
        </div>

        <div className="mt-4 max-h-[430px] overflow-y-auto rounded-xl border border-border">
          {grouped.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">No subjects found.</div>
          ) : grouped.map(({ curriculum, levels: curriculumLevels }) => {
            const open = openCurriculums.includes(curriculum.id) || Boolean(search.trim());
            return (
              <div key={curriculum.id} className="border-b border-border last:border-b-0">
                <button type="button" onClick={() => setOpenCurriculums((current) => current.includes(curriculum.id) ? current.filter((id) => id !== curriculum.id) : [...current, curriculum.id])} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/30">
                  <span className="text-sm font-bold text-foreground">{curriculum.name}</span>
                  <ChevronDown className={open ? "h-4 w-4 rotate-180 text-muted-foreground" : "h-4 w-4 text-muted-foreground"} />
                </button>
                {open && (
                  <div className="space-y-3 px-4 pb-4">
                    {[...curriculumLevels.values()].map(({ level, subjects: levelSubjects }) => (
                      <div key={level.id} className="rounded-xl bg-muted/30 p-3">
                        <p className="mb-2 text-xs font-bold text-muted-foreground">{level.name}</p>
                        <div className="space-y-1">
                          {levelSubjects.map((subject) => {
                            const checked = selected.includes(subject.id);
                            return (
                              <button key={subject.id} type="button" onClick={() => toggle(subject.id)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-card">
                                <span className={checked ? "flex h-5 w-5 items-center justify-center rounded-md bg-primary text-primary-foreground" : "h-5 w-5 rounded-md border border-border bg-card"}>
                                  {checked && <Check className="h-3.5 w-3.5" />}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block text-sm font-semibold text-foreground">{subject.name}</span>
                                  <span className="block text-[10px] text-muted-foreground">{[curriculum.name, level.name, subject.code].filter(Boolean).join(" → ")}</span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">{selected.length} subject{selected.length === 1 ? "" : "s"} selected</p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="button-secondary h-10 px-4">Cancel</button>
            <button type="button" disabled={saving} onClick={() => onSubmit(selected)} className="button-primary h-10 gap-2 px-4">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Assignments
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-foreground">{label}</span>
      {children}
    </label>
  );
}
