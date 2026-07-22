create extension if not exists "pgcrypto";

create table if not exists public.roles (
  id text primary key check (id in ('student', 'teacher', 'admin')),
  name text not null
);

insert into public.roles (id, name) values
  ('student', 'Student'),
  ('teacher', 'Teacher'),
  ('admin', 'Admin')
on conflict (id) do update set name = excluded.name;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'student' references public.roles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
  code text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (level_id, slug)
);

create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  name text not null,
  slug text not null,
  description text not null default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (subject_id, slug)
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  name text not null,
  slug text not null,
  description text not null default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (unit_id, slug)
);

create table if not exists public.sub_topics (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  name text not null,
  slug text not null,
  description text not null default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (topic_id, slug)
);

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  slug text not null unique,
  email text not null unique,
  photo_url text,
  cover_url text,
  subjects text[] not null default '{}',
  curriculums text[] not null default '{}',
  qualifications text not null default '',
  experience_years integer not null default 0,
  short_bio text not null default '',
  biography text not null default '',
  social_links jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.teacher_assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (teacher_id, subject_id)
);

create table if not exists public.question_sets (
  id uuid primary key default gen_random_uuid(),
  sub_topic_id uuid not null references public.sub_topics(id) on delete cascade,
  teacher_id uuid references public.teachers(id) on delete set null,
  title text not null,
  description text not null default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.mcq_questions (
  id uuid primary key default gen_random_uuid(),
  question_set_id uuid not null references public.question_sets(id) on delete cascade,
  question_image_url text not null,
  correct_answer text not null check (correct_answer in ('A', 'B', 'C', 'D')),
  explanation text not null default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.discussion_videos (
  id uuid primary key default gen_random_uuid(),
  sub_topic_id uuid not null references public.sub_topics(id) on delete cascade,
  teacher_id uuid references public.teachers(id) on delete set null,
  title text not null,
  youtube_url text not null,
  youtube_video_id text not null,
  description text not null default '',
  resources text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (sub_topic_id)
);

create table if not exists public.student_attempts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  question_set_id uuid not null references public.question_sets(id) on delete cascade,
  total_questions integer not null default 0,
  correct_answers integer not null default 0,
  score_percentage numeric(5,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.student_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.student_attempts(id) on delete cascade,
  mcq_question_id uuid not null references public.mcq_questions(id) on delete cascade,
  selected_answer text not null check (selected_answer in ('A', 'B', 'C', 'D')),
  is_correct boolean not null default false
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();

drop trigger if exists teachers_set_updated_at on public.teachers;
create trigger teachers_set_updated_at before update on public.teachers for each row execute function public.set_updated_at();

drop trigger if exists question_sets_set_updated_at on public.question_sets;
create trigger question_sets_set_updated_at before update on public.question_sets for each row execute function public.set_updated_at();

drop trigger if exists mcq_questions_set_updated_at on public.mcq_questions;
create trigger mcq_questions_set_updated_at before update on public.mcq_questions for each row execute function public.set_updated_at();

drop trigger if exists discussion_videos_set_updated_at on public.discussion_videos;
create trigger discussion_videos_set_updated_at before update on public.discussion_videos for each row execute function public.set_updated_at();

alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.curriculums enable row level security;
alter table public.levels enable row level security;
alter table public.subjects enable row level security;
alter table public.units enable row level security;
alter table public.topics enable row level security;
alter table public.sub_topics enable row level security;
alter table public.teachers enable row level security;
alter table public.teacher_assignments enable row level security;
alter table public.question_sets enable row level security;
alter table public.mcq_questions enable row level security;
alter table public.discussion_videos enable row level security;
alter table public.student_attempts enable row level security;
alter table public.student_answers enable row level security;

create policy "Public can read active curriculums" on public.curriculums for select using (deleted_at is null);
create policy "Public can read active levels" on public.levels for select using (deleted_at is null);
create policy "Public can read active subjects" on public.subjects for select using (deleted_at is null);
create policy "Public can read active units" on public.units for select using (deleted_at is null);
create policy "Public can read active topics" on public.topics for select using (deleted_at is null);
create policy "Public can read active sub topics" on public.sub_topics for select using (deleted_at is null);
create policy "Public can read active teachers" on public.teachers for select using (deleted_at is null);
create policy "Public can read active question sets" on public.question_sets for select using (deleted_at is null);
create policy "Public can read active mcq questions" on public.mcq_questions for select using (deleted_at is null);
create policy "Public can read active discussion videos" on public.discussion_videos for select using (deleted_at is null);
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can read own attempts" on public.student_attempts for select using (auth.uid() = profile_id);
create policy "Users can read own answers" on public.student_answers for select using (
  exists (select 1 from public.student_attempts where student_attempts.id = student_answers.attempt_id and student_attempts.profile_id = auth.uid())
);

create index if not exists levels_curriculum_id_idx on public.levels(curriculum_id);
create index if not exists subjects_level_id_idx on public.subjects(level_id);
create index if not exists units_subject_id_idx on public.units(subject_id);
create index if not exists topics_unit_id_idx on public.topics(unit_id);
create index if not exists sub_topics_topic_id_idx on public.sub_topics(topic_id);
create index if not exists teacher_assignments_teacher_id_idx on public.teacher_assignments(teacher_id);
create index if not exists teacher_assignments_subject_id_idx on public.teacher_assignments(subject_id);
create index if not exists question_sets_sub_topic_id_idx on public.question_sets(sub_topic_id);
create index if not exists mcq_questions_question_set_id_idx on public.mcq_questions(question_set_id);
create index if not exists discussion_videos_sub_topic_id_idx on public.discussion_videos(sub_topic_id);
