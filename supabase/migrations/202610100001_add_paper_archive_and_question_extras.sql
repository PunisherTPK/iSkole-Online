alter table public.questions
  add column if not exists question_images text[] not null default '{}';

alter table public.question_answers
  add column if not exists answer_images text[] not null default '{}';

update public.questions
set question_images = array[question_image_url]
where question_image_url is not null and cardinality(question_images) = 0;

update public.question_answers
set answer_images = array[answer_image_url]
where answer_image_url is not null and cardinality(answer_images) = 0;

create table if not exists public.question_teacher_comments (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  comment text not null check (length(trim(comment)) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (question_id, teacher_id)
);
alter table public.question_teacher_comments enable row level security;
create policy "Teachers manage their question comments"
  on public.question_teacher_comments for all to authenticated
  using (
    teacher_id = (select auth.uid()) and exists (
      select 1 from public.profiles p where p.id = (select auth.uid())
        and p.role in ('teacher', 'admin') and p.is_active
    )
  )
  with check (
    teacher_id = (select auth.uid()) and exists (
      select 1 from public.profiles p where p.id = (select auth.uid())
        and p.role in ('teacher', 'admin') and p.is_active
    )
  );

create table if not exists public.paper_archive_questions (
  id uuid primary key default gen_random_uuid(),
  subject_code text not null check (length(trim(subject_code)) between 1 and 24),
  paper_number text not null check (length(trim(paper_number)) between 1 and 12),
  session text not null check (session in ('M/J', 'O/N')),
  year smallint not null check (year between 0 and 99),
  question_number text not null check (length(trim(question_number)) between 1 and 16),
  question_images text[] not null default '{}',
  answer_images text[] not null default '{}',
  tags text[] not null default '{}',
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subject_code, paper_number, session, year, question_number)
);
create index if not exists paper_archive_questions_subject_code_idx
  on public.paper_archive_questions (subject_code, paper_number, session, year);
create index if not exists paper_archive_questions_tags_idx
  on public.paper_archive_questions using gin (tags);
alter table public.paper_archive_questions enable row level security;
create policy "Teachers and admins can browse paper archive"
  on public.paper_archive_questions for select to authenticated
  using (exists (
    select 1 from public.profiles p where p.id = (select auth.uid())
      and p.role in ('teacher', 'admin') and p.is_active
  ));
create policy "Teachers and admins can add paper archive questions"
  on public.paper_archive_questions for insert to authenticated
  with check (created_by = (select auth.uid()) and exists (
    select 1 from public.profiles p where p.id = (select auth.uid())
      and p.role in ('teacher', 'admin') and p.is_active
  ));
create policy "Creators and admins can update paper archive questions"
  on public.paper_archive_questions for update to authenticated
  using (created_by = (select auth.uid()) or exists (
    select 1 from public.profiles p where p.id = (select auth.uid())
      and p.role = 'admin' and p.is_active
  ))
  with check (created_by = (select auth.uid()) or exists (
    select 1 from public.profiles p where p.id = (select auth.uid())
      and p.role = 'admin' and p.is_active
  ));
create policy "Creators and admins can delete paper archive questions"
  on public.paper_archive_questions for delete to authenticated
  using (created_by = (select auth.uid()) or exists (
    select 1 from public.profiles p where p.id = (select auth.uid())
      and p.role = 'admin' and p.is_active
  ));

revoke all on public.question_teacher_comments, public.paper_archive_questions from anon;
grant select, insert, update, delete on public.question_teacher_comments, public.paper_archive_questions to authenticated;
