
import { useParams } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { PracticeSession } from "@/components/practice/PracticeSession";

export default function EnglishPractice() {
  const { sessionId } = useParams();

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <PracticeSession />
    </div>
  );
}
