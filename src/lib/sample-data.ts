import type { Catalog } from "@/lib/types";

export const sampleCatalog: Catalog = {
  grades: [
    { id: "grade-6", name: "Grade 6" },
    { id: "grade-7", name: "Grade 7" },
    { id: "grade-8", name: "Grade 8" },
    { id: "grade-9", name: "Grade 9" },
    { id: "grade-10", name: "Grade 10" },
    { id: "grade-11", name: "Grade 11" },
    { id: "al", name: "A/L" },
  ],
  subjects: [
    { id: "g10-math", grade_id: "grade-10", name: "Mathematics" },
    { id: "g10-science", grade_id: "grade-10", name: "Science" },
    { id: "g10-ict", grade_id: "grade-10", name: "ICT" },
    { id: "g10-english", grade_id: "grade-10", name: "English" },
    { id: "g11-math", grade_id: "grade-11", name: "Mathematics" },
    { id: "g11-science", grade_id: "grade-11", name: "Science" },
    { id: "al-physics", grade_id: "al", name: "Physics" },
    { id: "al-combined-maths", grade_id: "al", name: "Combined Mathematics" },
  ],
  lessons: [
    {
      id: "g10-science-electricity",
      subject_id: "g10-science",
      name: "Electricity",
      description:
        "Practice circuits, current, voltage, resistance, and everyday electrical safety questions.",
    },
    {
      id: "g10-science-force",
      subject_id: "g10-science",
      name: "Force",
      description: "Revise balanced forces, pressure, motion, and real-world applications.",
    },
    {
      id: "g10-science-light",
      subject_id: "g10-science",
      name: "Light",
      description: "Explore reflection, refraction, lenses, and ray diagrams.",
    },
    {
      id: "g10-science-human-body",
      subject_id: "g10-science",
      name: "Human Body",
      description: "Review body systems, organs, health, and applied biology questions.",
    },
    {
      id: "g10-math-algebra",
      subject_id: "g10-math",
      name: "Algebra",
      description: "Build confidence with expressions, equations, and word problems.",
    },
    {
      id: "g11-science-electronics",
      subject_id: "g11-science",
      name: "Electronics",
      description: "Practice semiconductor devices, logic gates, and circuit analysis.",
    },
  ],
  papers: [
    { id: "paper-electricity-2024", lesson_id: "g10-science-electricity", year: 2024, title: "2024 Past Paper" },
    { id: "paper-electricity-2023", lesson_id: "g10-science-electricity", year: 2023, title: "2023 Past Paper" },
    { id: "paper-electricity-2022", lesson_id: "g10-science-electricity", year: 2022, title: "2022 Past Paper" },
    { id: "paper-force-2024", lesson_id: "g10-science-force", year: 2024, title: "2024 Past Paper" },
    { id: "paper-algebra-2024", lesson_id: "g10-math-algebra", year: 2024, title: "2024 Practice Paper" },
  ],
  questions: [
    {
      id: "q-electricity-1",
      paper_id: "paper-electricity-2024",
      question_text: "A bulb is connected to a 6 V battery and draws a current of 0.5 A. What is the resistance of the bulb?",
      answer_text: "12 ohms.",
      explanation_text: "Use Ohm's law: R = V / I. Therefore R = 6 / 0.5 = 12 ohms.",
    },
    {
      id: "q-electricity-2",
      paper_id: "paper-electricity-2024",
      question_text: "Name one safety device used in household electrical circuits and state its function.",
      answer_text: "A fuse or circuit breaker protects the circuit by stopping current during a fault.",
      explanation_text: "When current becomes too high, the device opens the circuit and reduces the risk of overheating or fire.",
    },
    {
      id: "q-electricity-3",
      paper_id: "paper-electricity-2023",
      question_text: "Two 4 ohm resistors are connected in series. Find the total resistance.",
      answer_text: "8 ohms.",
      explanation_text: "In a series circuit, resistances are added directly: 4 + 4 = 8 ohms.",
    },
    {
      id: "q-force-1",
      paper_id: "paper-force-2024",
      question_text: "A 20 N force acts on an area of 2 m2. Calculate the pressure.",
      answer_text: "10 Pa.",
      explanation_text: "Pressure = force / area. 20 N / 2 m2 = 10 Pa.",
    },
  ],
};
