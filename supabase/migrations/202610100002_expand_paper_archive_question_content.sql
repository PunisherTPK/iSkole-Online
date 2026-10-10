alter table public.paper_archive_questions
  add column if not exists question_type text not null default 'structured' check (question_type in ('mcq', 'structured')),
  add column if not exists marks numeric(7,2) not null default 1 check (marks >= 0),
  add column if not exists correct_option text check (correct_option in ('A', 'B', 'C', 'D')),
  add column if not exists marking_text text,
  add column if not exists explanation_text text,
  add column if not exists explanation_images text[] not null default '{}',
  add column if not exists teacher_comment text,
  add column if not exists parts jsonb not null default '[]'::jsonb check (jsonb_typeof(parts) = 'array');

alter table public.questions
  add column if not exists parts jsonb not null default '[]'::jsonb check (jsonb_typeof(parts) = 'array');
