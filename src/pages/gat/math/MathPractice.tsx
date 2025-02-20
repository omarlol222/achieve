
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { PracticeSession } from "@/components/practice/PracticeSession";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function MathPractice() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  if (!sessionId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container py-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/gat/math/practice")}
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Practice Setup
        </Button>
        <PracticeSession />
      </div>
    </div>
  );
}
