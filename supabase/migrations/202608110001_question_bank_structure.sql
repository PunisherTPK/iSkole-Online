-- iSkole Question Bank v4
-- Replaces the fixed Unit -> Topic -> Sub Topic -> Question Type
-- hierarchy with a recursive content tree and Question Pages.

create extension if not exists "pgcrypto";

-- Remove the legacy question hierarchy. The current application no longer
-- reads these tables and the new structure supports arbitrary depth.
drop table if exists public.questions cascade;
drop table if exists public.discussion_videos cascade;
drop table if exists public.question_types cascade;
drop table if exists public.sub_topics cascade;
drop table if exists public.topics cascade;
drop table if exists public.units cascade;

create table if not exists public.content_nodes (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  parent_id uuid references public.content_nodes(id) on delete cascade,
  name text not null,
  slug text not null,
  description text not null default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists content_nodes_subject_parent_slug_idx
  on public.content_nodes(subject_id, parent_id, slug)
  where deleted_at is null and parent_id is not null;

create unique index if not exists content_nodes_subject_root_slug_idx
  on public.content_nodes(subject_id, slug)
  where deleted_at is null and parent_id is null;

create index if not exists content_nodes_subject_id_idx
  on public.content_nodes(subject_id);

create index if not exists content_nodes_parent_id_idx
  on public.content_nodes(parent_id);

create table if not exists public.question_pages (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  content_node_id uuid references public.content_nodes(id) on delete cascade,
  teacher_id uuid references public.teachers(id) on delete set null,
  title text not null,
  description text not null default '',
  page_type text not null check (page_type in ('mcq', 'structured')),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists question_pages_subject_id_idx
  on public.question_pages(subject_id);

create index if not exists question_pages_content_node_id_idx
  on public.question_pages(content_node_id);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  question_page_id uuid not null references public.question_pages(id) on delete cascade,
  question_image_url text not null,
  correct_answer text check (correct_answer in ('A', 'B', 'C', 'D')),
  marking_scheme text not null default '',
  explanation text not null default '',
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists questions_question_page_id_idx
  on public.questions(question_page_id);

create table if not exists public.discussion_videos (
  id uuid primary key default gen_random_uuid(),
  question_page_id uuid not null references public.question_pages(id) on delete cascade,
  teacher_id uuid references public.teachers(id) on delete set null,
  title text not null,
  youtube_url text not null,
  youtube_video_id text not null,
  description text not null default '',
  resources text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique(question_page_id)
);

create or replace function public.question_bank_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists content_nodes_set_updated_at on public.content_nodes;
create trigger content_nodes_set_updated_at
before update on public.content_nodes
for each row execute function public.question_bank_set_updated_at();

drop trigger if exists question_pages_set_updated_at on public.question_pages;
create trigger question_pages_set_updated_at
before update on public.question_pages
for each row execute function public.question_bank_set_updated_at();

drop trigger if exists questions_set_updated_at on public.questions;
create trigger questions_set_updated_at
before update on public.questions
for each row execute function public.question_bank_set_updated_at();

drop trigger if exists discussion_videos_set_updated_at on public.discussion_videos;
create trigger discussion_videos_set_updated_at
before update on public.discussion_videos
for each row execute function public.question_bank_set_updated_at();

alter table public.content_nodes enable row level security;
alter table public.question_pages enable row level security;
alter table public.questions enable row level security;
alter table public.discussion_videos enable row level security;

create policy "Public can read active content nodes"
on public.content_nodes for select
using (deleted_at is null);

create policy "Public can read published question pages"
on public.question_pages for select
using (deleted_at is null and is_published = true);

create policy "Public can read active questions"
on public.questions for select
using (
  deleted_at is null
  and exists (
    select 1
    from public.question_pages qp
    where qp.id = questions.question_page_id
      and qp.deleted_at is null
      and qp.is_published = true
  )
);

create policy "Public can read active discussion videos"
on public.discussion_videos for select
using (
  deleted_at is null
  and exists (
    select 1
    from public.question_pages qp
    where qp.id = discussion_videos.question_page_id
      and qp.deleted_at is null
      and qp.is_published = true
  )
);
