
import { useParams } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { PracticeSession } from "@/components/practice/PracticeSession";

export default function MathPractice() {
  const { sessionId } = useParams();

  if (!sessionId) {
    return null; // or redirect to setup
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <PracticeSession />
    </div>
  );
}
