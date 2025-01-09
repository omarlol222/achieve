import { useParams } from "react-router-dom";
import { TestResults } from "@/components/simulator/TestResults";

export default function SimulatorResults() {
  const { sessionId } = useParams();

  if (!sessionId) {
    return <div>No session ID provided</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-8">
        <TestResults sessionId={sessionId} onRestart={() => window.location.href = '/gat/simulator'} />
      </div>
    </div>
  );
}