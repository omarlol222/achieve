
// Create stub for English practice
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EnglishPractice() {
  const navigate = useNavigate();

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
          <h1 className="text-4xl font-bold text-[#1B2B2B]">English Practice</h1>
          <p className="mt-4 text-lg text-gray-600">Coming soon...</p>
        </div>
      </div>
    </div>
  );
}
