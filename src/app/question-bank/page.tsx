import QuestionBankShell from "@/components/question-bank/QuestionBankShell";
import { getCurriculums } from "@/lib/question-bank";

export default async function QuestionBankPage() {
  const curriculums = await getCurriculums();

  return (
    <QuestionBankShell curriculums={curriculums} />
  );
}