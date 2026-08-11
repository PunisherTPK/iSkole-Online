import QuestionBankShell from "@/components/question-bank/QuestionBankShell";
import {
  getContentNodes,
  getCurriculums,
  getLevels,
  getQuestionPages,
  getSubjects,
} from "@/lib/question-bank";

type SearchParams = {
  curriculum?: string;
  level?: string;
  subject?: string;
  node?: string;
};

export default async function QuestionBankPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const curriculums = await getCurriculums();

  const selectedCurriculum = params.curriculum ?? null;
  const selectedLevel = params.level ?? null;
  const selectedSubject = params.subject ?? null;
  const selectedNode = params.node ?? null;

  const levels = selectedCurriculum
    ? await getLevels(selectedCurriculum)
    : [];

  const subjects = selectedLevel
    ? await getSubjects(selectedLevel)
    : [];

  const nodes = selectedSubject
    ? await getContentNodes(
        selectedSubject,
        selectedNode
      )
    : [];

  const questionPages = selectedSubject
    ? await getQuestionPages(
        selectedSubject,
        selectedNode
      )
    : [];

  return (
    <QuestionBankShell
      curriculums={curriculums}
      levels={levels}
      subjects={subjects}
      nodes={nodes}
      questionPages={questionPages}
      selectedCurriculum={selectedCurriculum}
      selectedLevel={selectedLevel}
      selectedSubject={selectedSubject}
      selectedNode={selectedNode}
    />
  );
}