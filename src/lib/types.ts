export type UserRole = "student" | "teacher" | "admin";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
};

export type Curriculum = {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  created_at?: string;
  deleted_at?: string | null;
};

export type Level = {
  id: string;
  curriculum_id: string;
  name: string;
  slug: string;
  display_order: number;
  created_at?: string;
  deleted_at?: string | null;
};

export type Subject = {
  id: string;
  level_id: string;
  name: string;
  slug: string;
  code?: string | null;
  display_order: number;
  created_at?: string;
  deleted_at?: string | null;
};

export type Unit = {
  id: string;
  subject_id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  created_at?: string;
  deleted_at?: string | null;
};

export type Topic = {
  id: string;
  unit_id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  created_at?: string;
  deleted_at?: string | null;
};

export type SubTopic = {
  id: string;
  topic_id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  created_at?: string;
  deleted_at?: string | null;
};

export type Teacher = {
  id: string;
  profile_id?: string | null;
  name: string;
  slug: string;
  email: string;
  photo_url: string | null;
  cover_url: string | null;
  subjects: string[];
  curriculums: string[];
  qualifications: string;
  experience_years: number;
  short_bio: string;
  biography: string;
  social_links: Record<string, string>;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

export type TeacherAssignment = {
  id: string;
  teacher_id: string;
  subject_id: string;
  created_at?: string;
};

export type QuestionSet = {
  id: string;
  sub_topic_id: string;
  teacher_id: string | null;
  title: string;
  description: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

export type McqQuestion = {
  id: string;
  question_set_id: string;
  question_image_url: string;
  correct_answer: "A" | "B" | "C" | "D";
  explanation: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

export type DiscussionVideo = {
  id: string;
  sub_topic_id: string;
  teacher_id: string | null;
  title: string;
  youtube_url: string;
  youtube_video_id: string;
  description: string;
  resources: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

export type StudentAttempt = {
  id: string;
  profile_id: string;
  question_set_id: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  created_at?: string;
};

export type StudentAnswer = {
  id: string;
  attempt_id: string;
  mcq_question_id: string;
  selected_answer: "A" | "B" | "C" | "D";
  is_correct: boolean;
};

export type Catalog = {
  profiles: Profile[];
  curriculums: Curriculum[];
  levels: Level[];
  subjects: Subject[];
  units: Unit[];
  topics: Topic[];
  subTopics: SubTopic[];
  teachers: Teacher[];
  teacherAssignments: TeacherAssignment[];
  questionSets: QuestionSet[];
  mcqQuestions: McqQuestion[];
  discussionVideos: DiscussionVideo[];
};

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type SearchResult = {
  title: string;
  description: string;
  href: string;
  type: "Curriculum" | "Level" | "Subject" | "Unit" | "Topic" | "Sub Topic" | "Teacher";
};
