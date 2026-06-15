create extension if not exists "pgcrypto";

create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid not null references public.grades(id) on delete cascade,
  name text not null,
  unique (grade_id, name)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  name text not null,
  description text not null default '',
  unique (subject_id, name)
);

create table if not exists public.papers (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  year integer not null check (year between 1900 and 2100),
  title text not null,
  unique (lesson_id, year, title)
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  paper_id uuid not null references public.papers(id) on delete cascade,
  question_text text not null,
  answer_text text not null,
  explanation_text text not null,
  created_at timestamptz not null default now()
);

alter table public.grades enable row level security;
alter table public.subjects enable row level security;
alter table public.lessons enable row level security;
alter table public.papers enable row level security;
alter table public.questions enable row level security;

create policy "Public can read grades" on public.grades for select using (true);
create policy "Public can read subjects" on public.subjects for select using (true);
create policy "Public can read lessons" on public.lessons for select using (true);
create policy "Public can read papers" on public.papers for select using (true);
create policy "Public can read questions" on public.questions for select using (true);

create index if not exists subjects_grade_id_idx on public.subjects(grade_id);
create index if not exists lessons_subject_id_idx on public.lessons(subject_id);
create index if not exists papers_lesson_id_idx on public.papers(lesson_id);
create index if not exists questions_paper_id_idx on public.questions(paper_id);
