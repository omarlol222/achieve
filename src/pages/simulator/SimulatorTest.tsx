import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { QuestionContent } from "@/components/practice/QuestionContent";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Flag } from "lucide-react";
import { ModuleOverview } from "@/components/simulator/ModuleOverview";

export default function SimulatorTest() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeSession();
  }, []);

  useEffect(() => {
    if (!timeLeft) {
      handleModuleComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const initializeSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create a new test session
      const { data: session, error: sessionError } = await supabase
        .from("test_sessions")
        .insert({ user_id: user.id })
        .select()
        .single();

      if (sessionError) throw sessionError;
      setSessionId(session.id);

      // Fetch questions for the first module
      await loadModuleQuestions();
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const loadModuleQuestions = async () => {
    try {
      const subjectName = currentModuleIndex === 0 ? "Verbal" : "Quantitative";
      
      const { data: questions, error } = await supabase
        .from("questions")
        .select(`
          *,
          topic:topics!topic_id (
            id,
            name,
            subject:subjects (
              id,
              name
            )
          )
        `)
        .eq("topic.subject.name", subjectName)
        .limit(20);

      if (error) throw error;
      setQuestions(questions || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAnswer = async (answer: number) => {
    if (!sessionId) return;

    try {
      const currentQuestion = questions[currentQuestionIndex];
      
      // Save the answer
      const { error } = await supabase
        .from("module_answers")
        .insert({
          module_progress_id: sessionId,
          question_id: currentQuestion.id,
          selected_answer: answer,
          is_flagged: flagged[currentQuestionIndex] || false
        });

      if (error) throw error;

      // Update local state
      setAnswers(prev => ({
        ...prev,
        [currentQuestionIndex]: answer
      }));

      // Move to next question
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error saving answer",
        description: err.message
      });
    }
  };

  const handleModuleComplete = async () => {
    if (!sessionId) return;

    try {
      // Mark module as complete
      const { error } = await supabase
        .from("module_progress")
        .update({ completed_at: new Date().toISOString() })
        .eq("session_id", sessionId)
        .eq("module_id", currentModuleIndex.toString());

      if (error) throw error;

      if (currentModuleIndex === 0) {
        // Load next module
        setCurrentModuleIndex(1);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setFlagged({});
        setTimeLeft(3600);
        await loadModuleQuestions();
      } else {
        // Complete test
        const { error: sessionError } = await supabase
          .from("test_sessions")
          .update({ completed_at: new Date().toISOString() })
          .eq("id", sessionId);

        if (sessionError) throw sessionError;

        navigate(`/gat/simulator/results/${sessionId}`);
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error completing module",
        description: err.message
      });
    }
  };

  const toggleFlag = () => {
    setFlagged(prev => ({
      ...prev,
      [currentQuestionIndex]: !prev[currentQuestionIndex]
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / questions.length) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              {currentModuleIndex === 0 ? "Verbal" : "Quantitative"} Module
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-lg font-medium">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </div>
              <ModuleOverview
                moduleName={currentModuleIndex === 0 ? "Verbal" : "Quantitative"}
                totalQuestions={questions.length}
                currentQuestion={currentQuestionIndex + 1}
                answeredCount={Object.keys(answers).length}
                unansweredCount={questions.length - Object.keys(answers).length}
                flaggedCount={Object.values(flagged).filter(Boolean).length}
                questions={questions}
                currentIndex={currentQuestionIndex}
                answers={answers}
                flagged={flagged}
                onQuestionSelect={setCurrentQuestionIndex}
              />
            </div>
          </div>

          <Progress value={progress} className="h-2" />

          <Card className="p-6">
            {currentQuestion && (
              <QuestionContent
                question={currentQuestion}
                selectedAnswer={answers[currentQuestionIndex] || null}
                showFeedback={false}
                onAnswerSelect={handleAnswer}
              />
            )}
          </Card>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button
              variant="outline"
              onClick={toggleFlag}
            >
              <Flag className={`h-4 w-4 ${flagged[currentQuestionIndex] ? 'fill-yellow-500' : ''}`} />
            </Button>

            <Button
              onClick={() => {
                if (currentQuestionIndex === questions.length - 1) {
                  handleModuleComplete();
                } else {
                  setCurrentQuestionIndex(prev => prev + 1);
                }
              }}
            >
              {currentQuestionIndex === questions.length - 1 ? (
                "Complete Module"
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
