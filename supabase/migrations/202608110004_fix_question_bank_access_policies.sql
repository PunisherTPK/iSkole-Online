-- The actual schema stores YouTube discussions in question_page_discussions,
-- not discussion_videos. This migration is safe to run after the earlier
-- access migration failed.

create table if not exists public.student_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_type text not null check (plan_type in ('subject', 'premium')),
  curriculum_id uuid references public.curriculums(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'cancelled', 'expired')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_subscriptions_scope_check check (
    (plan_type = 'premium' and curriculum_id is null and subject_id is null)
    or
    (plan_type = 'subject' and curriculum_id is not null and subject_id is not null)
  )
);

create index if not exists student_subscriptions_user_id_idx
  on public.student_subscriptions(user_id);

create index if not exists student_subscriptions_subject_scope_idx
  on public.student_subscriptions(user_id, curriculum_id, subject_id);

alter table public.student_subscriptions enable row level security;

drop policy if exists "Users can read their own subscriptions" on public.student_subscriptions;
create policy "Users can read their own subscriptions"
on public.student_subscriptions
for select
to authenticated
using (auth.uid() = user_id);

-- Discussion videos are stored in question_page_discussions.
drop policy if exists "Public can read active discussion videos" on public.question_page_discussions;
drop policy if exists "Students can read discussion videos with access" on public.question_page_discussions;

create policy "Students can read discussion videos with access"
on public.question_page_discussions
for select
to authenticated
using (
  exists (
    select 1
    from public.question_pages qp
    join public.subjects s on s.id = qp.subject_id
    join public.levels l on l.id = s.level_id
    join public.curriculums c on c.id = l.curriculum_id
    where qp.id = question_page_discussions.question_page_id
      and qp.is_published = true
      and exists (
        select 1
        from public.student_subscriptions ss
        where ss.user_id = auth.uid()
          and ss.status = 'active'
          and ss.starts_at <= now()
          and (ss.ends_at is null or ss.ends_at > now())
          and (
            ss.plan_type = 'premium'
            or (
              ss.plan_type = 'subject'
              and ss.curriculum_id = c.id
              and ss.subject_id = s.id
            )
          )
      )
  )
);

-- Answers are only visible to users whose subscription covers the subject.
drop policy if exists "Public can read active answers" on public.question_answers;
drop policy if exists "Students can read answers with access" on public.question_answers;

create policy "Students can read answers with access"
on public.question_answers
for select
to authenticated
using (
  exists (
    select 1
    from public.questions q
    join public.question_pages qp on qp.id = q.question_page_id
    join public.subjects s on s.id = qp.subject_id
    join public.levels l on l.id = s.level_id
    join public.curriculums c on c.id = l.curriculum_id
    where q.id = question_answers.question_id
      and qp.is_published = true
      and exists (
        select 1
        from public.student_subscriptions ss
        where ss.user_id = auth.uid()
          and ss.status = 'active'
          and ss.starts_at <= now()
          and (ss.ends_at is null or ss.ends_at > now())
          and (
            ss.plan_type = 'premium'
            or (
              ss.plan_type = 'subject'
              and ss.curriculum_id = c.id
              and ss.subject_id = s.id
            )
          )
      )
  )
);

drop trigger if exists student_subscriptions_set_updated_at on public.student_subscriptions;
create trigger student_subscriptions_set_updated_at
before update on public.student_subscriptions
for each row execute function public.question_bank_set_updated_at();
