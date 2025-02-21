
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { MonitorPlay, BookOpen, Calculator, HelpCircle, Trophy } from "lucide-react";

export default function GAT() {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container py-8 space-y-8">
        <div className="flex justify-start mb-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/gat/leaderboard")} className="hover:bg-primary/10 my-0 mx-[2px] py-0 px-0 text-center">
            <Trophy className="h-5 w-5" />
          </Button>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-[#1B2B2B]">
            Welcome to GAT Learning!
          </h1>
          <p className="text-lg text-gray-600">
            Choose your learning path and start your journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <Button variant="outline" size="lg" className="h-32 flex flex-col items-center justify-center gap-3 text-lg hover:bg-[#1B2B2B] hover:text-white transition-all" onClick={() => navigate("/gat/simulator")}>
            <MonitorPlay className="h-8 w-8" />
            GAT Simulator
          </Button>

          <Button variant="outline" size="lg" className="h-32 flex flex-col items-center justify-center gap-3 text-lg hover:bg-[#1B2B2B] hover:text-white transition-all" onClick={() => navigate("/gat/english")}>
            <BookOpen className="h-8 w-8" />
            English
          </Button>

          <Button variant="outline" size="lg" className="h-32 flex flex-col items-center justify-center gap-3 text-lg hover:bg-[#1B2B2B] hover:text-white transition-all" onClick={() => navigate("/gat/math")}>
            <Calculator className="h-8 w-8" />
            Math
          </Button>

          <Button variant="outline" size="lg" className="h-32 flex flex-col items-center justify-center gap-3 text-lg hover:bg-[#1B2B2B] hover:text-white transition-all" onClick={() => navigate("/questionsupport")}>
            <HelpCircle className="h-8 w-8" />
            Question Support
          </Button>
        </div>
      </div>
    </div>;
}
