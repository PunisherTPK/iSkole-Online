insert into public.grades (id, name) values
  ('00000000-0000-0000-0000-000000000006', 'Grade 6'),
  ('00000000-0000-0000-0000-000000000007', 'Grade 7'),
  ('00000000-0000-0000-0000-000000000008', 'Grade 8'),
  ('00000000-0000-0000-0000-000000000009', 'Grade 9'),
  ('00000000-0000-0000-0000-000000000010', 'Grade 10'),
  ('00000000-0000-0000-0000-000000000011', 'Grade 11'),
  ('00000000-0000-0000-0000-000000000012', 'A/L')
on conflict (id) do nothing;

insert into public.subjects (id, grade_id, name) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'Mathematics'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', 'Science'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000010', 'ICT'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010', 'English'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000011', 'Science'),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000012', 'Physics')
on conflict (id) do nothing;

insert into public.lessons (id, subject_id, name, description) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Electricity', 'Practice circuits, current, voltage, resistance, and everyday electrical safety questions.'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Force', 'Revise balanced forces, pressure, motion, and real-world applications.'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Light', 'Explore reflection, refraction, lenses, and ray diagrams.'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Human Body', 'Review body systems, organs, health, and applied biology questions.'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'Algebra', 'Build confidence with expressions, equations, and word problems.')
on conflict (id) do nothing;

insert into public.papers (id, lesson_id, year, title) values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 2024, '2024 Past Paper'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 2023, '2023 Past Paper'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 2022, '2022 Past Paper'),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 2024, '2024 Past Paper')
on conflict (id) do nothing;

insert into public.questions (id, paper_id, question_text, answer_text, explanation_text) values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'A bulb is connected to a 6 V battery and draws a current of 0.5 A. What is the resistance of the bulb?', '12 ohms.', 'Use Ohm''s law: R = V / I. Therefore R = 6 / 0.5 = 12 ohms.'),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Name one safety device used in household electrical circuits and state its function.', 'A fuse or circuit breaker protects the circuit by stopping current during a fault.', 'When current becomes too high, the device opens the circuit and reduces the risk of overheating or fire.'),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'Two 4 ohm resistors are connected in series. Find the total resistance.', '8 ohms.', 'In a series circuit, resistances are added directly: 4 + 4 = 8 ohms.')
on conflict (id) do nothing;
