
import { useParams } from "react-router-dom";
import { PracticeSession } from "@/components/practice/PracticeSession";
import { Navigation } from "@/components/ui/navigation";
import { usePracticeQuestions } from "@/hooks/usePracticeQuestions";

export default function PracticeTest() {
  const { sessionId } = useParams();
  const practiceQuestions = usePracticeQuestions(sessionId);

  if (!practiceQuestions.currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <PracticeSession />
    </div>
  );
}
