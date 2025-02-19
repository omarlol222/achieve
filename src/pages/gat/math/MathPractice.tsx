
// Move existing code from src/pages/gat/math/practice/[sessionId].tsx to here
import { Navigation } from "@/components/ui/navigation";
import { PracticeSession } from "@/components/practice/PracticeSession";

export default function MathPractice() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <PracticeSession />
    </div>
  );
}
