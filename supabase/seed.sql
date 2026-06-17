insert into public.resource_types (id, name) values
  ('00000000-0000-0000-0000-000000000101', 'Notes'),
  ('00000000-0000-0000-0000-000000000102', 'Videos'),
  ('00000000-0000-0000-0000-000000000103', 'Topical Questions'),
  ('00000000-0000-0000-0000-000000000104', 'Past Papers')
on conflict (name) do nothing;

insert into public.curriculums (id, name, slug, display_order) values
  ('10000000-0000-0000-0000-000000000001', 'Sample Curriculum', 'sample-curriculum', 1)
on conflict (slug) do nothing;

insert into public.levels (id, curriculum_id, name, slug, display_order) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Sample Level', 'sample-level', 1)
on conflict (curriculum_id, slug) do nothing;

insert into public.subjects (id, level_id, name, slug, display_order) values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Sample Subject', 'sample-subject', 1)
on conflict (level_id, slug) do nothing;

insert into public.resources (id, subject_id, resource_type_id, title, description, content, display_order) values
  (
    '40000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000101',
    'Getting Started Notes',
    'A starter resource for this subject.',
    'Use this field for lesson notes, teacher guidance, and embedded learning content.',
    1
  )
on conflict (id) do nothing;

insert into public.past_papers (id, subject_id, year, session, display_order) values
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 2026, 'Sample Session', 1)
on conflict (id) do nothing;

insert into public.teachers (id, name, email, role) values
  ('60000000-0000-0000-0000-000000000001', 'Sample Teacher', 'teacher@example.com', 'teacher')
on conflict (email) do nothing;

insert into public.teacher_assignments (id, teacher_id, subject_id) values
  ('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001')
on conflict (teacher_id, subject_id) do nothing;
