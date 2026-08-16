insert into public.curriculums (id, name, slug, display_order) values
  ('00000000-0000-0000-0000-000000000201', 'Cambridge', 'cambridge', 1)
on conflict (id) do nothing;

insert into public.levels (id, curriculum_id, name, slug, display_order) values
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000201', 'IGCSE', 'igcse', 1)
on conflict (id) do nothing;

insert into public.subjects (id, level_id, name, slug, code, display_order) values
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000202', 'Physics', 'physics-0625', '0625', 1)
on conflict (id) do nothing;

insert into public.teachers (id, name, slug, email, subjects, curriculums, qualifications, experience_years, short_bio, biography, social_links) values
  ('00000000-0000-0000-0000-000000000207', 'Amara Perera', 'amara-perera', 'amara@example.com', array['Physics 0625'], array['Cambridge IGCSE'], 'BSc Physics, PGCE', 8, 'Builds clear topical question pathways for Cambridge Physics learners.', 'Amara specializes in helping students turn syllabus points into repeatable problem-solving habits.', '{"youtube":"https://youtube.com"}')
on conflict (id) do nothing;

insert into public.teacher_subjects (id, teacher_id, subject_id) values
  ('00000000-0000-0000-0000-000000000208', '00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000203')
on conflict (id) do nothing;

insert into public.units (id, subject_id, name, slug, description, display_order) values
  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000203', 'Unit 1', 'unit-1', 'Physical quantities and measurement foundations.', 1)
on conflict (id) do nothing;

insert into public.topics (id, unit_id, name, slug, description, display_order) values
  ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000204', 'Physical Quantities', 'physical-quantities', 'Core quantities, units, and measurement language.', 1)
on conflict (id) do nothing;

insert into public.sub_topics (id, topic_id, name, slug, description, display_order) values
  ('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000205', 'Scalars and Vectors', 'scalars-and-vectors', 'Practice distinguishing magnitude-only quantities from directional quantities.', 1)
on conflict (id) do nothing;

insert into public.question_types (id, sub_topic_id, teacher_id, type, title, description, display_order) values
  ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000207', 'mcq', 'Scalars and Vectors MCQ', 'A short diagnostic MCQ set for the first pass through the topic.', 1),
  ('00000000-0000-0000-0000-000000000212', '00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000207', 'structured', 'Scalars and Vectors Structured', 'Written practice with marking scheme support.', 2)
on conflict (id) do nothing;

insert into public.questions (id, question_type_id, question_image_url, correct_answer, marking_scheme, explanation, difficulty, display_order) values
  ('00000000-0000-0000-0000-000000000210', '00000000-0000-0000-0000-000000000209', 'https://dummyimage.com/960x540/ffffff/111827.png&text=Which+quantity+is+a+vector%3F+A+Mass+B+Speed+C+Velocity+D+Time', 'C', '', 'Velocity includes both magnitude and direction.', 'easy', 1),
  ('00000000-0000-0000-0000-000000000213', '00000000-0000-0000-0000-000000000212', 'https://dummyimage.com/960x540/ffffff/111827.png&text=Explain+the+difference+between+distance+and+displacement.', null, '1 mark for scalar/vector distinction. 1 mark for direction. 1 mark for example.', 'Distance is scalar; displacement is vector.', 'medium', 1)
on conflict (id) do nothing;

insert into public.discussion_videos (id, question_type_id, teacher_id, title, youtube_url, youtube_video_id, description, resources) values
  ('00000000-0000-0000-0000-000000000211', '00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000207', 'Scalars and Vectors Discussion', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 'Walk through the key definitions, traps, and answer patterns for this MCQ set.', 'Download the syllabus checklist from your class folder.')
on conflict (id) do nothing;
