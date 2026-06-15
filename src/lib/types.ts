export type Grade = {
  id: string;
  name: string;
};

export type Subject = {
  id: string;
  grade_id: string;
  name: string;
};

export type Lesson = {
  id: string;
  subject_id: string;
  name: string;
  description: string;
};

export type Paper = {
  id: string;
  lesson_id: string;
  year: number;
  title: string;
};

export type Question = {
  id: string;
  paper_id: string;
  question_text: string;
  answer_text: string;
  explanation_text: string;
};

export type Catalog = {
  grades: Grade[];
  subjects: Subject[];
  lessons: Lesson[];
  papers: Paper[];
  questions: Question[];
};

export type SearchResult = {
  title: string;
  description: string;
  href: string;
  type: "Grade" | "Subject" | "Lesson" | "Paper" | "Question";
};
