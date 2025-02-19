
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuestionContent } from "./QuestionContent";
import { useToast } from "@/hooks/use-toast";

export function PracticeSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  // Get session details
  const { data: session } = useQuery({
    queryKey: ["practice-session", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("practice_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Get next question based on adaptive logic
  const getNextQuestion = async () => {
    try {
      // This is where we'll implement the adaptive question selection logic
      // For now, just get a random question
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .limit(1)
        .single();

      if (error) throw error;
      setCurrentQuestion(data);
    } catch (error: any) {
      toast({
        title: "Error fetching question",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (session && !currentQuestion) {
      getNextQuestion();
    }
  }, [session]);

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer || !currentQuestion) return;

    try {
      const isCorrect = selectedAnswer === currentQuestion.correct_answer;
      
      // Update streak
      const newStreak = isCorrect ? streak + 1 : 0;
      setStreak(newStreak);

      // Record answer
      await supabase.from("practice_answers").insert({
        session_id: sessionId,
        question_id: currentQuestion.id,
        selected_answer: selectedAnswer,
        is_correct: isCorrect,
        streak_at_answer: streak
      });

      setShowFeedback(true);

      // Show feedback for 2 seconds before moving to next question
      setTimeout(() => {
        setShowFeedback(false);
        setSelectedAnswer(null);
        getNextQuestion();
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Error submitting answer",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!session || !currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-8 space-y-8">
      <Card className="p-6">
        <QuestionContent
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          showFeedback={showFeedback}
          onAnswerSelect={setSelectedAnswer}
        />
        
        <div className="mt-6 flex justify-end">
          <Button
            size="lg"
            onClick={handleAnswerSubmit}
            disabled={selectedAnswer === null || showFeedback}
          >
            Submit Answer
          </Button>
        </div>
      </Card>
    </div>
  );
}
