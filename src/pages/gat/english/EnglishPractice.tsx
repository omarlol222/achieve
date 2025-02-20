
import { useNavigate, useParams } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { PracticeSession } from "@/components/practice/PracticeSession";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EnglishPractice() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container py-8 space-y-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/gat/english")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to English
          </Button>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#1B2B2B]">English Practice Setup</h1>
            <p className="mt-4 text-lg text-gray-600">Please start a practice session from the setup page.</p>
            <Button
              className="mt-6"
              onClick={() => navigate("/gat/english/practice/setup")}
            >
              Go to Practice Setup
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <PracticeSession />
    </div>
  );
}
