-- Structure-first CMS migration for iSkole Online.
-- This migration replaces the old grade/lesson/question-bank model.

drop table if exists public.questions cascade;
drop table if exists public.papers cascade;
drop table if exists public.lessons cascade;
drop table if exists public.subjects cascade;
drop table if exists public.grades cascade;

create extension if not exists "pgcrypto";

create table if not exists public.curriculums (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.levels (
  id uuid primary key default gen_random_uuid(),
  curriculum_id uuid not null references public.curriculums(id) on delete cascade,
  name text not null,
  slug text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (curriculum_id, slug)
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  level_id uuid not null references public.levels(id) on delete cascade,
  name text not null,
  slug text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (level_id, slug)
);

create table if not exists public.resource_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  resource_type_id uuid not null references public.resource_types(id),
  title text not null,
  description text not null default '',
  content text not null default '',
  file_url text,
  youtube_url text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.past_papers (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  year integer not null check (year between 1900 and 2100),
  session text not null,
  paper_file_url text,
  mark_scheme_file_url text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role text not null default 'teacher' check (role in ('super_admin', 'teacher')),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.teacher_assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (teacher_id, subject_id)
);

insert into public.resource_types (name) values
  ('Notes'),
  ('Videos'),
  ('Topical Questions'),
  ('Past Papers')
on conflict (name) do nothing;

alter table public.curriculums enable row level security;
alter table public.levels enable row level security;
alter table public.subjects enable row level security;
alter table public.resource_types enable row level security;
alter table public.resources enable row level security;
alter table public.past_papers enable row level security;
alter table public.teachers enable row level security;
alter table public.teacher_assignments enable row level security;

create policy "Public can read active curriculums" on public.curriculums for select using (deleted_at is null);
create policy "Public can read active levels" on public.levels for select using (deleted_at is null);
create policy "Public can read active subjects" on public.subjects for select using (deleted_at is null);
create policy "Public can read resource types" on public.resource_types for select using (true);
create policy "Public can read active resources" on public.resources for select using (deleted_at is null);
create policy "Public can read active past papers" on public.past_papers for select using (deleted_at is null);

create index if not exists levels_curriculum_id_idx on public.levels(curriculum_id);
create index if not exists subjects_level_id_idx on public.subjects(level_id);
create index if not exists resources_subject_id_idx on public.resources(subject_id);
create index if not exists past_papers_subject_id_idx on public.past_papers(subject_id);
