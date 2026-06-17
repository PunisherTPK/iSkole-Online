import type { Catalog } from "@/lib/types";

export const sampleCatalog: Catalog = {
  curriculums: [
    {
      id: "sample-curriculum",
      name: "Sample Curriculum",
      slug: "sample-curriculum",
      display_order: 1,
      created_at: "2026-01-01T00:00:00.000Z",
    },
  ],
  levels: [
    {
      id: "sample-level",
      curriculum_id: "sample-curriculum",
      name: "Sample Level",
      slug: "sample-level",
      display_order: 1,
      created_at: "2026-01-01T00:00:00.000Z",
    },
  ],
  subjects: [
    {
      id: "sample-subject",
      level_id: "sample-level",
      name: "Sample Subject",
      slug: "sample-subject",
      display_order: 1,
      created_at: "2026-01-01T00:00:00.000Z",
    },
  ],
  resourceTypes: [
    { id: "notes", name: "Notes" },
    { id: "videos", name: "Videos" },
    { id: "topical-questions", name: "Topical Questions" },
    { id: "past-papers", name: "Past Papers" },
  ],
  resources: [
    {
      id: "sample-notes",
      subject_id: "sample-subject",
      resource_type_id: "notes",
      title: "Getting Started Notes",
      description: "A short starter resource for this subject.",
      content: "Use this space for lesson notes, links, and teacher guidance.",
      file_url: null,
      youtube_url: null,
      display_order: 1,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "sample-video",
      subject_id: "sample-subject",
      resource_type_id: "videos",
      title: "Introductory Video",
      description: "A sample video resource.",
      content: "",
      file_url: null,
      youtube_url: "https://www.youtube.com/",
      display_order: 2,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
  ],
  pastPapers: [
    {
      id: "sample-paper",
      subject_id: "sample-subject",
      year: 2026,
      session: "Sample Session",
      paper_file_url: null,
      mark_scheme_file_url: null,
      display_order: 1,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
  ],
  teachers: [
    {
      id: "sample-teacher",
      name: "Sample Teacher",
      email: "teacher@example.com",
      role: "teacher",
      created_at: "2026-01-01T00:00:00.000Z",
    },
  ],
  teacherAssignments: [
    {
      id: "sample-assignment",
      teacher_id: "sample-teacher",
      subject_id: "sample-subject",
      created_at: "2026-01-01T00:00:00.000Z",
    },
  ],
};
