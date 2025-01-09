import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SimulatorTest() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const sessionId = location.state?.sessionId;

  useEffect(() => {
    if (!sessionId) {
      toast({
        variant: "destructive",
        title: "Invalid session",
        description: "Please start a new test from the simulator page.",
      });
      navigate("/gat/simulator");
    }
  }, [sessionId, navigate, toast]);

  if (!sessionId) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-8">
        <h1>Test Session: {sessionId}</h1>
        {/* We'll implement the test UI in the next iteration */}
      </div>
    </div>
  );
}