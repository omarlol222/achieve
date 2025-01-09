import { BookOpen, PenTool, MonitorPlay } from "lucide-react";
import { LearningCard } from "./LearningCard";
import { useNavigate } from "react-router-dom";

export const LearningSection = () => {
  const navigate = useNavigate();

  const handlePracticeClick = () => {
    navigate("/practice");
  };

  const handleSimulatorClick = () => {
    navigate("/simulator");
  };

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1B2B2B]">Learning center</h2>
      <div className="grid md:grid-cols-3 gap-8">
        <LearningCard title="Course" icon={BookOpen} />
        <LearningCard 
          title="Practice" 
          icon={PenTool} 
          onClick={handlePracticeClick}
        />
        <LearningCard 
          title="GAT Simulator" 
          icon={MonitorPlay} 
          onClick={handleSimulatorClick}
        />
      </div>
    </section>
  );
};