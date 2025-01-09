import { useNavigate, useParams } from "react-router-dom";
import { TestResults } from "@/components/simulator/TestResults";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/ui/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SimulatorResults() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container py-8">
          <Alert variant="destructive">
            <AlertDescription>
              No session ID provided. Please start a new test.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => navigate("/gat/simulator")}>
              Back to Simulator
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/gat/simulator")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Simulator
        </Button>
        <TestResults 
          sessionId={sessionId} 
          onRestart={() => navigate('/gat/simulator')} 
        />
      </div>
    </div>
  );
}