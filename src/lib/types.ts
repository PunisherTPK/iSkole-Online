export type Curriculum = {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  created_at?: string;
  deleted_at?: string | null;
};

export type Level = {
  id: string;
  curriculum_id: string;
  name: string;
  slug: string;
  display_order: number;
  created_at?: string;
  deleted_at?: string | null;
};

export type Subject = {
  id: string;
  level_id: string;
  name: string;
  slug: string;
  display_order: number;
  created_at?: string;
  deleted_at?: string | null;
};

export type ResourceType = {
  id: string;
  name: string;
};

export type Resource = {
  id: string;
  subject_id: string;
  resource_type_id: string;
  title: string;
  description: string;
  content: string;
  file_url: string | null;
  youtube_url: string | null;
  display_order: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

export type PastPaper = {
  id: string;
  subject_id: string;
  year: number;
  session: string;
  paper_file_url: string | null;
  mark_scheme_file_url: string | null;
  display_order: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

export type Teacher = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "teacher";
  created_at?: string;
  deleted_at?: string | null;
};

export type TeacherAssignment = {
  id: string;
  teacher_id: string;
  subject_id: string;
  created_at?: string;
};

export type Catalog = {
  curriculums: Curriculum[];
  levels: Level[];
  subjects: Subject[];
  resourceTypes: ResourceType[];
  resources: Resource[];
  pastPapers: PastPaper[];
  teachers: Teacher[];
  teacherAssignments: TeacherAssignment[];
};

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type SearchResult = {
  title: string;
  description: string;
  href: string;
  type: "Curriculum" | "Level" | "Subject" | "Resource" | "Past Paper";
};
