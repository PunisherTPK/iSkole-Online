create table if not exists public.paper_archive_teacher_comments (
  id uuid primary key default gen_random_uuid(),
  paper_archive_question_id uuid not null references public.paper_archive_questions(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  comment text not null check (length(trim(comment)) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (paper_archive_question_id, teacher_id)
);

alter table public.paper_archive_teacher_comments enable row level security;
create policy "Teachers manage their private archive comments"
  on public.paper_archive_teacher_comments for all to authenticated
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

revoke all on public.paper_archive_teacher_comments from anon;
grant select, insert, update, delete on public.paper_archive_teacher_comments to authenticated;
