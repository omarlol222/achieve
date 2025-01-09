import { useNavigate, useParams } from "react-router-dom";
import { TestResults } from "@/components/simulator/TestResults";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SimulatorResults() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  if (!sessionId) {
    return <div>No session ID provided</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/gat/simulator")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Simulator
        </Button>
        <TestResults sessionId={sessionId} onRestart={() => navigate('/gat/simulator')} />
      </div>
    </div>
  );
}