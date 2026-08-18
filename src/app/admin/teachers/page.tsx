"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  GraduationCap,
  Plus,
  Search,
  UserRound,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Teacher = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
};

export default function TeachersPage() {
  const supabase = useMemo(() => createClient(), []);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTeachers();
  }, []);

  async function loadTeachers() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, is_active")
      .eq("role", "teacher")
      .eq("is_active", true)
      .order("full_name");

    if (error) {
      setError(error.message);
    } else {
      setTeachers(data ?? []);
    }

    setLoading(false);
  }

  const filteredTeachers = teachers.filter((teacher) =>
    (teacher.full_name ?? "")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
            Teachers
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Manage teachers and their subject assignments.
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
              className="h-10 w-full rounded-xl border border-input bg-card pl-9 pr-4 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10 sm:w-64"
            />
          </div>

          <button
            type="button"
            className="button-primary h-10 gap-2 px-4"
          >
            <Plus className="h-4 w-4" />
            Add Teacher
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* List */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />

            <h2 className="text-sm font-bold text-foreground">
              All Teachers
            </h2>

            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
              {teachers.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <UserRound className="h-5 w-5" />
            </div>

            <p className="mt-4 text-sm font-bold text-foreground">
              No teachers found
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {search
                ? "Try a different search."
                : "Add your first teacher to get started."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="flex items-center gap-4 px-5 py-4 transition hover:bg-muted/30"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                  {teacher.avatar_url ? (
                    <img
                      src={teacher.avatar_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound className="h-5 w-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">
                    {teacher.full_name || "Unnamed teacher"}
                  </p>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Teacher
                  </p>
                </div>

                <button
                  type="button"
                  className="hidden h-9 items-center gap-2 rounded-xl border border-border px-3 text-xs font-bold text-muted-foreground transition hover:border-primary/20 hover:bg-primary/5 hover:text-primary sm:flex"
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  Subjects
                </button>

                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  aria-label={`Edit ${teacher.full_name ?? "teacher"}`}
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}