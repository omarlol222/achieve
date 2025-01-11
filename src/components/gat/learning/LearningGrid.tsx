import { memo } from "react";
import { LearningCard } from "./LearningCard";
import { BookOpen, PenTool, MonitorPlay } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const LearningGrid = memo(() => {
  const navigate = useNavigate();

  const handlePracticeClick = () => navigate("/gat/practice");
  const handleSimulatorClick = () => navigate("/gat/simulator");

  return (
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
  );
});

LearningGrid.displayName = "LearningGrid";